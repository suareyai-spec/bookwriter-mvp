import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, PlanKey } from "@/lib/stripe";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Check if monthly reset is needed
  if (user.monthlyResetDate && new Date() > user.monthlyResetDate) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyBooksUsed: 0,
        monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    user.monthlyBooksUsed = 0;
  }

  const credits = await prisma.bookCredit.findMany({
    where: { userId, used: false },
  });

  const plan = user.subscriptionPlan as PlanKey | null;
  const planConfig = plan && PLANS[plan] ? PLANS[plan] : null;

  return NextResponse.json({
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus,
    monthlyBooksUsed: user.monthlyBooksUsed,
    monthlyCreditsTotal: planConfig?.monthlyCredits || 0,
    monthlyCreditsRemaining: planConfig ? Math.max(0, planConfig.monthlyCredits - user.monthlyBooksUsed) : 0,
    maxProjects: planConfig?.maxProjects || 0,
    allowedSizes: planConfig?.allowedSizes || [],
    credits: credits.map((c) => ({ id: c.id, bookSize: c.bookSize })),
    creditCounts: {
      short: credits.filter((c) => c.bookSize === "short").length,
      medium: credits.filter((c) => c.bookSize === "medium").length,
      standard: credits.filter((c) => c.bookSize === "standard").length,
      epic: credits.filter((c) => c.bookSize === "epic").length,
    },
  });
}
