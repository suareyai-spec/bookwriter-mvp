import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, getBookSize, PlanKey } from "@/lib/stripe";
import { CREDIT_COST, getContentSizeFromLength, isUnlimitedPlan } from "@/lib/credits";
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
    } else {

    const userPlan = user.subscriptionPlan as string | null;
    const isActive = user.subscriptionStatus === "active";

    // Concurrent generation limit — auto-reset if stuck > 30 minutes
    if (user.isGenerating) {
      const startedAt = (user as any).generationStartedAt;
      const stuckThreshold = 30 * 60 * 1000;
      if (startedAt && Date.now() - new Date(startedAt).getTime() > stuckThreshold) {
        await prisma.user.update({ where: { id: userId }, data: { isGenerating: false, generationStartedAt: null } });
        (user as any).isGenerating = false;
      } else {
        return new Response(JSON.stringify({ error: "You already have a generation in progress. Please wait for it to finish." }), { status: 429, headers: { "Content-Type": "application/json" } });
      }
    }

    if (!isActive) {
      // Free tier: 1 free short book
      if ((user as any).freeBookUsed) {
        return new Response(JSON.stringify({ error: "You need a subscription to generate books. Visit the pricing page to get started.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      if (bookSize !== "short") {
        return new Response(JSON.stringify({ error: "Free accounts can only generate short books (10,000 words). Subscribe to unlock all sizes.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      await prisma.user.update({ where: { id: userId }, data: { freeBookUsed: true } });
    } else if (isUnlimitedPlan(userPlan)) {
      // Studio — no credit check
    } else {
      // Credit-based check for starter/author/creator/author-pro
      const isCourseFormat = body.format === "course";
      const contentSizeKey = isCourseFormat ? "course" : getContentSizeFromLength(body.bookLength || "10,000 words");
      const creditCost = CREDIT_COST[contentSizeKey] ?? CREDIT_COST.standard;

      const monthlyCredits = (user as any).monthlyCredits ?? 0;
      const purchasedCredits = (user as any).purchasedCredits ?? 0;
      const totalCredits = monthlyCredits + purchasedCredits;

      if (totalCredits < creditCost) {
        return new Response(JSON.stringify({
          error: `Not enough credits. This book costs ${creditCost} credits and you have ${totalCredits}. Buy a credit pack or upgrade your plan.`,
          needsCredits: true,
          creditCost,
          totalCredits,
        }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      // Deduct purchased first, then monthly
      const fromPurchased = Math.min(purchasedCredits, creditCost);
      const fromMonthly = creditCost - fromPurchased;
      await prisma.user.update({
        where: { id: userId },
        data: {
          purchasedCredits: purchasedCredits - fromPurchased,
          monthlyCredits: monthlyCredits - fromMonthly,
        },
      });
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
