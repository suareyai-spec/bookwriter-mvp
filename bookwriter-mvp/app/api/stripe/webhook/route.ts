import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { PLAN_MONTHLY_CREDITS, PLAN_ROLLOVER_CAP, getCreditPack } from "@/lib/credits";

export async function POST(req: Request) {
  const body = await req.text();

  const sig = req.headers.get("stripe-signature")!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      if (session.mode === "subscription") {
        const plan = session.metadata?.plan;
        const subscriptionId = session.subscription as string;
        const planAllowance = PLAN_MONTHLY_CREDITS[plan || ''];
        const initialCredits = planAllowance ?? 0;

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionId,
            subscriptionPlan: plan,
            subscriptionStatus: "active",
            monthlyBooksUsed: 0,
            monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            stripeCustomerId: session.customer as string,
            monthlyCredits: initialCredits,
          },
        });
      } else if (session.mode === "payment" && session.metadata?.type === "credit_pack") {
        const pack = getCreditPack(session.metadata.packId || "");
        if (pack && userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { purchasedCredits: { increment: pack.credits } },
          });
        }
      }

      // Affiliate conversion tracking
      if (session.metadata?.affiliateCode) {
        try {
          const code = session.metadata.affiliateCode;
          const amountUsd = (session.amount_total || 0) / 100;
          const affiliate = await prisma.affiliate.findUnique({ where: { code } });
          if (affiliate && affiliate.isActive) {
            const commissionUsd = parseFloat((amountUsd * affiliate.commissionPercent / 100).toFixed(2));
            await prisma.affiliateConversion.create({
              data: {
                affiliateId: affiliate.id,
                userEmail: session.customer_email || session.customer_details?.email || null,
                stripeSessionId: session.id,
                plan: session.metadata?.plan || null,
                amountUsd,
                commissionUsd,
              },
            });
            await prisma.affiliate.update({
              where: { id: affiliate.id },
              data: {
                totalConversions: { increment: 1 },
                totalEarned: { increment: commissionUsd },
              },
            });
          }
        } catch (err) {
          console.error('[webhook] affiliate conversion error:', err);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(sub.customer as string);
      if (!customer || customer.deleted) break;
      const userId = (customer as Stripe.Customer).metadata?.userId;
      if (!userId) break;

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(sub.customer as string);
      if (!customer || customer.deleted) break;
      const userId = (customer as Stripe.Customer).metadata?.userId;
      if (!userId) break;

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "canceled",
          subscriptionPlan: null,
          subscriptionId: null,
        },
      });
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customer = await stripe.customers.retrieve(invoice.customer as string);
      if (!customer || customer.deleted) break;
      const userId = (customer as Stripe.Customer).metadata?.userId;
      if (!userId) break;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlan: true, monthlyCredits: true, creditsRollover: true, referredBy: true },
      });
      if (!user) break;

      if (invoice.billing_reason === "subscription_cycle") {
        const plan = user.subscriptionPlan || 'free';
        const planAllowance = PLAN_MONTHLY_CREDITS[plan];
        // Unused monthly credits carry over into creditsRollover, capped at the plan's
        // rollover cap (50 for Starter, 100 for Author, 500 for Studio).
        const rolloverCap = PLAN_ROLLOVER_CAP[plan] ?? 0;
        const unusedMonthly = (user as any).monthlyCredits ?? 0;
        const newRollover = Math.min(unusedMonthly + ((user as any).creditsRollover ?? 0), rolloverCap);
        const freshCredits = planAllowance ?? 0;

        await prisma.user.update({
          where: { id: userId },
          data: {
            monthlyBooksUsed: 0,
            monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            monthlyCredits: freshCredits,
            creditsRollover: newRollover,
          },
        });
      }

      // Recurring affiliate commission — credited on every paid invoice (first payment + renewals)
      // for users referred by an approved self-serve affiliate.
      if (user.referredBy) {
        try {
          const affiliate = await prisma.affiliate.findUnique({ where: { code: user.referredBy } });
          if (affiliate && affiliate.isApproved) {
            const amountUsd = (invoice.amount_paid || 0) / 100;
            if (amountUsd > 0) {
              const commissionUsd = parseFloat((amountUsd * affiliate.commissionRate).toFixed(2));
              await prisma.affiliate.update({
                where: { id: affiliate.id },
                data: {
                  totalEarnings: { increment: commissionUsd },
                  pendingPayout: { increment: commissionUsd },
                  totalConversions: { increment: 1 },
                },
              });
              await prisma.affiliateConversion.create({
                data: {
                  affiliateId: affiliate.id,
                  userEmail: (customer as Stripe.Customer).email || null,
                  stripeSessionId: invoice.id,
                  plan: user.subscriptionPlan || null,
                  amountUsd,
                  commissionUsd,
                },
              });
            }
          }
        } catch (err) {
          console.error('[webhook] recurring affiliate commission error:', err);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
