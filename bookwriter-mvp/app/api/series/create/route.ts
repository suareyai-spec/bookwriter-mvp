import { z } from "zod";
import { anthropic } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/config";
import { randomUUID } from "crypto";

export const maxDuration = 900;
export const dynamic = "force-dynamic";

const Body = z.object({
  // For series from existing book
  bookId: z.string().optional(),
  // For series from scratch
  title: z.string().optional(),
  description: z.string().optional(),
  genre: z.string().optional(),
  tone: z.string().optional(),
  audience: z.string().optional(),
  bookLength: z.string().optional(),
  language: z.string().optional(),
  // Series params
  seriesLength: z.number().min(2).max(5).default(3),
  seriesDescription: z.string().max(2000).optional(),
});

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  const resp = await anthropic.messages.create({
    model: "claude-opus-4-8",
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

function getChapterPlan(bookLength: string): { chapters: number; totalWords: number } {
  if (bookLength?.includes("10,000")) return { chapters: 5, totalWords: 10000 };
  if (bookLength?.includes("25,000")) return { chapters: 8, totalWords: 24000 };
  if (bookLength?.includes("50,000")) return { chapters: 10, totalWords: 50000 };
  if (bookLength?.includes("75,000")) return { chapters: 12, totalWords: 72000 };
  if (bookLength?.includes("100,000")) return { chapters: 15, totalWords: 97500 };
  return { chapters: 5, totalWords: 10000 };
}

export async function POST(req: Request) {
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

    // Only admins can create series for now (no credit deduction per book in series)
    if (!isAdmin(user.email)) {
      return new Response(JSON.stringify({ error: "Series creation requires admin access or a future subscription upgrade." }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const body = Body.parse(await req.json());
    const seriesId = randomUUID();

    // Get source book info if creating from existing book
    let sourceBook: any = null;
    let sourceContent = "";
    if (body.bookId) {
      sourceBook = await prisma.book.findFirst({
        where: { id: body.bookId, userId },
        include: { versions: { orderBy: { version: "desc" }, take: 1 } },
      });
      if (!sourceBook) {
        return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      sourceContent = sourceBook.versions[0]?.content || "";
      // Update source book with series info
      await prisma.book.update({
        where: { id: body.bookId },
        data: { seriesId, seriesOrder: 1 },
      });
    }

    const title = sourceBook?.title || body.title || "Untitled Series";
    const description = sourceBook?.description || body.description || "";
    const genre = sourceBook?.genre || body.genre || "General";
    const tone = sourceBook?.tone || body.tone || "Professional";
    const audience = sourceBook?.audience || body.audience || "";
    const language = sourceBook?.language || body.language || "English";
    const bookLength = sourceBook?.bookLength || body.bookLength || "10,000 words (~40 pages)";
    const plan = getChapterPlan(bookLength);
    const seriesLen = body.seriesLength;
    const startIndex = sourceBook ? 2 : 1; // If from existing book, start generating from book 2

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(new TextEncoder().encode(sseEvent({
            type: "series_start",
            seriesId,
            totalBooks: seriesLen,
            startingFrom: startIndex,
          })));

          // Step 1: Generate series plan
          const seriesPlanPrompt = `You are a master storyteller and series architect. Plan a ${seriesLen}-book series.

Original Book Title: "${title}"
Genre: ${genre}
Tone: ${tone}
Audience: ${audience || "General readers"}
Language: ${language}

Original Book Description: ${description}
${body.seriesDescription ? `\nSeries Direction: ${body.seriesDescription}` : ""}
${sourceContent ? `\nSummary of Book 1 (first 2000 chars): ${sourceContent.slice(0, 2000)}` : ""}

Create a detailed series plan with:
1. Overall series arc and theme
2. For each book (${seriesLen} total), provide:
   - Book number
   - Title
   - A detailed description (3-5 sentences) of what this book covers
   - How it connects to and builds upon the previous book(s)
   - Key themes or developments unique to this book

Ensure narrative continuity across all books. Each book should stand on its own while contributing to the larger series arc.

Write in ${language}.`;

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", status: "planning", message: "Creating series plan..." })));

          const seriesPlan = await callClaude(seriesPlanPrompt, 4000);

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "series_plan", plan: seriesPlan })));

          // Step 2: Generate each book
          const previousBookSummaries: string[] = [];
          if (sourceContent) {
            previousBookSummaries.push(`Book 1 "${title}": ${sourceContent.slice(0, 3000)}`);
          }

          for (let bookNum = startIndex; bookNum <= seriesLen; bookNum++) {
            controller.enqueue(new TextEncoder().encode(sseEvent({
              type: "book_start",
              bookNumber: bookNum,
              totalBooks: seriesLen,
            })));

            // Generate outline for this book
            const outlinePrompt = `You are an expert author writing Book ${bookNum} of a ${seriesLen}-book series.

Series Plan:
${seriesPlan}

${previousBookSummaries.length > 0 ? `Previous books in the series:\n${previousBookSummaries.join("\n\n")}` : ""}

Genre: ${genre}
Tone: ${tone}
Audience: ${audience || "General readers"}
Language: ${language}

Create a detailed TABLE OF CONTENTS for Book ${bookNum} with approximately ${plan.chapters} chapters.
For each chapter provide:
- Chapter number and title
- A 3-4 sentence description

This book must maintain continuity with the previous books while advancing the series arc.
Write in ${language}.`;

            const outline = await callClaude(outlinePrompt, 3000);

            // Extract chapter titles
            const chapterTitles: string[] = [];
            const titleRegex = /chapter\s+\d+[:\s]+(.+)/gi;
            let match;
            while ((match = titleRegex.exec(outline)) !== null) {
              chapterTitles.push(match[1].trim().replace(/\*+/g, "").trim());
            }
            const actualChapters = chapterTitles.length > 0 ? chapterTitles.length : plan.chapters;
            const wordsPerChapter = Math.round(plan.totalWords / actualChapters);

            // Extract book title from series plan
            const bookTitleRegex = new RegExp(`book\\s*${bookNum}[^\\n]*?[:\\-–]\\s*[""]?([^""\\n]+)`, "i");
            const bookTitleMatch = seriesPlan.match(bookTitleRegex);
            const bookTitle = bookTitleMatch ? bookTitleMatch[1].trim().replace(/[""]$/, "") : `${title} - Book ${bookNum}`;

            controller.enqueue(new TextEncoder().encode(sseEvent({
              type: "book_outline",
              bookNumber: bookNum,
              bookTitle,
              outline,
              totalChapters: actualChapters,
            })));

            // Generate chapters
            const chapters: string[] = [];
            for (let i = 1; i <= actualChapters; i++) {
              const chTitle = chapterTitles[i - 1] || `Chapter ${i}`;
              controller.enqueue(new TextEncoder().encode(sseEvent({
                type: "book_chapter_progress",
                bookNumber: bookNum,
                chapter: i,
                totalChapters: actualChapters,
                title: chTitle,
                percent: Math.round(((bookNum - startIndex) / (seriesLen - startIndex + 1)) * 100 + ((i - 1) / actualChapters) * (100 / (seriesLen - startIndex + 1))),
              })));

              const prevSummary = chapters.length > 0
                ? `\nPrevious chapters in this book:\n${chapters.map((c, idx) => `Chapter ${idx + 1}: ${c.slice(0, 400)}...`).join("\n\n")}`
                : "";

              const chapterPrompt = `You are writing Book ${bookNum} of a ${seriesLen}-book series.

Series Plan:
${seriesPlan}

${previousBookSummaries.length > 0 ? `Previous books:\n${previousBookSummaries.join("\n\n").slice(0, 4000)}` : ""}

Book ${bookNum} outline:
${outline}
${prevSummary}

Write CHAPTER ${i}: "${chTitle}" in full. Target: ~${wordsPerChapter} words. Write in ${language}.

Maintain continuity with both the series and previous chapters. Write with depth and engagement.
Start with the chapter title as a heading.`;

              const chapter = await callClaude(chapterPrompt, 8192);
              chapters.push(chapter);

              controller.enqueue(new TextEncoder().encode(sseEvent({
                type: "book_chapter_done",
                bookNumber: bookNum,
                chapter: i,
                totalChapters: actualChapters,
                title: chTitle,
              })));
            }

            // Save this book
            const fullBook = `${outline}\n\n${"━".repeat(50)}\n\n${chapters.join("\n\n" + "━".repeat(50) + "\n\n")}`;
            const wordCount = fullBook.split(/\s+/).filter(Boolean).length;

            const newBook = await prisma.book.create({
              data: {
                title: bookTitle,
                description: `Book ${bookNum} of series. ${description}`,
                genre,
                tone,
                audience,
                language,
                bookLength,
                userId,
                status: "complete",
                seriesId,
                seriesOrder: bookNum,
                versions: {
                  create: {
                    version: 1,
                    content: fullBook,
                    wordCount,
                    notes: `Book ${bookNum} of ${seriesLen}-book series`,
                  },
                },
              },
            });

            previousBookSummaries.push(`Book ${bookNum} "${bookTitle}": ${fullBook.slice(0, 3000)}`);

            controller.enqueue(new TextEncoder().encode(sseEvent({
              type: "book_complete",
              bookNumber: bookNum,
              bookId: newBook.id,
              bookTitle,
              wordCount,
            })));
          }

          controller.enqueue(new TextEncoder().encode(sseEvent({
            type: "series_complete",
            seriesId,
            totalBooks: seriesLen,
          })));

          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
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
