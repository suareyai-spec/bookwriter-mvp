import axios from 'axios';
import { Account } from '@prisma/client';

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const { data } = await axios.post(OAUTH_TOKEN_URL, new URLSearchParams({
    code,
    client_id: process.env.YOUTUBE_CLIENT_ID!,
    client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  }).toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function getChannel(accessToken: string): Promise<any> {
  const { data } = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
    params: { part: 'snippet,statistics', mine: true },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.items?.[0] || null;
}

export async function uploadVideo(
  account: Account,
  videoUrl: string,
  title: string,
  description: string,
  tags: string[],
  privacyStatus: string = 'private'
): Promise<{ platformPostId: string }> {
  const token = account.accessToken;

  // Download video to buffer
  const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
  const videoBuffer = Buffer.from(videoResponse.data);

  // Step 1: Initialize resumable upload
  const initResponse = await axios.post(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      snippet: { title, description, tags },
      status: { privacyStatus },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Length': videoBuffer.length,
        'X-Upload-Content-Type': 'video/*',
      },
    }
  );

  const uploadUrl = initResponse.headers.location;
  if (!uploadUrl) throw new Error('Failed to get resumable upload URL');

  // Step 2: Upload video data
  const { data } = await axios.put(uploadUrl, videoBuffer, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'video/*',
      'Content-Length': videoBuffer.length,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return { platformPostId: data.id };
}

export async function getYouTubeAnalytics(
  account: Account, startDate: Date, endDate: Date
): Promise<any> {
  const token = account.accessToken;
  const { data } = await axios.get('https://youtubeanalytics.googleapis.com/v2/reports', {
    params: {
      ids: 'channel==MINE',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dimensions: 'day',
      metrics: 'views,likes,comments,subscribersGained',
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function refreshYouTubeToken(
  account: Account
): Promise<{ accessToken: string; refreshToken?: string; expiresAt: Date }> {
  if (!account.refreshToken) throw new Error('No refresh token available');

  const { data } = await axios.post(OAUTH_TOKEN_URL, new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID!,
    client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
    refresh_token: account.refreshToken,
    grant_type: 'refresh_token',
  }).toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}
