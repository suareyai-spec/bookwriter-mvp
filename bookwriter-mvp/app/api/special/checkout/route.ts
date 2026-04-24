import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { isAdmin, PREMIUM_PACKAGES } from "@/lib/config";

const PREMIUM_TIER_PRICES: Record<string, { amount: number; label: string }> = {
  'doctoral-thesis': { amount: 49900, label: "Premium Doctoral-Level Thesis Package" },
  'premium-playwright': { amount: 39900, label: "Premium Playwright Package" },
  'premium-comic': { amount: 39900, label: "Premium Comic Book Script Package" },
  'course-builder-pro': { amount: 39900, label: "Full Course Builder Pro Package" },
  'multi-language-bundle': { amount: 24900, label: "Multi-Language Expansion Bundle" },
};

const TIER_PRICES: Record<string, { amount: number; label: string }> = {
  comic_single: { amount: 9900, label: "Comic Book — Single Issue" },
  comic_full: { amount: 24900, label: "Comic Book — Full Story Arc" },
  play_standard: { amount: 14900, label: "Theatrical Play — Standard" },
  play_long: { amount: 24900, label: "Theatrical Play — Long Multi-Act" },
  thesis_standard: { amount: 19900, label: "Academic Thesis — Standard" },
  thesis_doctoral: { amount: 29900, label: "Academic Thesis — Doctoral-Level" },
  course_mini: { amount: 9900, label: "Course Builder — Mini" },
  course_full: { amount: 19900, label: "Course Builder — Full" },
  course_premium: { amount: 24900, label: "Course Builder — Premium + Workbook" },
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { tier, packageType, bookId, targetLanguages } = body as {
    tier?: string;
    packageType?: string;
    bookId?: string;
    targetLanguages?: string[];
  };

  // Handle premium package purchase
  if (packageType) {
    const premiumConfig = PREMIUM_TIER_PRICES[packageType];
    if (!premiumConfig) return NextResponse.json({ error: "Invalid package" }, { status: 400 });

    if (isAdmin(user.email)) {
      return NextResponse.json({ skipPayment: true });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const metadata: Record<string, string> = { userId: user.id, type: "premium_package", packageType };
    if (bookId) metadata.bookId = bookId;
    if (targetLanguages) metadata.targetLanguages = JSON.stringify(targetLanguages);

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Plot Ghost ${premiumConfig.label}`,
            description: packageType === 'multi-language-bundle'
              ? `Translate project into ${targetLanguages?.join(', ') || '3 languages'}`
              : "Premium one-time package",
          },
          unit_amount: premiumConfig.amount,
        },
        quantity: 1,
      }],
      metadata,
      success_url: `${origin}/pricing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  if (!tier) return NextResponse.json({ error: "Missing tier or packageType" }, { status: 400 });

  const tierConfig = TIER_PRICES[tier];
  if (!tierConfig) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  // Admin bypass
  if (isAdmin(user.email)) {
    return NextResponse.json({ skipPayment: true });
  }

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
  const mode = tier.split("_")[0] === "play" ? "playwright" : tier.split("_")[0];

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Plot Ghost ${tierConfig.label}`,
            description: "One-time special content generation",
          },
          unit_amount: tierConfig.amount,
        },
        quantity: 1,
      },
    ],
    metadata: { userId: user.id, type: "special", tier },
    success_url: `${origin}/special/${mode}?paid=true`,
    cancel_url: `${origin}/special/${mode}?canceled=true`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
