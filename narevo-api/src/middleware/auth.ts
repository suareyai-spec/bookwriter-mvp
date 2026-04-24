import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  // JWT token (starts with eyJ)
  if (token.startsWith('eyJ')) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { customerId: string; email: string };
      const customer = await prisma.customer.findUnique({
        where: { id: decoded.customerId },
        include: { apiKeys: true },
      });
      if (!customer || !customer.apiKeys.length) {
        res.status(401).json({ error: 'Invalid token or no API key' });
        return;
      }
      (req as any).apiKeyId = customer.apiKeys[0].id;
      (req as any).customerId = customer.id;
      next();
      return;
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  }

  // API key auth (nrv_...)
  const apiKey = await prisma.apiKey.findUnique({ where: { key: token }, include: { customer: true } });
  if (!apiKey) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  // IP allowlisting check
  if (apiKey.allowedIps) {
    const allowedIps = apiKey.allowedIps as string[];
    const clientIp = req.ip || req.socket.remoteAddress || '';
    if (Array.isArray(allowedIps) && allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
      res.status(403).json({ error: 'IP not allowed' });
      return;
    }
  }

  (req as any).apiKeyId = apiKey.id;
  if (apiKey.customer) {
    (req as any).customerId = apiKey.customer.id;
  }

  next();
}
