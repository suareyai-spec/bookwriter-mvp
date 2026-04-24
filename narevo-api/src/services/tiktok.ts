import axios from 'axios';
import { Account } from '@prisma/client';

const TIKTOK_API = 'https://open.tiktokapis.com/v2';

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<{
  accessToken: string;
  refreshToken: string;
  openId: string;
  expiresIn: number;
  refreshExpiresIn: number;
}> {
  const { data } = await axios.post(`${TIKTOK_API}/oauth/token/`, new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  }).toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    openId: data.open_id,
    expiresIn: data.expires_in,
    refreshExpiresIn: data.refresh_expires_in,
  };
}

export async function getUserInfo(accessToken: string): Promise<any> {
  const { data } = await axios.get(`${TIKTOK_API}/user/info/`, {
    params: { fields: 'open_id,display_name,avatar_url' },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data?.user || null;
}

export async function publishToTikTok(
  account: Account, content: string, videoUrl?: string
): Promise<{ platformPostId: string }> {
  const token = account.accessToken;

  if (!videoUrl) throw new Error('TikTok requires a video URL');

  // Step 1: Initialize video publish
  const { data: initData } = await axios.post(
    `${TIKTOK_API}/post/publish/inbox/video/init/`,
    {
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl,
      },
      post_info: {
        title: content.substring(0, 150),
        privacy_level: 'SELF_ONLY', // default to private, user can change
      },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  const publishId = initData.data?.publish_id;
  if (!publishId) throw new Error('Failed to initialize TikTok upload');

  // Step 2: Poll for publish status
  let attempts = 0;
  while (attempts < 30) {
    await new Promise(r => setTimeout(r, 5000));
    const { data: statusData } = await axios.post(
      `${TIKTOK_API}/post/publish/status/fetch/`,
      { publish_id: publishId },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    const status = statusData.data?.status;
    if (status === 'PUBLISH_COMPLETE') {
      return { platformPostId: publishId };
    }
    if (status === 'FAILED') {
      throw new Error(`TikTok publish failed: ${statusData.data?.fail_reason || 'unknown'}`);
    }
    attempts++;
  }

  // Return publish_id even if still processing
  return { platformPostId: publishId };
}

export async function getTikTokAnalytics(
  account: Account, startDate: Date, endDate: Date
): Promise<any> {
  const token = account.accessToken;

  // Get video list
  const { data: videoList } = await axios.post(
    `${TIKTOK_API}/video/list/`,
    { max_count: 50 },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  const videos = videoList.data?.videos || [];
  if (videos.length === 0) return { videos: [], totals: { views: 0, likes: 0, comments: 0, shares: 0 } };

  const videoIds = videos.map((v: any) => v.id);

  // Get video stats
  const { data: statsData } = await axios.post(
    `${TIKTOK_API}/video/query/`,
    {
      filters: { video_ids: videoIds },
      fields: ['id', 'title', 'view_count', 'like_count', 'comment_count', 'share_count'],
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  const videoStats = statsData.data?.videos || [];
  const totals = videoStats.reduce((acc: any, v: any) => ({
    views: acc.views + (v.view_count || 0),
    likes: acc.likes + (v.like_count || 0),
    comments: acc.comments + (v.comment_count || 0),
    shares: acc.shares + (v.share_count || 0),
  }), { views: 0, likes: 0, comments: 0, shares: 0 });

  return { videos: videoStats, totals };
}

export async function refreshTikTokToken(
  account: Account
): Promise<{ accessToken: string; refreshToken?: string; expiresAt: Date }> {
  if (!account.refreshToken) throw new Error('No refresh token available');

  const { data } = await axios.post(`${TIKTOK_API}/oauth/token/`, new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    refresh_token: account.refreshToken,
    grant_type: 'refresh_token',
  }).toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}
