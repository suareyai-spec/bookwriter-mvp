import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, getBookSize, getBookCreditCost, PlanKey } from "@/lib/stripe";
import { isAdmin } from "@/lib/config";
import { rateLimitByUser } from "@/lib/rate-limit";
import { inngest } from "@/lib/inngest";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const ReferenceItem = z.object({
  type: z.enum(["pdf", "gdoc", "text"]),
  content: z.string(),
  name: z.string(),
});

const Body = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  genre: z.string().max(60).optional(),
  tone: z.string().max(60).optional(),
  audience: z.string().max(200).optional(),
  bookLength: z.string().max(100).optional(),
  language: z.string().max(30).optional(),
  references: z.array(ReferenceItem).optional(),
  revisionInstructions: z.string().max(5000).optional(),
  previousContent: z.string().optional(),
  mature: z.boolean().optional(),
  matureLevel: z.enum(["steamy", "explicit", "nolimits"]).optional(),
  humanize: z.boolean().optional(),
  format: z.enum(["book", "course"]).optional(),
  subGenre: z.string().max(50).optional(),
  romanceSubGenre: z.string().max(100).optional(),
  relationshipDynamic: z.string().max(100).optional(),
  leadOne: z.object({ name: z.string().max(100), traits: z.string().max(500) }).optional(),
  leadTwo: z.object({ name: z.string().max(100), traits: z.string().max(500) }).optional(),
});

export async function POST(req: Request) {
  try {
    // --- RATE LIMIT ---
    const rl = await rateLimitByUser("generate", 10, 60 * 60 * 1000);
    if (rl.blocked) return rl.blocked;

    // --- PAYMENT GATE ---
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Please sign in to generate books." }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const userId = (session.user as any).id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const body = Body.parse(await req.json());
    const bookSize = getBookSize(body.bookLength || "10,000 words (~40 pages)");

    // Admin bypass — skip all payment checks
    if (isAdmin(user.email)) {
      await prisma.user.update({ where: { id: userId }, data: { isGenerating: true, generationStartedAt: new Date() } });
      // Skip to generation (falls through to after payment gate)
    } else {

    const userPlan = user.subscriptionPlan as PlanKey | null;
    const isActive = user.subscriptionStatus === "active";
    const isFreeUser = !isActive && !userPlan;

    // Concurrent generation limit — auto-reset if stuck > 30 minutes
    if (user.isGenerating) {
      const startedAt = (user as any).generationStartedAt;
      const stuckThreshold = 30 * 60 * 1000; // 30 minutes
      if (startedAt && Date.now() - new Date(startedAt).getTime() > stuckThreshold) {
        await prisma.user.update({ where: { id: userId }, data: { isGenerating: false, generationStartedAt: null } });
        (user as any).isGenerating = false;
      } else {
        const planConfig = userPlan && PLANS[userPlan] ? PLANS[userPlan] : null;
        const maxConcurrent = planConfig?.concurrentGenerations || 1;
        if (maxConcurrent <= 1) {
          return new Response(JSON.stringify({ error: "You already have a generation in progress. Please wait for it to finish." }), { status: 429, headers: { "Content-Type": "application/json" } });
        }
      }
    }

    // FREE STARTER TIER: users with no plan get 1 free short book
    if (isFreeUser) {
      if (bookSize !== "short") {
        return new Response(JSON.stringify({ error: "Free Starter only includes Short Books (10,000 words max). Upgrade to unlock Medium, Standard, and Epic book generation.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      if ((user as any).freeBookUsed) {
        const credit = await prisma.bookCredit.findFirst({
          where: { userId, bookSize, used: false },
        });
        if (credit) {
          await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
        } else {
          return new Response(JSON.stringify({ error: "You've reached your Free Starter limit. Upgrade to unlock full book generation, full translations, and unlimited creative output.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
      } else {
        await prisma.user.update({ where: { id: userId }, data: { freeBookUsed: true } });
      }
    }
    // Epic books always require a separate credit purchase ($499)
    else if (bookSize === "epic") {
      const credit = await prisma.bookCredit.findFirst({
        where: { userId, bookSize: "epic", used: false },
      });
      if (!credit) {
        return new Response(JSON.stringify({ error: "Epic books require a $499 credit purchase. Buy an Epic Book credit to continue.", needsCredit: true, creditSize: "epic" }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
    } else if (isActive && userPlan) {
      const planConfig = PLANS[userPlan];

      if (!planConfig.allowedSizes.includes(bookSize)) {
        return new Response(JSON.stringify({ error: `Your ${planConfig.name} plan doesn't include ${bookSize} books. Upgrade your plan or buy a credit.`, needsCredit: true, creditSize: bookSize }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      if (user.monthlyResetDate && new Date() > user.monthlyResetDate) {
        await prisma.user.update({ where: { id: userId }, data: { monthlyBooksUsed: 0, monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), monthlyNewslettersUsed: 0 } });
        user.monthlyBooksUsed = 0;
      }

      const creditCost = getBookCreditCost(userPlan, bookSize);
      const remaining = planConfig.monthlyCredits - user.monthlyBooksUsed;

      if (remaining >= creditCost) {
        await prisma.user.update({ where: { id: userId }, data: { monthlyBooksUsed: user.monthlyBooksUsed + creditCost } });
      } else {
        const credit = await prisma.bookCredit.findFirst({
          where: { userId, bookSize, used: false },
        });
        if (credit) {
          await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
        } else {
          return new Response(JSON.stringify({ error: `You've used all your monthly books. Buy an extra ${bookSize} book credit to continue.`, needsCredit: true, creditSize: bookSize }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
      }
    } else {
      const credit = await prisma.bookCredit.findFirst({
        where: { userId, bookSize, used: false },
      });
      if (!credit) {
        return new Response(JSON.stringify({ error: "You need a subscription or book credit to generate. Visit the pricing page to get started.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
    }

    // Mark as generating
    await prisma.user.update({ where: { id: userId }, data: { isGenerating: true, generationStartedAt: new Date() } });

    } // end admin bypass else

    // --- END PAYMENT GATE ---

    // Create book record
    const isCourse = body.format === "course";
    const earlyBook = await prisma.book.create({
      data: {
        title: body.title,
        description: body.description,
        genre: body.genre,
        tone: body.tone,
        audience: body.audience,
        language: body.language,
        bookLength: body.bookLength,
        contentType: isCourse ? "course" : "book",
        userId,
        mature: body.mature || false,
        humanize: true,
        status: "generating",
        progress: JSON.stringify({ percent: 0, currentChapter: 0, totalChapters: 0, status: "outline" }),
      },
    });
    const bookId = earlyBook.id;

    // Dispatch background generation via Inngest
    await inngest.send({
      name: "book/generate",
      data: { bookId, userId, body },
    });

    return Response.json({ bookId, status: 'generating' });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
