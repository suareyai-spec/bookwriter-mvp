import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();

  // TODO: Verify webhook signature when STRIPE_WEBHOOK_SECRET is configured
  // const sig = req.headers.get("stripe-signature")!;
  // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  let event: Stripe.Event;
  try {
    event = JSON.parse(body) as Stripe.Event;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      if (session.mode === "subscription") {
        const plan = session.metadata?.plan;
        const subscriptionId = session.subscription as string;

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionId,
            subscriptionPlan: plan,
            subscriptionStatus: "active",
            monthlyBooksUsed: 0,
            monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            stripeCustomerId: session.customer as string,
          },
        });
      } else if (session.mode === "payment" && session.metadata?.type === "credit") {
        const creditSize = session.metadata.creditSize;
        await prisma.bookCredit.create({
          data: {
            userId,
            bookSize: creditSize,
            stripePaymentId: session.payment_intent as string,
          },
        });
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
      if (invoice.billing_reason === "subscription_cycle") {
        const customer = await stripe.customers.retrieve(invoice.customer as string);
        if (!customer || customer.deleted) break;
        const userId = (customer as Stripe.Customer).metadata?.userId;
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            monthlyBooksUsed: 0,
            monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
