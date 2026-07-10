import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { CREDIT_COST, getContentSizeFromLength } from "@/lib/credits";

// Current monthly plan prices in USD (mirrors lib/stripe.ts PLANS).
const PLAN_PRICES_USD: Record<string, number> = {
  starter: 19,
  author: 49,
  studio: 99,
};

function estimateCreditCost(book: { contentType: string; bookLength: string | null }): number {
  const ct = book.contentType || "book";
  if (ct === "book") {
    const size = getContentSizeFromLength(book.bookLength || "10,000 words");
    return CREDIT_COST[size] ?? CREDIT_COST.standard;
  }
  return CREDIT_COST[ct] ?? 0;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    signupsToday,
    signupsWeek,
    signupsMonth,
    generationsByType,
    subscriptionBreakdown,
    recentFailed,
    booksThisMonth,
    users,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.book.groupBy({ by: ["contentType"], _count: true, orderBy: { _count: { contentType: "desc" } } }),
    prisma.user.groupBy({ by: ["subscriptionPlan"], where: { subscriptionStatus: "active" }, _count: true }),
    prisma.book.findMany({
      where: { status: "failed" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, title: true, contentType: true, failedReason: true, createdAt: true, user: { select: { email: true } } },
    }),
    prisma.book.findMany({
      where: { createdAt: { gte: startOfMonth }, status: "complete" },
      select: { contentType: true, bookLength: true, userId: true },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        monthlyCredits: true,
        purchasedCredits: true,
        creditsRollover: true,
        createdAt: true,
        _count: { select: { books: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  // Revenue estimate from active subscriptions
  let revenueEstimate = 0;
  const subscriptionBreakdownOut = subscriptionBreakdown.map((s) => {
    const plan = s.subscriptionPlan || "none";
    revenueEstimate += (PLAN_PRICES_USD[plan] || 0) * s._count;
    return { plan, count: s._count };
  });

  // Credit usage: total credits spent this month (completed generations) / distinct active users this month
  let totalCreditsSpentThisMonth = 0;
  const activeUserIds = new Set<string>();
  for (const b of booksThisMonth) {
    totalCreditsSpentThisMonth += estimateCreditCost(b);
    activeUserIds.add(b.userId);
  }
  const avgCreditsPerActiveUser = activeUserIds.size > 0
    ? Math.round((totalCreditsSpentThisMonth / activeUserIds.size) * 10) / 10
    : 0;

  return NextResponse.json({
    totalUsers,
    signups: { today: signupsToday, week: signupsWeek, month: signupsMonth },
    generationsByType: generationsByType.map((g) => ({ type: g.contentType || "book", count: g._count })),
    subscriptionBreakdown: subscriptionBreakdownOut,
    revenueEstimate,
    recentFailedGenerations: recentFailed.map((b) => ({
      id: b.id,
      title: b.title,
      contentType: b.contentType,
      reason: b.failedReason,
      createdAt: b.createdAt,
      userEmail: b.user?.email || null,
    })),
    creditUsage: {
      totalCreditsSpentThisMonth,
      activeUsersThisMonth: activeUserIds.size,
      avgCreditsPerActiveUser,
    },
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      plan: u.subscriptionStatus === "active" ? (u.subscriptionPlan || "—") : "Free",
      creditsRemaining: (u.monthlyCredits ?? 0) + (u.purchasedCredits ?? 0) + (u.creditsRollover ?? 0),
      totalGenerations: u._count.books,
      joinedDate: u.createdAt,
    })),
  });
}
