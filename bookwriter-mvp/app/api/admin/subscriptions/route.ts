import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim() || "";
  const plan = url.searchParams.get("plan") || "";
  const status = url.searchParams.get("status") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = 25;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (plan === "none") {
    where.subscriptionPlan = null;
  } else if (plan) {
    where.subscriptionPlan = plan;
  }
  if (status) {
    where.subscriptionStatus = status;
  }

  const [users, total, totalActive, planBreakdown] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        monthlyCredits: true,
        purchasedCredits: true,
        creditsRollover: true,
        createdAt: true,
        _count: { select: { books: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { subscriptionStatus: "active" } }),
    prisma.user.groupBy({ by: ["subscriptionPlan"], where: { subscriptionStatus: "active" }, _count: true }),
  ]);

  // Last generation date per user — one grouped query instead of N+1.
  const userIds = users.map((u) => u.id);
  const lastGen = userIds.length
    ? await prisma.book.groupBy({ by: ["userId"], where: { userId: { in: userIds } }, _max: { createdAt: true } })
    : [];
  const lastGenMap = new Map(lastGen.map((g) => [g.userId, g._max.createdAt]));

  const subscriptions = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    plan: u.subscriptionPlan || "free",
    status: u.subscriptionStatus || "none",
    creditsRemaining: (u.monthlyCredits ?? 0) + (u.purchasedCredits ?? 0) + (u.creditsRollover ?? 0),
    joinDate: u.createdAt,
    lastGenerationDate: lastGenMap.get(u.id) || null,
    totalGenerations: u._count.books,
  }));

  return NextResponse.json({
    subscriptions,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    stats: {
      totalActive,
      byPlan: planBreakdown.map((p) => ({ plan: p.subscriptionPlan || "free", count: p._count })),
    },
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
