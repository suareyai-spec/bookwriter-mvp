import { z } from "zod";
import { anthropic } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, getBookSize, getBookCreditCost, PlanKey } from "@/lib/stripe";
import { isAdmin } from "@/lib/config";
import { rateLimitByUser } from "@/lib/rate-limit";
import { humanizeChapter } from "@/lib/humanizer";
import { trackApiCost, getTokensFromResponse, CostType } from "@/lib/cost-tracker";

export const maxDuration = 900;
export const dynamic = "force-dynamic";

const ReferenceItem = z.object({
  type: z.enum(["pdf", "gdoc", "text"]),
  content: z.string(),
  name: z.string(),
});

const Body = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  genre: z.string().max(60).optional(),
  tone: z.string().max(60).optional(),
  audience: z.string().max(200).optional(),
  bookLength: z.string().max(100).optional(),
  language: z.string().max(30).optional(),
  references: z.array(ReferenceItem).optional(),
  revisionInstructions: z.string().max(5000).optional(),
  previousContent: z.string().optional(),
  mature: z.boolean().optional(),
  matureLevel: z.enum(["steamy", "explicit", "nolimits"]).optional(),
  humanize: z.boolean().optional(),
  subGenre: z.string().max(50).optional(),
  romanceSubGenre: z.string().max(100).optional(),
  relationshipDynamic: z.string().max(100).optional(),
  leadOne: z.object({ name: z.string().max(100), traits: z.string().max(500) }).optional(),
  leadTwo: z.object({ name: z.string().max(100), traits: z.string().max(500) }).optional(),
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
  return `\n\nREFERENCE MATERIALS PROVIDED BY THE AUTHOR:
The author has provided the following reference materials. Use these to inform the book's content, style, facts, and direction. Incorporate relevant information naturally.

${parts.join("\n\n")}`;
}

function getChapterPlan(bookLength: string): { chapters: number; totalWords: number } {
  if (bookLength?.includes("10,000")) return { chapters: 5, totalWords: 10000 };
  if (bookLength?.includes("25,000")) return { chapters: 8, totalWords: 24000 };
  if (bookLength?.includes("50,000")) return { chapters: 10, totalWords: 50000 };
  if (bookLength?.includes("75,000")) return { chapters: 12, totalWords: 72000 };
  if (bookLength?.includes("100,000")) return { chapters: 15, totalWords: 97500 };
  return { chapters: 5, totalWords: 10000 };
}

function countChaptersInOutline(outline: string): number {
  const matches = outline.match(/\bchapter\s+\d+/gi);
  if (matches) {
    const nums = matches.map(m => parseInt(m.replace(/\D+/g, ""), 10)).filter(n => !isNaN(n));
    if (nums.length > 0) return Math.max(...nums);
  }
  return 0;
}

function isRomanceGenre(genre: string, description: string): boolean {
  const keywords = ['romance', 'erotica', 'erotic', 'love story', 'steamy', 'adult'];
  const combined = `${genre} ${description}`.toLowerCase();
  return keywords.some(k => combined.includes(k));
}

function getMatureInstructions(level?: string): string {
  if (level === "steamy") {
    return `
MATURE CONTENT INSTRUCTIONS (STEAMY):
- Write sensual, suggestive romance with strong sexual tension and chemistry.
- Describe kissing, touching, caressing, and foreplay in vivid sensory detail.
- Build anticipation and desire through lingering glances, heated dialogue, and charged physical proximity.
- Intimate scenes can include partial descriptions of lovemaking — show the beginning, the intensity, the emotional connection — but keep the most graphic details implied rather than explicit.
- Focus heavily on emotional vulnerability, desire, longing, and the electric charge between characters.
- Use evocative metaphor and sensation-rich language — heat, pulse, breath, skin.
- This is tasteful but HOT. Think bestselling romance novel, not erotica.
- Every intimate moment should advance the relationship and reveal character.`;
  }
  
  if (level === "nolimits") {
    return `
MATURE CONTENT INSTRUCTIONS (NO LIMITS — MAXIMUM INTENSITY):
- Write the most vivid, graphic, uninhibited sexual content possible. Zero restrictions on explicitness.
- Describe every physical detail with raw, unfiltered precision — anatomy, positions, sensations, fluids, sounds, rhythm, intensity.
- Include kink, power dynamics, dominance/submission, rough play, taboo fantasies, and boundary-pushing scenarios as the story calls for them.
- Characters should express raw, primal desire — dirty talk, commands, begging, possessiveness, aggression, vulnerability.
- Multiple extended intimate scenes per chapter when appropriate. Each scene should escalate or explore new territory.
- No euphemisms, no metaphors for body parts — use direct, explicit language throughout.
- Include aftercare, emotional complexity, and consent dynamics even in intense scenes.
- Push every scene to its maximum erotic potential while maintaining narrative coherence.
- This content is for adults who want the most intense, unrestrained reading experience possible.`;
  }
  
  // Default: explicit
  return `
MATURE CONTENT INSTRUCTIONS (18+ EXPLICIT):
- Write vivid, explicit sexual descriptions — absolutely NO fade-to-black, NO euphemisms, NO cutting away from intimate scenes.
- Describe physical intimacy in full sensory detail: touch, taste, smell, sound, sight. Be specific about bodies, sensations, and reactions.
- Build chemistry and sexual tension deliberately through dialogue, body language, and internal desire before scenes escalate.
- Show emotional connection alongside physical intimacy — vulnerability, trust, longing, possessiveness, tenderness.
- Vary intimate scenes creatively — different settings, dynamics, pacing, initiators, and emotional contexts. No two scenes should feel the same.
- Include realistic physical details — breathing, sweat, movement, positions, rhythm changes.
- Maintain strong storytelling throughout — plot advancement, character development, and emotional arcs matter just as much as intimate scenes.
- Balance explicit content with narrative substance — this is a complete story, not just a collection of scenes.`;
}

function isReligiousPhilosophy(genre: string, tone: string, description: string): boolean {
  const keywords = ['religious', 'spiritual', 'philosophy', 'philosophical'];
  const combined = `${genre} ${tone} ${description}`.toLowerCase();
  return keywords.some(k => combined.includes(k));
}

function buildReligiousReferenceContext(references: z.infer<typeof ReferenceItem>[]): string {
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
    parts.push(`[Source Text ${i + 1}: ${ref.name}]\n${content}`);
  }
  return `\n\nPRIMARY SOURCE TEXTS — THE FOUNDATION OF THIS WORK:
These are not supplementary references. These texts ARE the source. The philosophy, terminology, stories, teachings, and concepts within them form the backbone of every chapter. Every chapter must draw directly from these texts, expand on them in the sacred writing style, and treat their language as inviolable vocabulary. Do not paraphrase away from the original — transmit it, elevated.

${parts.join("\n\n")}`;
}

function isEducational(genre: string, tone: string): boolean {
  const eduKeywords = ['educational', 'self-help', 'non-fiction', 'nonfiction', 'business', 'science', 'history', 'philosophy', 'psychology', 'health', 'technology', 'how-to', 'guide', 'textbook', 'academic', 'medical', 'medicine', 'nursing', 'clinical'];
  const combined = `${genre} ${tone}`.toLowerCase();
  return eduKeywords.some(k => combined.includes(k));
}

function isMedical(genre: string, tone: string, description: string): boolean {
  const medKeywords = ['medical', 'medicine', 'clinical', 'healthcare', 'health care', 'nursing', 'pharmacy', 'pharmaceutical', 'surgical', 'pathology', 'oncology', 'cardiology', 'neurology', 'pediatric', 'psychiatric', 'epidemiology', 'biomedical', 'anatomy', 'physiology', 'diagnosis', 'treatment protocol', 'patient care'];
  const combined = `${genre} ${tone} ${description}`.toLowerCase();
  return medKeywords.some(k => combined.includes(k));
}

function detectCitationStyle(genre: string, tone: string, description: string): string {
  const combined = `${genre} ${tone} ${description}`.toLowerCase();
  
  // Medical/Health → AMA
  if (['medical', 'medicine', 'clinical', 'healthcare', 'nursing', 'pharmacy', 'surgical', 'pathology', 'oncology', 'cardiology', 'neurology', 'biomedical', 'anatomy', 'physiology', 'patient care'].some(k => combined.includes(k))) {
    return 'ama';
  }
  // Psychology/Social Sciences → APA
  if (['psychology', 'sociology', 'social science', 'behavioral', 'cognitive', 'mental health', 'counseling', 'therapy', 'developmental', 'social work', 'education', 'linguistics'].some(k => combined.includes(k))) {
    return 'apa';
  }
  // Law → Bluebook
  if (['law', 'legal', 'jurisprudence', 'court', 'legislation', 'constitutional', 'criminal justice', 'attorney', 'litigation'].some(k => combined.includes(k))) {
    return 'bluebook';
  }
  // Hard Sciences/Engineering → IEEE or Vancouver
  if (['engineering', 'computer science', 'physics', 'chemistry', 'mathematics', 'biology', 'environmental science', 'geology', 'astronomy', 'data science', 'artificial intelligence', 'machine learning'].some(k => combined.includes(k))) {
    return 'ieee';
  }
  // History/Humanities → Chicago
  if (['history', 'philosophy', 'theology', 'religion', 'literature', 'art history', 'music', 'cultural studies', 'anthropology', 'archaeology', 'classics'].some(k => combined.includes(k))) {
    return 'chicago';
  }
  // Business/Economics → APA or Harvard
  if (['business', 'economics', 'finance', 'management', 'marketing', 'accounting', 'entrepreneurship', 'startup', 'strategy', 'mba'].some(k => combined.includes(k))) {
    return 'harvard';
  }
  // Default for any educational → APA (most universal)
  return 'apa';
}

function getCitationInstructions(style: string): string {
  switch (style) {
    case 'ama':
      return `CITATION STYLE: AMA (American Medical Association)
- Format: Author(s). Title. Journal. Year;Volume(Issue):Pages. doi:
- Number references sequentially as they appear in text using superscript numbers.
- Reference major medical journals: NEJM, The Lancet, JAMA, BMJ, Annals of Internal Medicine.
- Cite clinical trials by name, clinical guidelines from WHO/CDC/NIH/AHA.
- Include a numbered References section at the end of each chapter.`;
    case 'apa':
      return `CITATION STYLE: APA 7th Edition (American Psychological Association)
- In-text: (Author, Year) or Author (Year) for narrative citations.
- Multiple authors: (Smith & Jones, 2020) or (Smith et al., 2019) for 3+.
- Reference list format: Author, A. A. (Year). Title of work. Publisher. https://doi.org/
- Include DOIs where applicable.
- Include a References section at the end of each chapter, alphabetically ordered.`;
    case 'bluebook':
      return `CITATION STYLE: Bluebook Legal Citation
- Cases: Party v. Party, Volume Reporter Page (Court Year).
- Statutes: Title Source § Section (Year).
- Law review articles: Author, Title, Volume Journal Page (Year).
- Use footnotes for citations throughout.
- Reference landmark cases, statutes, and legal scholarship by proper Bluebook format.`;
    case 'ieee':
      return `CITATION STYLE: IEEE (Institute of Electrical and Electronics Engineers)
- Number references in square brackets [1], [2], in order of appearance.
- Format: [1] A. Author, "Title," Journal, vol. X, no. Y, pp. Z–Z, Month Year.
- Conference papers: [2] A. Author, "Title," in Proc. Conference Name, Year, pp. Z–Z.
- Reference key papers, technical standards, and foundational algorithms by name.
- Include a numbered References section at the end of each chapter.`;
    case 'chicago':
      return `CITATION STYLE: Chicago Manual of Style (Notes-Bibliography)
- Use footnotes for citations: Author, Title (Place: Publisher, Year), page.
- Subsequent references: Author, Short Title, page.
- Bibliography at end: Author. Title. Place: Publisher, Year.
- Reference primary sources, archives, and seminal historical works.
- Include a Bibliography section at the end of each chapter.`;
    case 'harvard':
      return `CITATION STYLE: Harvard Referencing
- In-text: (Author Year, p. X) or Author (Year, p. X).
- Reference list: Author, Year. Title. Edition. Place: Publisher.
- For journals: Author, Year. Title. Journal, Volume(Issue), pp.X–Y.
- Reference business case studies from Harvard Business Review, McKinsey, BCG, etc.
- Include a References section at the end of each chapter, alphabetically ordered.`;
    default:
      return '';
  }
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
    const rl = await rateLimitByUser("generate", 10, 60 * 60 * 1000);
    if (rl.blocked) return rl.blocked;

    // --- PAYMENT GATE ---
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Please sign in to generate books." }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const userId = (session.user as any).id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const body = Body.parse(await req.json());
    const bookSize = getBookSize(body.bookLength || "10,000 words (~40 pages)");

    // Admin bypass — skip all payment checks
    if (isAdmin(user.email)) {
      await prisma.user.update({ where: { id: userId }, data: { isGenerating: true, generationStartedAt: new Date() } });
      // Skip to generation (falls through to after payment gate)
    } else {

    const userPlan = user.subscriptionPlan as PlanKey | null;
    const isActive = user.subscriptionStatus === "active";
    const isFreeUser = !isActive && !userPlan;

    // Concurrent generation limit — auto-reset if stuck > 30 minutes
    if (user.isGenerating) {
      const startedAt = (user as any).generationStartedAt;
      const stuckThreshold = 30 * 60 * 1000; // 30 minutes
      if (startedAt && Date.now() - new Date(startedAt).getTime() > stuckThreshold) {
        // Auto-reset stuck generation
        await prisma.user.update({ where: { id: userId }, data: { isGenerating: false, generationStartedAt: null } });
        (user as any).isGenerating = false;
      } else {
        const planConfig = userPlan && PLANS[userPlan] ? PLANS[userPlan] : null;
        const maxConcurrent = planConfig?.concurrentGenerations || 1;
        if (maxConcurrent <= 1) {
          return new Response(JSON.stringify({ error: "You already have a generation in progress. Please wait for it to finish." }), { status: 429, headers: { "Content-Type": "application/json" } });
        }
      }
    }

    // FREE STARTER TIER: users with no plan get 1 free short book
    if (isFreeUser) {
      // Free users can ONLY generate short books
      if (bookSize !== "short") {
        return new Response(JSON.stringify({ error: "Free Starter only includes Short Books (10,000 words max). Upgrade to unlock Medium, Standard, and Epic book generation.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      // Check if free book already used
      if ((user as any).freeBookUsed) {
        // Check for purchased credits as fallback
        const credit = await prisma.bookCredit.findFirst({
          where: { userId, bookSize, used: false },
        });
        if (credit) {
          await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
        } else {
          return new Response(JSON.stringify({ error: "You've reached your Free Starter limit. Upgrade to unlock full book generation, full translations, and unlimited creative output.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
      } else {
        // Mark free book as used
        await prisma.user.update({ where: { id: userId }, data: { freeBookUsed: true } });
      }
    }
    // Epic books always require a separate credit purchase ($499)
    else if (bookSize === "epic") {
      const credit = await prisma.bookCredit.findFirst({
        where: { userId, bookSize: "epic", used: false },
      });
      if (!credit) {
        return new Response(JSON.stringify({ error: "Epic books require a $499 credit purchase. Buy an Epic Book credit to continue.", needsCredit: true, creditSize: "epic" }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
    } else if (isActive && userPlan) {
      const planConfig = PLANS[userPlan];

      // Check if plan allows this book size (Creator can't do standard)
      if (!planConfig.allowedSizes.includes(bookSize)) {
        return new Response(JSON.stringify({ error: `Your ${planConfig.name} plan doesn't include ${bookSize} books. Upgrade your plan or buy a credit.`, needsCredit: true, creditSize: bookSize }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      // Check monthly reset
      if (user.monthlyResetDate && new Date() > user.monthlyResetDate) {
        await prisma.user.update({ where: { id: userId }, data: { monthlyBooksUsed: 0, monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), monthlyNewslettersUsed: 0 } });
        user.monthlyBooksUsed = 0;
      }

      const creditCost = getBookCreditCost(userPlan, bookSize);
      const remaining = planConfig.monthlyCredits - user.monthlyBooksUsed;

      if (remaining >= creditCost) {
        await prisma.user.update({ where: { id: userId }, data: { monthlyBooksUsed: user.monthlyBooksUsed + creditCost } });
      } else {
        const credit = await prisma.bookCredit.findFirst({
          where: { userId, bookSize, used: false },
        });
        if (credit) {
          await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
        } else {
          return new Response(JSON.stringify({ error: `You've used all your monthly books. Buy an extra ${bookSize} book credit to continue.`, needsCredit: true, creditSize: bookSize }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
      }
    } else {
      const credit = await prisma.bookCredit.findFirst({
        where: { userId, bookSize, used: false },
      });
      if (!credit) {
        return new Response(JSON.stringify({ error: "You need a subscription or book credit to generate. Visit the pricing page to get started.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      await prisma.bookCredit.update({ where: { id: credit.id }, data: { used: true, usedAt: new Date() } });
    }

    // Mark as generating
    await prisma.user.update({ where: { id: userId }, data: { isGenerating: true, generationStartedAt: new Date() } });

    } // end admin bypass else

    // --- END PAYMENT GATE ---

    const plan = getChapterPlan(body.bookLength || "10,000 words (~40 pages)");
    const lang = body.language || "English";
    const genre = body.genre || "General";
    const tone = body.tone || "Professional";
    const isEdu = isEducational(genre, tone);
    const isMed = isMedical(genre, tone, body.description);
    const citationStyle = isEdu ? detectCitationStyle(genre, tone, body.description) : '';
    const citationInstructions = isEdu ? getCitationInstructions(citationStyle) : '';
    const isMatureRomance = body.mature === true && isRomanceGenre(genre, body.description);
    const matureContext = isMatureRomance ? getMatureInstructions(body.matureLevel) : "";
    const isReligious = isReligiousPhilosophy(genre, tone, body.description);

    // Build romance details context
    let romanceContext = "";
    if (/^romance$/i.test(genre)) {
      const parts: string[] = [];
      if (body.romanceSubGenre) parts.push(`- Sub-genre: ${body.romanceSubGenre}`);
      if (body.relationshipDynamic) parts.push(`- Relationship Dynamic: ${body.relationshipDynamic}`);
      if (body.leadOne?.name || body.leadOne?.traits) parts.push(`- Lead Character 1: ${body.leadOne?.name || "Unnamed"}${body.leadOne?.traits ? ` — ${body.leadOne.traits}` : ""}`);
      if (body.leadTwo?.name || body.leadTwo?.traits) parts.push(`- Lead Character 2: ${body.leadTwo?.name || "Unnamed"}${body.leadTwo?.traits ? ` — ${body.leadTwo.traits}` : ""}`);
      if (parts.length > 0) {
        romanceContext = `\n\nROMANCE DETAILS:\n${parts.join("\n")}`;
        if (body.romanceSubGenre) romanceContext += `\n\nWrite the romance following the ${body.romanceSubGenre} sub-genre conventions.`;
        if (body.leadOne?.name && body.leadTwo?.name && body.relationshipDynamic) {
          romanceContext += ` The relationship between ${body.leadOne.name} and ${body.leadTwo.name} should follow a ${body.relationshipDynamic} arc.`;
        }
      }
    }

    const refContext = body.references?.length
      ? (isReligious ? buildReligiousReferenceContext(body.references) : buildReferenceContext(body.references))
      : "";
    const revisionContext = body.revisionInstructions
      ? `\n\nREVISION INSTRUCTIONS FROM THE AUTHOR:\n${body.revisionInstructions}`
      : "";
    const previousContentContext = body.previousContent
      ? `\n\nPREVIOUS VERSION OF THE BOOK (use as foundation, improve upon it):\n${body.previousContent.slice(0, 80000)}`
      : "";

    const bookContext = `Title: "${body.title}"
Genre: ${genre}${body.subGenre ? `\nSub-genre focus: ${body.subGenre}` : ""}
Tone: ${tone}
Target Audience: ${body.audience || "General readers"}
Language: ${lang} — Write EVERYTHING in ${lang}.

Author's Vision:
${body.description}${refContext}${revisionContext}${previousContentContext}${romanceContext}${matureContext}`;

    let outlinePrompt = isReligious
      ? `You are a spiritual author who has received revelation and is now transmitting truth. You write as one who has discovered the deepest principles of existence and must record them for those ready to receive.

${bookContext}

Create a detailed TABLE OF CONTENTS. If the author's vision specifies a number of chapters, use that exact number. Otherwise use approximately ${plan.chapters} chapters.

WRITING STYLE — THREE TRADITIONS FUSED INTO ONE VOICE:
This work combines three powerful literary traditions:

1. DIANETICS INFLUENCE (Authoritative & Declarative): Present every principle as absolute discovered fact. The book's own terminology is precise, proprietary, and sacred — treat it as such throughout. No hedging. No "perhaps." Declarations only, written with the certainty of someone who has arrived at unshakeable conclusions through deep discovery.

2. BIBLICAL INFLUENCE (Prophetic & Poetic): Use rhythm, repetition, and parallel structure. Write with the weight of prophecy. Employ poetic cadences meant to be memorized. Repeat key truths in different forms to hammer them into consciousness.

3. QURANIC INFLUENCE (Direct Address & Verse-like Commands): Speak directly to the reader as "you." Use short declarative statements alternating with reflection. Issue commands and pronouncements of truth. The reader should feel personally addressed by someone who sees them clearly.

THE RESULT: A life guide — not theory, not speculation, but instruction. The author speaks as one who has received or discovered truth and is now transmitting it. No references to external religions, traditions, or philosophies. The book's own terminology is its sacred vocabulary.

${body.references?.length ? `PRIMARY SOURCE REQUIREMENT: The uploaded source texts are the foundation of this work. Every chapter must be built around the specific teachings, terminology, stories, and concepts found in those texts. The outline must reflect what is actually in the source material.` : ""}

For each chapter, provide:
- Chapter number and title
- A 3-4 sentence description of the teaching, principle, or truth this chapter transmits
- 4-6 key sections/subsections within the chapter

Write the entire outline in ${lang}. ALL text must be in ${lang} — chapter titles, descriptions, everything. Never use English unless ${lang} IS English.`

      : isEdu
      ? `You are an expert author and subject-matter specialist writing a definitive book on this topic.

${bookContext}

Create a detailed TABLE OF CONTENTS. If the author's vision specifies a number of chapters, use that exact number. Otherwise use approximately ${plan.chapters} chapters.

CRITICAL REQUIREMENTS FOR EDUCATIONAL/NON-FICTION:
- Go DEEP, not wide. Each chapter should thoroughly explore its subject with real substance.
- CITE ORIGINAL RESEARCH throughout. Reference real published studies, academic papers, books, and their authors by name. Include publication years and institutions. Example: "As demonstrated by Dr. Robert Cialdini's research at Arizona State University (1984)..."
- Include specific data points, statistics, and quantitative findings from real, verifiable research. Never use vague claims like "studies show" — always name the specific study, researcher, or institution.
- Reference seminal works and foundational texts that shaped the field. Name the actual authors and publications.
- Structure each chapter with clear sub-sections that build on each other.
- Include practical frameworks, methodologies, step-by-step processes, or actionable takeaways where appropriate.
- Reference real-world case studies, historical events, named companies, and notable figures relevant to the topic with specific dates and outcomes.
- Avoid surface-level generalities. If a chapter covers a concept, explain the WHY and HOW, not just the WHAT.
- Think like a professor writing for intelligent adults who want to truly understand the subject.
- For each major claim, back it up with a named source or study.

For each chapter, provide:
- Chapter number and title
- A 3-4 sentence detailed description of what the chapter covers, including specific subtopics
- 4-6 key sections/subsections within the chapter

Write the entire outline in ${lang}. ALL text must be in ${lang} — chapter titles, descriptions, everything. Never use English unless ${lang} IS English.`

      : `You are a masterful novelist known for literary depth, complex characters, and stories that stay with readers long after they finish.

${bookContext}

Create a detailed TABLE OF CONTENTS. If the author's vision specifies a number of chapters, use that exact number. Otherwise use approximately ${plan.chapters} chapters.

CRITICAL REQUIREMENTS FOR FICTION:
- Characters must feel like REAL PEOPLE with contradictions, flaws, desires they don't fully understand, and histories that shape their behavior.
- Avoid cliches: no "waking up to an alarm," no "looking in the mirror to describe appearance," no convenient coincidences, no love-at-first-sight without complication, no villains who are evil for no reason.
- Every character should want something — and the things they want should sometimes conflict.
- Ground the story in SPECIFIC, vivid details — real street names if set in a real city, authentic cultural details, sensory descriptions that feel lived-in.
- Subplots should weave naturally into the main arc, not feel like filler.
- Dialogue should sound like actual humans talking — interruptions, subtext, things left unsaid, humor mixed with tension.
- The story should explore genuine themes and moral complexity. No easy answers. No tidy lessons.
- Pacing should vary: quiet intimate moments balanced with tension and momentum.

STORYTELLING CRAFT (from NYT Manual of Style, The Power of Story, and masterclass references):
- Every story has a controlling narrative — know what it is and serve it. The "Old Story/New Story" arc: characters begin trapped in one understanding and are transformed into another.
- Use the "single image" technique: one striking image or detail can elevate an entire passage and anchor it in the reader's memory.
- Prefer the unpretentious language of a letter to an urbane and literate friend. When an unusual word or a swerve in logic appears, the reader should feel rewarded.
- Humor and surprise are tools of engagement — deploy them where the reader least expects.
- The best writing relies on the writer's ear and eye, and on simplicity.
- Style is a set of tools and tricks, a tone of voice — let each character's voice be distinct and recognizable.

${/^romance$/i.test(genre) ? `ROMANCE STRUCTURE (from Romancing the Beat):
- Follow the romance beat structure: Setup → Meet → Attraction → Obstacle → Midpoint Commitment → Deepening → Black Moment → Grand Gesture → Resolution/HEA.
- The "Meet" should establish immediate chemistry through contrast, conflict, or unexpected circumstances.
- The "Black Moment" must feel genuinely devastating — the reader should doubt the HEA is possible.
- Both leads need their own character arc. The romance is the vehicle for personal transformation.
- The relationship should escalate through specific beats: first touch, first kiss, first vulnerability, first "I love you" — each earned through story progression.` : ''}

${/^romance$/i.test(genre) && /comedy|humor|funny|romcom|rom-com/i.test(`${tone} ${body.description}`) ? `ROMANTIC COMEDY CRAFT (from How to Write Romantic Comedy):
- Comedy in romance comes from CHARACTER, not gags. Funny characters in awkward situations > random jokes.
- Story structure IS joke structure: setup → expectation → subversion. Apply this at scene level and chapter level.
- The "rule of three" works everywhere: establish a pattern, confirm it, then break it.
- Comedic characters need a blind spot — something obvious to everyone else that they can't see about themselves.
- Timing on the page = word choice and sentence length. Short sentences are punchlines. Long setups make the payoff land.
- Embarrassment is the engine of romantic comedy. Characters should regularly mortify themselves.
- The comedy should come from truth — the funniest moments are the ones readers recognize from their own lives.` : ''}

${/horror|thriller|dark|supernatural|gothic|psychological/i.test(genre) ? `HORROR CRAFT (from On Writing Horror — HWA, Stephen King et al):
- Horror works through DREAD, not shock. Build a pervasive atmosphere of wrongness before anything happens.
- The reader's imagination is more terrifying than anything you can describe. Suggest, imply, let shadows do the work.
- Ground horror in the mundane — the familiar made wrong is more disturbing than the overtly monstrous.
- Give your monster RULES. The reader's fear comes from understanding the logic of the threat, not from randomness.
- Visceral violence, when used, must serve the story. Gratuitous gore numbs; targeted, unexpected violence shocks.
- The best horror explores real human fears: isolation, loss of control, the people we trust becoming threats, the body betraying us.
- Pacing in horror is everything: slow burn, false safety, escalation, brief respite, then the floor drops.
- Characters in horror must make decisions the reader understands — "don't go in the basement" only works if we understand WHY they go.` : ''}

For each chapter, provide:
- Chapter number and title
- A 3-4 sentence description covering the emotional arc, key events, and character development
- Key scenes and turning points

Write the entire outline in ${lang}. ALL text must be in ${lang} — chapter titles, descriptions, everything. Never use English unless ${lang} IS English.`;

    // Create book record early for background tracking
    const earlyBook = await prisma.book.create({
      data: {
        title: body.title,
        description: body.description,
        genre: body.genre,
        tone: body.tone,
        audience: body.audience,
        language: body.language,
        bookLength: body.bookLength,
        userId,
        mature: body.mature || false,
        humanize: true,
        status: "generating",
        progress: JSON.stringify({ percent: 0, currentChapter: 0, totalChapters: 0, status: "outline" }),
      },
    });
    const earlyBookId = earlyBook.id;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send bookId to client so it can navigate away
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "bookId", bookId: earlyBookId })));

          // Step 0 (religious + refs): Extract core laws/framework from source texts before outlining
          let extractedFramework = "";
          if (isReligious && body.references?.length) {
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", chapter: 0, totalChapters: 0, title: "Analyzing source framework...", status: "outline" })));
            const fwResp = await callClaude(`Read the following source texts and extract — with precision and direct quotation:

1. CORE LAWS / NUMBERED FRAMEWORK: Every named law, principle, or numbered construct EXACTLY as stated in the source. Quote the exact language for each one. If the author has "3 Laws," "5 Principles," or any named framework, extract every single item verbatim.

2. PROPRIETARY TERMINOLOGY: Every coined term or specialized concept the author uses, with their exact definitions or descriptions from the text.

3. KEY STORIES / EXAMPLES: Any named stories, parables, metaphors, or illustrative examples.

4. THE AUTHOR'S CENTRAL THESIS: In 2-3 sentences, the core claim this philosophy makes about reality, life, or the human condition.

Source texts:
${refContext}

Be exhaustive. Quote directly from the source. Do not invent or paraphrase away from the original language.`, 2000);
            extractedFramework = fwResp.text;
            trackApiCost({ userId, type: "book", inputTokens: fwResp.inputTokens, outputTokens: fwResp.outputTokens, bookId: earlyBookId }).catch(() => {});

            // Rebuild outline prompt with the extracted framework as the organizing spine
            outlinePrompt = `You are a spiritual author who has received revelation and is now transmitting truth. You write as one who has discovered the deepest principles of existence and must record them for those ready to receive.

${bookContext}

CORE FRAMEWORK EXTRACTED FROM SOURCE TEXTS:
${extractedFramework}

Create a detailed TABLE OF CONTENTS. If the author's vision specifies a number of chapters, use that exact number. Otherwise use approximately ${plan.chapters} chapters.

CRITICAL STRUCTURAL REQUIREMENT — THE FRAMEWORK IS THE SPINE:
The outline MUST be organized around the exact laws, principles, and constructs extracted above. This is non-negotiable. The specific laws identified in the source material are the organizing spine of the entire book. Each law or core construct must be featured as a dedicated chapter or as the central subject of multiple sections. Chapter titles must directly reflect the language and framework of the source texts.

Do NOT create a generic spiritual outline. The structure must be derived from the laws and constructs that actually exist in the source material.

WRITING STYLE — THREE TRADITIONS FUSED INTO ONE VOICE:
1. DIANETICS INFLUENCE (Authoritative & Declarative): Present every principle as absolute discovered fact. The book's own terminology is precise, proprietary, and sacred. No hedging. No "perhaps." Declarations only.

2. BIBLICAL INFLUENCE (Prophetic & Poetic): Rhythm, repetition, and parallel structure. The weight of prophecy. Poetic cadences meant to be memorized.

3. QURANIC INFLUENCE (Direct Address & Verse-like Commands): Speak directly to the reader as "you." Short declarative statements alternating with reflection. Commands and pronouncements of truth.

THE RESULT: A life guide — not theory, but instruction. The author speaks as one who has received or discovered truth and is transmitting it. No references to external religions or traditions. The book's own terminology is its sacred vocabulary.

For each chapter, provide:
- Chapter number and title (derived directly from the source framework's laws/constructs)
- Which specific law, principle, or construct from the source this chapter centers on
- A 3-4 sentence description of the teaching this chapter transmits
- 4-6 key sections/subsections

Write the entire outline in ${lang}. ALL text must be in ${lang} — chapter titles, descriptions, everything. Never use English unless ${lang} IS English.`;
          }

          // Step 1: Generate outline
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", chapter: 0, totalChapters: 0, title: "Generating outline...", status: "outline" })));
          const outlineResp = await callClaude(outlinePrompt, 3000);
          const outline = outlineResp.text;
          trackApiCost({ userId, type: "book", inputTokens: outlineResp.inputTokens, outputTokens: outlineResp.outputTokens, bookId: earlyBookId }).catch(() => {});
          // Extract chapter titles from outline to determine actual count
          const chapterTitles: string[] = [];
          const titleRegex = /chapter\s+\d+[:\s]+(.+)/gi;
          let match;
          while ((match = titleRegex.exec(outline)) !== null) {
            chapterTitles.push(match[1].trim().replace(/\*+/g, "").trim());
          }
          const actualChapters = chapterTitles.length > 0 ? chapterTitles.length : plan.chapters;
          const wordsPerChapter = Math.round(plan.totalWords / actualChapters);

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "outline", content: outline, totalChapters: actualChapters })));
          await prisma.book.update({ where: { id: earlyBookId }, data: { progress: JSON.stringify({ percent: 0, currentChapter: 0, totalChapters: actualChapters, status: "writing" }) } }).catch(() => {});

          // Step 2: Generate each chapter
          const chapters: string[] = [];
          for (let i = 1; i <= actualChapters; i++) {
            const chTitle = chapterTitles[i - 1] || `Chapter ${i}`;
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", chapter: i, totalChapters: actualChapters, title: chTitle, status: "writing" })));
            await prisma.book.update({ where: { id: earlyBookId }, data: { progress: JSON.stringify({ percent: Math.round(((i - 1) / actualChapters) * 100), currentChapter: i, totalChapters: actualChapters, currentTitle: chTitle, status: "writing" }) } }).catch(() => {});

            const prevSummary = chapters.length > 0
              ? `\nSummary of previous chapters:\n${chapters.map((c, idx) => `Chapter ${idx + 1}: ${c.slice(0, 500)}...`).join("\n\n")}`
              : "";

            const chapterPrompt = isReligious
              ? `You are a spiritual author writing a sacred life guide. You have received truth — now you transmit it. You write with the combined authority of a scientist of the mind, a prophet, and a divine messenger.

${bookContext}

Full book outline:
${outline}
${prevSummary}

Now write CHAPTER ${i} in full. Target: approximately ${wordsPerChapter} words.

CRITICAL LANGUAGE REQUIREMENT: Write this ENTIRE chapter in ${lang}. Every single word MUST be in ${lang}. This is non-negotiable.

WRITING STYLE — THREE TRADITIONS FUSED INTO ONE VOICE:

DIANETICS LAYER (Authoritative, Declarative, Proprietary):
- Write every principle as absolute discovered fact, not opinion or suggestion.
- Use the book's own terminology consistently as the sacred vocabulary of this work — never dilute or replace it with synonyms from other traditions.
- State mechanisms and truths with clinical certainty: "This is what happens. This is why. This is what you must do."
- Remove all hedging language: no "perhaps," "may," "might," "seems to," "it could be said." Replace with declarations.

BIBLICAL LAYER (Prophetic, Poetic, Rhythmic):
- Use repetition for emphasis — repeat key phrases, echo them in different forms within the same passage.
- Write in rhythmic cadences that feel meant to be read aloud or memorized.
- Use parallel structure: "He who does this, gains that. He who avoids this, loses that."
- Carry the weight of prophecy — the author speaks not just to the present reader but to all who will ever receive these words.
- Let poetic passages intersperse the instructional prose, creating rhythm and depth.

QURANIC LAYER (Direct Address, Verse-like Commands):
- Address the reader directly and frequently: "You have been told..." "Know this." "Understand what stands before you."
- Use short, stand-alone declarative sentences as verse-like proclamations between longer explanatory passages.
- Alternate between command and reflection: a command or truth statement, then a passage that illuminates why and how.
- The reader must feel personally spoken to — addressed by someone who sees them clearly.

THE UNIFIED RESULT:
- This is instruction, not theory. Every page teaches the reader what to do, how to be, or what is true.
- The author's voice carries the authority of one who has discovered, not imagined.
- No references to other religions, spiritual traditions, philosophies, or external authorities. This work stands alone.
- The book's terminology is sacred vocabulary throughout — consistent, precise, elevated.

${extractedFramework ? `CORE FRAMEWORK FROM SOURCE TEXTS:
${extractedFramework}

CRITICAL — THIS CHAPTER MUST BE BUILT FROM THE FRAMEWORK ABOVE:
- Anchor every major point in one of the specific laws or constructs listed above.
- Use the exact terminology from the source texts — these are the sacred vocabulary of this work.
- Every section must trace back to the actual philosophy in the source material.
- Do NOT write generic spiritual content. Expand the specific framework, using its own language, elevated into the three-tradition style.` : body.references?.length ? `PRIMARY SOURCE REQUIREMENT — THIS IS CRITICAL:
The uploaded reference texts are the PRIMARY source material for this chapter. Draw specific content, ideas, and terminology directly from the source material. Build this chapter from the foundation of those teachings, not generic spiritual writing.` : ""}

- Do NOT include the outline — just write the chapter content.
- Start with the chapter title as a heading.
- End with forward momentum that pulls the reader deeper.

Write Chapter ${i} now:`

              : isEdu
              ? `You are an expert author and subject-matter specialist writing a comprehensive, authoritative book.

${bookContext}

Full book outline:
${outline}
${prevSummary}

Now write CHAPTER ${i} in full. Target: approximately ${wordsPerChapter} words.

CRITICAL LANGUAGE REQUIREMENT: Write this ENTIRE chapter in ${lang}. Every single word, sentence, paragraph, heading, and dialogue MUST be in ${lang}. Do NOT switch to English or any other language. This is non-negotiable.

REQUIREMENTS FOR THIS CHAPTER:
- Write with DEPTH and AUTHORITY. You are the world's foremost expert on this subject.
- CITE ORIGINAL RESEARCH: Reference real, verifiable published studies, papers, and research by name. Include author names, publication year, journal or institution when relevant. For example: "A 2019 study by Dr. Sarah Chen at Stanford found that..." or "According to research published in The Lancet (2021)..."
- Reference seminal works and foundational texts in the field. Name the actual books, papers, and authors that shaped the discipline.
- Include specific statistics, data points, and quantitative findings from real research. Not vague claims like "studies show" — name the actual study.
- When discussing theories or frameworks, attribute them to their originators (e.g., "Porter's Five Forces," "Kahneman and Tversky's Prospect Theory," "Maslow's hierarchy").
- Reference real-world case studies with named companies, organizations, historical events, and public figures. Include specific dates, numbers, and outcomes.
- Explain concepts thoroughly — the reasoning behind them, not just definitions. Answer "why" and "how," not just "what."
- Include practical applications, frameworks, or actionable advice where relevant.
- Use analogies and real-world comparisons to make complex ideas accessible.
- Address counterarguments, nuances, and common misconceptions. Reference opposing research or viewpoints by name.
- Connect ideas to the reader's life — why should they care? How does this apply to them?
- Use clear section headings and subheadings to organize the content.
- Write in an engaging, authoritative voice — not dry or textbook-like, but substantive and insightful.
- Do NOT pad with filler, repetitive summaries, or vague generalizations. Every paragraph should teach something specific.
- Do NOT fabricate research that doesn't exist. Use real, well-known studies and sources in the field. If the topic is niche, reference the most relevant and credible sources available.
- Build on previous chapters naturally.
- Do NOT include the outline — just write the chapter content.
- Start with the chapter title as a heading.
${citationInstructions ? `\n${citationInstructions}\n` : ''}

TONE AND VOICE:
- Match the tone and voice the author described. If they want conversational, be conversational. If they want academic, be academic.
- Respect the author's intent — do not override their preferred style with rigid formality.
- Default to an engaging, authoritative voice that is substantive but accessible.

Write Chapter ${i} now:`

              : `You are a masterful novelist writing with literary depth, emotional honesty, and vivid authenticity.

${bookContext}

Full book outline:
${outline}
${prevSummary}

Now write CHAPTER ${i} in full. Target: approximately ${wordsPerChapter} words.

CRITICAL LANGUAGE REQUIREMENT: Write this ENTIRE chapter in ${lang}. Every single word, sentence, paragraph, heading, and dialogue MUST be in ${lang}. Do NOT switch to English or any other language. This is non-negotiable.

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

PROSE CRAFT (from NYT Manual of Style & The Power of Story):
- Prefer simplicity — the unpretentious language of a letter to a literate friend. Let vivid details and precise verbs do the heavy lifting.
- A single striking image can elevate an entire passage. Find it for this chapter.
- Use concrete, specific nouns over abstract ones. Not "vehicle" — the dented blue Civic with a cracked taillight.
- Eliminate filler words: "very," "really," "quite," "rather," "somewhat." Find the exact word instead.
- Every paragraph should earn its place. If it doesn't advance character, plot, theme, or atmosphere — cut it.
- Avoid the passive voice except when it creates deliberate effect. "The window had been broken" vs "Someone had broken the window."
- Sentence variety is rhythm: short declarative sentences create urgency; longer, layered sentences create reflection and atmosphere. Alternate them.

${/^romance$/i.test(genre) ? `ROMANCE BEATS FOR THIS CHAPTER (from Romancing the Beat & How to Write Romantic Comedy):
- Every scene between the leads should shift their relationship — closer or further, trust gained or broken. Static scenes have no place in romance.
- Physical awareness should be specific: not "she was attracted to him" but the exact detail she notices — his hands, the way he tilts his head, the sound of his laugh.
- Banter is not just witty dialogue — it's two people revealing themselves while trying not to. Every joke is a window.
- Vulnerability is the currency of romance. Each act of vulnerability should cost the character something.
- The emotional stakes should always be clear: what does this character stand to lose by loving this person?` : ''}

${/horror|thriller|dark|supernatural|gothic|psychological/i.test(genre) ? `HORROR CRAFT FOR THIS CHAPTER (from On Writing Horror):
- Build dread through atmosphere before the scare. The reader should feel uneasy before they know why.
- Use the familiar made strange: a child's toy in the wrong place, a door that was closed now open, silence where there should be sound.
- Sensory details are your weapon: the smell of copper, the texture of something wet in the dark, the sound that shouldn't be there.
- Fear is most effective when the character tries to rationalize it away — and fails.
- Pacing: slow the prose down before moments of terror. Short, fragmented sentences during the scare. Then silence after.
- Let the monster/threat operate on consistent internal logic. Randomness isn't scary — inevitability is.` : ''}

${isMatureRomance ? getMatureInstructions(body.matureLevel) : ""}
Write Chapter ${i} now:`;

            const chapterResp = await callClaude(chapterPrompt, 8192);
            let chapter = chapterResp.text;
            trackApiCost({ userId, type: "book", inputTokens: chapterResp.inputTokens, outputTokens: chapterResp.outputTokens, bookId: earlyBookId }).catch(() => {});
            
            // Always run humanizer pass for natural voice
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", chapter: i, totalChapters: actualChapters, title: `Humanizing Chapter ${i}...`, status: "humanizing" })));
            await prisma.book.update({ where: { id: earlyBookId }, data: { progress: JSON.stringify({ percent: Math.round(((i - 0.5) / actualChapters) * 100), currentChapter: i, totalChapters: actualChapters, currentTitle: chTitle, status: "humanizing" }) } }).catch(() => {});
            chapter = await humanizeChapter(chapter, { userId, bookId: earlyBookId });
            
            chapters.push(chapter);
            controller.enqueue(new TextEncoder().encode(sseEvent({ type: "chapter", chapter: i, totalChapters: actualChapters, title: chTitle, content: chapter })));
          }

          const fullBook = `${outline}\n\n${"━".repeat(50)}\n\n${chapters.join("\n\n" + "━".repeat(50) + "\n\n")}`;
          
          // Save content to book and mark complete
          const wordCount = fullBook.split(/\s+/).filter(Boolean).length;
          await prisma.bookVersion.create({
            data: {
              bookId: earlyBookId,
              version: 1,
              content: fullBook,
              wordCount,
              notes: body.revisionInstructions ? "New version" : "Initial generation",
            },
          });
          // Save references
          if (body.references?.length) {
            await prisma.bookReference.createMany({
              data: body.references.map(r => ({ name: r.name, type: r.type, content: r.content, bookId: earlyBookId })),
            });
          }
          await prisma.book.update({ where: { id: earlyBookId }, data: { status: "complete", progress: null } });
          
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "complete", fullText: fullBook, bookId: earlyBookId })));
          await prisma.user.update({ where: { id: userId }, data: { isGenerating: false, generationStartedAt: null } });
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
          await prisma.user.update({ where: { id: userId }, data: { isGenerating: false, generationStartedAt: null } }).catch(() => {});
          await prisma.book.update({ where: { id: earlyBookId }, data: { status: "failed", progress: JSON.stringify({ error: message }) } }).catch(() => {});
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
