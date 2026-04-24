import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  try {
    // All costs
    const allCosts = await prisma.apiCost.findMany({
      include: { user: { select: { email: true, subscriptionPlan: true } } },
      orderBy: { createdAt: "desc" },
    });

    const totalCost = allCosts.reduce((s, c) => s + c.cost, 0);
    const monthlyCost = allCosts.filter(c => c.createdAt >= startOfMonth).reduce((s, c) => s + c.cost, 0);
    const lastMonthCost = allCosts.filter(c => c.createdAt >= startOfLastMonth && c.createdAt < startOfMonth).reduce((s, c) => s + c.cost, 0);

    // By type
    const types = ["book", "revision", "special", "newsletter", "article", "translation", "humanizer"] as const;
    const byType: Record<string, number> = {};
    const countByType: Record<string, number> = {};
    const tokensByType: Record<string, number> = {};
    for (const t of types) {
      const items = allCosts.filter(c => c.type === t);
      byType[t] = items.reduce((s, c) => s + c.cost, 0);
      countByType[t] = items.length;
      tokensByType[t] = items.reduce((s, c) => s + c.inputTokens + c.outputTokens, 0);
    }

    // By month (last 12)
    const byMonth: { month: string; cost: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const cost = allCosts.filter(c => c.createdAt >= d && c.createdAt < end).reduce((s, c) => s + c.cost, 0);
      byMonth.push({ month: key, cost });
    }

    // By user (top 10)
    const userMap: Record<string, { email: string; plan: string | null; cost: number; count: number }> = {};
    for (const c of allCosts) {
      if (!userMap[c.userId]) {
        userMap[c.userId] = { email: c.user.email, plan: c.user.subscriptionPlan, cost: 0, count: 0 };
      }
      userMap[c.userId].cost += c.cost;
      userMap[c.userId].count++;
    }
    const byUser = Object.values(userMap)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10)
      .map(u => ({ email: u.email, plan: u.plan, cost: u.cost, generations: u.count }));

    // Recent costs (last 50)
    const recentCosts = allCosts.slice(0, 50).map(c => ({
      date: c.createdAt.toISOString(),
      user: c.user.email,
      type: c.type,
      inputTokens: c.inputTokens,
      outputTokens: c.outputTokens,
      tokens: c.inputTokens + c.outputTokens,
      cost: c.cost,
    }));

    // Average cost per generation
    const avgCost = (type: string) => {
      const items = allCosts.filter(c => c.type === type);
      return items.length > 0 ? items.reduce((s, c) => s + c.cost, 0) / items.length : 0;
    };
    const averageCostPerGeneration = {
      book: avgCost("book"),
      newsletter: avgCost("newsletter"),
      article: avgCost("article"),
      translation: avgCost("translation"),
    };

    // Cost by type detail for table
    const costByTypeDetail = types.map(t => ({
      type: t,
      calls: countByType[t],
      totalTokens: tokensByType[t],
      totalCost: byType[t],
      avgCostPerCall: countByType[t] > 0 ? byType[t] / countByType[t] : 0,
    }));

    return NextResponse.json({
      totalCost,
      monthlyCost,
      lastMonthCost,
      byType,
      byMonth,
      byUser,
      recentCosts,
      averageCostPerGeneration,
      costByTypeDetail,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
