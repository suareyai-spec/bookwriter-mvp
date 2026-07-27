import { z } from "zod";
import { anthropic } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/config";
import { rateLimitByUser } from "@/lib/rate-limit";
import { humanizeChapter } from "@/lib/humanizer";
import { trackApiCost, getTokensFromResponse } from "@/lib/cost-tracker";
import { getRevisionCreditCost, hasUnlimitedAccess, totalCredits, deductCredits, refundCredits, insufficientCreditsMessage, CreditDeduction } from "@/lib/credits";

export const maxDuration = 900;
export const dynamic = "force-dynamic";

const ReferenceItem = z.object({
  type: z.enum(["pdf", "gdoc", "text"]),
  content: z.string(),
  name: z.string(),
});

const Body = z.object({
  bookId: z.string().optional(),
  title: z.string(),
  genre: z.string().optional(),
  tone: z.string().optional(),
  audience: z.string().optional(),
  language: z.string().optional(),
  previousContent: z.string(),
  revisionInstructions: z.string().min(1).max(5000),
  references: z.array(ReferenceItem).optional(),
  lengthAdjustment: z.enum(["keep", "extend", "shorten"]).optional(),
  mature: z.boolean().optional(),
  humanize: z.boolean().optional(),
  translateTo: z.string().optional(),
});

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

function buildReferenceContext(refs: z.infer<typeof ReferenceItem>[]): string {
  if (!refs || refs.length === 0) return "";
  let context = "\n\nNEW REFERENCE MATERIALS PROVIDED FOR THIS REVISION:\n";
  let totalChars = 0;
  for (const ref of refs) {
    if (totalChars > 50000) break;
    const snippet = ref.content.slice(0, 50000 - totalChars);
    context += `\n[${ref.name}]\n${snippet}\n`;
    totalChars += snippet.length;
  }
  return context;
}

function isRomanceGenre(genre: string, instructions: string): boolean {
  const keywords = ['romance', 'erotica', 'erotic', 'love story', 'steamy', 'adult'];
  const combined = `${genre} ${instructions}`.toLowerCase();
  return keywords.some(k => combined.includes(k));
}

function getMatureInstructions(): string {
  return `
MATURE CONTENT INSTRUCTIONS (18+ EXPLICIT):
- Write vivid, explicit sexual descriptions — absolutely NO fade-to-black, NO euphemisms, NO cutting away from intimate scenes.
- Describe physical intimacy in full sensory detail: touch, taste, smell, sound, sight.
- Build chemistry and sexual tension deliberately.
- Show emotional connection alongside physical intimacy.
- Vary intimate scenes creatively — different settings, dynamics, pacing.
- Maintain strong storytelling throughout — plot, character development, emotional arcs.`;
}

function parseChapters(content: string): { outline: string; chapters: { title: string; content: string }[] } {
  const separator = "━".repeat(50);
  const parts = content.split(separator).map(p => p.trim()).filter(Boolean);
  
  const outline = parts[0] || "";
  const chapters: { title: string; content: string }[] = [];
  
  for (let i = 1; i < parts.length; i++) {
    const chapterText = parts[i];
    const firstLine = chapterText.split("\n")[0]?.trim() || "";
    const titleMatch = firstLine.match(/^(?:#+ )?(?:Chapter\s+\d+[:\s]*)?(.+)/i);
    chapters.push({
      title: titleMatch ? titleMatch[1].trim() : `Chapter ${i}`,
      content: chapterText,
    });
  }
  
  return { outline, chapters };
}

function getLengthInstruction(lengthAdjustment: string | undefined): string {
  switch (lengthAdjustment) {
    case "extend":
      return "\n\nLENGTH ADJUSTMENT: The author wants to EXTEND the book. Add significantly more detail, examples, depth, and content to each chapter. If appropriate, suggest splitting chapters or adding new sections. Aim for at least 50% more content per chapter.";
    case "shorten":
      return "\n\nLENGTH ADJUSTMENT: The author wants to SHORTEN/CONDENSE the book. Remove redundant content, tighten prose, merge overlapping sections, and focus on the most essential points. Aim to reduce content by about 30-40% while keeping all key ideas.";
    default:
      return "";
  }
}

async function updateBookProgress(bookId: string | undefined, progress: Record<string, unknown>) {
  if (!bookId) return;
  try {
    await prisma.book.update({
      where: { id: bookId },
      data: { progress: JSON.stringify(progress) },
    });
  } catch {}
}

export async function POST(req: Request) {
  try {
    // --- RATE LIMIT ---
    const rl = await rateLimitByUser("revise", 20, 60 * 60 * 1000);
    if (rl.blocked) return rl.blocked;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Please sign in to revise books." }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const userId = (session.user as any).id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const body = Body.parse(await req.json());

    const translateTo = body.translateTo;
    const lang = translateTo || body.language || "English";
    const isMatureRomance = body.mature === true && isRomanceGenre(body.genre || "", body.revisionInstructions);
    const matureInstructions = isMatureRomance ? getMatureInstructions() : "";
    const refContext = body.references?.length ? buildReferenceContext(body.references) : "";
    const lengthInstruction = getLengthInstruction(body.lengthAdjustment);
    const { outline, chapters } = parseChapters(body.previousContent);

    // --- DETERMINE SCOPE (which chapters actually need revision) ---
    // Has to happen before the credit check below, since the cost depends on
    // how many chapters are touched. Length changes and full translations
    // always touch every chapter, so Claude is only consulted when the
    // instructions might be chapter-specific.
    let chaptersToRevise: number[] = chapters.map((_, i) => i + 1);
    if (chapters.length > 0 && body.lengthAdjustment !== "extend" && body.lengthAdjustment !== "shorten" && !translateTo) {
      const analysisPrompt = `You are a professional book editor. A book has been written and the author wants revisions.

Book Title: "${body.title}"
Genre: ${body.genre || "General"}
Tone: ${body.tone || "Professional"}
Language: ${lang}

The book has ${chapters.length} chapters:
${chapters.map((ch, i) => `Chapter ${i + 1}: ${ch.title}`).join("\n")}

REVISION INSTRUCTIONS FROM THE AUTHOR:
${body.revisionInstructions}
${refContext}
${lengthInstruction}

Based on the revision instructions, which chapters need to be rewritten or updated?
Respond with ONLY a JSON array of chapter numbers that need revision, like [1, 3, 5].
If the instructions are general and apply to the whole book, list all chapters.
If they mention specific chapters, only list those.
Respond with ONLY the JSON array, nothing else.`;

      try {
        const analysisResp = await callClaude(analysisPrompt, 200);
        trackApiCost({ userId, type: "revision", inputTokens: analysisResp.inputTokens, outputTokens: analysisResp.outputTokens, bookId: body.bookId }).catch(() => {});
        const parsed = JSON.parse(analysisResp.text.trim());
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((n: unknown) => typeof n === "number" && n >= 1 && n <= chapters.length);
          if (filtered.length > 0) chaptersToRevise = filtered;
        }
      } catch {
        // Keep the "all chapters" fallback already assigned above
      }
    }

    // --- PAYMENT GATE ---
    let creditDeduction: CreditDeduction | null = null;
    if (!isAdmin(user.email) && !hasUnlimitedAccess(user.email)) {
      const isActive = user.subscriptionStatus === "active";
      const isFreeUser = !isActive && !user.subscriptionPlan;

      // Full translation via revision always redirects to the dedicated
      // Translate page, which prices by actual word count — a flat
      // per-chapter revision charge would badly undercharge a full book.
      if (translateTo && chapters.length > 0) {
        return new Response(JSON.stringify({
          error: "Full translation counts as a new book generation. Please use the Translate page instead, which prices by word count.",
          isFullRewrite: true,
        }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      if (isFreeUser) {
        // Free Starter: 1 lifetime revision
        const freeRevisionsUsed = (user as any).freeRevisionsUsed || 0;
        if (freeRevisionsUsed >= 1) {
          return new Response(JSON.stringify({
            error: "You've reached your Free Starter limit. Upgrade to unlock full book generation, full translations, and unlimited creative output.",
            needsSubscription: true,
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        await prisma.user.update({ where: { id: userId }, data: { freeRevisionsUsed: { increment: 1 } } });
      } else {
        // Credit-based check for starter/author/studio — 1 credit per chapter
        // actually touched, capped at the flat full-book rate (3 credits).
        const creditCost = getRevisionCreditCost(chaptersToRevise.length);
        const balance = {
          purchasedCredits: (user as any).purchasedCredits ?? 0,
          monthlyCredits: (user as any).monthlyCredits ?? 0,
          creditsRollover: (user as any).creditsRollover ?? 0,
        };
        const have = totalCredits(balance);

        if (have < creditCost) {
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
    // --- END PAYMENT GATE ---

    // Mark book as revising in DB
    if (body.bookId && userId) {
      try {
        await prisma.book.update({
          where: { id: body.bookId, userId },
          data: { 
            status: "revising", 
            progress: JSON.stringify({ percent: 0, currentChapter: 0, totalChapters: chapters.length, status: "analyzing" }) 
          },
        });
      } catch {}
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Scope (chaptersToRevise) was already determined above, before the
          // credit check, so this just narrates it — no second Claude call.
          controller.enqueue(new TextEncoder().encode(sseEvent({
            type: "analysis",
            chaptersToRevise,
            totalChapters: chapters.length,
            message: `Updating ${chaptersToRevise.length} of ${chapters.length} chapters`
          })));

          const revisedChapters = [...chapters];
          let completedCount = 0;

          for (let i = 0; i < chapters.length; i++) {
            const chapterNum = i + 1;
            const ch = chapters[i];
            
            if (!chaptersToRevise.includes(chapterNum)) {
              completedCount++;
              const percent = Math.round((completedCount / chapters.length) * 100);
              controller.enqueue(new TextEncoder().encode(sseEvent({ 
                type: "chapter", chapter: chapterNum, totalChapters: chapters.length, 
                title: ch.title, content: ch.content, revised: false,
                percent, completedCount,
              })));
              await updateBookProgress(body.bookId, { percent, currentChapter: chapterNum, totalChapters: chapters.length, completedCount, status: "skipped" });
              continue;
            }

            const percent = Math.round((completedCount / chapters.length) * 100);
            controller.enqueue(new TextEncoder().encode(sseEvent({ 
              type: "progress", chapter: chapterNum, totalChapters: chapters.length, 
              title: ch.title, status: "revising", percent, completedCount,
            })));
            await updateBookProgress(body.bookId, { percent, currentChapter: chapterNum, totalChapters: chapters.length, completedCount, status: "revising" });

            const revisePrompt = `You are a professional book editor revising a specific chapter.

Book Title: "${body.title}"
Genre: ${body.genre || "General"}
Tone: ${body.tone || "Professional"}
Language: ${lang} — Write EVERYTHING in ${lang}.

REVISION INSTRUCTIONS FROM THE AUTHOR:
${body.revisionInstructions}
${refContext}
${lengthInstruction}

CURRENT CHAPTER ${chapterNum}: "${ch.title}"
${ch.content}

${i > 0 ? `PREVIOUS CHAPTER (for context):\n${chapters[i-1].content.slice(0, 2000)}...` : ""}
${i < chapters.length - 1 ? `NEXT CHAPTER (for context):\n${chapters[i+1].content.slice(0, 2000)}...` : ""}

Rewrite this chapter incorporating the author's revision instructions and any new reference materials.
IMPORTANT RULES:
- Keep the same chapter title and overall structure unless the instructions say otherwise
- Maintain consistency with the rest of the book
- Improve and update based on the specific instructions
- Keep the same tone, style, and voice unless a tone change was requested
${body.lengthAdjustment === "extend" ? "- EXTEND this chapter significantly: add more detail, examples, explanations, and depth. Aim for at least 50% more content." : ""}
${body.lengthAdjustment === "shorten" ? "- CONDENSE this chapter: remove redundancy, tighten prose, focus on essentials. Reduce by about 30-40%." : ""}
- Output ONLY the revised chapter content, starting with the chapter title as a heading
${translateTo ? `- TRANSLATE this entire chapter into ${translateTo}. Every word, including the chapter title, must be in ${translateTo}. This is a professional-quality translation, not machine translation. Preserve meaning, tone, idioms, and cultural nuance.` : ""}
${matureInstructions}
Revised Chapter ${chapterNum}:`;

            const reviseResp = await callClaude(revisePrompt, 8192);
            let revised = reviseResp.text;
            trackApiCost({ userId, type: "revision", inputTokens: reviseResp.inputTokens, outputTokens: reviseResp.outputTokens, bookId: body.bookId }).catch(() => {});
            
            // Always run humanizer pass for natural voice
            controller.enqueue(new TextEncoder().encode(sseEvent({ 
              type: "progress", chapter: chapterNum, totalChapters: chapters.length, 
              title: `Humanizing Chapter ${chapterNum}...`, status: "humanizing", percent, completedCount,
            })));
            await updateBookProgress(body.bookId, { percent, currentChapter: chapterNum, totalChapters: chapters.length, completedCount, status: "humanizing" });
            revised = await humanizeChapter(revised, { userId, bookId: body.bookId });
            
            revisedChapters[i] = { title: ch.title, content: revised };
            completedCount++;
            
            const newPercent = Math.round((completedCount / chapters.length) * 100);
            controller.enqueue(new TextEncoder().encode(sseEvent({ 
              type: "chapter", chapter: chapterNum, totalChapters: chapters.length, 
              title: ch.title, content: revised, revised: true,
              percent: newPercent, completedCount,
            })));
            await updateBookProgress(body.bookId, { percent: newPercent, currentChapter: chapterNum, totalChapters: chapters.length, completedCount, status: "done" });
          }

          const separator = "━".repeat(50);
          const fullBook = `${outline}\n\n${separator}\n\n${revisedChapters.map(ch => ch.content).join("\n\n" + separator + "\n\n")}`;
          
          controller.enqueue(new TextEncoder().encode(sseEvent({ 
            type: "complete", fullText: fullBook, 
            revisedCount: chaptersToRevise.length, 
            totalChapters: chapters.length 
          })));

          // Mark book as complete in DB
          if (body.bookId && userId) {
            try {
              await prisma.book.update({
                where: { id: body.bookId },
                data: { status: "complete", progress: null },
              });
            } catch {}
          }

          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Revision failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
          // Mark book as failed
          if (body.bookId && userId) {
            try {
              await prisma.book.update({
                where: { id: body.bookId },
                data: { status: "failed", progress: JSON.stringify({ error: message }) },
              });
            } catch {}
          }
          await refundCredits(userId, creditDeduction).catch((refundErr) => console.error('[revise] credit refund failed:', refundErr));
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
