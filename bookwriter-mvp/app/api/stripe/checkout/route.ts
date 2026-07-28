import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS, PlanKey } from "@/lib/stripe";
import { getCreditPack } from "@/lib/credits";
import { rateLimitByUser } from "@/lib/rate-limit";
import { cookies } from "next/headers";

// The only two Stripe products PlotGhost sells: monthly subscriptions and
// one-time credit pack top-ups. There is no other paid path — every
// generation action is credit-metered (see lib/credits.ts).
//
// Env vars this route depends on:
//   STRIPE_SECRET_KEY — required. Set on lib/stripe.ts's `stripe` client at
//     module load; missing/invalid keys throw immediately on import, which
//     would break subscriptions too, not just credit packs (Stripe isn't
//     configured per-feature — it's one client for everything).
//
// No pre-created Stripe Price ID env vars are used for either product
// (e.g. no STRIPE_CREDIT_PACK_STARTER_PRICE_ID-style variables exist).
// Both subscription and credit-pack prices are created dynamically via
// price_data on each checkout session, sourced from PLANS (lib/stripe.ts)
// and CREDIT_PACKS (lib/credits.ts) — nothing extra needs to be added to
// Vercel to add or change a plan or pack; edit those two files instead.
export async function POST(req: Request) {
  try {
    return await handleCheckout(req);
  } catch (err) {
    console.error("[stripe/checkout] failed:", err);
    return NextResponse.json({ error: "Checkout is not available right now. Contact support." }, { status: 500 });
  }
}

async function handleCheckout(req: Request) {
  // --- RATE LIMIT ---
  const rl = await rateLimitByUser("stripe-checkout", 10, 60 * 60 * 1000);
  if (rl.blocked) return rl.blocked;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { type, plan } = body as {
    type: "subscription" | "credit_pack";
    plan?: PlanKey;
    packId?: string;
  };

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = req.headers.get("origin") || "http://localhost:3000";

  // Read affiliate code from cookie
  const cookieStore = await cookies();
  const affiliateCode = cookieStore.get('plotghost_ref')?.value || null;

  if (type === "subscription" && plan && PLANS[plan]) {
    const planConfig = PLANS[plan];

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `PlotGhost ${planConfig.name} Plan`,
              description: `Monthly subscription — ${planConfig.name}`,
            },
            unit_amount: planConfig.price,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: user.id, plan, ...(affiliateCode ? { affiliateCode } : {}) },
      success_url: `${origin}/pricing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  if (type === "credit_pack") {
    const pack = getCreditPack((body as any).packId || "");
    if (!pack) return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 });
    if (!pack.price || !pack.credits) {
      // Defensive check on the CREDIT_PACKS entry itself — not currently
      // reachable, but if a pack is ever added without a price/credits
      // value, fail with a friendly message instead of sending Stripe a
      // $0 or NaN line item.
      return NextResponse.json({ error: "Credit packs not yet configured. Contact support." }, { status: 503 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `PlotGhost ${pack.label}` },
          unit_amount: pack.price,
        },
        quantity: 1,
      }],
      metadata: { userId: user.id, type: "credit_pack", packId: pack.id, ...(affiliateCode ? { affiliateCode } : {}) },
      success_url: `${origin}/credits?purchased=true`,
      cancel_url: `${origin}/credits?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
