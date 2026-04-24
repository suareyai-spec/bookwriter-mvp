import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "active";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 25;
  const skip = (page - 1) * limit;

  const where: any = { subscriptionId: { not: null } };
  if (status === "active") {
    where.subscriptionStatus = "active";
  } else if (status === "canceled") {
    where.subscriptionStatus = { in: ["canceled", "past_due", "unpaid"] };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true,
        subscriptionPlan: true, subscriptionStatus: true,
        subscriptionId: true, stripeCustomerId: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Get Stripe sub details for active ones
  const enriched = await Promise.all(
    users.map(async (u) => {
      let stripeSub: any = null;
      if (u.subscriptionId) {
        try {
          stripeSub = await stripe.subscriptions.retrieve(u.subscriptionId);
        } catch {}
      }
      return {
        ...u,
        currentPeriodEnd: stripeSub?.current_period_end
          ? new Date(stripeSub.current_period_end * 1000).toISOString()
          : null,
        canceledAt: stripeSub?.canceled_at
          ? new Date(stripeSub.canceled_at * 1000).toISOString()
          : null,
        priceAmount: stripeSub?.items?.data?.[0]?.price?.unit_amount
          ? stripeSub.items.data[0].price.unit_amount / 100
          : null,
      };
    })
  );

  // Churn rate
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totalActive, canceledRecently] = await Promise.all([
    prisma.user.count({ where: { subscriptionStatus: "active" } }),
    prisma.user.count({
      where: {
        subscriptionStatus: { in: ["canceled", "past_due"] },
        // approximation — we don't track cancel date in DB
      },
    }),
  ]);

  return NextResponse.json({
    subscriptions: enriched,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: { totalActive, canceledRecently, churnRate: totalActive > 0 ? canceledRecently / (totalActive + canceledRecently) : 0 },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { subscriptionId, userId } = await req.json();
  if (!subscriptionId) return NextResponse.json({ error: "subscriptionId required" }, { status: 400 });

  try {
    await stripe.subscriptions.cancel(subscriptionId);
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: "canceled" },
      });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
