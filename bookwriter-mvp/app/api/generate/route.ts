import { NextResponse } from "next/server";
import { z } from "zod";
import { anthropic } from "@/lib/openai";

const Body = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  genre: z.string().max(60).optional(),
  tone: z.string().max(60).optional(),
  audience: z.string().max(200).optional(),
  bookLength: z.string().max(100).optional(),
  language: z.string().max(30).optional(),
});

// Map book length to chapter count and words per chapter
function getChapterPlan(bookLength: string): { chapters: number; wordsPerChapter: number } {
  if (bookLength?.includes("10,000")) return { chapters: 5, wordsPerChapter: 2000 };
  if (bookLength?.includes("25,000")) return { chapters: 8, wordsPerChapter: 3000 };
  if (bookLength?.includes("50,000")) return { chapters: 10, wordsPerChapter: 5000 };
  if (bookLength?.includes("75,000")) return { chapters: 12, wordsPerChapter: 6000 };
  if (bookLength?.includes("100,000")) return { chapters: 15, wordsPerChapter: 6500 };
  return { chapters: 5, wordsPerChapter: 2000 };
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

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const plan = getChapterPlan(body.bookLength || "10,000 words (~40 pages)");
    const lang = body.language || "English";

    const bookContext = `Title: "${body.title}"
Genre: ${body.genre || "General"}
Tone: ${body.tone || "Professional"}
Target Audience: ${body.audience || "General readers"}
Language: ${lang} — Write EVERYTHING in ${lang}.

Author's Vision:
${body.description}`;

    // Step 1: Generate outline
    const outlinePrompt = `You are a world-class professional book author. Create a detailed outline for this book.

${bookContext}

Create a TABLE OF CONTENTS with exactly ${plan.chapters} chapters.
For each chapter, provide:
- Chapter number and title
- A 2-3 sentence description of what the chapter covers
- Key topics/sections within the chapter

Make the outline cohesive, logical, and compelling. This must read like a real published book.
Write the entire outline in ${lang}.`;

    const outline = await callClaude(outlinePrompt, 2000);

    // Step 2: Generate each chapter
    const chapters: string[] = [];
    for (let i = 1; i <= plan.chapters; i++) {
      const chapterPrompt = `You are a world-class professional book author writing a book.

${bookContext}

Here is the full book outline:
${outline}

${chapters.length > 0 ? `Here is a brief summary of what you've written so far:\n${chapters.map((c, idx) => `Chapter ${idx + 1}: ${c.slice(0, 300)}...`).join("\n")}` : ""}

Now write CHAPTER ${i} in full. Requirements:
- Write approximately ${plan.wordsPerChapter} words
- Write in ${lang}
- Professional, published-book quality prose
- Include depth, real-world context, and practical insights
- Use clear section headings within the chapter
- Build naturally on previous chapters
- Do NOT include the outline or table of contents — just write the chapter content
- Start with the chapter title as a heading

Write Chapter ${i} now:`;

      const chapter = await callClaude(chapterPrompt, 4096);
      chapters.push(chapter);
    }

    // Combine everything
    const fullBook = `${outline}\n\n${"━".repeat(50)}\n\n${chapters.join("\n\n" + "━".repeat(50) + "\n\n")}`;

    return NextResponse.json({ text: fullBook });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
