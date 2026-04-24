import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

function deriveAction(method: string, path: string): string {
  const parts = path.replace(/^\/api\//, '').split('/');
  const resource = parts[0] || 'unknown';
  const subAction = parts[1] || method.toLowerCase();
  const methodMap: Record<string, string> = { POST: 'create', PUT: 'update', DELETE: 'delete' };
  return `${resource}.${methodMap[method] || subAction}`;
}

function deriveResource(method: string, path: string): string | null {
  const match = path.match(/\/api\/(\w+)\/([a-f0-9-]+)/);
  if (match) return `${match[1]}:${match[2]}`;
  return null;
}

export function auditLog(req: Request, res: Response, next: NextFunction): void {
  // Only log mutating requests
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    next();
    return;
  }

  // Capture info before next() in case it changes
  const apiKey = req.headers.authorization?.slice(7);
  const action = deriveAction(req.method, req.path);
  const resource = deriveResource(req.method, req.path);
  const ip = req.ip || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || null;

  // Write asynchronously — don't block the request
  res.on('finish', () => {
    prisma.apiKey.findUnique({ where: { key: apiKey || '' } })
      .then((found) => {
        return prisma.auditLog.create({
          data: {
            apiKeyId: found?.id || null,
            action,
            resource,
            ip,
            userAgent,
            metadata: { statusCode: res.statusCode, method: req.method, path: req.path },
          },
        });
      })
      .catch((err) => {
        console.error('[AUDIT] Failed to write audit log:', err.message);
      });
  });

  next();
}
