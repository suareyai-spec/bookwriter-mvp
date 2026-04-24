import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { schedulePost, removeScheduledPost } from '../services/scheduler';
import { publishPostToPlatform } from '../services/platforms';

const router = Router();

// POST /api/posts/schedule
router.post('/schedule', async (req: Request, res: Response): Promise<void> => {
  const { accountId, content, mediaUrls, thumbnailUrl, scheduledAt, platform } = req.body;

  if (!accountId || !content || !scheduledAt || !platform) {
    res.status(400).json({ error: 'accountId, content, scheduledAt, and platform are required' });
    return;
  }

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }

  const post = await prisma.post.create({
    data: {
      accountId, platform, content,
      mediaUrls: mediaUrls || null,
      thumbnailUrl,
      scheduledAt: new Date(scheduledAt),
      status: 'scheduled',
    },
  });

  schedulePost(post);
  res.status(201).json(post);
});

// POST /api/posts/publish
router.post('/publish', async (req: Request, res: Response): Promise<void> => {
  const { accountId, content, mediaUrls, thumbnailUrl, platform } = req.body;

  if (!accountId || !content || !platform) {
    res.status(400).json({ error: 'accountId, content, and platform are required' });
    return;
  }

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }

  const post = await prisma.post.create({
    data: {
      accountId, platform, content,
      mediaUrls: mediaUrls || null,
      thumbnailUrl, status: 'publishing',
    },
  });

  try {
    const result = await publishPostToPlatform(account, post);
    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { status: 'published', publishedAt: new Date(), platformPostId: result.platformPostId },
    });
    res.status(201).json(updated);
  } catch (err: any) {
    await prisma.post.update({
      where: { id: post.id },
      data: { status: 'failed', errorMessage: err.message },
    });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { status, platform, startDate, endDate } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (platform) where.platform = platform;
  if (startDate || endDate) {
    where.scheduledAt = {};
    if (startDate) where.scheduledAt.gte = new Date(startDate as string);
    if (endDate) where.scheduledAt.lte = new Date(endDate as string);
  }

  const posts = await prisma.post.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(posts);
});

// GET /api/posts/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id as string } });
  if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
  res.json(post);
});

// PUT /api/posts/:id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { content, mediaUrls, thumbnailUrl, scheduledAt } = req.body;
  const data: any = {};
  if (content !== undefined) data.content = content;
  if (mediaUrls !== undefined) data.mediaUrls = mediaUrls;
  if (thumbnailUrl !== undefined) data.thumbnailUrl = thumbnailUrl;
  if (scheduledAt !== undefined) data.scheduledAt = new Date(scheduledAt);

  const post = await prisma.post.update({ where: { id: req.params.id as string }, data });
  if (scheduledAt) schedulePost(post);
  res.json(post);
});

// DELETE /api/posts/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  await removeScheduledPost(req.params.id as string);
  await prisma.post.delete({ where: { id: req.params.id as string } });
  res.json({ success: true });
});

export default router;
