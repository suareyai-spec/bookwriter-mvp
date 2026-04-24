import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeSubscribers,
    totalBooks,
    booksThisMonth,
    subscriptionBreakdown,
    newSignupsLast30,
    booksPerDay,
    totalApiCostAgg,
    monthlyApiCostAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: "active" } }),
    prisma.book.count(),
    prisma.book.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.groupBy({
      by: ["subscriptionPlan"],
      where: { subscriptionStatus: "active" },
      _count: true,
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.book.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.apiCost.aggregate({ _sum: { cost: true } }),
    prisma.apiCost.aggregate({ _sum: { cost: true }, where: { createdAt: { gte: startOfMonth } } }),
  ]);

  // Calculate MRR from active subscriptions
  const planPrices: Record<string, number> = {
    creator: 99,
    "author-pro": 199,
    studio: 349,
  };
  let mrr = 0;
  for (const sub of subscriptionBreakdown) {
    if (sub.subscriptionPlan) {
      mrr += (planPrices[sub.subscriptionPlan] || 0) * sub._count;
    }
  }

  // Revenue from Stripe
  let totalRevenue = 0;
  let monthlyRevenue = 0;
  let lastMonthRevenue = 0;
  const revenueByMonth: Record<string, number> = {};

  try {
    const charges = await stripe.charges.list({ limit: 100, created: { gte: Math.floor(new Date(now.getFullYear() - 1, now.getMonth(), 1).getTime() / 1000) } });
    for (const charge of charges.data) {
      if (charge.status === "succeeded") {
        const amount = charge.amount / 100;
        totalRevenue += amount;
        const d = new Date(charge.created * 1000);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        revenueByMonth[key] = (revenueByMonth[key] || 0) + amount;
        if (d >= startOfMonth) monthlyRevenue += amount;
        if (d >= startOfLastMonth && d < startOfMonth) lastMonthRevenue += amount;
      }
    }
  } catch (e) {
    // Stripe may fail if no key
  }

  // Format signups by day
  const signupsByDay: Record<string, number> = {};
  for (const u of newSignupsLast30) {
    const key = u.createdAt.toISOString().slice(0, 10);
    signupsByDay[key] = (signupsByDay[key] || 0) + 1;
  }

  const booksByDay: Record<string, number> = {};
  for (const b of booksPerDay) {
    const key = b.createdAt.toISOString().slice(0, 10);
    booksByDay[key] = (booksByDay[key] || 0) + 1;
  }

  // Build last 12 months revenue array
  const revenueChart = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    revenueChart.push({ month: key, revenue: revenueByMonth[key] || 0 });
  }

  // Build last 30 days arrays
  const signupsChart = [];
  const booksChart = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    signupsChart.push({ date: key, count: signupsByDay[key] || 0 });
    booksChart.push({ date: key, count: booksByDay[key] || 0 });
  }

  const totalApiCost = totalApiCostAgg._sum.cost || 0;
  const monthlyApiCost = monthlyApiCostAgg._sum.cost || 0;

  return NextResponse.json({
    totalUsers,
    activeSubscribers,
    totalBooks,
    booksThisMonth,
    mrr,
    totalRevenue,
    monthlyRevenue,
    lastMonthRevenue,
    totalApiCost,
    monthlyApiCost,
    netProfit: totalRevenue - totalApiCost,
    subscriptionBreakdown: subscriptionBreakdown.map((s) => ({
      plan: s.subscriptionPlan || "No Plan",
      count: s._count,
    })),
    revenueChart,
    signupsChart,
    booksChart,
  });
}
