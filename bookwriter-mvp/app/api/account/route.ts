import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, PlanKey } from "@/lib/stripe";
import { isAdmin } from "@/lib/config";

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
    totalCredits: credits.length,
    monthlyArticlesUsed: (user as any).monthlyArticlesUsed || 0,
    monthlyArticleLimit: plan ? ({ free: 2, creator: 5, "author-pro": 15, studio: 50 }[plan] ?? 0) : 2,
    monthlyNewslettersUsed: (user as any).monthlyNewslettersUsed || 0,
    monthlyNewsletterLimit: planConfig ? (planConfig as any).monthlyNewsletters || 0 : 0,
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
