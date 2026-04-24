import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.subscriptionId) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  try {
    const sub = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: "canceling" },
    });

    return NextResponse.json({
      success: true,
      cancelAt: (sub as any).current_period_end ? new Date((sub as any).current_period_end * 1000).toISOString() : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to cancel" }, { status: 500 });
  }
}
