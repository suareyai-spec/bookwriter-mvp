import { z } from "zod";
import { anthropic } from "@/lib/openai";

export const maxDuration = 600;
export const dynamic = "force-dynamic";

const ReferenceItem = z.object({
  type: z.enum(["pdf", "gdoc", "text"]),
  content: z.string(),
  name: z.string(),
});

const Body = z.object({
  title: z.string(),
  genre: z.string().optional(),
  tone: z.string().optional(),
  audience: z.string().optional(),
  language: z.string().optional(),
  previousContent: z.string(), // the full existing book
  revisionInstructions: z.string().min(1).max(5000),
  references: z.array(ReferenceItem).optional(),
});

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
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

// Split existing book into chapters
function parseChapters(content: string): { outline: string; chapters: { title: string; content: string }[] } {
  const separator = "━".repeat(50);
  const parts = content.split(separator).map(p => p.trim()).filter(Boolean);
  
  const outline = parts[0] || "";
  const chapters: { title: string; content: string }[] = [];
  
  for (let i = 1; i < parts.length; i++) {
    const chapterText = parts[i];
    // Extract title from first line
    const firstLine = chapterText.split("\n")[0]?.trim() || "";
    const titleMatch = firstLine.match(/^(?:#+ )?(?:Chapter\s+\d+[:\s]*)?(.+)/i);
    chapters.push({
      title: titleMatch ? titleMatch[1].trim() : `Chapter ${i}`,
      content: chapterText,
    });
  }
  
  return { outline, chapters };
}

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const lang = body.language || "English";
    const refContext = body.references?.length ? buildReferenceContext(body.references) : "";
    const { outline, chapters } = parseChapters(body.previousContent);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Ask Claude which chapters need updating based on the revision instructions
          controller.enqueue(new TextEncoder().encode(sseEvent({ 
            type: "progress", chapter: 0, totalChapters: chapters.length, 
            title: "Analyzing revision instructions...", status: "analyzing" 
          })));

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

Based on the revision instructions, which chapters need to be rewritten or updated? 
Respond with ONLY a JSON array of chapter numbers that need revision, like [1, 3, 5].
If the instructions are general and apply to the whole book, list all chapters.
If they mention specific chapters, only list those.
Respond with ONLY the JSON array, nothing else.`;

          const analysisResult = await callClaude(analysisPrompt, 200);
          let chaptersToRevise: number[] = [];
          try {
            const parsed = JSON.parse(analysisResult.trim());
            if (Array.isArray(parsed)) {
              chaptersToRevise = parsed.filter((n: unknown) => typeof n === "number" && n >= 1 && n <= chapters.length);
            }
          } catch {
            // If parsing fails, revise all chapters
            chaptersToRevise = chapters.map((_, i) => i + 1);
          }

          if (chaptersToRevise.length === 0) {
            chaptersToRevise = chapters.map((_, i) => i + 1);
          }

          controller.enqueue(new TextEncoder().encode(sseEvent({ 
            type: "analysis", 
            chaptersToRevise, 
            totalChapters: chapters.length,
            message: `Updating ${chaptersToRevise.length} of ${chapters.length} chapters` 
          })));

          // Step 2: Keep outline, revise only the chapters that need it
          const revisedChapters = [...chapters];

          for (let i = 0; i < chapters.length; i++) {
            const chapterNum = i + 1;
            const ch = chapters[i];
            
            if (!chaptersToRevise.includes(chapterNum)) {
              // Skip — keep original
              controller.enqueue(new TextEncoder().encode(sseEvent({ 
                type: "chapter", chapter: chapterNum, totalChapters: chapters.length, 
                title: ch.title, content: ch.content, revised: false 
              })));
              continue;
            }

            // Revise this chapter
            controller.enqueue(new TextEncoder().encode(sseEvent({ 
              type: "progress", chapter: chapterNum, totalChapters: chapters.length, 
              title: ch.title, status: "revising" 
            })));

            const revisePrompt = `You are a professional book editor revising a specific chapter.

Book Title: "${body.title}"
Genre: ${body.genre || "General"}
Tone: ${body.tone || "Professional"}
Language: ${lang} — Write EVERYTHING in ${lang}.

REVISION INSTRUCTIONS FROM THE AUTHOR:
${body.revisionInstructions}
${refContext}

CURRENT CHAPTER ${chapterNum}: "${ch.title}"
${ch.content}

${i > 0 ? `PREVIOUS CHAPTER (for context):\n${chapters[i-1].content.slice(0, 2000)}...` : ""}
${i < chapters.length - 1 ? `NEXT CHAPTER (for context):\n${chapters[i+1].content.slice(0, 2000)}...` : ""}

Rewrite this chapter incorporating the author's revision instructions and any new reference materials. 
IMPORTANT RULES:
- Keep the same chapter title and overall structure unless the instructions say otherwise
- Maintain consistency with the rest of the book
- Improve and update based on the specific instructions — don't just rewrite for the sake of it
- Keep the same tone, style, and voice
- If the instructions don't apply to this chapter much, make minimal changes but still improve quality
- Output ONLY the revised chapter content, starting with the chapter title as a heading

Revised Chapter ${chapterNum}:`;

            const revised = await callClaude(revisePrompt, 8192);
            revisedChapters[i] = { title: ch.title, content: revised };
            
            controller.enqueue(new TextEncoder().encode(sseEvent({ 
              type: "chapter", chapter: chapterNum, totalChapters: chapters.length, 
              title: ch.title, content: revised, revised: true 
            })));
          }

          // Combine
          const separator = "━".repeat(50);
          const fullBook = `${outline}\n\n${separator}\n\n${revisedChapters.map(ch => ch.content).join("\n\n" + separator + "\n\n")}`;
          
          controller.enqueue(new TextEncoder().encode(sseEvent({ 
            type: "complete", fullText: fullBook, 
            revisedCount: chaptersToRevise.length, 
            totalChapters: chapters.length 
          })));
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Revision failed";
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
