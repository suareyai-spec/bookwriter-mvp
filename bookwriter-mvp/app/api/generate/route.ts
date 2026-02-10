import { NextResponse } from "next/server";
import { z } from "zod";
import { openai, BUDGET } from "@/lib/openai";

const Body = z.object({
  title: z.string().min(1).max(120),
  genre: z.string().min(2).max(60),
  targetWords: z.number().min(5000).max(100000),
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());

    const prompt = `Write original fiction only. Create:\n1) a one-page outline\n2) chapter 1 (~900 words)\n3) chapter 2 (~900 words)\n\nTitle: ${body.title}\nGenre: ${body.genre}\nTarget length: ${body.targetWords} words\n\nAvoid imitating specific living authors.`.slice(
      0,
      BUDGET.maxPromptChars
    );

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
