import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { PLANS, ADMIN_EMAILS } from '../config/plans';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

type UsageField = 'posts' | 'captions' | 'reports' | 'accounts';

function getUsageField(path: string, method: string): UsageField | null {
  if (path.startsWith('/api/posts') && (method === 'POST')) return 'posts';
  if (path.startsWith('/api/captions')) return 'captions';
  if (path.startsWith('/api/analytics') && path.includes('report')) return 'reports';
  if (path.startsWith('/api/accounts') && method === 'POST') return 'accounts';
  return null;
}

export async function usageLimiter(req: Request, res: Response, next: NextFunction): Promise<void> {
  const apiKeyId = (req as any).apiKeyId;
  if (!apiKeyId) { next(); return; }

  const field = getUsageField(req.path, req.method);
  if (!field) { next(); return; }

  // Get the API key with customer
  const apiKey = await prisma.apiKey.findUnique({ where: { id: apiKeyId }, include: { customer: true } });
  if (!apiKey?.customer) { next(); return; }

  // Admin emails bypass all limits
  if (ADMIN_EMAILS.includes(apiKey.customer.email)) { next(); return; }

  const plan = PLANS[apiKey.customer.plan];
  if (!plan) { next(); return; }

  const limit = plan[field];
  if (limit === -1) { next(); return; } // unlimited

  const month = getCurrentMonth();
  const usage = await prisma.usageTracker.findUnique({
    where: { apiKeyId_month: { apiKeyId, month } },
  });

  const used = usage ? (usage as any)[field] : 0;
  if (used >= limit) {
    res.status(403).json({
      error: 'Plan limit exceeded',
      limit: field,
      used,
      allowed: limit,
      upgrade: 'https://api.narevo.ai/pricing',
    });
    return;
  }

  // Increment after response
  res.on('finish', async () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        await prisma.usageTracker.upsert({
          where: { apiKeyId_month: { apiKeyId, month } },
          create: { apiKeyId, month, [field]: 1 },
          update: { [field]: { increment: 1 } },
        });
      } catch (e) { console.error('Usage tracking error:', e); }
    }
  });

  next();
}
