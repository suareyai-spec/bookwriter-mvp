import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(category: string): Map<string, RateLimitEntry> {
  if (!stores.has(category)) {
    stores.set(category, new Map());
  }
  return stores.get(category)!;
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const store of stores.values()) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getCategory(method: string, path: string): { category: string; config: RateLimitConfig } {
  if (method === 'POST' && path.startsWith('/api/keys')) {
    return { category: 'keys', config: { windowMs: 3600000, max: 5 } };
  }
  if (method === 'POST' && path.startsWith('/api/posts')) {
    return { category: 'posts', config: { windowMs: 3600000, max: 100 } };
  }
  if (method === 'POST' && path.startsWith('/api/captions/generate')) {
    return { category: 'captions', config: { windowMs: 3600000, max: 50 } };
  }
  if (method === 'GET' && path.startsWith('/api/analytics')) {
    return { category: 'analytics', config: { windowMs: 3600000, max: 200 } };
  }
  return { category: 'general', config: { windowMs: 3600000, max: 1000 } };
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const { category, config } = getCategory(req.method, req.path);
  const store = getStore(category);

  // Use API key for most routes, IP for /api/keys
  const authHeader = req.headers.authorization;
  const identifier = category === 'keys'
    ? (req.ip || req.socket.remoteAddress || 'unknown')
    : (authHeader?.slice(7) || req.ip || 'unknown');

  const key = `${identifier}`;
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + config.windowMs };
    store.set(key, entry);
  }

  entry.count++;

  const remaining = Math.max(0, config.max - entry.count);
  const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

  res.setHeader('X-RateLimit-Limit', config.max);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

  if (entry.count > config.max) {
    res.setHeader('Retry-After', resetSeconds);
    res.status(429).json({ error: 'Too many requests', retryAfter: resetSeconds });
    return;
  }

  next();
}
