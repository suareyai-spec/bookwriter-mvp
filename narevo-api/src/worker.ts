import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { decrypt, encrypt } from './services/encryption';
import { publishToFacebook, publishToInstagram, refreshMetaToken } from './services/meta';
import { uploadVideo, refreshYouTubeToken } from './services/youtube';
import { publishToTikTok, refreshTikTokToken } from './services/tiktok';

dotenv.config();

const prisma = new PrismaClient();

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

function decryptAccount(account: any) {
  return {
    ...account,
    accessToken: decrypt(account.accessToken),
    refreshToken: account.refreshToken ? decrypt(account.refreshToken) : null,
  };
}

async function tryRefreshToken(account: any): Promise<any> {
  const decrypted = decryptAccount(account);
  let result: { accessToken: string; refreshToken?: string; expiresAt: Date };

  switch (account.platform) {
    case 'facebook':
    case 'instagram':
      result = await refreshMetaToken(decrypted);
      break;
    case 'youtube':
      result = await refreshYouTubeToken(decrypted);
      break;
    case 'tiktok':
      result = await refreshTikTokToken(decrypted);
      break;
    default:
      throw new Error(`Cannot refresh token for platform: ${account.platform}`);
  }

  const updated = await prisma.account.update({
    where: { id: account.id },
    data: {
      accessToken: encrypt(result.accessToken),
      ...(result.refreshToken ? { refreshToken: encrypt(result.refreshToken) } : {}),
      tokenExpiresAt: result.expiresAt,
    },
  });

  return updated;
}

async function publishPost(account: any, post: any): Promise<{ platformPostId: string }> {
  const decrypted = decryptAccount(account);
  const mediaUrls = Array.isArray(post.mediaUrls) ? post.mediaUrls as string[] : [];

  switch (post.platform) {
    case 'facebook':
      return publishToFacebook(decrypted, post.content, mediaUrls);
    case 'instagram':
      return publishToInstagram(decrypted, post.content, mediaUrls);
    case 'youtube':
      return uploadVideo(decrypted, mediaUrls[0] || '', post.content, '', []);
    case 'tiktok':
      return publishToTikTok(decrypted, post.content, mediaUrls[0]);
    default:
      throw new Error(`Unsupported platform: ${post.platform}`);
  }
}

const worker = new Worker(
  'post-publish',
  async (job: Job) => {
    const { postId } = job.data;
    console.log(`[WORKER] Processing post ${postId}`);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { account: true },
    });

    if (!post) {
      console.log(`[WORKER] Post ${postId} not found, skipping`);
      return;
    }

    if (post.status !== 'scheduled') {
      console.log(`[WORKER] Post ${postId} status is ${post.status}, skipping`);
      return;
    }

    await prisma.post.update({
      where: { id: postId },
      data: { status: 'publishing' },
    });

    let account = post.account;

    // Check if token is expired and try to refresh
    if (account.tokenExpiresAt && account.tokenExpiresAt < new Date()) {
      console.log(`[WORKER] Token expired for account ${account.id}, refreshing...`);
      try {
        account = await tryRefreshToken(account);
      } catch (refreshErr: any) {
        console.error(`[WORKER] Token refresh failed:`, refreshErr.message);
        await prisma.post.update({
          where: { id: postId },
          data: { status: 'failed', errorMessage: `Token refresh failed: ${refreshErr.message}` },
        });
        throw refreshErr;
      }
    }

    try {
      const result = await publishPost(account, post);

      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'published',
          publishedAt: new Date(),
          platformPostId: result.platformPostId,
        },
      });

      console.log(`[WORKER] Post ${postId} published successfully: ${result.platformPostId}`);
    } catch (publishErr: any) {
      // If it looks like a token error, try refresh and retry once
      const isAuthError = publishErr.response?.status === 401 ||
        publishErr.response?.status === 190 ||
        publishErr.message?.includes('token') ||
        publishErr.message?.includes('auth');

      if (isAuthError) {
        console.log(`[WORKER] Auth error, attempting token refresh and retry...`);
        try {
          account = await tryRefreshToken(account);
          const result = await publishPost(account, post);
          await prisma.post.update({
            where: { id: postId },
            data: {
              status: 'published',
              publishedAt: new Date(),
              platformPostId: result.platformPostId,
            },
          });
          console.log(`[WORKER] Post ${postId} published after token refresh: ${result.platformPostId}`);
          return;
        } catch (retryErr: any) {
          console.error(`[WORKER] Retry after refresh also failed:`, retryErr.message);
        }
      }

      throw publishErr;
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on('failed', async (job, err) => {
  console.error(`[WORKER] Job ${job?.id} failed:`, err.message);

  if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
    const { postId } = job.data;
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'failed', errorMessage: err.message },
    }).catch(console.error);
  }
});

worker.on('completed', (job) => {
  console.log(`[WORKER] Job ${job.id} completed`);
});

worker.on('ready', () => {
  console.log('[WORKER] Ready and waiting for jobs');
});

console.log('[WORKER] Post publish worker started');
