import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 25;

  try {
    // Get recent charges
    const chargeParams: Stripe.ChargeListParams = { limit: 100 };
    const charges = await stripe.charges.list(chargeParams);

    let filteredCharges = charges.data;
    if (search) {
      const s = search.toLowerCase();
      filteredCharges = filteredCharges.filter(
        (c) =>
          c.id.toLowerCase().includes(s) ||
          (c.billing_details?.email || "").toLowerCase().includes(s) ||
          (c.receipt_email || "").toLowerCase().includes(s)
      );
    }

    const paginatedCharges = filteredCharges.slice((page - 1) * limit, page * limit);

    // Get refunds
    const refunds = await stripe.refunds.list({ limit: 50 });

    return NextResponse.json({
      charges: paginatedCharges.map((c) => ({
        id: c.id,
        date: new Date(c.created * 1000).toISOString(),
        amount: c.amount / 100,
        email: c.billing_details?.email || c.receipt_email || "Unknown",
        description: c.description || "Payment",
        status: c.status,
        refunded: c.refunded,
        amountRefunded: c.amount_refunded / 100,
      })),
      totalCharges: filteredCharges.length,
      page,
      totalPages: Math.ceil(filteredCharges.length / limit),
      refunds: refunds.data.map((r) => ({
        id: r.id,
        chargeId: r.charge,
        amount: r.amount / 100,
        reason: r.reason,
        status: r.status,
        created: new Date(r.created * 1000).toISOString(),
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { chargeId, amount, reason } = await req.json();
    if (!chargeId) return NextResponse.json({ error: "chargeId required" }, { status: 400 });

    const params: Stripe.RefundCreateParams = { charge: chargeId };
    if (amount) params.amount = Math.round(amount * 100);
    if (reason) params.reason = reason as Stripe.RefundCreateParams.Reason;

    const refund = await stripe.refunds.create(params);
    return NextResponse.json({ refund });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
