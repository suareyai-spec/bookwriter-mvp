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
    return NextResponse.json({ error: "No subscription found" }, { status: 400 });
  }

  try {
    await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: false,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: "active" },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to reactivate" }, { status: 500 });
  }
}
