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
import { getCreditCost, hasUnlimitedAccess, totalCredits, deductCredits, refundCredits, insufficientCreditsMessage, CreditDeduction } from "@/lib/credits";
import { getStyleExamples } from "@/lib/embeddings";

export const maxDuration = 900;
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().min(1).max(200),
  brandName: z.string().min(1).max(200),
  topic: z.string().min(1).max(500),
  targetStudent: z.string().min(1).max(2000),
  coreTransformation: z.string().min(1).max(2000),
  moduleCount: z.number().int().min(4).max(10).default(6),
  tone: z.enum(["Tactical & Direct", "Motivational & Story-Driven", "No-BS & Blunt"]).default("Tactical & Direct"),
  pairWithBook: z.boolean().default(false),
  bookTitle: z.string().max(200).optional(),
  language: z.string().max(30).optional(),
});

const TONE_GUIDANCE: Record<string, string> = {
  "Tactical & Direct": "Give the instruction, not the theory. Numbered steps, clear cause-and-effect. Minimal narrative — get to the how.",
  "Motivational & Story-Driven": "Lead with story and stakes — a real client win, a personal low point, a turning point — then extract the tactical lesson from it. Make the student feel the transformation is possible for them specifically.",
  "No-BS & Blunt": "Cut every hedge and qualifier. Call out what doesn't work — and who's still doing it wrong — before showing what does. Zero fluff. Borderline confrontational honesty about what actually moves the needle.",
};

// The system prompt for every generation call in this route (overview,
// modules, bonuses/sales copy). Course-specific details (title, brand,
// topic, audience, transformation) are supplied separately via `context`
// and concatenated immediately after this at every call site — this
// prompt itself stays fixed doctrine for the premium influencer-course
// voice, not tied to any one course.
const INFLUENCER_COURSE_SYSTEM_PROMPT = `You are designing a premium influencer-style online course — the kind Alex Hormozi, Iman Gadzhi, or a top business coach would sell for $97–$997.

Rules:
- Every module has a NAMED FRAMEWORK (e.g. "The Acquisition Equation", "The 4-Hour Client Method") — not generic titles like "Module 1: Basics"
- Open every module with a HOOK: a result, a story, or a counterintuitive fact
- Lessons are SHORT and ACTIONABLE — one skill per lesson, no padding
- Each module ends with ONE clear action step the student does before the next module
- Worksheets are fill-in-the-blank or decision frameworks, not essays
- Language is direct, no academic hedging — speak like a practitioner, not a professor
- The course should feel like getting 1-on-1 advice from someone who's actually done the thing, not a textbook
- Include specific numbers, timelines, and results wherever possible ("This one framework is responsible for $2.3M in client revenue")

Avoid: "In this module we will explore..." / bullet dumps / passive voice / anything that sounds like a university syllabus`;

function getInfluencerCoursePrompt(body: z.infer<typeof Body>, styleReference: string): { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number } {
  const moduleCount = body.moduleCount;
  const toneGuidance = TONE_GUIDANCE[body.tone];
  const systemPrompt = INFLUENCER_COURSE_SYSTEM_PROMPT;

  const context = `Course Title: "${body.title}"
Creator / Brand: ${body.brandName}
Topic / Niche: ${body.topic}
Target Student: ${body.targetStudent}
Core Transformation (what they can DO after this course that they couldn't before): ${body.coreTransformation}
Number of Modules: ${moduleCount}
Tone: ${body.tone} — ${toneGuidance}
${body.pairWithBook && body.bookTitle ? `This course is sold as a companion to the book "${body.bookTitle}" — reference it naturally where it strengthens credibility or cross-sell (e.g. in the overview and sales description), but do not force it into every module.` : ""}`;

  return {
    sectionCount: moduleCount + 1, // + final bonuses/sales-copy stage

    outline: `${systemPrompt}

${context}

STAGE 1 — COURSE OVERVIEW

Produce:

## Course Title
Confirm or sharpen the course title into something that promises a specific, believable transformation.

## Transformation Promise
2-3 sentences: what the student can DO after finishing this course that they couldn't do before. Specific and outcome-based — "you'll understand marketing better" is banned; "you'll be able to write a cold DM sequence that converts at 8%+" is the standard.

## Module Titles
List all ${moduleCount} modules as NAMED FRAMEWORKS (not "Module 1: Basics" — give each module its own brand-able framework name), in the order students go through them, each with a one-sentence description of what it delivers and why it comes at that point in the sequence.`,

    section: (idx: number, total: number, outline: string, prev: string[]) => {
      const isFinal = idx === total;
      const prevSummary = prev.length > 0
        ? `\nModules written so far (for continuity — do not repeat their content, build on it):\n${prev.map((p, i) => `Module ${i + 1}: ${p.slice(0, 300)}...`).join("\n\n")}`
        : "";

      if (isFinal) {
        return `${systemPrompt}

${context}

Course overview:
${outline}
${prevSummary}

STAGE 3 — BONUSES & SALES DESCRIPTION

Write two things:

## Bonuses
2-4 bonuses that stack value onto the core course (templates, swipe files, live Q&A, private community access, scripts, checklists, etc.) — each with a one-line description of the specific problem it solves. Make them feel like they were built by someone who's actually run this before, not generic filler.

## Sales Description
The "what you get" section for a sales page selling this course at a $97–$997 price point. List the full module stack plus bonuses, framed around the transformation promise, written in the same ${body.tone} voice as the rest of the course. This is sales copy — build the value stack so it obviously outweighs the price, and close with urgency.
${styleReference ? `\n${styleReference}\n` : ""}
Write both sections now:`;
      }

      return `${systemPrompt}

${context}

Course overview:
${outline}
${prevSummary}

STAGE 2 — MODULE ${idx} OF ${moduleCount}

Write the complete content for Module ${idx}, following its named framework and description from the overview above. Use these exact section headings, in this order:

## Module ${idx}: [Named Framework Title]

### Hook
Open with a result, story, or counterintuitive fact that earns the student's attention before any teaching begins.

### Core Concept
Explain the single core idea behind this module's framework — name it, and make it memorable.

### Lessons
3-5 short, actionable lessons that build the framework step by step. One skill per lesson. No padding.

### Worksheet / Exercise
A fill-in-the-blank template or decision framework the student completes — not an essay prompt.

### Action Step
ONE clear thing the student does before moving to the next module.
${styleReference ? `\n${styleReference}\n` : ""}
Write the complete Module ${idx} now:`;
    },
  };
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

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  let slotUserId: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Please sign in." }), { status: 401, headers: { "Content-Type": "application/json" } });
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

    let creditDeduction: CreditDeduction | null = null;

    // Payment gate — admins and whitelisted emails bypass all payment
    if (!isAdmin(user.email) && !hasUnlimitedAccess(user.email)) {
      const isActive = user.subscriptionStatus === "active";
      const hasPlan = !!user.subscriptionPlan;
      const isFreeUser = !isActive && !hasPlan;

      if (isFreeUser) {
        if ((user as any).freeBookUsed) {
          await releaseGenerationSlot(userId);
          return new Response(JSON.stringify({
            error: "You've reached your Free Starter limit. Upgrade to unlock the Influencer Course generator and full book generation.",
            needsSubscription: true,
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        await prisma.user.update({ where: { id: userId }, data: { freeBookUsed: true } });
      } else {
        // Credit-based check for starter/author/studio (studio's high monthly
        // allotment is enforced through this same path — see lib/credits.ts)
        const creditCost = getCreditCost("influencer_course");
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

    const langNote = body.language && body.language !== "English" ? `\n\nIMPORTANT: Write ALL content in ${body.language}. Every word of the output must be in ${body.language}.` : "";

    // No dedicated influencer-course corpus yet — fall back through the
    // existing "course" corpus (IFRA/IO2/Ultimate Guide/etc.), then 'book'.
    const ragTopic = `${body.title} ${body.topic} ${body.coreTransformation}`.trim().slice(0, 500);
    const styleReference = (await getStyleExamples(ragTopic, "course")) || (await getStyleExamples(ragTopic, "book"));

    const promptConfig = getInfluencerCoursePrompt(body, styleReference);
    if (langNote) {
      const origOutline = promptConfig.outline;
      promptConfig.outline = origOutline + langNote;
      const origSection = promptConfig.section;
      promptConfig.section = (idx, total, outline, prev) => origSection(idx, total, outline, prev) + langNote;
    }

    const record = await prisma.book.create({
      data: {
        title: body.title,
        description: body.coreTransformation,
        genre: body.topic,
        tone: body.tone,
        contentType: "influencer_course",
        userId,
        humanize: true,
        status: "generating",
        progress: JSON.stringify({ percent: 0, currentChapter: 0, totalChapters: promptConfig.sectionCount, status: "outline" }),
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "bookId", bookId: record.id })));
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", title: "Generating course overview and module titles...", status: "outline" })));

          const outlineResp = await callClaude(promptConfig.outline, 3000);
          const outline = outlineResp.text;
          trackApiCost({ userId, type: "special", inputTokens: outlineResp.inputTokens, outputTokens: outlineResp.outputTokens, bookId: record.id }).catch(() => {});
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "outline", content: outline, totalSections: promptConfig.sectionCount })));

          await prisma.book.update({ where: { id: record.id }, data: { progress: JSON.stringify({ percent: 5, currentChapter: 0, totalChapters: promptConfig.sectionCount, status: "writing" }) } }).catch(() => {});

          const sections: string[] = [];
          for (let i = 1; i <= promptConfig.sectionCount; i++) {
            const isFinal = i === promptConfig.sectionCount;
            const percent = Math.round(((i - 1) / promptConfig.sectionCount) * 95) + 5;
            controller.enqueue(new TextEncoder().encode(sseEvent({
              type: "progress",
              chapter: i,
              totalChapters: promptConfig.sectionCount,
              title: isFinal ? "Writing bonuses & sales description..." : `Writing Module ${i} of ${body.moduleCount}...`,
              status: "writing",
            })));
            await prisma.book.update({ where: { id: record.id }, data: { progress: JSON.stringify({ percent, currentChapter: i, totalChapters: promptConfig.sectionCount, status: "writing" }) } }).catch(() => {});

            const sectionPrompt = promptConfig.section(i, promptConfig.sectionCount, outline, sections);
            const sectionResp = await callClaude(sectionPrompt, 8192);
            let section = sectionResp.text;
            trackApiCost({ userId, type: "special", inputTokens: sectionResp.inputTokens, outputTokens: sectionResp.outputTokens, bookId: record.id }).catch(() => {});

            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", chapter: i, totalChapters: promptConfig.sectionCount, title: isFinal ? "Refining bonuses & sales description..." : `Refining Module ${i}...`, status: "humanizing" })));
            await prisma.book.update({ where: { id: record.id }, data: { progress: JSON.stringify({ percent, currentChapter: i, totalChapters: promptConfig.sectionCount, status: "humanizing" }) } }).catch(() => {});
            section = await humanizeChapter(section, { userId, bookId: record.id });

            sections.push(section);
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "section", chapter: i, totalChapters: promptConfig.sectionCount, content: section })));
          }

          const fullContent = `${outline}\n\n${"━".repeat(50)}\n\n${sections.join("\n\n" + "━".repeat(50) + "\n\n")}`;
          const wordCount = fullContent.split(/\s+/).filter(Boolean).length;

          await prisma.bookVersion.create({
            data: { bookId: record.id, version: 1, content: fullContent, wordCount, notes: "Initial generation" },
          });

          await prisma.book.update({ where: { id: record.id }, data: { status: "complete", progress: null } });
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "complete", bookId: record.id })));
          controller.close();
          await releaseGenerationSlot(userId);
          sendGenerationCompleteEmail({ to: user.email, title: record.title, wordCount, bookId: record.id })
            .catch((emailErr) => console.error('[influencer-course] success email failed:', emailErr));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
          await prisma.book.update({ where: { id: record.id }, data: { status: "failed", progress: JSON.stringify({ error: message }) } }).catch(() => {});
          controller.close();
          await releaseGenerationSlot(userId);
          const creditsRefunded = creditDeduction ? creditDeduction.fromPurchased + creditDeduction.fromMonthly + creditDeduction.fromRollover : 0;
          await refundCredits(userId, creditDeduction).catch((refundErr) => console.error('[influencer-course] credit refund failed:', refundErr));
          sendGenerationFailedEmail({ to: user.email, title: record.title, reason: message, creditsRefunded })
            .catch((emailErr) => console.error('[influencer-course] failure email failed:', emailErr));
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (error) {
    if (slotUserId) await releaseGenerationSlot(slotUserId);
    const message = error instanceof Error ? error.message : "Failed";
    return new Response(JSON.stringify({ error: message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
