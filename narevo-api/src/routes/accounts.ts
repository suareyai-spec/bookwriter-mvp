import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { refreshTokenForAccount } from '../services/platforms';
import { encrypt } from '../services/encryption';

const router = Router();

// POST /api/accounts/connect
router.post('/connect', async (req: Request, res: Response): Promise<void> => {
  const { platform, platformAccountId, accountName, accessToken, refreshToken, tokenExpiresAt, metadata } = req.body;

  if (!platform || !platformAccountId || !accountName || !accessToken) {
    res.status(400).json({ error: 'platform, platformAccountId, accountName, and accessToken are required' });
    return;
  }

  const account = await prisma.account.create({
    data: {
      platform,
      platformAccountId,
      accountName,
      accessToken: encrypt(accessToken),
      refreshToken: refreshToken ? encrypt(refreshToken) : null,
      tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
      metadata: metadata || null,
    },
  });

  res.status(201).json({ id: account.id, platform: account.platform, platformAccountId: account.platformAccountId, accountName: account.accountName, createdAt: account.createdAt });
});

// GET /api/accounts
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const accounts = await prisma.account.findMany({
    select: {
      id: true, platform: true, platformAccountId: true, accountName: true,
      tokenExpiresAt: true, createdAt: true, updatedAt: true,
    },
  });
  res.json(accounts);
});

// DELETE /api/accounts/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  await prisma.account.delete({ where: { id: req.params.id as string } });
  res.json({ success: true });
});

// POST /api/accounts/:id/refresh
router.post('/:id/refresh', async (req: Request, res: Response): Promise<void> => {
  const account = await prisma.account.findUnique({ where: { id: req.params.id as string } });
  if (!account) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }

  const result = await refreshTokenForAccount(account);
  res.json(result);
});

export default router;
