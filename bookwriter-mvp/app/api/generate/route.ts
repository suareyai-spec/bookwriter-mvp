import { z } from "zod";
import { anthropic } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, getBookSize, getBookCreditCost, PlanKey } from "@/lib/stripe";

export const maxDuration = 600;
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
});

function buildReferenceContext(references: z.infer<typeof ReferenceItem>[]): string {
  if (!references.length) return "";
  const MAX_REF_CHARS = 50000;
  let total = 0;
  const parts: string[] = [];
  for (let i = 0; i < references.length; i++) {
    const ref = references[i];
    const remaining = MAX_REF_CHARS - total;
    if (remaining <= 0) break;
    const content = ref.content.slice(0, remaining);
    total += content.length;
    parts.push(`[Reference ${i + 1}: ${ref.name}]\n${content}`);
  }
  return `\n\nREFERENCE MATERIALS PROVIDED BY THE AUTHOR:
The author has provided the following reference materials. Use these to inform the book's content, style, facts, and direction. Incorporate relevant information naturally.

${parts.join("\n\n")}`;
}

function getChapterPlan(bookLength: string): { chapters: number; totalWords: number } {
  if (bookLength?.includes("10,000")) return { chapters: 5, totalWords: 10000 };
  if (bookLength?.includes("25,000")) return { chapters: 8, totalWords: 24000 };
  if (bookLength?.includes("50,000")) return { chapters: 10, totalWords: 50000 };
  if (bookLength?.includes("75,000")) return { chapters: 12, totalWords: 72000 };
  if (bookLength?.includes("100,000")) return { chapters: 15, totalWords: 97500 };
  return { chapters: 5, totalWords: 10000 };
}

function countChaptersInOutline(outline: string): number {
  const matches = outline.match(/\bchapter\s+\d+/gi);
  if (matches) {
    const nums = matches.map(m => parseInt(m.replace(/\D+/g, ""), 10)).filter(n => !isNaN(n));
    if (nums.length > 0) return Math.max(...nums);
  }
  return 0;
}

function isEducational(genre: string, tone: string): boolean {
  const eduKeywords = ['educational', 'self-help', 'non-fiction', 'nonfiction', 'business', 'science', 'history', 'philosophy', 'psychology', 'health', 'technology', 'how-to', 'guide', 'textbook', 'academic'];
  const combined = `${genre} ${tone}`.toLowerCase();
  return eduKeywords.some(k => combined.includes(k));
}

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  const resp = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");
}

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  try {
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

    // Check if already generating
    if (user.isGenerating) {
      return new Response(JSON.stringify({ error: "You already have a book being generated. Please wait for it to complete." }), { status: 429, headers: { "Content-Type": "application/json" } });
    }

    const body = Body.parse(await req.json());
    const bookSize = getBookSize(body.bookLength || "10,000 words (~40 pages)");
    const userPlan = user.subscriptionPlan as PlanKey | null;
    const isActive = user.subscriptionStatus === "active";

    // Check if user has any way to generate
    if (!isActive && !userPlan) {
      // Check for credits
      const credit = await prisma.bookCredit.findFirst({
        where: { userId, bookSize, used: false },
      });
      if (!credit) {
        return new Response(JSON.stringify({ error: "You need a subscription or book credit to generate. Visit the pricing page to get started.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
    }

    // Check if plan allows this size (epic never included in subscriptions)
    if (bookSize === "epic") {
      const credit = await prisma.bookCredit.findFirst({
        where: { userId, bookSize: "epic", used: false },
      });
      if (!credit) {
        return new Response(JSON.stringify({ error: "Epic books require a one-time credit purchase. Buy an Epic Book credit to continue.", needsCredit: true, creditSize: "epic" }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      // Will use this credit
      await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
    } else if (isActive && userPlan) {
      const planConfig = PLANS[userPlan];
      if (!planConfig.allowedSizes.includes(bookSize)) {
        return new Response(JSON.stringify({ error: `Your ${planConfig.name} plan doesn't include ${bookSize} books. Upgrade your plan or buy a credit.`, needsCredit: true, creditSize: bookSize }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      // Check monthly reset
      if (user.monthlyResetDate && new Date() > user.monthlyResetDate) {
        await prisma.user.update({ where: { id: userId }, data: { monthlyBooksUsed: 0, monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
        user.monthlyBooksUsed = 0;
      }

      const creditCost = getBookCreditCost(userPlan, bookSize);
      const remaining = planConfig.monthlyCredits - user.monthlyBooksUsed;

      if (remaining >= creditCost) {
        // Use monthly credits
        await prisma.user.update({ where: { id: userId }, data: { monthlyBooksUsed: user.monthlyBooksUsed + creditCost } });
      } else {
        // Try purchased credits
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
      // No active subscription — check credits
      const credit = await prisma.bookCredit.findFirst({
        where: { userId, bookSize, used: false },
      });
      if (!credit) {
        return new Response(JSON.stringify({ error: "You need a subscription or book credit to generate. Visit the pricing page to get started.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
    }

    // Mark as generating
    await prisma.user.update({ where: { id: userId }, data: { isGenerating: true } });

    // --- END PAYMENT GATE ---

    const plan = getChapterPlan(body.bookLength || "10,000 words (~40 pages)");
    const lang = body.language || "English";
    const genre = body.genre || "General";
    const tone = body.tone || "Professional";
    const isEdu = isEducational(genre, tone);
    const refContext = body.references?.length ? buildReferenceContext(body.references) : "";
    const revisionContext = body.revisionInstructions
      ? `\n\nREVISION INSTRUCTIONS FROM THE AUTHOR:\n${body.revisionInstructions}`
      : "";
    const previousContentContext = body.previousContent
      ? `\n\nPREVIOUS VERSION OF THE BOOK (use as foundation, improve upon it):\n${body.previousContent.slice(0, 80000)}`
      : "";

    const bookContext = `Title: "${body.title}"
Genre: ${genre}
Tone: ${tone}
Target Audience: ${body.audience || "General readers"}
Language: ${lang} — Write EVERYTHING in ${lang}.

Author's Vision:
${body.description}${refContext}${revisionContext}${previousContentContext}`;

    const outlinePrompt = isEdu
      ? `You are an expert author and subject-matter specialist writing a definitive book on this topic.

${bookContext}

Create a detailed TABLE OF CONTENTS. If the author's vision specifies a number of chapters, use that exact number. Otherwise use approximately ${plan.chapters} chapters.

CRITICAL REQUIREMENTS FOR EDUCATIONAL/NON-FICTION:
- Go DEEP, not wide. Each chapter should thoroughly explore its subject with real substance.
- Include specific data points, statistics, research findings, named studies, historical examples, and expert citations (use realistic attributions).
- Structure each chapter with clear sub-sections that build on each other.
- Include practical frameworks, methodologies, step-by-step processes, or actionable takeaways where appropriate.
- Reference real-world case studies, historical events, named companies, or notable figures relevant to the topic.
- Avoid surface-level generalities. If a chapter covers a concept, explain the WHY and HOW, not just the WHAT.
- Think like a professor writing for intelligent adults who want to truly understand the subject.

For each chapter, provide:
- Chapter number and title
- A 3-4 sentence detailed description of what the chapter covers, including specific subtopics
- 4-6 key sections/subsections within the chapter

Write the entire outline in ${lang}.`

      : `You are a masterful novelist known for literary depth, complex characters, and stories that stay with readers long after they finish.

${bookContext}

Create a detailed TABLE OF CONTENTS. If the author's vision specifies a number of chapters, use that exact number. Otherwise use approximately ${plan.chapters} chapters.

CRITICAL REQUIREMENTS FOR FICTION:
- Characters must feel like REAL PEOPLE with contradictions, flaws, desires they don't fully understand, and histories that shape their behavior.
- Avoid cliches: no "waking up to an alarm," no "looking in the mirror to describe appearance," no convenient coincidences, no love-at-first-sight without complication, no villains who are evil for no reason.
- Every character should want something — and the things they want should sometimes conflict.
- Ground the story in SPECIFIC, vivid details — real street names if set in a real city, authentic cultural details, sensory descriptions that feel lived-in.
- Subplots should weave naturally into the main arc, not feel like filler.
- Dialogue should sound like actual humans talking — interruptions, subtext, things left unsaid, humor mixed with tension.
- The story should explore genuine themes and moral complexity. No easy answers. No tidy lessons.
- Pacing should vary: quiet intimate moments balanced with tension and momentum.

For each chapter, provide:
- Chapter number and title
- A 3-4 sentence description covering the emotional arc, key events, and character development
- Key scenes and turning points

Write the entire outline in ${lang}.`;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Generate outline
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", chapter: 0, totalChapters: 0, title: "Generating outline...", status: "outline" })));
          const outline = await callClaude(outlinePrompt, 3000);
          // Extract chapter titles from outline to determine actual count
          const chapterTitles: string[] = [];
          const titleRegex = /chapter\s+\d+[:\s]+(.+)/gi;
          let match;
          while ((match = titleRegex.exec(outline)) !== null) {
            chapterTitles.push(match[1].trim().replace(/\*+/g, "").trim());
          }
          const actualChapters = chapterTitles.length > 0 ? chapterTitles.length : plan.chapters;
          const wordsPerChapter = Math.round(plan.totalWords / actualChapters);

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "outline", content: outline, totalChapters: actualChapters })));

          // Step 2: Generate each chapter
          const chapters: string[] = [];
          for (let i = 1; i <= actualChapters; i++) {
            const chTitle = chapterTitles[i - 1] || `Chapter ${i}`;
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", chapter: i, totalChapters: actualChapters, title: chTitle, status: "writing" })));

            const prevSummary = chapters.length > 0
              ? `\nSummary of previous chapters:\n${chapters.map((c, idx) => `Chapter ${idx + 1}: ${c.slice(0, 500)}...`).join("\n\n")}`
              : "";

            const chapterPrompt = isEdu
              ? `You are an expert author and subject-matter specialist writing a comprehensive, authoritative book.

${bookContext}

Full book outline:
${outline}
${prevSummary}

Now write CHAPTER ${i} in full. Target: approximately ${wordsPerChapter} words. Write in ${lang}.

REQUIREMENTS FOR THIS CHAPTER:
- Write with DEPTH and AUTHORITY. You are the world's foremost expert on this subject.
- Include specific examples, data, research findings, and real-world case studies. Use named sources, studies, companies, and historical events.
- Explain concepts thoroughly — the reasoning behind them, not just definitions. Answer "why" and "how," not just "what."
- Include practical applications, frameworks, or actionable advice where relevant.
- Use analogies and real-world comparisons to make complex ideas accessible.
- Address counterarguments, nuances, and common misconceptions.
- Connect ideas to the reader's life — why should they care? How does this apply to them?
- Use clear section headings and subheadings to organize the content.
- Write in an engaging, authoritative voice — not dry or textbook-like, but substantive and insightful.
- Do NOT pad with filler, repetitive summaries, or vague generalizations. Every paragraph should teach something specific.
- Build on previous chapters naturally.
- Do NOT include the outline — just write the chapter content.
- Start with the chapter title as a heading.

Write Chapter ${i} now:`

              : `You are a masterful novelist writing with literary depth, emotional honesty, and vivid authenticity.

${bookContext}

Full book outline:
${outline}
${prevSummary}

Now write CHAPTER ${i} in full. Target: approximately ${wordsPerChapter} words. Write in ${lang}.

REQUIREMENTS FOR THIS CHAPTER:
- Write like a published literary novelist, not an AI. NO cliches, NO generic prose, NO melodrama.
- SHOW, don't tell. Instead of "She was sad," show it through action, body language, dialogue, silence.
- Dialogue must sound REAL — people interrupt, trail off, say things they don't mean, use humor as deflection, talk past each other.
- Ground every scene in SPECIFIC sensory details — what does the room smell like? What song is playing? What's the texture of the food? What does the city sound like at 3am?
- Characters should behave consistently with their established personality but still surprise us. People are contradictions.
- Include quiet moments — not every scene needs drama. Sometimes the most powerful scenes are two people eating dinner in silence.
- Explore the INTERIOR LIFE of characters — their doubts, memories, the things they notice, the lies they tell themselves.
- Cultural details should feel authentic and specific, not stereotypical or performative.
- Subtext matters: what characters DON'T say is as important as what they do.
- Vary sentence rhythm — short punchy lines for tension, longer flowing ones for reflection.
- End the chapter with momentum — not necessarily a cliffhanger, but a reason to keep reading.
- Build naturally on previous chapters. Characters should remember and reference earlier events.
- Do NOT include the outline — just write the chapter content.
- Start with the chapter title as a heading.

Write Chapter ${i} now:`;

            const chapter = await callClaude(chapterPrompt, 8192);
            chapters.push(chapter);
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "chapter", chapter: i, totalChapters: actualChapters, title: chTitle, content: chapter })));
          }

          const fullBook = `${outline}\n\n${"━".repeat(50)}\n\n${chapters.join("\n\n" + "━".repeat(50) + "\n\n")}`;
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "complete", fullText: fullBook })));
          await prisma.user.update({ where: { id: userId }, data: { isGenerating: false } });
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
          await prisma.user.update({ where: { id: userId }, data: { isGenerating: false } }).catch(() => {});
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
