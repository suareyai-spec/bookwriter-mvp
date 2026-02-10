import { NextResponse } from "next/server";
import { z } from "zod";
import { anthropic, BUDGET } from "@/lib/openai";

const Body = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  genre: z.string().max(60).optional(),
  tone: z.string().max(60).optional(),
  audience: z.string().max(200).optional(),
  bookLength: z.string().max(100).optional(),
  language: z.string().max(30).optional(),
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());

    const prompt = `You are a world-class professional book author and subject matter expert. Write original, publication-quality content only.

BOOK DETAILS:
Title: "${body.title}"
Genre: ${body.genre || "General"}
Tone: ${body.tone || "Professional"}
Target Book Length: ${body.bookLength || "50,000 words (~200 pages)"}
Language: ${body.language || "English"} — Write the ENTIRE book in ${body.language || "English"}.
${body.audience ? `Target Audience: ${body.audience}` : ""}

AUTHOR'S VISION:
${body.description}

YOUR TASK — Create the following:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 TABLE OF CONTENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create a detailed table of contents with 8-12 chapters. Each chapter should have a title and a 1-2 sentence description of what it covers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 CHAPTER 1 (Full Chapter — ~1500 words)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write the complete first chapter. Make it compelling and set the foundation for the entire book.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 CHAPTER 2 (Full Chapter — ~1500 words)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write the complete second chapter. Build naturally on Chapter 1.

QUALITY GUIDELINES:
- Write at a professional, published-book level
- Include real-world context, practical insights, and depth
- Use engaging prose — not AI-summary style
- Avoid imitating any specific living author
- Structure with clear headings and flow`.slice(0, BUDGET.maxPromptChars);

    const resp = await anthropic.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: BUDGET.maxOutputTokens,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      resp.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("\n") || "No text returned.";

    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
