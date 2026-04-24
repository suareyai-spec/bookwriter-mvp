import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../index';
import { jwtAuth } from '../middleware/jwtAuth';
import { PLANS } from '../config/plans';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' as any });

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || '',
  growth: process.env.STRIPE_GROWTH_PRICE_ID || '',
  agency: process.env.STRIPE_AGENCY_PRICE_ID || '',
};

// POST /api/billing/checkout
router.post('/checkout', jwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { plan } = req.body;
    if (!plan || !PLANS[plan]) {
      res.status(400).json({ error: 'Invalid plan. Choose: starter, growth, agency' });
      return;
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      res.status(500).json({ error: 'Price not configured. Run setup-stripe script first.' });
      return;
    }

    const customer = await prisma.customer.findUnique({ where: { id: (req as any).customerId } });
    if (!customer) { res.status(404).json({ error: 'Customer not found' }); return; }

    // Create Stripe customer if needed
    let stripeCustomerId = customer.stripeCustomerId;
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.name || undefined,
        metadata: { narevoCustomerId: customer.id },
      });
      stripeCustomerId = stripeCustomer.id;
      await prisma.customer.update({ where: { id: customer.id }, data: { stripeCustomerId } });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://api.narevo.ai/dashboard?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://api.narevo.ai/pricing',
      metadata: { narevoCustomerId: customer.id, plan },
    });

    res.json({ checkoutUrl: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/billing/webhook
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent((req as any).rawBody || req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = req.body as Stripe.Event;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.metadata?.narevoCustomerId;
        const plan = session.metadata?.plan;
        if (customerId && plan) {
          await prisma.customer.update({
            where: { id: customerId },
            data: {
              plan,
              subscriptionId: (session as any).subscription as string,
              subscriptionStatus: 'active',
            },
          });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const cust = await prisma.customer.findUnique({ where: { stripeCustomerId: sub.customer as string } });
        if (cust) {
          await prisma.customer.update({
            where: { id: cust.id },
            data: { subscriptionStatus: sub.status },
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const cust = await prisma.customer.findUnique({ where: { stripeCustomerId: sub.customer as string } });
        if (cust) {
          await prisma.customer.update({
            where: { id: cust.id },
            data: { subscriptionStatus: 'canceled', subscriptionId: null },
          });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const cust = await prisma.customer.findUnique({ where: { stripeCustomerId: invoice.customer as string } });
        if (cust) {
          await prisma.customer.update({
            where: { id: cust.id },
            data: { subscriptionStatus: 'past_due' },
          });
        }
        break;
      }
    }
  } catch (err: any) {
    console.error('Webhook processing error:', err);
  }

  res.json({ received: true });
});

// GET /api/billing/portal
router.get('/portal', jwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: (req as any).customerId } });
    if (!customer?.stripeCustomerId) {
      res.status(400).json({ error: 'No billing account found. Subscribe to a plan first.' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: 'https://api.narevo.ai/dashboard',
    });

    res.json({ portalUrl: session.url });
  } catch (err: any) {
    console.error('Portal error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

export default router;
