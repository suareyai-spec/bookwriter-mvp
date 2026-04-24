import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [coupons, promoCodes] = await Promise.all([
      stripe.coupons.list({ limit: 100 }),
      stripe.promotionCodes.list({ limit: 100, expand: ["data.coupon"] }),
    ]);

    return NextResponse.json({
      coupons: coupons.data.map((c) => ({
        id: c.id,
        name: c.name,
        percentOff: c.percent_off,
        amountOff: c.amount_off ? c.amount_off / 100 : null,
        currency: c.currency,
        duration: c.duration,
        durationInMonths: c.duration_in_months,
        maxRedemptions: c.max_redemptions,
        timesRedeemed: c.times_redeemed,
        valid: c.valid,
        redeemBy: c.redeem_by ? new Date(c.redeem_by * 1000).toISOString() : null,
      })),
      promoCodes: promoCodes.data.map((p: any) => ({
        id: p.id,
        code: p.code,
        couponId: typeof p.coupon === "string" ? p.coupon : p.coupon?.id,
        active: p.active,
        timesRedeemed: p.times_redeemed,
        maxRedemptions: p.max_redemptions,
        expiresAt: p.expires_at ? new Date(p.expires_at * 1000).toISOString() : null,
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
    const body = await req.json();
    const { name, percentOff, amountOff, duration, durationInMonths, maxRedemptions, redeemBy, code } = body;

    const couponParams: Stripe.CouponCreateParams = {
      name,
      duration: duration || "once",
    };
    if (percentOff) couponParams.percent_off = percentOff;
    if (amountOff) {
      couponParams.amount_off = Math.round(amountOff * 100);
      couponParams.currency = "usd";
    }
    if (durationInMonths) couponParams.duration_in_months = durationInMonths;
    if (maxRedemptions) couponParams.max_redemptions = maxRedemptions;
    if (redeemBy) couponParams.redeem_by = Math.floor(new Date(redeemBy).getTime() / 1000);

    const coupon = await stripe.coupons.create(couponParams);

    let promoCode = null;
    if (code) {
      promoCode = await stripe.promotionCodes.create({
        promotion: coupon.id as string,
        code,
        max_redemptions: maxRedemptions || undefined,
      } as any);
    }

    return NextResponse.json({ coupon, promoCode });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { couponId, promoCodeId } = await req.json();
    if (promoCodeId) {
      await stripe.promotionCodes.update(promoCodeId, { active: false });
    }
    if (couponId) {
      await stripe.coupons.del(couponId);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
