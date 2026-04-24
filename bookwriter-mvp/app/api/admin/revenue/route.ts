import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 25;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  try {
    // Get charges
    const allCharges: Stripe.Charge[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;
    while (hasMore && allCharges.length < 500) {
      const params: Stripe.ChargeListParams = {
        limit: 100,
        created: { gte: Math.floor(oneYearAgo.getTime() / 1000) },
      };
      if (startingAfter) params.starting_after = startingAfter;
      const batch = await stripe.charges.list(params);
      allCharges.push(...batch.data);
      hasMore = batch.has_more;
      if (batch.data.length > 0) startingAfter = batch.data[batch.data.length - 1].id;
    }

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let lastMonthRevenue = 0;
    const byMonth: Record<string, number> = {};
    const byType: Record<string, number> = { subscription: 0, one_time: 0 };
    const transactions: any[] = [];

    for (const charge of allCharges) {
      if (charge.status !== "succeeded") continue;
      const amount = charge.amount / 100;
      totalRevenue += amount;
      const d = new Date(charge.created * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] || 0) + amount;
      if (d >= startOfMonth) monthlyRevenue += amount;
      if (d >= startOfLastMonth && d < startOfMonth) lastMonthRevenue += amount;

      const isRecurring = !!(charge as any).invoice;
      byType[isRecurring ? "subscription" : "one_time"] += amount;

      transactions.push({
        id: charge.id,
        date: d.toISOString(),
        amount,
        email: charge.billing_details?.email || charge.receipt_email || "Unknown",
        description: charge.description || (isRecurring ? "Subscription" : "One-time purchase"),
        status: charge.status,
        type: isRecurring ? "subscription" : "one_time",
        refunded: charge.refunded,
      });
    }

    // Paginate transactions
    const totalTx = transactions.length;
    const paginatedTx = transactions.slice((page - 1) * limit, page * limit);

    // Monthly chart
    const revenueChart = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      revenueChart.push({ month: key, revenue: byMonth[key] || 0 });
    }

    return NextResponse.json({
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      byType,
      revenueChart,
      transactions: paginatedTx,
      totalTransactions: totalTx,
      page,
      totalPages: Math.ceil(totalTx / limit),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
