import { Router, Request, Response } from 'express';
import { generateCaptions } from '../services/captions';

const router = Router();

// POST /api/captions/generate
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  const { topic, platform, tone, length, count } = req.body;

  if (!topic || !platform) {
    res.status(400).json({ error: 'topic and platform are required' });
    return;
  }

  const captions = await generateCaptions({
    topic,
    platform,
    tone: tone || 'engaging',
    length: length || 'medium',
    count: count || 3,
  });

  res.json({ captions });
});

export default router;
