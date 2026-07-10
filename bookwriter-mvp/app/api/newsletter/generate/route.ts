import { z } from "zod";
import { anthropic } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/config";
import { acquireGenerationSlot, releaseGenerationSlot } from "@/lib/rate-limit";
import { humanizeChapter } from "@/lib/humanizer";
import { trackApiCost, getTokensFromResponse } from "@/lib/cost-tracker";
import { sendGenerationCompleteEmail, sendGenerationFailedEmail } from "@/lib/email";
import { getCreditCost, isUnlimitedPlan, hasUnlimitedAccess, totalCredits, deductCredits, refundCredits, insufficientCreditsMessage, CreditDeduction } from "@/lib/credits";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const Body = z.object({
  companyName: z.string().min(1).max(200),
  industry: z.string().max(60),
  newsletterType: z.string().max(30),
  tone: z.string().max(30),
  keyTopics: z.string().min(1).max(5000),
  targetAudience: z.string().max(500).optional(),
  callToAction: z.string().max(500).optional(),
  sections: z.array(z.string()).optional(),
  wordCount: z.enum(["brief", "standard", "detailed", "comprehensive"]),
  language: z.string().max(30).optional(),
  writingSample: z.string().max(10000).optional(),
});

const PRICING: Record<string, number> = {
  brief: 900,       // $9
  standard: 1900,   // $19
  detailed: 2900,   // $29
  comprehensive: 3900, // $39
};

const WORD_TARGETS: Record<string, number> = {
  brief: 300,
  standard: 600,
  detailed: 1000,
  comprehensive: 1500,
};

const TYPE_LABELS: Record<string, string> = {
  monthly: "Monthly Update",
  launch: "Product Launch",
  insights: "Industry Insights",
  spotlight: "Customer Spotlight",
  recap: "Event Recap",
  seasonal: "Holiday/Seasonal",
};

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

async function callClaude(prompt: string, maxTokens: number): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const resp = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  const { inputTokens, outputTokens } = getTokensFromResponse(resp);
  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");
  return { text, inputTokens, outputTokens };
}

export async function POST(req: Request) {
  let slotUserId: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Please sign in to generate newsletters." }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const userId = (session.user as any).id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const slot = await acquireGenerationSlot(userId, user.email);
    if (!slot.allowed) return slot.error!;
    slotUserId = userId;

    const body = Body.parse(await req.json());
    const priceInCents = PRICING[body.wordCount];
    const wordTarget = WORD_TARGETS[body.wordCount];
    const typeLabel = TYPE_LABELS[body.newsletterType] || body.newsletterType;
    const lang = body.language || "English";

    let creditDeduction: CreditDeduction | null = null;

    // Admin / unlimited-access bypass
    if (!isAdmin(user.email) && !hasUnlimitedAccess(user.email)) {
      const hasActiveSub = user.subscriptionStatus === "active" && user.subscriptionPlan;
      const isFreeUser = !hasActiveSub;
      if (isFreeUser) {
        // Free Starter: 2 newsletters per month (resets monthly)
        if (user.monthlyResetDate && new Date() > user.monthlyResetDate) {
          await prisma.user.update({ where: { id: userId }, data: { monthlyNewslettersUsed: 0, monthlyBooksUsed: 0, monthlyArticlesUsed: 0, monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
          (user as any).monthlyNewslettersUsed = 0;
        }
        if (!user.monthlyResetDate) {
          await prisma.user.update({ where: { id: userId }, data: { monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
        }
        const used = (user as any).monthlyNewslettersUsed || 0;
        if (used >= 2) {
          await releaseGenerationSlot(userId);
          return new Response(JSON.stringify({
            error: "You've reached your Free Starter newsletter limit for this month. Upgrade to unlock more newsletters and unlimited creative output.",
            needsSubscription: true,
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        await prisma.user.update({ where: { id: userId }, data: { monthlyNewslettersUsed: { increment: 1 } } });
      } else if (isUnlimitedPlan(user.subscriptionPlan)) {
        // Studio — no credit check
      } else {
        // Credit-based check for starter/author/creator/author-pro
        const creditCost = getCreditCost("newsletter");
        const balance = {
          purchasedCredits: (user as any).purchasedCredits ?? 0,
          monthlyCredits: (user as any).monthlyCredits ?? 0,
          creditsRollover: (user as any).creditsRollover ?? 0,
        };
        const have = totalCredits(balance);

        if (have < creditCost) {
          await releaseGenerationSlot(userId);
          return new Response(JSON.stringify({
            error: insufficientCreditsMessage(creditCost, have),
            needsCredits: true,
            creditCost,
            totalCredits: have,
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }

        creditDeduction = await deductCredits(userId, balance, creditCost);
      }
    }

    const sectionsText = body.sections?.length
      ? `\n\nINCLUDE THESE SECTIONS:\n${body.sections.map(s => `- ${s}`).join("\n")}`
      : "";

    const prompt = `You are an expert email newsletter writer who understands the psychology of reader engagement and relationship-building through email. Generate a complete, ready-to-send newsletter.

COMPANY: ${body.companyName}
INDUSTRY: ${body.industry}
TYPE: ${typeLabel}
TONE: ${body.tone}
AUDIENCE: ${body.targetAudience || "General subscribers"}
CTA: ${body.callToAction || "Visit our website"}
LANGUAGE: ${lang} — Write EVERYTHING in ${lang}.
TARGET LENGTH: ~${wordTarget} words
${sectionsText}

CONTENT TO COVER:
${body.keyTopics}

PHILOSOPHY (based on Newsletter Ninja by Labrecque, Wired for Story by Cron, Write It Up by Silvia):
- A newsletter's primary purpose is NOT to sell — it's to build a relationship. You are selling the sender as someone worth hearing from, not just their product. Readers subscribed because they're interested in this person/brand — reward that trust.
- Every email must deliver VALUE before asking for anything. The "ask" (CTA, purchase, click) should come after a string of "gives." If you only email when you want something, you'll lose them.
- You are not the reader. Don't assume what bores you bores them. Write for THEIR interests, not yours.
- From the very first sentence, the reader must want to read the next sentence (Cron). Something must be at stake or intriguing immediately — not a preamble, not throat-clearing. The "ball must be in play" from word one.
- Everything must pass the "So what?" test (Labov's evaluation). Every paragraph must have a reason to exist. If it doesn't serve the reader, cut it.
- Emotion determines meaning (Cron). If the reader doesn't FEEL something, they won't remember anything. Ground abstract ideas in specific, concrete details that trigger feeling.
- Write with a personal, confident, collaborative tone (Silvia). Sound like a specific human wrote this and cared about it — not a corporate memo from no one to no one. Be warm but not sycophantic. Be confident but not combative.
- Specificity always beats generality. "We grew 23% in Q3" beats "We had a great quarter." "Sarah from Portland used it to..." beats "Many customers have found..."
- Answer reader objections before they arise (Labrecque). If you're announcing a price increase, acknowledge the reaction before they have it.

WRITING RULES:
- Subject lines: make a specific PROMISE the reader wants kept. Write 3 options: one curiosity-driven, one benefit-driven, one direct. A subject line is a contract — the email must deliver on it.
- Opening: 1-2 sentences max, then deliver value. No "I hope this email finds you well." No "It's been an exciting quarter." Start with something the READER cares about, not something you want to announce.
- Each section must answer "why should the reader care RIGHT NOW" — not why the company is excited, but why the reader's life/work/day is better for knowing this.
- One CTA per section maximum — decision fatigue kills action.
- Use the specific-to-general pattern: lead with a concrete story, example, or data point, THEN zoom out to the broader point.
- Bold key phrases for scanning. Short paragraphs (2-3 sentences max). Bullets for lists of 3+ items.
- Vary sentence rhythm: short punchy sentence after a long complex one. Read it aloud in your head — it should have a natural cadence.
- Match the ${body.tone} tone authentically — not a costume over generic corporate language.
- Close with a single clear next step. End on a human note — something that makes the reader feel like a person wrote this to another person, not a broadcast to a list.
- No clichés: "at the end of the day," "move the needle," "low-hanging fruit," "synergy." Find the real words.

FORMAT:
1. 3 SUBJECT LINE OPTIONS (each under 50 chars, each a different approach)
2. PREHEADER TEXT (~90-100 chars, complements but doesn't repeat subject line)
3. Newsletter body:
   - Company header
   - Opening hook (something specific, surprising, or emotionally resonant — then immediately deliver value)
   - Content sections with clear headers that themselves promise value
   - [IMAGE: description] placeholders where they'd earn their space
   - CTA: "${body.callToAction || "Visit our website"}" placed where the reader is most motivated to act (after you've delivered value, not before)
   - Brief, warm sign-off from a real person
   - Footer with unsubscribe placeholder
4. No emojis. No meta-commentary. No "In this newsletter, we'll cover..."

Write the complete newsletter now:`;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", percent: 10, status: "Crafting your newsletter..." })));

          const newsletterResp = await callClaude(prompt, 4096);
          let newsletter = newsletterResp.text;
          trackApiCost({ userId, type: "newsletter", inputTokens: newsletterResp.inputTokens, outputTokens: newsletterResp.outputTokens }).catch(() => {});

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", percent: 60, status: "Humanizing for natural voice..." })));

          // Humanizer pass
          newsletter = await humanizeChapter(newsletter, { userId, writingSample: body.writingSample });

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", percent: 90, status: "Finalizing..." })));

          // Save to library
          const record = await prisma.book.create({
            data: {
              title: `${body.companyName} — ${typeLabel} Newsletter`,
              description: body.keyTopics.slice(0, 500),
              genre: "Newsletter",
              tone: body.tone,
              contentType: "newsletter",
              language: lang,
              userId,
              status: "complete",
            },
          });

          await prisma.bookVersion.create({
            data: {
              bookId: record.id,
              version: 1,
              content: newsletter,
              wordCount: newsletter.split(/\s+/).filter(Boolean).length,
              notes: "Newsletter generation",
            },
          });

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "complete", content: newsletter, bookId: record.id })));
          controller.close();
          await releaseGenerationSlot(userId);
          sendGenerationCompleteEmail({
            to: user.email,
            title: record.title,
            wordCount: newsletter.split(/\s+/).filter(Boolean).length,
            bookId: record.id,
          }).catch((emailErr) => console.error('[newsletter] success email failed:', emailErr));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Generation failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
          controller.close();
          await releaseGenerationSlot(userId);
          const creditsRefunded = creditDeduction ? creditDeduction.fromPurchased + creditDeduction.fromMonthly + creditDeduction.fromRollover : 0;
          await refundCredits(userId, creditDeduction).catch((refundErr) => console.error('[newsletter] credit refund failed:', refundErr));
          sendGenerationFailedEmail({
            to: user.email,
            title: `${body.companyName} — ${typeLabel} Newsletter`,
            reason: message,
            creditsRefunded,
          }).catch((emailErr) => console.error('[newsletter] failure email failed:', emailErr));
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (slotUserId) await releaseGenerationSlot(slotUserId);
    const message = error instanceof Error ? error.message : "Failed";
    return new Response(JSON.stringify({ error: message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
