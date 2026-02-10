import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS, CREDIT_PRICES, PlanKey } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { type, plan, creditSize } = body as {
    type: "subscription" | "credit";
    plan?: PlanKey;
    creditSize?: string;
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
              name: `MyBook ${planConfig.name} Plan`,
              description: `Monthly subscription — ${planConfig.name}`,
            },
            unit_amount: planConfig.price,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: user.id, plan },
      success_url: `${origin}/pricing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  if (type === "credit" && creditSize) {
    const userPlan = (user.subscriptionPlan as string) || "none";
    const prices = CREDIT_PRICES[userPlan] || CREDIT_PRICES.none;
    const amount = prices[creditSize];
    if (!amount) return NextResponse.json({ error: "Invalid credit size" }, { status: 400 });

    const sizeLabels: Record<string, string> = {
      short: "Short Book (10k words)",
      medium: "Medium Book (25k words)",
      standard: "Standard Book (50k words)",
      epic: "Epic Book (100k words)",
    };

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `MyBook ${sizeLabels[creditSize] || creditSize} Credit`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: { userId: user.id, creditSize, type: "credit" },
      success_url: `${origin}/library?credit_purchased=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
