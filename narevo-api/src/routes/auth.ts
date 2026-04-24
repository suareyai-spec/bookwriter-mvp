import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../index';

const router = Router();

// POST /api/keys — generate a new API key (protected by master secret)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, masterSecret } = req.body;

  if (masterSecret !== process.env.MASTER_SECRET) {
    res.status(403).json({ error: 'Invalid master secret' });
    return;
  }

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const key = `nrv_${uuidv4().replace(/-/g, '')}`;
  const apiKey = await prisma.apiKey.create({
    data: { key, name },
  });

  res.status(201).json({ id: apiKey.id, key: apiKey.key, name: apiKey.name });
});

// PUT /api/keys/:id/allowed-ips — set allowed IPs for an API key
router.put('/:id/allowed-ips', async (req: Request, res: Response): Promise<void> => {
  const { masterSecret, allowedIps } = req.body;

  if (masterSecret !== process.env.MASTER_SECRET) {
    res.status(403).json({ error: 'Invalid master secret' });
    return;
  }

  if (allowedIps !== null && !Array.isArray(allowedIps)) {
    res.status(400).json({ error: 'allowedIps must be an array of IP strings or null' });
    return;
  }

  const apiKey = await prisma.apiKey.update({
    where: { id: req.params.id as string },
    data: { allowedIps: allowedIps },
  });

  res.json({ id: apiKey.id, name: apiKey.name, allowedIps: apiKey.allowedIps });
});

export default router;
