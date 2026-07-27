import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, PlanKey } from "@/lib/stripe";
import { isAdmin } from "@/lib/config";
import { PLAN_MONTHLY_CREDITS, PLAN_ROLLOVER_CAP } from "@/lib/credits";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const plan = user.subscriptionPlan as PlanKey | null;
  const planConfig = plan && PLANS[plan] ? PLANS[plan] : null;
  const monthlyRevisionLimit = planConfig ? planConfig.monthlyRevisions : 0;
  const revisionCount = user.revisionCount || 0;

  const credits = await prisma.bookCredit.findMany({
    where: { userId, used: false },
  });

  return NextResponse.json({
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    isAdmin: isAdmin(user.email),
    emailVerified: user.emailVerified,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionId: user.subscriptionId,
    stripeCustomerId: user.stripeCustomerId,
    monthlyBooksUsed: user.monthlyBooksUsed,
    monthlyCreditsTotal: planConfig?.monthlyCredits || 0,
    monthlyCreditsRemaining: planConfig ? Math.max(0, planConfig.monthlyCredits - user.monthlyBooksUsed) : 0,
    monthlyResetDate: user.monthlyResetDate,
    revisionCount,
    monthlyRevisionLimit,
    revisionsRemaining: monthlyRevisionLimit === Infinity ? Infinity : Math.max(0, monthlyRevisionLimit - revisionCount),
    creditCounts: {
      short: credits.filter((c) => c.bookSize === "short").length,
      medium: credits.filter((c) => c.bookSize === "medium").length,
      standard: credits.filter((c) => c.bookSize === "standard").length,
      epic: credits.filter((c) => c.bookSize === "epic").length,
    },
    monthlyArticlesUsed: (user as any).monthlyArticlesUsed || 0,
    monthlyArticleLimit: plan ? (({ free: 2, starter: 5, author: 15, studio: 50 } as Record<string, number>)[plan] ?? 0) : 2,
    monthlyNewslettersUsed: (user as any).monthlyNewslettersUsed || 0,
    monthlyNewsletterLimit: planConfig ? (planConfig as any).monthlyNewsletters || 0 : 0,
    // Unified credit balance — see lib/credits.ts for the spend order and
    // rollover policy. This supersedes the legacy per-book-size bookCredit
    // count above for display purposes; totalCredits below is authoritative.
    monthlyCredits: (user as any).monthlyCredits ?? 0,
    packCredits: (user as any).purchasedCredits ?? 0,
    creditsRollover: (user as any).creditsRollover ?? 0,
    rolloverCap: plan ? (PLAN_ROLLOVER_CAP[plan] ?? 0) : 0,
    planMonthlyAllowance: plan ? (PLAN_MONTHLY_CREDITS[plan] ?? 0) : 0,
    totalCredits: ((user as any).monthlyCredits ?? 0) + ((user as any).purchasedCredits ?? 0) + ((user as any).creditsRollover ?? 0),
    creditsUsedThisMonth: (user as any).creditsUsedThisMonth ?? 0,
    creditsUsedAllTime: (user as any).creditsUsedAllTime ?? 0,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await req.json();
  const { name } = body as { name?: string };

  if (name !== undefined) {
    const trimmed = name.trim();
    if (trimmed.length > 100) {
      return NextResponse.json({ error: "Name too long" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: userId },
      data: { name: trimmed || null },
    });
    return NextResponse.json({ success: true, name: trimmed || null });
  }

  return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
}
