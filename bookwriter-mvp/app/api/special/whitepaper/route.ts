import { z } from "zod";
import { anthropic } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/config";
import { acquireGenerationSlot, releaseGenerationSlot } from "@/lib/rate-limit";
import { humanizeChapter } from "@/lib/humanizer";
import { trackApiCost, getTokensFromResponse } from "@/lib/cost-tracker";
import { sendGenerationCompleteEmail, sendGenerationFailedEmail } from "@/lib/email";
import { getCreditCost, hasUnlimitedAccess, totalCredits, deductCredits, refundCredits, insufficientCreditsMessage, CreditDeduction } from "@/lib/credits";
import { getStyleExamples } from "@/lib/embeddings";

export const maxDuration = 900;
export const dynamic = "force-dynamic";

const ReferenceItem = z.object({
  type: z.enum(["pdf", "gdoc", "text"]),
  content: z.string(),
  name: z.string(),
});

const Body = z.object({
  title: z.string().min(1).max(200),
  documentType: z.enum(["White Paper", "Industry Report", "Research Report", "Annual Report", "Case Study Report", "Executive Brief"]),
  topic: z.string().min(1).max(500),
  targetAudience: z.string().min(1).max(500),
  centralThesis: z.string().min(1).max(3000),
  supportingPoints: z.string().max(3000).optional(),
  tone: z.enum(["Authoritative", "Academic", "Consultative", "Data-driven"]).default("Authoritative"),
  length: z.enum(["short", "standard", "comprehensive"]).default("standard"),
  organization: z.string().min(1).max(200),
  citationStyle: z.enum(["apa", "chicago", "none"]).default("none"),
  language: z.string().max(30).optional(),
  references: z.array(ReferenceItem).optional(),
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

const LENGTH_CONFIG: Record<string, { label: string; wordsPerSection: number; minBodySections: number; maxBodySections: number }> = {
  short: { label: "Short (6-8 pages)", wordsPerSection: 500, minBodySections: 3, maxBodySections: 3 },
  standard: { label: "Standard (10-15 pages)", wordsPerSection: 700, minBodySections: 4, maxBodySections: 5 },
  comprehensive: { label: "Comprehensive (16-25 pages)", wordsPerSection: 900, minBodySections: 5, maxBodySections: 7 },
};

const CITATION_LABELS: Record<string, string> = {
  apa: "APA 7th Edition — (Author, Year) in-text, full reference list",
  chicago: "Chicago Manual of Style — footnotes with bibliography",
  none: "No formal citation style required — reference sources by name in prose",
};

function whitepaperSystemPrompt(body: z.infer<typeof Body>): string {
  return `You are a senior professional writer producing a ${body.documentType} for ${body.organization} on the topic of ${body.topic}. Your reader is ${body.targetAudience}.

This document must establish ${body.organization} as the authoritative voice on this subject.

VOICE AND TONE:
Write with the authority of a subject matter expert — confident, precise, and evidence-based. No hedging. No filler. Every sentence must earn its place. This is not a blog post. It is a professional document that will be read by decision-makers who have limited time and high standards.

STRUCTURE STANDARDS:
- Executive Summary: 150-200 words. What is the problem, why it matters, and what this document recommends. A busy executive should understand the entire document from this summary alone.
- Each section opens with the key finding or argument — not background context
- Use specific data, named examples, and concrete figures wherever possible
- Avoid generic statements ("many organizations struggle with...") — name the specific challenge with precision
- Recommendations must be actionable: who does what, by when, to what end

DOCUMENT FEEL:
Read like McKinsey, not Wikipedia. Authoritative, structured, specific. Short paragraphs. Active voice. No passive constructions as default. Vary sentence length — mix short declarative statements with longer analytical ones. Section headers should be informative, not decorative ("Healthcare Providers Lose $8.3B Annually to Billing Errors" not "The Problem").

AVOID:
- "It is important to note that..."
- "In conclusion..."
- "As we have seen..."
- Vague recommendations ("organizations should consider improving their approach")
- Padding to hit length — every paragraph must add new information`;
}

function parseSupportingPoints(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);
}

function getWhitepaperPrompt(body: z.infer<typeof Body>, refContext: string, styleReference: string): { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number } {
  const lengthConfig = LENGTH_CONFIG[body.length];
  const citation = CITATION_LABELS[body.citationStyle];
  const points = parseSupportingPoints(body.supportingPoints);
  const bodySectionCount = points.length > 0
    ? Math.max(lengthConfig.minBodySections, Math.min(lengthConfig.maxBodySections, points.length))
    : lengthConfig.minBodySections;
  const totalSections = bodySectionCount + 1; // + final Conclusion/Recommendations/References section
  const systemPrompt = whitepaperSystemPrompt(body);

  const context = `Document Title: "${body.title}"
Document Type: ${body.documentType}
Organization/Author: ${body.organization}
Topic: ${body.topic}
Target Audience: ${body.targetAudience}
Central Thesis: ${body.centralThesis}
${points.length > 0 ? `Supporting Points to Cover:\n${points.map((p, i) => `${i + 1}. ${p}`).join("\n")}` : ""}
Tone: ${body.tone}
Length: ${lengthConfig.label}
Citation Style: ${citation}${refContext}`;

  return {
    sectionCount: totalSections,

    outline: `${systemPrompt}

${context}

STAGE 1 — EXECUTIVE SUMMARY AND DOCUMENT OUTLINE

Produce two things:

## Executive Summary
Write the full 150-200 word Executive Summary now, following the Structure Standards above exactly. This is finished, publishable text — not a placeholder.

## Document Outline
A structured outline of the ${bodySectionCount} body sections this document will contain, each with an informative (not decorative) working header and a one-sentence statement of the key finding or argument that section will lead with. Then note that the document closes with a final Conclusion, Recommendations, and References section.

${points.length > 0 ? `Organize the body sections around the supporting points listed above (combine or split them across exactly ${bodySectionCount} sections as makes sense).` : `Organize the body sections around the central thesis and topic — you are defining the section breakdown since no supporting points were provided.`}`,

    section: (idx: number, total: number, outline: string, prev: string[]) => {
      const isFinal = idx === total;
      const prevSummary = prev.length > 0
        ? `\nPrevious sections written so far (for continuity — do not repeat their content, build on it):\n${prev.map((p, i) => `Section ${i + 1}: ${p.slice(0, 400)}...`).join("\n\n")}`
        : "";

      if (isFinal) {
        return `${systemPrompt}

${context}

Executive Summary and Outline:
${outline}
${prevSummary}

STAGE 3 — CONCLUSION, RECOMMENDATIONS, AND REFERENCES

Write the closing section of this document with these parts:

## Conclusion
Synthesize the document's argument — do not introduce new information, restate how the body sections support the central thesis.

## Recommendations
Specific, actionable recommendations. Each one names who does what, by when, to what end — not vague guidance.

## References
${body.citationStyle === "none"
  ? "List the sources referenced throughout the document by name in a simple reference list."
  : `Compile all sources cited across the document, formatted strictly according to ${citation}.`}
${body.citationStyle !== "none" ? "Mark any source you cannot verify as [PLACEHOLDER — verify source] rather than fabricating a citation." : ""}
${styleReference ? `\n${styleReference}\n` : ""}
Write this closing section now:`;
      }

      return `${systemPrompt}

${context}

Executive Summary and Outline:
${outline}
${prevSummary}

STAGE 2 — BODY CONTENT, SECTION ${idx} OF ${bodySectionCount}

Write body section ${idx} of ${bodySectionCount} in full, at approximately ${lengthConfig.wordsPerSection} words. Open with an informative header stating the key finding or argument (not a decorative label), then lead with that finding before any supporting context. Use specific data, named examples, and concrete figures wherever the topic allows.
${styleReference ? `\n${styleReference}\n` : ""}
Write the complete section now:`;
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
  let slotUserId: string | null = null;
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

    const slot = await acquireGenerationSlot(userId, user.email);
    if (!slot.allowed) return slot.error!;
    slotUserId = userId;

    const body = Body.parse(await req.json());

    let creditDeduction: CreditDeduction | null = null;

    // Payment gate — admins and whitelisted emails bypass all payment
    if (!isAdmin(user.email) && !hasUnlimitedAccess(user.email)) {
      const isActive = user.subscriptionStatus === "active";
      const hasPlan = !!user.subscriptionPlan;
      const isFreeUser = !isActive && !hasPlan;

      if (isFreeUser) {
        if ((user as any).freeBookUsed) {
          await releaseGenerationSlot(userId);
          return new Response(JSON.stringify({
            error: "You've reached your Free Starter limit. Upgrade to unlock white papers, reports, and full book generation.",
            needsSubscription: true,
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        await prisma.user.update({ where: { id: userId }, data: { freeBookUsed: true } });
      } else {
        // Credit-based check for starter/author/studio (studio's high monthly
        // allotment is enforced through this same path — see lib/credits.ts)
        const creditCost = getCreditCost(`whitepaper_${body.length}`);
        const balance = {
          purchasedCredits: (user as any).purchasedCredits ?? 0,
          monthlyCredits: (user as any).monthlyCredits ?? 0,
          creditsRollover: (user as any).creditsRollover ?? 0,
        };
        const have = totalCredits(balance);

        if (have < creditCost) {
          await releaseGenerationSlot(userId);
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

    const refContext = body.references?.length ? buildReferenceContext(body.references) : "";
    const langNote = body.language && body.language !== "English" ? `\n\nIMPORTANT: Write ALL content in ${body.language}. Every word of the output must be in ${body.language}.` : "";

    // No dedicated whitepaper corpus has been ingested yet — fall back to
    // 'book' voice examples until one is.
    const ragTopic = `${body.title} ${body.topic} ${body.centralThesis}`.trim().slice(0, 500);
    const styleReference = (await getStyleExamples(ragTopic, "whitepaper")) || (await getStyleExamples(ragTopic, "book"));

    const promptConfig = getWhitepaperPrompt(body, refContext, styleReference);
    if (langNote) {
      const origOutline = promptConfig.outline;
      promptConfig.outline = origOutline + langNote;
      const origSection = promptConfig.section;
      promptConfig.section = (idx, total, outline, prev) => origSection(idx, total, outline, prev) + langNote;
    }

    const record = await prisma.book.create({
      data: {
        title: body.title,
        description: body.centralThesis,
        genre: body.documentType,
        tone: body.tone,
        contentType: "whitepaper",
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
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", title: "Generating executive summary and outline...", status: "outline" })));

          const outlineResp = await callClaude(promptConfig.outline, 3000);
          const outline = outlineResp.text;
          trackApiCost({ userId, type: "special", inputTokens: outlineResp.inputTokens, outputTokens: outlineResp.outputTokens, bookId: record.id }).catch(() => {});
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "outline", content: outline, totalSections: promptConfig.sectionCount })));

          await prisma.book.update({ where: { id: record.id }, data: { progress: JSON.stringify({ percent: 5, currentChapter: 0, totalChapters: promptConfig.sectionCount, status: "writing" }) } }).catch(() => {});

          const sections: string[] = [];
          for (let i = 1; i <= promptConfig.sectionCount; i++) {
            const isFinal = i === promptConfig.sectionCount;
            const percent = Math.round(((i - 1) / promptConfig.sectionCount) * 95) + 5;
            controller.enqueue(new TextEncoder().encode(sseEvent({
              type: "progress",
              chapter: i,
              totalChapters: promptConfig.sectionCount,
              title: isFinal ? "Writing conclusion, recommendations & references..." : `Writing section ${i} of ${promptConfig.sectionCount - 1}...`,
              status: "writing",
            })));
            await prisma.book.update({ where: { id: record.id }, data: { progress: JSON.stringify({ percent, currentChapter: i, totalChapters: promptConfig.sectionCount, status: "writing" }) } }).catch(() => {});

            const sectionPrompt = promptConfig.section(i, promptConfig.sectionCount, outline, sections);
            const sectionResp = await callClaude(sectionPrompt, 8192);
            let section = sectionResp.text;
            trackApiCost({ userId, type: "special", inputTokens: sectionResp.inputTokens, outputTokens: sectionResp.outputTokens, bookId: record.id }).catch(() => {});

            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", chapter: i, totalChapters: promptConfig.sectionCount, title: `Refining section ${i}...`, status: "humanizing" })));
            await prisma.book.update({ where: { id: record.id }, data: { progress: JSON.stringify({ percent, currentChapter: i, totalChapters: promptConfig.sectionCount, status: "humanizing" }) } }).catch(() => {});
            section = await humanizeChapter(section, { userId, bookId: record.id });

            sections.push(section);
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "section", chapter: i, totalChapters: promptConfig.sectionCount, content: section })));
          }

          const fullContent = `${outline}\n\n${"━".repeat(50)}\n\n${sections.join("\n\n" + "━".repeat(50) + "\n\n")}`;
          const wordCount = fullContent.split(/\s+/).filter(Boolean).length;

          await prisma.bookVersion.create({
            data: { bookId: record.id, version: 1, content: fullContent, wordCount, notes: "Initial generation" },
          });

          if (body.references?.length) {
            await prisma.bookReference.createMany({
              data: body.references.map((r) => ({ name: r.name, type: r.type, content: r.content, bookId: record.id })),
            });
          }

          await prisma.book.update({ where: { id: record.id }, data: { status: "complete", progress: null } });
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "complete", bookId: record.id })));
          controller.close();
          await releaseGenerationSlot(userId);
          sendGenerationCompleteEmail({ to: user.email, title: record.title, wordCount, bookId: record.id })
            .catch((emailErr) => console.error('[whitepaper] success email failed:', emailErr));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
          await prisma.book.update({ where: { id: record.id }, data: { status: "failed", progress: JSON.stringify({ error: message }) } }).catch(() => {});
          controller.close();
          await releaseGenerationSlot(userId);
          const creditsRefunded = creditDeduction ? creditDeduction.fromPurchased + creditDeduction.fromMonthly + creditDeduction.fromRollover : 0;
          await refundCredits(userId, creditDeduction).catch((refundErr) => console.error('[whitepaper] credit refund failed:', refundErr));
          sendGenerationFailedEmail({ to: user.email, title: record.title, reason: message, creditsRefunded })
            .catch((emailErr) => console.error('[whitepaper] failure email failed:', emailErr));
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (error) {
    if (slotUserId) await releaseGenerationSlot(slotUserId);
    const message = error instanceof Error ? error.message : "Failed";
    return new Response(JSON.stringify({ error: message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
