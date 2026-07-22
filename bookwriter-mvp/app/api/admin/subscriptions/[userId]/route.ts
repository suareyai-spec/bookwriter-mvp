import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      subscriptionId: true,
      stripeCustomerId: true,
      monthlyCredits: true,
      purchasedCredits: true,
      creditsRollover: true,
      createdAt: true,
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const generationsThisMonth = await prisma.book.count({
    where: { userId, createdAt: { gte: startOfMonth } },
  });

  let currentPeriodEnd: string | null = null;
  let subscriptionPriceAmount: number | null = null;
  let cancelAtPeriodEnd = false;
  let billingHistory: { id: string; amountPaid: number; status: string | null; created: string; hostedInvoiceUrl: string | null }[] = [];

  if (user.subscriptionId) {
    try {
      const sub: any = await stripe.subscriptions.retrieve(user.subscriptionId);
      currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
      subscriptionPriceAmount = sub.items?.data?.[0]?.price?.unit_amount ? sub.items.data[0].price.unit_amount / 100 : null;
      cancelAtPeriodEnd = !!sub.cancel_at_period_end;
    } catch {
      // Subscription may no longer exist in Stripe
    }
  }

  if (user.stripeCustomerId) {
    try {
      const invoices = await stripe.invoices.list({ customer: user.stripeCustomerId, limit: 20 });
      billingHistory = invoices.data.map((inv) => ({
        id: inv.id || "",
        amountPaid: (inv.amount_paid || 0) / 100,
        status: inv.status,
        created: new Date(inv.created * 1000).toISOString(),
        hostedInvoiceUrl: inv.hosted_invoice_url || null,
      }));
    } catch {
      // Stripe may fail if customer has no invoices or key is invalid
    }
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.subscriptionPlan || "free",
      status: user.subscriptionStatus || "none",
      creditsRemaining: (user.monthlyCredits ?? 0) + (user.purchasedCredits ?? 0) + (user.creditsRollover ?? 0),
      joinDate: user.createdAt,
      subscriptionId: user.subscriptionId,
    },
    currentPeriodEnd,
    subscriptionPriceAmount,
    cancelAtPeriodEnd,
    generationsThisMonth,
    billingHistory,
  });
}
