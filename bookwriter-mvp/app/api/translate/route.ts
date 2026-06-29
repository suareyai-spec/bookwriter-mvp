import { z } from "zod";
import { anthropic } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/config";
import { rateLimitByUser } from "@/lib/rate-limit";
import { humanizeChapter } from "@/lib/humanizer";
import { trackApiCost, getTokensFromResponse } from "@/lib/cost-tracker";

export const maxDuration = 900;
export const dynamic = "force-dynamic";

const Body = z.object({
  bookId: z.string().optional(),
  text: z.string().optional(),
  targetLanguage: z.string().min(1),
  sections: z.array(z.number()).optional(),
  translateAll: z.boolean().optional().default(true),
});

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function calculatePrice(wordCount: number): number {
  if (wordCount <= 0) return 0;
  if (wordCount <= 1000) return 19;
  if (wordCount <= 2500) return 39;
  if (wordCount <= 5000) return 69;
  if (wordCount <= 10000) return 49;
  if (wordCount <= 20000) return 79;
  if (wordCount <= 40000) return 149;
  if (wordCount <= 60000) return 199;
  return 299;
}

function splitIntoSections(text: string): { title: string; content: string }[] {
  const headerRegex = /^(#{1,3}\s+.+|Chapter\s+\d+[:\s].+)/gim;
  const sections: { title: string; content: string }[] = [];
  const matches = [...text.matchAll(headerRegex)];

  if (matches.length > 1) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index!;
      const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
      const chunk = text.slice(start, end).trim();
      const title = matches[i][0].replace(/^#+\s*/, "").trim();
      sections.push({ title, content: chunk });
    }
  } else {
    const words = text.split(/\s+/);
    const chunkSize = 2000;
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(" ");
      const idx = Math.floor(i / chunkSize) + 1;
      sections.push({ title: `Section ${idx}`, content: chunk });
    }
  }

  return sections.length > 0 ? sections : [{ title: "Full Text", content: text }];
}

function buildTranslationPrompt(sectionContent: string, targetLanguage: string): string {
  return `Translate the following text into ${targetLanguage}.

RULES:
- Translate ONLY what is written. Do NOT add anything — no storylines, no extra words, no filler, no commentary.
- Every sentence in your output must correspond to a sentence in the original. If it's not in the original, don't write it.
- Preserve the author's tone, voice, and style. If they write simply, translate simply. If they write formally, translate formally.
- Preserve ALL formatting exactly: headers, bold, italic, lists, paragraph breaks, indentation.
- Preserve names, citations, and technical terms. Only translate them if standard translations exist in ${targetLanguage}.
- Idioms and expressions should use natural ${targetLanguage} equivalents — don't translate them literally if it sounds unnatural.
- The result should read naturally in ${targetLanguage} while staying faithful to the original meaning and length.
- Do NOT summarize, expand, explain, or editorialize. Just translate.

OUTPUT: Return ONLY the translated text. Nothing else — no preamble, no notes, no "Here is the translation."

Text to translate:

${sectionContent}`;
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
  try {
    const rl = await rateLimitByUser("translate", 10, 60 * 60 * 1000);
    if (rl.blocked) return rl.blocked;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Please sign in to translate." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = (session.user as any).id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = Body.parse(await req.json());

    // Get source text
    let sourceText = "";
    if (body.bookId) {
      const book = await prisma.book.findFirst({
        where: { id: body.bookId, userId },
      });
      if (!book) {
        return new Response(JSON.stringify({ error: "Book not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      const latestVersion = await prisma.bookVersion.findFirst({
        where: { bookId: body.bookId },
        orderBy: { version: "desc" },
      });
      sourceText = latestVersion?.content || "";
    } else if (body.text) {
      sourceText = body.text;
    }

    if (!sourceText.trim()) {
      return new Response(JSON.stringify({ error: "No text to translate" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const wordCount = sourceText.split(/\s+/).filter(Boolean).length;

    // Single job at a time enforcement
    if (user.isGenerating) {
      return new Response(
        JSON.stringify({ error: "You already have a translation or generation in progress. Please wait for it to finish." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Payment gate — admins bypass all payment
    if (!isAdmin(user.email || "")) {
      const isActive = user.subscriptionStatus === "active";
      const plan = user.subscriptionPlan as string | null;
      const isFreeUser = !isActive && !plan;

      if (isFreeUser) {
        // Free Starter: 2 short translations (up to ~3,000 words each)
        if (wordCount > 3000) {
          return new Response(
            JSON.stringify({
              error: "Free Starter only includes short translations (up to ~3,000 words). Upgrade to unlock full translation.",
              needsSubscription: true,
            }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
        // 2 translations per month (resets monthly)
        if (user.monthlyResetDate && new Date() > user.monthlyResetDate) {
          await prisma.user.update({ where: { id: userId }, data: { freeTranslationsUsed: 0, monthlyNewslettersUsed: 0, monthlyArticlesUsed: 0, monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
          (user as any).freeTranslationsUsed = 0;
        }
        if (!user.monthlyResetDate) {
          await prisma.user.update({ where: { id: userId }, data: { monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
        }
        const freeTranslationsUsed = (user as any).freeTranslationsUsed || 0;
        if (freeTranslationsUsed >= 2) {
          return new Response(
            JSON.stringify({
              error: "You've reached your Free Starter translation limit for this month. Upgrade to unlock more translations and unlimited creative output.",
              needsSubscription: true,
            }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
        await prisma.user.update({ where: { id: userId }, data: { freeTranslationsUsed: { increment: 1 } } });
      } else if (!isActive) {
        const credit = await prisma.bookCredit.findFirst({
          where: { userId, used: false },
        });
        if (!credit) {
          return new Response(
            JSON.stringify({
              error: `You need a subscription to translate. Visit the pricing page.`,
              needsSubscription: true,
            }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
        await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
      } else {
        // Enforce translation type by plan
        const isShortText = wordCount <= 5000;
        const isFullBook = wordCount > 5000;

        // Creator and Author Pro: only short-text translation included
        if (isFullBook && plan !== "studio") {
          // Full-book translation counts as a book credit
          const bookSize = wordCount <= 20000 ? "short" : wordCount <= 40000 ? "medium" : wordCount <= 60000 ? "standard" : "epic";
          const credit = await prisma.bookCredit.findFirst({
            where: { userId, bookSize, used: false },
          });
          if (!credit) {
            return new Response(
              JSON.stringify({
                error: `Full-book translation counts as a book credit. Buy a ${bookSize} book credit or upgrade to Studio for unlimited translation.`,
                needsCredit: true,
                creditSize: bookSize,
              }),
              { status: 403, headers: { "Content-Type": "application/json" } }
            );
          }
          await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
        }
        // Short-text translation is free/unlimited for all plans (fair use)
      }
    }

    // Mark as generating (single job enforcement)
    await prisma.user.update({ where: { id: userId }, data: { isGenerating: true, generationStartedAt: new Date() } });

    const allSections = splitIntoSections(sourceText);
    const sectionsToTranslate = body.sections
      ? allSections.filter((_, i) => body.sections!.includes(i))
      : allSections;
    const totalSections = sectionsToTranslate.length;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            new TextEncoder().encode(
              sseEvent({
                type: "start",
                totalSections,
                sourceWordCount: wordCount,
              })
            )
          );

          const translatedSections: { title: string; content: string; index: number }[] = [];

          for (let i = 0; i < sectionsToTranslate.length; i++) {
            const section = sectionsToTranslate[i];
            const originalIndex = body.sections ? body.sections[i] : i;

            controller.enqueue(
              new TextEncoder().encode(
                sseEvent({
                  type: "progress",
                  section: i + 1,
                  totalSections,
                  title: section.title,
                  percent: Math.round((i / totalSections) * 100),
                })
              )
            );

            const prompt = buildTranslationPrompt(section.content, body.targetLanguage);
            const translateResp = await callClaude(prompt, 8192);
            let translated = translateResp.text;
            trackApiCost({ userId, type: "translation", inputTokens: translateResp.inputTokens, outputTokens: translateResp.outputTokens, bookId: body.bookId }).catch(() => {});

            // Humanize for natural voice
            controller.enqueue(
              new TextEncoder().encode(
                sseEvent({
                  type: "progress",
                  section: i + 1,
                  totalSections,
                  title: `Polishing ${section.title}...`,
                  percent: Math.round(((i + 0.5) / totalSections) * 100),
                })
              )
            );
            translated = await humanizeChapter(translated, { userId, bookId: body.bookId });

            translatedSections.push({
              title: section.title,
              content: translated,
              index: originalIndex,
            });

            controller.enqueue(
              new TextEncoder().encode(
                sseEvent({
                  type: "section",
                  section: i + 1,
                  totalSections,
                  title: section.title,
                  content: translated,
                  index: originalIndex,
                })
              )
            );
          }

          const fullTranslation = translatedSections.map((s) => s.content).join("\n\n");
          const targetWordCount = fullTranslation.split(/\s+/).filter(Boolean).length;

          controller.enqueue(
            new TextEncoder().encode(
              sseEvent({
                type: "complete",
                targetWordCount,
                sections: translatedSections,
              })
            )
          );

          // Release generating lock
          await prisma.user.update({ where: { id: userId }, data: { isGenerating: false, generationStartedAt: null } }).catch(() => {});
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Translation failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
          await prisma.user.update({ where: { id: userId }, data: { isGenerating: false, generationStartedAt: null } }).catch(() => {});
          controller.close();
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
    const message = error instanceof Error ? error.message : "Failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
