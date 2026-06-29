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

const ReferenceItem = z.object({
  type: z.enum(["pdf", "gdoc", "text"]),
  content: z.string(),
  name: z.string(),
});

const Body = z.object({
  mode: z.enum(["comic", "playwright", "thesis", "course"]),
  tier: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  genre: z.string().max(60).optional(),
  tone: z.string().max(60).optional(),
  synopsis: z.string().max(5000).optional(),
  characters: z.string().max(5000).optional(),
  fieldOfStudy: z.string().max(200).optional(),
  thesisStatement: z.string().max(10000).optional(),
  citationStyle: z.string().max(20).optional(),
  methodologyType: z.string().max(200).optional(),
  targetLength: z.string().max(100).optional(),
  topic: z.string().max(500).optional(),
  targetAudience: z.string().max(500).optional(),
  platform: z.string().max(50).optional(),
  references: z.array(ReferenceItem).optional(),
  language: z.string().max(30).optional(),
  humanize: z.boolean().optional(),
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
  return `\n\nREFERENCE MATERIALS:\n${parts.join("\n\n")}`;
}

const CONTENT_TYPE_MAP: Record<string, string> = {
  comic: "comic",
  playwright: "play",
  thesis: "thesis",
  course: "course",
};

function getComicPrompt(body: z.infer<typeof Body>, refContext: string): { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number } {
  const isFullArc = body.tier.includes("full");
  const issueCount = isFullArc ? 5 : 1;
  const context = `Title: "${body.title}"
Genre: ${body.genre || "General"}
Tone: ${body.tone || "Dramatic"}
Synopsis: ${body.synopsis || body.description || "Not specified"}
Characters: ${body.characters || "Not specified"}
Format: ${isFullArc ? "Full Story Arc (5 issues)" : "Single Issue"}${refContext}`;

  return {
    sectionCount: issueCount,
    outline: `You are an expert comic book scriptwriter. Create a detailed outline for a comic book.

${context}

Create a structured outline with:
${isFullArc ? "- 5 issues with titles and brief summaries\n- Overall story arc progression\n- Character arcs across issues" : "- Issue breakdown into 22-24 pages\n- Key story beats per page group"}
- Major plot points and dramatic moments
- Character introductions and development`,

    section: (idx: number, total: number, outline: string, prev: string[]) => {
      const prevSummary = prev.length > 0 ? `\nPrevious issues summary:\n${prev.map((p, i) => `Issue ${i + 1}: ${p.slice(0, 500)}...`).join("\n\n")}` : "";
      return `You are an expert comic book scriptwriter. Write complete, professional comic scripts.

${context}

Outline:
${outline}
${prevSummary}

Write ${isFullArc ? `ISSUE ${idx} of ${total}` : "the complete issue"} as a full comic script.

FORMAT REQUIREMENTS:
- Use PAGE headers: PAGE 1, PAGE 2, etc. (22-24 pages per issue)
- Use PANEL headers: [PANEL 1], [PANEL 2], etc. (4-6 panels per page)
- For each panel include:
  - Scene description: Setting, lighting, camera angle
  - Character actions: What characters are doing physically
  - DIALOGUE in speech bubble format:
    CHARACTER NAME: "Dialogue here."
    CHARACTER NAME (CAPTION): "Internal monologue."
    CHARACTER NAME (WHISPER): "Whispered text."
    SFX: KRAAAK! (sound effects)
  - Any narrative captions in [CAPTION] blocks
- Include character description notes on first appearance (for illustrator reference)
- Note dramatic visual moments, splash pages, and two-page spreads
- Maintain consistent character voice throughout
- End with a compelling hook or resolution

Write the complete comic script now:`;
    },
  };
}

function getPlaywrightPrompt(body: z.infer<typeof Body>, refContext: string): { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number } {
  const isLong = body.tier.includes("long");
  const actCount = isLong ? 5 : 2;
  const context = `Title: "${body.title}"
Genre: ${body.genre || "Drama"}
Tone: ${body.tone || "Natural and lifelike"}
Synopsis: ${body.synopsis || body.description || "Not specified"}
Characters: ${body.characters || "Not specified"}
Format: ${isLong ? "Long Multi-Act Play (5 acts)" : "Standard Play (2 acts)"}${refContext}`;

  return {
    sectionCount: actCount,
    outline: `You are an accomplished playwright. Create a detailed outline for a theatrical play.

${context}

Create a structured outline with:
- ${actCount} acts, each with multiple scenes
- Character list with descriptions and relationships
- Key dramatic moments and turning points per act
- Thematic throughlines
- Setting descriptions`,

    section: (idx: number, total: number, outline: string, prev: string[]) => {
      const prevSummary = prev.length > 0 ? `\nPrevious acts summary:\n${prev.map((p, i) => `Act ${i + 1}: ${p.slice(0, 500)}...`).join("\n\n")}` : "";
      return `You are an accomplished playwright known for natural, lifelike dialogue and compelling drama.

${context}

Outline:
${outline}
${prevSummary}

Write ACT ${idx} of ${total} as a complete theatrical script.

FORMAT REQUIREMENTS:
- Start with: ACT ${idx}
- Scene headers: SCENE 1, SCENE 2, etc.
- Setting descriptions in italics/brackets at scene start: (A dimly lit apartment. Rain against windows.)
- Character names in CAPS before dialogue:
  SARAH: I didn't expect you to come.
  MICHAEL: (crossing to the window) I almost didn't.
- Stage directions in parentheses: (She turns away, her hand trembling slightly.)
- Include blocking, movement, gestures, pauses
- [BEAT] for significant pauses
- [LIGHTS DIM] / [BLACKOUT] for lighting cues
- [SOUND: description] for sound cues

DIALOGUE QUALITY:
- Write like real people talk — interruptions, half-sentences, subtext
- People rarely say exactly what they mean
- Mix humor with tension naturally
- Silence and pauses carry meaning
- Each character should have a distinct voice and speech pattern

Write Act ${idx} now:`;
    },
  };
}

function getThesisPrompt(body: z.infer<typeof Body>, refContext: string): { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number } {
  const isDoctoral = body.tier.includes("doctoral");
  const sections = ["Abstract", "Introduction", "Literature Review", "Methodology", "Results and Discussion", "Conclusion", "References"];
  const citationMap: Record<string, string> = {
    apa: "APA 7th Edition — (Author, Year) in-text, full reference list",
    mla: "MLA 9th Edition — (Author Page) in-text, Works Cited list",
    chicago: "Chicago Manual of Style — footnotes with bibliography",
  };
  const citation = citationMap[body.citationStyle || "apa"] || citationMap.apa;

  const context = `Title: "${body.title}"
Field of Study: ${body.fieldOfStudy || "Not specified"}
Thesis Statement: ${body.thesisStatement || "Not specified"}
Citation Style: ${citation}
Methodology: ${body.methodologyType || "Not specified"}
Level: ${isDoctoral ? "Doctoral / PhD" : "Standard academic"}
Additional Notes: ${body.description || "None"}${refContext}`;

  return {
    sectionCount: sections.length,
    outline: `You are an academic writing expert. Create a detailed thesis outline.

${context}

Create a comprehensive outline with:
- All major sections: ${sections.join(", ")}
- Subsections within each major section
- Key arguments and evidence to cover
- Research methodology framework
- Proposed structure of literature review
${isDoctoral ? "- Doctoral-level depth: theoretical framework, comprehensive lit review, rigorous methodology" : ""}`,

    section: (idx: number, total: number, outline: string, prev: string[]) => {
      const sectionName = sections[idx - 1] || `Section ${idx}`;
      const prevSummary = prev.length > 0 ? `\nPrevious sections summary:\n${prev.map((p, i) => `${sections[i]}: ${p.slice(0, 500)}...`).join("\n\n")}` : "";
      return `You are an academic writing expert producing a ${isDoctoral ? "doctoral-level" : "university-level"} thesis.

${context}

Outline:
${outline}
${prevSummary}

Write the "${sectionName}" section in full.

ACADEMIC WRITING STANDARDS (MANDATORY):
Maintain an academic, formal, and professional style throughout, strictly adhering to scientific research standards and established methodological guidelines. The language must be objective, precise, and clear — avoid value judgments, personal opinions, subjective evaluations, or emotional expressions. Adopt the position of a researcher, analyzing phenomena with impartiality, theoretical grounding, and intellectual rigor.

PARAGRAPH STRUCTURE:
Each paragraph must develop a single central idea in a clear, logical, and coherent manner. Follow this sequence:
1. Topic sentence — explicitly presents the main idea, specific and aligned with the text's objective
2. Conceptual explanation — expands, defines, or contextualizes the topic with theoretical clarity
3. Academic evidence — citations from scholarly authors, empirical data, or references to prior research, integrated smoothly using rhetorical structures that position arguments within the broader academic conversation
4. Critical analysis — interpret the evidence and explain its relevance to the central argument, demonstrating conceptual mastery and reflective thinking (never merely accumulate references without intellectual development)
5. Closing/transitional sentence — reinforce the main idea or link logically to the next paragraph for textual continuity

CITATION AND EVIDENCE:
- Citation style: ${citation}
- Reference REAL, verifiable published studies, academic papers, and books with author names, publication years, and institutions
- Integrate sources using proper academic framing (e.g., "As Booth et al. argue in The Craft of Research..." or "According to Creswell (2018)...")
- Where specific sources cannot be verified, clearly label as [PLACEHOLDER — verify source]
- Every major claim must be supported by a named source or study

GRAMMATICAL AND STYLISTIC REQUIREMENTS:
- Syntactic clarity, proper agreement, and consistent verb tense usage
- Construct precise sentences, eliminate redundancy, employ appropriate technical vocabulary
- Maintain concision without sacrificing analytical depth
- Formal academic voice — no colloquialisms, contractions, or informal expressions
- Every sentence must contribute meaningfully to argument development
- Ideas must flow in a logical, coherent, and progressive manner with proper textual cohesion

SECTION-SPECIFIC REQUIREMENTS:
${sectionName === "Abstract" ? "- 250-350 words summarizing the entire thesis\n- Include: purpose, methods, key findings, conclusions" : ""}
${sectionName === "Introduction" ? "- Establish the research problem, context, and significance\n- Present the thesis statement and research questions\n- Outline the structure of the work" : ""}
${sectionName === "Literature Review" ? "- Organize thematically, not just chronologically\n- Define concepts, compare theoretical perspectives, synthesize existing literature\n- Identify gaps in existing research and show how this work fills those gaps\n- Demonstrate comprehensive engagement with the scholarly conversation" : ""}
${sectionName === "Methodology" ? "- Describe procedures, justify methodological choices, explain criteria for data/participant selection\n- Detail research design, data collection, and analysis methods\n- Address limitations and ethical considerations" : ""}
${sectionName === "Results and Discussion" ? "- Present findings objectively and systematically in Results\n- In Discussion, analyze theoretical implications and relate to previous research\n- Discuss implications, limitations, and future research directions" : ""}
${sectionName === "Conclusion" ? "- Synthesize key findings without introducing new information\n- Restate how findings address the research questions\n- Discuss broader implications and recommendations for future research" : ""}
${sectionName === "References" ? "- Compile all citations used across the thesis\n- Format strictly according to " + (body.citationStyle || "APA") + " style\n- Mark any unverifiable sources as [PLACEHOLDER]" : ""}

The thesis must reflect organization, scientific rigor, conceptual precision, and a well-articulated connection between theory, methodology, and results.

IMPORTANT: This is a DRAFT for academic assistance. The user is responsible for verifying all citations and sources.

Write the complete "${sectionName}" section now:`;
    },
  };
}

function getCoursePrompt(body: z.infer<typeof Body>, refContext: string): { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number } {
  const tierMap: Record<string, number> = {
    course_mini: 6,
    course_full: 15,
    course_premium: 18,
  };
  const lessonCount = tierMap[body.tier] || 6;
  const isPremium = body.tier === "course_premium";

  const context = `Title: "${body.title}"
Topic: ${body.topic || body.title}
Target Audience: ${body.targetAudience || "General"}
Tone: ${body.tone || "Conversational and engaging"}
Platform: ${body.platform || "General"}
Lesson Count: ${lessonCount}
${isPremium ? "Includes: Workbook outline" : ""}
Additional Notes: ${body.description || "None"}${refContext}`;

  return {
    sectionCount: lessonCount + (isPremium ? 1 : 0),
    outline: `You are an expert course designer and content strategist. Create a comprehensive course outline.

${context}

Create a detailed course outline with:
- ${lessonCount} lessons with titles and learning objectives
- Logical progression from foundational to advanced concepts
- Engagement strategy per lesson
- Key takeaways and action items
${isPremium ? "- Workbook structure overview (exercises, worksheets, reflection prompts)" : ""}`,

    section: (idx: number, total: number, outline: string, prev: string[]) => {
      const isWorkbook = isPremium && idx === total;
      const prevSummary = prev.length > 0 ? `\nPrevious lessons summary:\n${prev.slice(-3).map((p, i) => `Lesson ${idx - 3 + i}: ${p.slice(0, 300)}...`).join("\n\n")}` : "";

      if (isWorkbook) {
        return `You are an expert course designer. Create a comprehensive workbook outline.

${context}

Course outline:
${outline}

Create a WORKBOOK OUTLINE that accompanies this course:
- One worksheet/exercise per lesson
- Reflection questions
- Fill-in-the-blank exercises
- Action planning templates
- Self-assessment checklists
- Space for notes and journaling prompts

Format clearly with lesson numbers and exercise types.`;
      }

      return `You are an expert course designer creating content for ${body.platform || "online"} delivery.

${context}

Course outline:
${outline}
${prevSummary}

Write LESSON ${idx} of ${lessonCount} as a complete lesson script.

FORMAT REQUIREMENTS:
- LESSON ${idx}: [Title]
- LEARNING OBJECTIVES: (3-5 bullet points)
- INTRODUCTION: (Hook and context — 2-3 paragraphs)
- MAIN CONTENT: (Organized into 3-5 sections with clear headings)
  - Each section includes:
    - Key concept explanation
    - Examples or stories
    - TALKING POINT: (Brief bullet for video delivery)
- ENGAGEMENT PROMPT: (Question or activity for audience interaction)
- KEY TAKEAWAYS: (3-5 bullet points summarizing the lesson)
- CALL TO ACTION: (What the viewer should do next)
- TRANSITION: (Bridge to the next lesson)

TONE:
- Conversational and ${body.tone || "engaging"} — write as if talking directly to the viewer
- Use "you" language throughout
- Include relatable examples and analogies
- Natural speech patterns suitable for video delivery
${body.platform === "youtube" ? "- Include suggested video title and description\n- Note good points for B-roll or visual aids" : ""}
${body.platform === "udemy" ? "- Include quiz questions at the end\n- Note where to add downloadable resources" : ""}

Write the complete Lesson ${idx} script now:`;
    },
  };
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

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  try {
    // --- RATE LIMIT ---
    const rl = await rateLimitByUser("special-generate", 10, 60 * 60 * 1000);
    if (rl.blocked) return rl.blocked;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Please sign in." }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const userId = (session.user as any).id as string;

    const body = Body.parse(await req.json());

    // Free Starter gate for special content
    const specialUser = await prisma.user.findUnique({ where: { id: userId } });
    if (specialUser && !isAdmin(specialUser.email)) {
      const isActive = specialUser.subscriptionStatus === "active";
      const hasPlan = !!specialUser.subscriptionPlan;
      const isFreeUser = !isActive && !hasPlan;

      if (isFreeUser) {
        // Block doctoral thesis entirely for free users
        if (body.mode === "thesis" && body.tier?.includes("doctoral")) {
          return new Response(JSON.stringify({
            error: "Doctoral-Level Thesis requires a paid plan or premium package purchase. Upgrade to access this feature.",
            needsSubscription: true,
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        // Free users: use their free book allocation (already tracked by freeBookUsed)
        if ((specialUser as any).freeBookUsed) {
          return new Response(JSON.stringify({
            error: "You've reached your Free Starter limit. Upgrade to unlock full book generation, full translations, and unlimited creative output.",
            needsSubscription: true,
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        await prisma.user.update({ where: { id: userId }, data: { freeBookUsed: true } });
      }
    }

    const refContext = body.references?.length ? buildReferenceContext(body.references) : "";
    const langNote = body.language && body.language !== "English" ? `\n\nIMPORTANT: Write ALL content in ${body.language}. Every word of the output must be in ${body.language}.` : "";

    let promptConfig: { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number };

    switch (body.mode) {
      case "comic":
        promptConfig = getComicPrompt(body, refContext);
        break;
      case "playwright":
        promptConfig = getPlaywrightPrompt(body, refContext);
        break;
      case "thesis":
        promptConfig = getThesisPrompt(body, refContext);
        break;
      case "course":
        promptConfig = getCoursePrompt(body, refContext);
        break;
    }

    // Inject language instruction into prompts
    if (langNote) {
      const origOutline = promptConfig.outline;
      promptConfig.outline = origOutline + langNote;
      const origSection = promptConfig.section;
      promptConfig.section = (idx, total, outline, prev) => origSection(idx, total, outline, prev) + langNote;
    }

    const contentType = CONTENT_TYPE_MAP[body.mode];

    // Create record
    const record = await prisma.book.create({
      data: {
        title: body.title,
        description: body.description || "",
        genre: body.genre,
        tone: body.tone,
        contentType,
        userId,
        humanize: true,
        status: "generating",
        progress: JSON.stringify({ percent: 0, currentChapter: 0, totalChapters: promptConfig.sectionCount, status: "outline" }),
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "bookId", bookId: record.id })));
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", title: "Generating outline...", status: "outline" })));

          const outlineResp = await callClaude(promptConfig.outline, 3000);
          const outline = outlineResp.text;
          trackApiCost({ userId, type: "special", inputTokens: outlineResp.inputTokens, outputTokens: outlineResp.outputTokens, bookId: record.id }).catch(() => {});
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "outline", content: outline, totalSections: promptConfig.sectionCount })));

          await prisma.book.update({ where: { id: record.id }, data: { progress: JSON.stringify({ percent: 5, currentChapter: 0, totalChapters: promptConfig.sectionCount, status: "writing" }) } }).catch(() => {});

          const sections: string[] = [];
          for (let i = 1; i <= promptConfig.sectionCount; i++) {
            const percent = Math.round(((i - 1) / promptConfig.sectionCount) * 95) + 5;
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", chapter: i, totalChapters: promptConfig.sectionCount, title: `Writing section ${i} of ${promptConfig.sectionCount}...`, status: "writing" })));
            await prisma.book.update({ where: { id: record.id }, data: { progress: JSON.stringify({ percent, currentChapter: i, totalChapters: promptConfig.sectionCount, status: "writing" }) } }).catch(() => {});

            const sectionPrompt = promptConfig.section(i, promptConfig.sectionCount, outline, sections);
            const sectionResp = await callClaude(sectionPrompt, 8192);
            let section = sectionResp.text;
            trackApiCost({ userId, type: "special", inputTokens: sectionResp.inputTokens, outputTokens: sectionResp.outputTokens, bookId: record.id }).catch(() => {});
            
            // Always run humanizer pass for natural voice
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", chapter: i, totalChapters: promptConfig.sectionCount, title: `Humanizing section ${i}...`, status: "humanizing" })));
            await prisma.book.update({ where: { id: record.id }, data: { progress: JSON.stringify({ percent, currentChapter: i, totalChapters: promptConfig.sectionCount, status: "humanizing" }) } }).catch(() => {});
            section = await humanizeChapter(section, { userId, bookId: record.id });
            
            sections.push(section);
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "section", chapter: i, totalChapters: promptConfig.sectionCount, content: section })));
          }

          const fullContent = `${outline}\n\n${"━".repeat(50)}\n\n${sections.join("\n\n" + "━".repeat(50) + "\n\n")}`;
          const wordCount = fullContent.split(/\s+/).filter(Boolean).length;

          await prisma.bookVersion.create({
            data: {
              bookId: record.id,
              version: 1,
              content: fullContent,
              wordCount,
              notes: "Initial generation",
            },
          });

          if (body.references?.length) {
            await prisma.bookReference.createMany({
              data: body.references.map((r) => ({ name: r.name, type: r.type, content: r.content, bookId: record.id })),
            });
          }

          await prisma.book.update({ where: { id: record.id }, data: { status: "complete", progress: null } });
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "complete", bookId: record.id })));
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
          await prisma.book.update({ where: { id: record.id }, data: { status: "failed", progress: JSON.stringify({ error: message }) } }).catch(() => {});
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
    return new Response(JSON.stringify({ error: message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
