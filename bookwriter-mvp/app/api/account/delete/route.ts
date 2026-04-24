import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await req.json();

  if (body.confirm !== "DELETE") {
    return NextResponse.json({ error: "Type DELETE to confirm" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Cancel Stripe subscription if active
  if (user.subscriptionId) {
    try {
      await stripe.subscriptions.cancel(user.subscriptionId);
    } catch {
      // Subscription may already be canceled
    }
  }

  // Delete all user data (cascade handles book versions and references)
  await prisma.bookCredit.deleteMany({ where: { userId } });
  await prisma.bookVersion.deleteMany({ where: { book: { userId } } });
  await prisma.bookReference.deleteMany({ where: { book: { userId } } });
  await prisma.book.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
