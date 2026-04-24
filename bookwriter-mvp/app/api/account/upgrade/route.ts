import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS, PlanKey } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { plan } = body as { plan: PlanKey };

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planConfig = PLANS[plan];
  const origin = req.headers.get("origin") || "http://localhost:3000";

  // If user has an active subscription, switch plan via Stripe
  if (user.subscriptionId && (user.subscriptionStatus === "active" || user.subscriptionStatus === "canceling")) {
    try {
      const sub = await stripe.subscriptions.retrieve(user.subscriptionId);
      const currentItem = sub.items.data[0];

      if (!currentItem) {
        return NextResponse.json({ error: "Invalid subscription state" }, { status: 400 });
      }

      // Create a new price for the target plan
      const price = await stripe.prices.create({
        currency: "usd",
        unit_amount: planConfig.price,
        recurring: { interval: "month" },
        product_data: {
          name: `Plot Ghost ${planConfig.name} Plan`,
        },
      });

      // Determine proration behavior
      const currentPlanPrice = user.subscriptionPlan && PLANS[user.subscriptionPlan as PlanKey]
        ? PLANS[user.subscriptionPlan as PlanKey].price
        : 0;
      const isUpgrade = planConfig.price > currentPlanPrice;

      await stripe.subscriptions.update(user.subscriptionId, {
        items: [{ id: currentItem.id, price: price.id }],
        proration_behavior: isUpgrade ? "always_invoice" : "none",
        cancel_at_period_end: false,
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: plan,
          subscriptionStatus: "active",
        },
      });

      return NextResponse.json({ success: true, plan });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Failed to update subscription" }, { status: 500 });
    }
  }

  // No existing subscription — create checkout session
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

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Plot Ghost ${planConfig.name} Plan`,
            description: `Monthly subscription — ${planConfig.name}`,
          },
          unit_amount: planConfig.price,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    metadata: { userId: user.id, plan },
    success_url: `${origin}/account?upgraded=true`,
    cancel_url: `${origin}/account`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
