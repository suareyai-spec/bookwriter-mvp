import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import accountRoutes from './routes/accounts';
import postRoutes from './routes/posts';
import captionRoutes from './routes/captions';
import analyticsRoutes from './routes/analytics';
import customerRoutes from './routes/customers';
import billingRoutes from './routes/billing';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { auditLog } from './middleware/auditLog';
import { usageLimiter } from './middleware/usageLimiter';
import oauthRoutes from './routes/oauth';
import { initScheduler } from './services/scheduler';

dotenv.config();

export const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3002;

// Security headers
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use((req, res, next) => {
  if (req.path === '/api/billing/webhook') {
    express.raw({ type: 'application/json', limit: '50mb' })(req, res, (err) => {
      if (err) return next(err);
      (req as any).rawBody = req.body;
      next();
    });
  } else {
    express.json({ limit: '50mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting & audit logging (applied globally)
app.use(rateLimiter);
app.use(auditLog);

// Static pages
const publicDir = path.join(__dirname, '..', 'public');
app.get('/docs', (_req, res) => res.sendFile('docs.html', { root: publicDir }));
app.get('/pricing', (_req, res) => res.sendFile('pricing.html', { root: publicDir }));
app.get('/signup', (_req, res) => res.sendFile('signup.html', { root: publicDir }));
app.get('/login', (_req, res) => res.sendFile('login.html', { root: publicDir }));
app.get('/dashboard', (_req, res) => res.sendFile('dashboard.html', { root: publicDir }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (protected by master secret)
app.use('/api/keys', authRoutes);

// Customer & billing routes
app.use('/api/customers', customerRoutes);
app.use('/api/billing', billingRoutes);

// OAuth routes (public — callbacks need to be accessible)
app.use('/api/oauth', oauthRoutes);

// Protected routes
app.use('/api/accounts', authMiddleware, usageLimiter, accountRoutes);
app.use('/api/posts', authMiddleware, usageLimiter, postRoutes);
app.use('/api/captions', authMiddleware, usageLimiter, captionRoutes);
app.use('/api/analytics', authMiddleware, usageLimiter, analyticsRoutes);

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Narevo API running on port ${PORT}`);
  initScheduler().catch(console.error);
});

export default app;
