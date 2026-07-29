import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCreditCost, hasUnlimitedAccess, totalCredits, deductCredits, insufficientCreditsMessage, CreditDeduction } from "@/lib/credits";
import { isAdmin } from "@/lib/config";
import { acquireGenerationSlot, releaseGenerationSlot } from "@/lib/rate-limit";
import { inngest } from "@/lib/inngest";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const ReferenceItem = z.object({
  type: z.enum(["pdf", "gdoc", "text"]),
  content: z.string(),
  name: z.string(),
});

const Body = z.object({
  courseTitle: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  academicLevel: z.enum(["undergraduate", "graduate", "professional"]),
  creditHours: z.number().int().min(1).max(4),
  weeks: z.number().int().min(12).max(15),
  description: z.string().min(10).max(5000),
  audiencePrerequisites: z.string().max(2000).optional(),
  learningObjectives: z.string().max(3000).optional(),
  deliveryFormat: z.string().max(100).optional(),
  gradingPreference: z.enum(["quiz-heavy", "project-heavy", "balanced"]).default("balanced"),
  language: z.string().max(30).optional(),
  references: z.array(ReferenceItem).optional(),
});

export async function POST(req: Request) {
  let slotUserId: string | null = null;
  try {
    // --- AUTH ---
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: "Please sign in to generate a course." }, { status: 401 });
    }
    const userId = (session.user as any).id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // --- GENERATION RATE LIMIT: 3 concurrent / 10 per hour / 50 per day ---
    const slot = await acquireGenerationSlot(userId, user.email);
    if (!slot.allowed) return slot.error!;
    slotUserId = userId;

    const body = Body.parse(await req.json());

    let creditDeduction: CreditDeduction | null = null;

    // Admin / unlimited-access bypass — skip all payment checks
    if (isAdmin(user.email) || hasUnlimitedAccess(user.email)) {
      await prisma.user.update({ where: { id: userId }, data: { isGenerating: true, generationStartedAt: new Date() } });
    } else {
      const isActive = user.subscriptionStatus === "active";

      // Concurrent generation limit — auto-reset if stuck > 30 minutes
      if (user.isGenerating) {
        const startedAt = (user as any).generationStartedAt;
        const stuckThreshold = 30 * 60 * 1000;
        if (startedAt && Date.now() - new Date(startedAt).getTime() > stuckThreshold) {
          await prisma.user.update({ where: { id: userId }, data: { isGenerating: false, generationStartedAt: null } });
          (user as any).isGenerating = false;
        } else {
          await releaseGenerationSlot(userId);
          return Response.json({ error: "You already have a generation in progress. Please wait for it to finish." }, { status: 429 });
        }
      }

      if (!isActive) {
        await releaseGenerationSlot(userId);
        return Response.json({
          error: "A University Course requires an active subscription. Visit the pricing page to get started.",
          needsSubscription: true,
        }, { status: 403 });
      } else {
        // Credit-based check for starter/author/studio (studio's high monthly
        // allotment is enforced through this same path — see lib/credits.ts)
        const creditCost = getCreditCost("university_course");
        const balance = {
          purchasedCredits: (user as any).purchasedCredits ?? 0,
          monthlyCredits: (user as any).monthlyCredits ?? 0,
          creditsRollover: (user as any).creditsRollover ?? 0,
        };
        const have = totalCredits(balance);

        if (have < creditCost) {
          await releaseGenerationSlot(userId);
          return Response.json({
            error: insufficientCreditsMessage(creditCost, have),
            needsCredits: true,
            creditCost,
            totalCredits: have,
          }, { status: 403 });
        }

        creditDeduction = await deductCredits(userId, balance, creditCost);
      }

      await prisma.user.update({ where: { id: userId }, data: { isGenerating: true, generationStartedAt: new Date() } });
    }
    // --- END PAYMENT GATE ---

    const earlyBook = await prisma.book.create({
      data: {
        title: body.courseTitle,
        description: body.description,
        genre: body.subject,
        audience: body.audiencePrerequisites,
        language: body.language,
        contentType: "university_course",
        userId,
        status: "generating",
        progress: JSON.stringify({ status: "syllabus", totalWeeks: body.weeks }),
      },
    });
    const bookId = earlyBook.id;

    // Dispatch the staged background generation via Inngest — pass along what was
    // deducted so the job can refund the correct pools if generation fails.
    await inngest.send({
      name: "university-course/generate",
      data: { bookId, userId, body, creditDeduction },
    });

    return Response.json({ bookId, status: "generating" });
  } catch (error) {
    if (slotUserId) await releaseGenerationSlot(slotUserId);
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
