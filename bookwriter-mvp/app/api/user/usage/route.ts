import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, REVISION_PRICES, PlanKey } from "@/lib/stripe";
import { isAdmin } from "@/lib/config";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (isAdmin(user.email)) {
    return NextResponse.json({
      isAdmin: true,
      subscriptionPlan: "admin",
      subscriptionStatus: "active",
      monthlyBooksUsed: 0,
      monthlyCreditsTotal: Infinity,
      monthlyCreditsRemaining: Infinity,
      maxProjects: Infinity,
      allowedSizes: ["short", "medium", "standard", "epic"],
      credits: [],
      creditCounts: { short: 0, medium: 0, standard: 0, epic: 0 },
      revisionCount: 0,
      monthlyRevisionLimit: Infinity,
      revisionsRemaining: Infinity,
    });
  }

  // Check if monthly reset is needed
  if (user.monthlyResetDate && new Date() > user.monthlyResetDate) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyBooksUsed: 0,
        revisionCount: 0,
        monthlyNewslettersUsed: 0,
        monthlyArticlesUsed: 0,
        monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        revisionResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    user.monthlyBooksUsed = 0;
    (user as any).revisionCount = 0;
    (user as any).monthlyNewslettersUsed = 0;
  }

  // Also check revision reset separately
  if ((user as any).revisionResetDate && new Date() > (user as any).revisionResetDate) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        revisionCount: 0,
        revisionResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    (user as any).revisionCount = 0;
  }

  const credits = await prisma.bookCredit.findMany({
    where: { userId, used: false },
  });

  const plan = user.subscriptionPlan as PlanKey | null;
  const isActive = user.subscriptionStatus === "active";
  const isFreeUser = !isActive && !plan;
  const planConfig = plan && PLANS[plan] ? PLANS[plan] : null;
  const monthlyRevisionLimit = isFreeUser ? 1 : (planConfig ? planConfig.monthlyRevisions : 0);
  const revisionCount = isFreeUser ? ((user as any).freeRevisionsUsed || 0) : ((user as any).revisionCount || 0);
  const revisionsRemaining = monthlyRevisionLimit === Infinity ? Infinity : Math.max(0, monthlyRevisionLimit - revisionCount);
  const monthlyNewsletterLimit = isFreeUser ? 2 : (planConfig ? (planConfig as any).monthlyNewsletters || 0 : 0);
  const monthlyNewslettersUsed = (user as any).monthlyNewslettersUsed || 0;
  const monthlyArticlesUsed = (user as any).monthlyArticlesUsed || 0;
  const articleLimits: Record<string, number> = { free: 2, creator: 5, "author-pro": 15, studio: 50 };
  const monthlyArticleLimit = isFreeUser ? 2 : (plan ? (articleLimits[plan] ?? 0) : 0);

  return NextResponse.json({
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus,
    isFreeUser,
    monthlyBooksUsed: isFreeUser ? ((user as any).freeBookUsed ? 1 : 0) : user.monthlyBooksUsed,
    monthlyCreditsTotal: isFreeUser ? 1 : (planConfig?.monthlyCredits || 0),
    monthlyCreditsRemaining: isFreeUser ? ((user as any).freeBookUsed ? 0 : 1) : (planConfig ? Math.max(0, planConfig.monthlyCredits - user.monthlyBooksUsed) : 0),
    maxProjects: planConfig?.maxProjects || Infinity,
    allowedSizes: isFreeUser ? ["short"] : (planConfig?.allowedSizes || []),
    credits: credits.map((c) => ({ id: c.id, bookSize: c.bookSize })),
    creditCounts: {
      short: credits.filter((c) => c.bookSize === "short").length,
      medium: credits.filter((c) => c.bookSize === "medium").length,
      standard: credits.filter((c) => c.bookSize === "standard").length,
      epic: credits.filter((c) => c.bookSize === "epic").length,
    },
    revisionCount,
    monthlyRevisionLimit,
    revisionsRemaining,
    revisionPrices: REVISION_PRICES[plan || "free"],
    monthlyNewslettersUsed,
    monthlyNewsletterLimit,
    monthlyArticlesUsed,
    monthlyArticleLimit,
    // Free tier specific
    freeBookUsed: (user as any).freeBookUsed || false,
    freeRevisionsUsed: (user as any).freeRevisionsUsed || 0,
    freeTranslationsUsed: (user as any).freeTranslationsUsed || 0,
    freeNewslettersUsed: (user as any).freeNewslettersUsed || 0,
    freeArticlesUsed: (user as any).freeArticlesUsed || 0,
  });
}
