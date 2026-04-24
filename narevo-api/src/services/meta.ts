import axios from 'axios';
import { Account } from '@prisma/client';

const GRAPH_API = 'https://graph.facebook.com/v21.0';

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  // Exchange code for short-lived token
  const { data: shortLived } = await axios.get(`${GRAPH_API}/oauth/access_token`, {
    params: {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: redirectUri,
      code,
    },
  });

  // Exchange short-lived for long-lived token (60 days)
  const { data: longLived } = await axios.get(`${GRAPH_API}/oauth/access_token`, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      fb_exchange_token: shortLived.access_token,
    },
  });

  return {
    accessToken: longLived.access_token,
    expiresIn: longLived.expires_in || 5184000, // default 60 days
  };
}

export async function getPages(accessToken: string): Promise<any[]> {
  const { data } = await axios.get(`${GRAPH_API}/me/accounts`, {
    params: { access_token: accessToken },
  });
  return data.data || [];
}

export async function getInstagramAccount(pageId: string, accessToken: string): Promise<string | null> {
  const { data } = await axios.get(`${GRAPH_API}/${pageId}`, {
    params: { fields: 'instagram_business_account', access_token: accessToken },
  });
  return data.instagram_business_account?.id || null;
}

export async function publishToFacebook(
  account: Account, content: string, mediaUrls?: string[]
): Promise<{ platformPostId: string }> {
  const pageId = account.platformAccountId;
  const token = account.accessToken;

  if (mediaUrls && mediaUrls.length > 0) {
    const url = mediaUrls[0];
    // Detect video by extension
    if (/\.(mp4|mov|avi|wmv|flv|webm)(\?|$)/i.test(url)) {
      const { data } = await axios.post(`${GRAPH_API}/${pageId}/videos`, null, {
        params: { file_url: url, description: content, access_token: token },
      });
      return { platformPostId: data.id };
    } else {
      const { data } = await axios.post(`${GRAPH_API}/${pageId}/photos`, null, {
        params: { url, message: content, access_token: token },
      });
      return { platformPostId: data.id || data.post_id };
    }
  }

  const { data } = await axios.post(`${GRAPH_API}/${pageId}/feed`, null, {
    params: { message: content, access_token: token },
  });
  return { platformPostId: data.id };
}

export async function publishToInstagram(
  account: Account, content: string, mediaUrls?: string[]
): Promise<{ platformPostId: string }> {
  const igUserId = (account.metadata as any)?.instagramAccountId || account.platformAccountId;
  const token = account.accessToken;

  if (!mediaUrls || mediaUrls.length === 0) {
    throw new Error('Instagram requires at least one media URL');
  }

  const mediaUrl = mediaUrls[0];
  const isVideo = /\.(mp4|mov|avi|wmv|flv|webm)(\?|$)/i.test(mediaUrl);

  // Step 1: Create media container
  const containerParams: any = {
    caption: content,
    access_token: token,
  };
  if (isVideo) {
    containerParams.video_url = mediaUrl;
    containerParams.media_type = 'VIDEO';
  } else {
    containerParams.image_url = mediaUrl;
  }

  const { data: container } = await axios.post(`${GRAPH_API}/${igUserId}/media`, null, {
    params: containerParams,
  });

  // For video, wait for processing
  if (isVideo) {
    let status = 'IN_PROGRESS';
    while (status === 'IN_PROGRESS') {
      await new Promise(r => setTimeout(r, 5000));
      const { data: check } = await axios.get(`${GRAPH_API}/${container.id}`, {
        params: { fields: 'status_code', access_token: token },
      });
      status = check.status_code;
      if (status === 'ERROR') throw new Error('Instagram video processing failed');
    }
  }

  // Step 2: Publish
  const { data: published } = await axios.post(`${GRAPH_API}/${igUserId}/media_publish`, null, {
    params: { creation_id: container.id, access_token: token },
  });

  return { platformPostId: published.id };
}

export async function getMetaAnalytics(
  account: Account, startDate: Date, endDate: Date
): Promise<any> {
  const token = account.accessToken;
  const since = Math.floor(startDate.getTime() / 1000);
  const until = Math.floor(endDate.getTime() / 1000);

  if (account.platform === 'instagram') {
    const igUserId = (account.metadata as any)?.instagramAccountId || account.platformAccountId;
    const { data } = await axios.get(`${GRAPH_API}/${igUserId}/insights`, {
      params: {
        metric: 'impressions,reach,follower_count',
        period: 'day',
        since, until,
        access_token: token,
      },
    });
    return data.data;
  }

  // Facebook Page insights
  const pageId = account.platformAccountId;
  const { data } = await axios.get(`${GRAPH_API}/${pageId}/insights`, {
    params: {
      metric: 'page_impressions,page_engaged_users,page_fans',
      period: 'day',
      since, until,
      access_token: token,
    },
  });
  return data.data;
}

export async function refreshMetaToken(
  account: Account
): Promise<{ accessToken: string; expiresAt: Date }> {
  const { data } = await axios.get(`${GRAPH_API}/oauth/access_token`, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      fb_exchange_token: account.accessToken,
    },
  });

  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000),
  };
}
