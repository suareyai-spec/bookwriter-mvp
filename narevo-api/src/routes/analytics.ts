import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// GET /api/analytics/:accountId
router.get('/:accountId', async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  const where: any = { accountId: req.params.accountId };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  const analytics = await prisma.analytics.findMany({ where, orderBy: { date: 'desc' } });
  res.json(analytics);
});

// GET /api/analytics/:accountId/summary
router.get('/:accountId/summary', async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  const where: any = { accountId: req.params.accountId };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  const result = await prisma.analytics.aggregate({
    where,
    _sum: { followers: true, impressions: true, reach: true, likes: true, comments: true, shares: true, clicks: true },
    _avg: { engagement: true },
    _count: true,
  });

  res.json({
    totalRecords: result._count,
    totals: result._sum,
    averageEngagement: result._avg.engagement,
  });
});

// POST /api/analytics/report
router.post('/report', async (req: Request, res: Response): Promise<void> => {
  const { accountId, period, brandName, brandLogo, brandColor } = req.body;

  if (!accountId || !period) {
    res.status(400).json({ error: 'accountId and period are required' });
    return;
  }

  // Parse period to get date range
  const [year, month] = period.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const analytics = await prisma.analytics.findMany({
    where: {
      accountId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  });

  // TODO: Generate actual PDF with a library like pdfkit
  // For now, store report metadata
  const report = await prisma.report.create({
    data: {
      accountId,
      period,
      metadata: {
        brandName, brandLogo, brandColor,
        dataPoints: analytics.length,
        summary: {
          totalImpressions: analytics.reduce((s, a) => s + a.impressions, 0),
          totalReach: analytics.reduce((s, a) => s + a.reach, 0),
          totalLikes: analytics.reduce((s, a) => s + a.likes, 0),
          totalComments: analytics.reduce((s, a) => s + a.comments, 0),
          totalShares: analytics.reduce((s, a) => s + a.shares, 0),
          avgEngagement: analytics.length > 0
            ? analytics.reduce((s, a) => s + a.engagement, 0) / analytics.length
            : 0,
        },
      },
    },
  });

  res.status(201).json(report);
});

export default router;
