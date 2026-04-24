import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../index';
import { jwtAuth } from '../middleware/jwtAuth';
import { ADMIN_EMAILS } from '../config/plans';

const router = Router();

function signToken(customerId: string, email: string): string {
  return jwt.sign({ customerId, email }, process.env.JWT_SECRET!, { expiresIn: '30d' });
}

// POST /api/customers/signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const apiKeyValue = `nrv_${uuidv4().replace(/-/g, '')}`;

    // Admin emails get agency plan for free
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    const customer = await prisma.customer.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        plan: isAdmin ? 'agency' : 'starter',
        subscriptionStatus: isAdmin ? 'active' : null,
        apiKeys: {
          create: { key: apiKeyValue, name: `${email}'s key` },
        },
      },
      include: { apiKeys: true },
    });

    const token = signToken(customer.id, customer.email);

    res.status(201).json({
      token,
      apiKey: customer.apiKeys[0].key,
      customer: { id: customer.id, email: customer.email, name: customer.name, plan: customer.plan },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// POST /api/customers/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken(customer.id, customer.email);
    res.json({ token, customer: { id: customer.id, email: customer.email, name: customer.name, plan: customer.plan } });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/customers/me
router.get('/me', jwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: (req as any).customerId },
      include: { apiKeys: { include: { usage: true } } },
    });
    if (!customer) { res.status(404).json({ error: 'Customer not found' }); return; }

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Aggregate usage across all keys for current month
    const usage = { posts: 0, captions: 0, reports: 0, accounts: 0 };
    for (const key of customer.apiKeys) {
      for (const u of key.usage) {
        if (u.month === month) {
          usage.posts += u.posts;
          usage.captions += u.captions;
          usage.reports += u.reports;
          usage.accounts += u.accounts;
        }
      }
    }

    res.json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      plan: customer.plan,
      subscriptionStatus: customer.subscriptionStatus,
      apiKeys: customer.apiKeys.map(k => ({ id: k.id, key: k.key, name: k.name })),
      usage,
      month,
    });
  } catch (err: any) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/customers/api-keys
router.post('/api-keys', jwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = (req as any).customerId;
    const existing = await prisma.apiKey.count({ where: { customerId } });
    if (existing >= 5) {
      res.status(400).json({ error: 'Maximum 5 API keys per customer' });
      return;
    }

    const key = `nrv_${uuidv4().replace(/-/g, '')}`;
    const apiKey = await prisma.apiKey.create({
      data: { key, name: req.body.name || 'API Key', customerId },
    });

    res.status(201).json({ id: apiKey.id, key: apiKey.key, name: apiKey.name });
  } catch (err: any) {
    console.error('API key error:', err);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

export default router;
