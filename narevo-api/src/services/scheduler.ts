import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../index';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const postQueue = new Queue('post-publish', { connection });

export function schedulePost(post: { id: string; scheduledAt: Date | null }): void {
  if (!post.scheduledAt) return;

  const delay = new Date(post.scheduledAt).getTime() - Date.now();

  postQueue.add(
    'publish',
    { postId: post.id },
    {
      delay: Math.max(delay, 0),
      jobId: `post-${post.id}`,
      removeOnComplete: true,
      removeOnFail: 100,
      attempts: 3,
      backoff: { type: 'exponential', delay: 30000 },
    }
  ).then(() => {
    console.log(`[SCHEDULER] Queued post ${post.id} for ${post.scheduledAt} (delay: ${Math.round(Math.max(delay, 0) / 1000)}s)`);
  }).catch(console.error);
}

export async function removeScheduledPost(postId: string): Promise<void> {
  const job = await postQueue.getJob(`post-${postId}`);
  if (job) await job.remove();
}

export async function initScheduler(): Promise<void> {
  const posts = await prisma.post.findMany({
    where: { status: 'scheduled', scheduledAt: { gt: new Date() } },
  });

  console.log(`[SCHEDULER] Loading ${posts.length} scheduled posts into queue`);
  for (const post of posts) {
    schedulePost(post);
  }
}
