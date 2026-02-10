import { NextResponse } from "next/server";
import { z } from "zod";
import { openai, BUDGET } from "@/lib/openai";

const Body = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());

    const prompt = `You are a professional book author. Write original content only.

Book Title: "${body.title}"

Author's Vision:
${body.description}

Based on the above, create:

1) A detailed TABLE OF CONTENTS with chapter titles and brief descriptions (8-12 chapters)

2) CHAPTER 1 — Write the full first chapter (~1500 words). Make it compelling, well-researched, and professional.

3) CHAPTER 2 — Write the full second chapter (~1500 words). Continue the narrative/guide naturally.

Guidelines:
- Write in a professional, authoritative tone
- Include real-world context and practical insights
- Make it engaging and informative
- Avoid imitating any specific living author
- This should read like a published book, not an AI summary`.slice(0, BUDGET.maxPromptChars);

    const resp = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: BUDGET.maxOutputTokens,
    });

    const text = resp.output_text || "No text returned.";
    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
