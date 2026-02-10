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

function getChapterPlan(bookLength: string): { chapters: number; wordsPerChapter: number } {
  if (bookLength?.includes("10,000")) return { chapters: 5, wordsPerChapter: 2000 };
  if (bookLength?.includes("25,000")) return { chapters: 8, wordsPerChapter: 3000 };
  if (bookLength?.includes("50,000")) return { chapters: 10, wordsPerChapter: 5000 };
  if (bookLength?.includes("75,000")) return { chapters: 12, wordsPerChapter: 6000 };
  if (bookLength?.includes("100,000")) return { chapters: 15, wordsPerChapter: 6500 };
  return { chapters: 5, wordsPerChapter: 2000 };
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

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const plan = getChapterPlan(body.bookLength || "10,000 words (~40 pages)");
    const lang = body.language || "English";
    const genre = body.genre || "General";
    const tone = body.tone || "Professional";
    const isEdu = isEducational(genre, tone);

    const bookContext = `Title: "${body.title}"
Genre: ${genre}
Tone: ${tone}
Target Audience: ${body.audience || "General readers"}
Language: ${lang} — Write EVERYTHING in ${lang}.

Author's Vision:
${body.description}`;

    // Step 1: Generate outline
    const outlinePrompt = isEdu
      ? `You are an expert author and subject-matter specialist writing a definitive book on this topic.

${bookContext}

Create a detailed TABLE OF CONTENTS with exactly ${plan.chapters} chapters.

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

Create a detailed TABLE OF CONTENTS with exactly ${plan.chapters} chapters.

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

    const outline = await callClaude(outlinePrompt, 3000);

    // Step 2: Generate each chapter
    const chapters: string[] = [];
    for (let i = 1; i <= plan.chapters; i++) {
      const prevSummary = chapters.length > 0
        ? `\nSummary of previous chapters:\n${chapters.map((c, idx) => `Chapter ${idx + 1}: ${c.slice(0, 500)}...`).join("\n\n")}`
        : "";

      const chapterPrompt = isEdu
        ? `You are an expert author and subject-matter specialist writing a comprehensive, authoritative book.

${bookContext}

Full book outline:
${outline}
${prevSummary}

Now write CHAPTER ${i} in full. Target: approximately ${plan.wordsPerChapter} words. Write in ${lang}.

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

Now write CHAPTER ${i} in full. Target: approximately ${plan.wordsPerChapter} words. Write in ${lang}.

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
    }

    const fullBook = `${outline}\n\n${"━".repeat(50)}\n\n${chapters.join("\n\n" + "━".repeat(50) + "\n\n")}`;

    return NextResponse.json({ text: fullBook });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
