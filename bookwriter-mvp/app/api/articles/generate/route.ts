import { z } from "zod";
import { anthropic } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin, ARTICLE_LIMITS, ARTICLE_EXTRA_PRICE } from "@/lib/config";
import { rateLimitByUser } from "@/lib/rate-limit";
import { humanizeChapter } from "@/lib/humanizer";
import { trackApiCost, getTokensFromResponse } from "@/lib/cost-tracker";

export const maxDuration = 180;
export const dynamic = "force-dynamic";



const Body = z.object({
  articleType: z.string().min(1).max(30),
  topic: z.string().min(1).max(2000),
  tone: z.string().min(1).max(30),
  targetAudience: z.string().max(500).optional(),
  keyPoints: z.string().max(5000).optional(),
  direction: z.string().max(3000).optional(),
  referenceUrl: z.string().url().max(2000).optional().or(z.literal("")),
  wordCount: z.enum(["short", "standard", "longform", "deepdive"]),
  seoHeadlines: z.boolean().optional(),
  seoMeta: z.boolean().optional(),
  seoTags: z.boolean().optional(),
  language: z.string().max(30).optional(),
  referenceText: z.string().max(60000).optional(),
  writingSample: z.string().max(10000).optional(),
});

const WORD_TARGETS: Record<string, number> = {
  short: 650,
  standard: 1250,
  longform: 2500,
  deepdive: 4500,
};

const MAX_TOKENS: Record<string, number> = {
  short: 2048,
  standard: 4096,
  longform: 6144,
  deepdive: 10000,
};

const TYPE_LABELS: Record<string, string> = {
  news: "News Article",
  opinion: "Opinion / Editorial",
  howto: "How-To Guide",
  listicle: "Listicle",
  profile: "Profile / Interview",
  research: "Research & Analysis",
  essay: "Personal Essay",
  review: "Product Review",
  casestudy: "Case Study",
  thought: "Thought Leadership",
};

const TONE_LABELS: Record<string, string> = {
  journalistic: "Journalistic (objective, factual, AP-style)",
  conversational: "Conversational (Medium/blog style, personal voice)",
  academic: "Academic (formal, research-backed)",
  provocative: "Provocative (bold takes, engaging hooks)",
  storytelling: "Storytelling (narrative-driven, immersive)",
  professional: "Professional (business/corporate tone)",
};

const TYPE_PROMPTS: Record<string, string> = {
  news: `Inverted pyramid: most newsworthy info first. Summary lead: who, what, when, where, why in 25-35 words. Nut graf by paragraph 3-4 explaining why this matters. Short paragraphs (1-3 sentences). Active voice always. Use "said" for attribution (never "stated," "remarked," "shared"). Titles before names. Spell out numbers under 10. Every claim needs a source — attribute everything. No editorializing — show, don't tell. End with a forward-looking statement or next steps.`,
  opinion: `Open with a concession — acknowledge the strongest opposing argument first to build credibility. Then establish your standing (why you have authority on this). Use future tense for proposals ("we should" not "we need to"). Structure: ethos (credibility) → logos (evidence and data) → pathos (emotional close). Name the opponent's best argument and dismantle it specifically. End with a clear call to action — tell the reader what to DO.`,
  howto: `Start with the outcome: what the reader will be able to do after following this guide. List prerequisites upfront. Use numbered steps with **bold action verbs** starting each step. For each step, include WHY (not just what). Anticipate where readers get stuck and address it inline. End with a troubleshooting / common mistakes section.`,
  listicle: `Each item must be independently valuable — cut any filler. Consistent format per item: **bold heading**, 2-3 sentence explanation, specific example. Put strongest items first and last (primacy + recency effect). Intro must set up WHY this list matters, not just what's in it. Never pad to hit a round number.`,
  profile: `Open with the subject in action — a specific scene, not their resume. Weave background into the narrative (never dump biography in a block). Use direct quotes for emotion and opinion; paraphrase for facts. Include physical details of the setting. Show character through actions and choices, not adjectives. End with a scene, not a summary.`,
  research: `Lead with the finding, not the methodology. Make data concrete: "jumped 47% in 6 months" not "significant increase." Explain implications for the reader specifically. Cite sources with enough detail to verify. Include counterevidence or limitations. Use comparison and analogy to make abstract data tangible.`,
  essay: `Open with a specific scene or moment — not a thesis statement. Use status details (specific objects, gestures, environments that reveal character). Build a narrative arc: situation → complication → resolution → reflection. Be vulnerable without self-pity. Let a universal theme emerge from specific experience. End with resonance, not summary.`,
  review: `State your use case upfront — context matters for relevance. Present pros and cons in honest balance (credibility comes from acknowledging weaknesses). Compare to 2-3 specific alternatives. Include real usage scenarios, not feature lists. Provide price-to-value analysis. Clear verdict with conditional recommendations: "best for X, skip if Y."`,
  casestudy: `Use Problem → Solution → Results framework (always that order). Quantify everything: "reduced costs by $2.4M" not "improved efficiency." Include direct quotes from stakeholders. Address the skeptic: what could have gone wrong. Make the protagonist a relatable person, not the company. End with transferable lessons.`,
  thought: `Open with a counterintuitive claim or prediction. Back every opinion with specific evidence or experience. Reference industry data or trends. Anticipate the reader's objection by paragraph 3-4 and address it. Include a framework or model (people remember structures). End with actionable implications, not platitudes.`,
};

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
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

async function fetchReference(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PlotGhost/1.0)" },
    });
    clearTimeout(timeout);
    if (!res.ok) return "";
    const text = await res.text();
    // Strip HTML tags, take first 3000 chars
    const cleaned = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return cleaned.slice(0, 3000);
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const rl = await rateLimitByUser("article-generate", 10, 60 * 60 * 1000);
    if (rl.blocked) return rl.blocked;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Please sign in to generate articles." }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const userId = (session.user as any).id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const body = Body.parse(await req.json());
    const wordTarget = WORD_TARGETS[body.wordCount];
    const maxTokens = MAX_TOKENS[body.wordCount];
    const typeLabel = TYPE_LABELS[body.articleType] || body.articleType;
    const toneLabel = TONE_LABELS[body.tone] || body.tone;
    const lang = body.language || "English";

    // Payment gate
    if (!isAdmin(user.email)) {
      const hasActiveSub = user.subscriptionStatus === "active" && user.subscriptionPlan;
      const isFreeUser = !hasActiveSub;

      if (isFreeUser) {
        // Free Starter: 2 articles per month (resets monthly), short only
        if (body.wordCount !== "short") {
          return new Response(JSON.stringify({
            error: "Free Starter only includes short articles. Upgrade to unlock longer formats.",
            needsSubscription: true,
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        if (user.monthlyResetDate && new Date() > user.monthlyResetDate) {
          await prisma.user.update({ where: { id: userId }, data: { monthlyArticlesUsed: 0, monthlyBooksUsed: 0, monthlyNewslettersUsed: 0, monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
          (user as any).monthlyArticlesUsed = 0;
        }
        if (!user.monthlyResetDate) {
          await prisma.user.update({ where: { id: userId }, data: { monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
        }
        const used = (user as any).monthlyArticlesUsed || 0;
        if (used >= 2) {
          return new Response(JSON.stringify({
            error: "You've reached your Free Starter article limit for this month. Upgrade to unlock more articles and unlimited creative output.",
            needsSubscription: true,
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        await prisma.user.update({ where: { id: userId }, data: { monthlyArticlesUsed: { increment: 1 } } });
      } else {

      const plan = user.subscriptionPlan as string;
      const monthlyLimit = ARTICLE_LIMITS[plan] ?? 0;

      // Reset if needed
      if (user.monthlyResetDate && new Date() > user.monthlyResetDate) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            monthlyArticlesUsed: 0,
            monthlyBooksUsed: 0,
            monthlyNewslettersUsed: 0,
            monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        (user as any).monthlyArticlesUsed = 0;
      }

      const used = (user as any).monthlyArticlesUsed || 0;
      if (used >= monthlyLimit) {
        const extraPrice = ARTICLE_EXTRA_PRICE[plan] ?? 7;
        const credit = await prisma.bookCredit.findFirst({
          where: { userId, bookSize: "article_extra", used: false },
        });
        if (!credit) {
          return new Response(JSON.stringify({
            error: `You've used all ${monthlyLimit} articles this month. Additional articles cost $${extraPrice} each.`,
            needsCredit: true,
            creditSize: "article_extra",
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
      } else {
        await prisma.user.update({ where: { id: userId }, data: { monthlyArticlesUsed: { increment: 1 } } });
      }
      } // end paid plan article block
    }

    const typePrompt = TYPE_PROMPTS[body.articleType] || "";
    const keyPointsText = body.keyPoints ? `\n\nKEY POINTS TO COVER:\n${body.keyPoints}` : "";
    const audienceText = body.targetAudience ? `\nTARGET AUDIENCE: ${body.targetAudience}` : "";
    const directionText = body.direction ? `\n\nAUTHOR'S DIRECTION — FOLLOW THIS CLOSELY:\n${body.direction}` : "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", percent: 5, status: "Preparing article..." })));

          // Collect all reference materials
          const refParts: string[] = [];

          // Fetch reference URL if provided
          if (body.referenceUrl) {
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", percent: 8, status: "Fetching reference URL..." })));
            const urlText = await fetchReference(body.referenceUrl);
            if (urlText) refParts.push(`[Reference URL]\n${urlText}`);
          }

          // Add pre-extracted reference text (PDFs extracted client-side via /api/upload)
          if (body.referenceText?.trim()) {
            refParts.push(body.referenceText.trim().slice(0, 50000));
            console.log(`[articles] Reference text provided: ${body.referenceText.trim().length} chars`);
          }

          const hasReferences = refParts.length > 0;
          console.log(`[articles] Total reference parts: ${refParts.length}, total chars: ${refParts.reduce((s, p) => s + p.length, 0)}`);
          const referenceSection = hasReferences
            ? `\n\nREFERENCE MATERIALS — THIS IS YOUR PRIMARY SOURCE. The article must be based on the information below. Extract facts, quotes, data, names, and events from these materials. Do NOT invent information that isn't here. If something isn't in the references, don't include it.\n${refParts.join("\n\n")}`
            : "";

          // Voice matching section
          const voiceSection = body.writingSample?.trim()
            ? `\n\nVOICE MATCHING:
The following is a sample of the author's writing. Analyze their voice — sentence patterns, vocabulary, rhythm, level of formality, quirks, how they transition between ideas — and write the article in that same voice. Do NOT mention or reference the writing sample. Just absorb the style and write naturally in it.

AUTHOR'S WRITING SAMPLE:
${body.writingSample.trim().slice(0, 8000)}`
            : "";

          // Build SEO instructions if any SEO option is enabled
          const wantAnySeo = body.seoHeadlines || body.seoMeta || body.seoTags;
          const seoInstructions = wantAnySeo ? `
SEO RULES:
- Use the topic naturally as primary keyword in: title, first paragraph, one H2, and conclusion
- Include semantic/related keywords naturally throughout
- Front-load important keywords in headings
- Use question-format subheadings where natural (matches search intent)
- Include specific data points (Google rewards specificity)` : "";

          // Determine POV based on article type
          const firstPersonTypes = ["opinion", "essay", "review"];
          const povInstruction = firstPersonTypes.includes(body.articleType)
            ? "POINT OF VIEW: First person is appropriate for this article type."
            : "POINT OF VIEW: Write in THIRD PERSON. Do NOT use 'I', 'me', 'my', 'we', or 'our'. This is not an opinion piece — report and present, don't editorialize from a personal perspective.";

          // Current date for temporal accuracy
          const now = new Date();
          const currentDate = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
          const currentYear = now.getFullYear();

          const prompt = `You are an expert writer and journalist. Write a complete, publication-ready ${typeLabel.toLowerCase()}.

TODAY'S DATE: ${currentDate}. The current year is ${currentYear}. All temporal references must reflect this.

ARTICLE TYPE: ${typeLabel}
TONE: ${toneLabel}${audienceText}
${povInstruction}
LANGUAGE: ${lang} — Write EVERYTHING in ${lang}.
TARGET LENGTH: ~${wordTarget} words

TOPIC/SUBJECT:
${body.topic}
${keyPointsText}${directionText}${referenceSection}${voiceSection}

TYPE-SPECIFIC INSTRUCTIONS:
${typePrompt}

CRAFT RULES (based on Wired for Story by Cron, Write It Up by Silvia, Newsletter Ninja by Labrecque):

STORY & ENGAGEMENT:
- From the very first sentence, the reader must want to know what happens next (Cron). Something must be at stake — a question raised, a tension introduced, a surprise landed. Not a preamble. Not background. The ball must be in play immediately.
- Everything must pass the "So what?" test. Every paragraph earns its place or gets cut. The reader's brain is filtering for relevance — give it clear reasons to keep reading.
- Emotion determines meaning (Cron). Abstract arguments don't stick. Ground every point in specific, concrete details that make the reader FEEL something. A statistic means nothing until you make it feel like something ("That's one classroom of kids every hour").
- Think in cause and effect. Each paragraph should raise a question or create tension that the next paragraph resolves — while introducing new tension. This is what pulls readers forward.
- Specific always beats general. "A 2019 Honda Civic with 87,000 miles" not "a car." "Dr. Elena Torres, a pediatrician in rural New Mexico" not "some doctors." Names, places, numbers, details.
- Use the protagonist principle even in nonfiction: give the reader someone to follow through the story. A person affected by the issue. A researcher who discovered something. A company that tried and failed.

STYLE & VOICE:
- Write with a personal, confident, collaborative tone (Silvia). Sound like an informed human talking to a peer — not a textbook, not a press release, not a college essay.
- Confident, not defensive. Make your points assertively. Don't hedge with "It could perhaps be argued that..." Just argue it.
- Collaborative, not combative. Respect the reader's intelligence. Teach, don't lecture. Assume they're smart but unfamiliar with this specific thing.
- Vary sentence rhythm: short punchy sentence after a long complex one. A fragment for emphasis. Then a longer sentence that develops the idea. Read it aloud — it should have a natural cadence.
- Active voice default (passive only when the action matters more than the actor)
- Cut every word that doesn't earn its place. If removing a sentence doesn't lose meaning, remove it.
- No clichés ("at the end of the day," "it goes without saying," "in today's fast-paced world"), no jargon without explanation, no weasel words ("some experts say," "studies show" without saying which studies)
- Use "said" for attribution — never "stated," "remarked," "noted," "opined"
- Answer reader objections before they arise (Labrecque). If your argument has an obvious counterpoint, address it before the reader thinks of it.
${seoInstructions}

FACTUAL INTEGRITY — THIS IS NON-NEGOTIABLE:
- NEVER fabricate quotes. If you don't have a real quote from the reference materials, don't invent one. Paraphrase instead.
- NEVER invent facts, statistics, dates, addresses, names, or details that aren't in the reference materials or widely known public facts.
- If reference materials are provided, the article must be BASED on them. They are your source of truth. Don't wander off into invented tangents.
- If you don't know something, leave it out. An article with fewer details that are all true is infinitely better than one padded with fabrications.
- Don't say "the exact X has not been announced" or similar filler — if you don't have the info, just don't mention it at all.
- Attribution: only quote someone if the quote appears in the reference materials. Otherwise, describe what they said in your own words.
${hasReferences ? "- You have reference materials above. USE THEM. The article should closely follow the information provided. Do not make up parallel stories or alternative narratives." : "- No reference materials were provided, so stick to the topic as described and widely known public facts. Do not invent specific quotes, data points, or details."}

FORMAT:
1. # for headline, ## for sections, **bold** for emphasis
2. Write naturally with varied sentence structure
3. No meta-commentary about the writing process
4. No emojis
5. Target ~${wordTarget} words

Write the complete article now:`;

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", percent: 20, status: "Writing article..." })));

          const articleResp = await callClaude(prompt, maxTokens);
          let article = articleResp.text;
          trackApiCost({ userId, type: "article", inputTokens: articleResp.inputTokens, outputTokens: articleResp.outputTokens }).catch(() => {});

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", percent: 55, status: "Humanizing for natural voice..." })));

          // Humanizer pass
          article = await humanizeChapter(article, { userId, writingSample: body.writingSample });

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "content", content: article })));
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", percent: 80, status: "Generating SEO elements..." })));

          // SEO generation
          const wantSeo = body.seoHeadlines || body.seoMeta || body.seoTags;
          let seoData = { headlines: [] as string[], metaDescription: "", tags: [] as string[] };

          if (wantSeo) {
            const seoParts: string[] = [];
            if (body.seoHeadlines) seoParts.push("3-5 alternative headline options (array of strings)");
            if (body.seoMeta) seoParts.push("a meta description for SEO (max 160 chars)");
            if (body.seoTags) seoParts.push("5-8 suggested tags/keywords");

            const seoPrompt = `Based on this article, generate SEO elements. Return ONLY valid JSON with this exact structure:
{
  "headlines": ["headline 1", "headline 2", "headline 3"],
  "metaDescription": "meta description here",
  "tags": ["tag1", "tag2", "tag3"]
}

Generate: ${seoParts.join(", ")}
If a field wasn't requested, return empty array or empty string.

Article title and content:
${article.slice(0, 2000)}`;

            try {
              const seoResp = await callClaude(seoPrompt, 1024);
              const seoRaw = seoResp.text;
              trackApiCost({ userId, type: "article", inputTokens: seoResp.inputTokens, outputTokens: seoResp.outputTokens }).catch(() => {});
              const jsonMatch = seoRaw.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                seoData = JSON.parse(jsonMatch[0]);
              }
            } catch {
              // SEO generation failed, continue without it
            }

            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "seo", ...seoData })));
          }

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", percent: 90, status: "Saving to library..." })));

          // Save to library
          const record = await prisma.book.create({
            data: {
              title: article.split("\n")[0]?.replace(/^#\s*/, "").trim().slice(0, 200) || `${typeLabel}: ${body.topic.slice(0, 100)}`,
              description: body.topic.slice(0, 500),
              genre: "article",
              tone: body.tone,
              contentType: "article",
              language: lang,
              userId,
              status: "complete",
            },
          });

          await prisma.bookVersion.create({
            data: {
              bookId: record.id,
              version: 1,
              content: article,
              wordCount: article.split(/\s+/).filter(Boolean).length,
              notes: `${typeLabel} | ${toneLabel}`,
            },
          });

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "complete", bookId: record.id })));
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Generation failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
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
