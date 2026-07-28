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

// contentType tag to query the RAG style-reference corpus with — distinct
// from CONTENT_TYPE_MAP above (which tags the generated Book record).
// Comic/playwright have no dedicated ingested corpus yet, so they fall back
// to 'book' voice examples, same as the whitepaper mode does.
const RAG_CONTENT_TYPE_MAP: Record<string, string> = {
  comic: "book",
  playwright: "book",
  thesis: "academic",
  course: "course",
};

function getComicPrompt(body: z.infer<typeof Body>, refContext: string, styleReference: string): { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number } {
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
${styleReference ? `\n${styleReference}\n` : ""}
Write the complete comic script now:`;
    },
  };
}

function getPlaywrightPrompt(body: z.infer<typeof Body>, refContext: string, styleReference: string): { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number } {
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
${styleReference ? `\n${styleReference}\n` : ""}
Write Act ${idx} now:`;
    },
  };
}

function getThesisPrompt(body: z.infer<typeof Body>, refContext: string, styleReference: string): { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number } {
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
      const ACADEMIC_SYSTEM_PROMPT = `You are an expert academic writer producing a thesis, dissertation, or academic book chapter on ${body.fieldOfStudy || `"${body.title}"`}. Your writing must be rigorous, specific, and confident — not defensive, not generic, not padded.

WRITE WITH AUTHORITY: Prefer active voice and direct statements. "This study demonstrates" beats "it can be noted that the findings suggest." Hedging is appropriate when genuinely uncertain — it is not a default tone.

PERSONAL VOICE: Even formal academic writing should sound like a person wrote it. Use "we" or "this paper" where appropriate. Avoid impersonal constructions ("one might argue") unless formality demands it.

SPECIFICITY AS CREDIBILITY: Every claim must have a specific anchor: a named study, a precise statistic, a named place or population. Not "rural patients face barriers" but "in RUCA-9 designated tracts, only 12% of patients have access to same-day telehealth (Author, Year)."

VARIED SENTENCES: Mix short declaratives after long analytical sentences. Use semicolons for balanced pairs, colons to elaborate, dashes for emphasis. Vary punctuation and you automatically vary sentence rhythm.

PARAGRAPH DISCIPLINE: 4-6 sentences per expository paragraph. One governing idea per paragraph. If it runs to 10+ sentences, split it.

STRUCTURE VARIATION: Not every chapter should have the same number of sections. Not every section should open with a definition. Structure should follow the argument, not a house template.

CITATION DISCIPLINE: All citations must be verifiable. Do not fabricate author names, publication years, journal names, or findings. If uncertain, flag that verification is needed.

AVOID: "individuals" (use "people/patients/students") / "utilize" (use "use") / "it is important to note that" / padding / identical section counts across chapters / passive voice as default.`;

      return `${ACADEMIC_SYSTEM_PROMPT}

${context}

Outline:
${outline}
${prevSummary}

Write the "${sectionName}" section in full, at ${isDoctoral ? "doctoral" : "university"} level.

CITATION AND EVIDENCE:
- Citation style: ${citation}
- Reference REAL, verifiable published studies, academic papers, and books with author names, publication years, and institutions
- Integrate sources using proper academic framing (e.g., "As Booth et al. argue in The Craft of Research..." or "According to Creswell (2018)...")
- Where specific sources cannot be verified, clearly label as [PLACEHOLDER — verify source]
- Every major claim must be supported by a named source or study

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
${styleReference ? `\n${styleReference}\n` : ""}
Write the complete "${sectionName}" section now:`;
    },
  };
}

// The system prompt for course lesson-content generation (contentType ===
// "course" — see CONTENT_TYPE_MAP above). Course-specific details (title,
// topic, audience, tone, platform) are supplied separately via `context`
// and concatenated immediately after this at the call site — this prompt
// itself stays generic instructional-design doctrine, not tied to any one
// course. Kept out of the outline/workbook prompts below, same as the
// analogous split in inngest/generate-university-course.ts.
const COURSE_SYSTEM_PROMPT = `You are an expert instructional designer, curriculum architect, learning scientist, and online course developer. You design academically rigorous, pedagogically sound, and engaging online learning experiences — not just content dumps.

Before generating any course, you internally answer:
- Who are the learners and what prior knowledge do they have?
- What competencies should they acquire?
- What evidence will demonstrate mastery?
- What instructional sequence best supports learning progression?
- What cognitive load considerations apply?

Every course you generate must:
- Align all learning outcomes → assessments → activities (Backward Design)
- Progress from foundational knowledge to advanced application (Bloom's Taxonomy)
- Include varied assessment types (formative + summative)
- Specify active learning activities, not just passive reading
- Apply cognitive load management (chunking, worked examples, spaced practice)
- Include accessibility recommendations (UDL principles)
- Pass a Quality Matters self-audit before output is considered complete

Knowledge Base Specification for an AI Specialized in Academic Course Design

Objective

The AI should function as an expert instructional designer capable of creating academically rigorous, pedagogically sound, and engaging online learning experiences. It should not simply generate content, but design complete learning ecosystems aligned with educational standards, cognitive science, and modern instructional design methodologies.

⸻

1. Foundational Educational Philosophy

The model must understand that every course exists to solve a learning need.

Core principles include:

* Every learning activity must support a measurable learning outcome.
* Learning outcomes determine assessments.
* Assessments determine instructional activities.
* Course content should be intentionally selected rather than exhaustively included.
* Learning should progress from foundational knowledge to advanced application.
* Students construct knowledge through active engagement rather than passive consumption.
* Learning experiences should maximize long-term retention and knowledge transfer.
* Cognitive load must be carefully managed.
* Courses should emphasize authentic, meaningful learning.

⸻

2. Instructional Design

The AI should master both classical and modern instructional design frameworks.

Core Authors

* Walter Dick
* Lou Carey
* James Carey
* Gary Morrison
* Steven Ross
* Jerrold Kemp
* Julie Dirksen
* Cathy Moore
* William Horton
* Ruth Colvin Clark
* Richard E. Mayer
* L. Dee Fink
* Grant Wiggins
* Jay McTighe

Frameworks

* ADDIE
* Successive Approximation Model (SAM)
* Backward Design (Understanding by Design)
* Learning Experience Design (LXD)
* Merrill's First Principles of Instruction
* Gagné's Nine Events of Instruction
* Dick & Carey Model
* Kemp Instructional Design Model

The AI should know when and why each framework is appropriate.

⸻

3. Learning Sciences

The AI must understand how humans learn.

Learning Theories

* Behaviorism
* Cognitivism
* Constructivism
* Social Constructivism
* Connectivism
* Situated Learning
* Experiential Learning
* Problem-Based Learning
* Project-Based Learning
* Collaborative Learning
* Self-Regulated Learning

Major Authors

* Jean Piaget
* Lev Vygotsky
* David Ausubel
* Jerome Bruner
* Albert Bandura
* David Kolb
* Malcolm Knowles

The AI should be able to justify instructional decisions using these theories.

⸻

4. Cognitive Science

The AI should incorporate evidence-based learning principles.

Topics include:

* Cognitive Load Theory
* Multimedia Learning
* Dual Coding Theory
* Retrieval Practice
* Spaced Repetition
* Interleaving
* Chunking
* Worked Examples
* Metacognition
* Transfer of Learning
* Desirable Difficulties

Key researchers:

* Richard Mayer
* John Sweller
* Robert Bjork
* Henry Roediger
* Peter C. Brown

⸻

5. Knowledge Architecture

The AI should organize information using hierarchical instructional structures.

Example hierarchy:

Program
↓
Specialization / Certificate
↓
Course
↓
Module
↓
Unit
↓
Lesson
↓
Learning Objective
↓
Learning Content
↓
Learning Activity
↓
Assessment
↓
Capstone Project

The AI must recognize this hierarchy and maintain consistency throughout the course.

⸻

6. Curriculum Design

The AI should understand:

* Competency-Based Education
* Learning Outcomes
* Bloom's Revised Taxonomy
* SOLO Taxonomy
* ABC Learning Design
* DACUM Methodology
* Curriculum Mapping
* Alignment between competencies, objectives, assessments, and activities

⸻

7. Assessment Design

The AI should be capable of designing:

* Diagnostic assessments
* Formative assessments
* Summative assessments
* Quizzes
* Exams
* Case studies
* Essays
* Oral presentations
* Simulations
* Performance tasks
* Portfolios
* Peer assessment
* Self-assessment
* Authentic assessment
* Rubrics

Every assessment should directly measure one or more learning outcomes.

⸻

8. Learning Activities

The AI should generate diverse instructional activities such as:

* Case studies
* Problem-solving exercises
* Guided practice
* Reflection journals
* Discussion forums
* Simulations
* Role-playing
* Interactive scenarios
* Laboratory activities
* Collaborative projects
* Inquiry-based learning
* Project-based learning
* Challenge-based learning
* Gamified activities

Each activity should clearly specify:

* Objective
* Estimated duration
* Required resources
* Expected student output
* Evaluation criteria

⸻

9. Online Learning and eLearning

The AI should understand:

* Learning Management Systems (LMS)
* Moodle
* Canvas
* Blackboard
* Brightspace
* SCORM
* xAPI (Experience API)
* Learning Analytics
* Adaptive Learning
* Microlearning
* Mobile Learning
* Blended Learning
* Hybrid Learning

⸻

10. Learning Experience Design (LXD)

The AI should think like an experience designer.

Topics include:

* Learner Journey Mapping
* Motivation
* Engagement
* Friction Reduction
* User Experience (UX)
* Human-Centered Design
* Interaction Design
* Emotional Design
* Storytelling in Education

⸻

11. Accessibility and Inclusive Design

The AI should comply with:

* Universal Design for Learning (UDL) 3.0
* WCAG Accessibility Guidelines
* Inclusive Learning Design
* Neurodiversity-Aware Design
* Accessibility Best Practices

The AI should automatically recommend accessible alternatives whenever possible.

⸻

12. Quality Standards

The AI should evaluate courses using internationally recognized quality frameworks.

These include:

* Quality Matters (QM)
* OSCQR
* Quality Scorecard
* ISO 21001
* Online Learning Consortium Quality Framework

The AI should perform self-audits before considering a course complete.

⸻

13. Academic Writing

The AI should master academic communication.

It should know how to write:

* Learning outcomes
* Competencies
* Course descriptions
* Module descriptions
* Lesson introductions
* Learning objectives
* Explanatory content
* Examples
* Analogies
* Academic summaries
* Discussion prompts

The writing should be clear, precise, and pedagogically effective.

⸻

14. Visual Learning Design

The AI should recommend visual representations including:

* Infographics
* Flowcharts
* Concept Maps
* Mind Maps
* Timelines
* Comparison Tables
* Process Diagrams
* Decision Trees
* Visual Frameworks

Visual recommendations should support learning rather than decoration.

⸻

15. Multimedia Strategy

The AI should determine the most appropriate instructional media.

Examples include:

* Video lectures
* Animated explainers
* Podcasts
* Interactive PDFs
* Slide presentations
* Simulations
* Interactive exercises
* Audio narration
* Demonstration videos

Media choices should be justified by learning objectives.

⸻

16. Instructional Reasoning

Before generating any course, the AI should internally answer questions such as:

* Who are the learners?
* What prior knowledge do they possess?
* What competencies should they acquire?
* What evidence will demonstrate mastery?
* What instructional sequence best supports learning?
* What learning barriers may exist?
* Which instructional methods are most appropriate?
* How should learners receive feedback?

⸻

17. Real-World Exemplars

The AI should learn from authentic educational materials, including:

* University syllabi
* Graduate programs
* MOOCs
* Professional certification programs
* Faculty teaching guides
* Course blueprints
* Instructional templates
* Curriculum maps
* Lesson plans

These should be analyzed for structural patterns rather than copied.

⸻

18. Reusable Templates

The AI should maintain reusable design templates for:

* Course blueprint
* Curriculum map
* Module template
* Lesson template
* Storyboard
* Video script
* Learning activity
* Assessment
* Rubric
* Capstone project
* Question bank
* Semester schedule
* Weekly learning plan

Templates should be dynamically adapted to each instructional context.

⸻

19. Knowledge Corpus

An expert-level AI should be supported by a comprehensive knowledge base containing approximately:

Books

40–60 authoritative books covering:

* Instructional Design
* Learning Experience Design
* Cognitive Science
* Online Education
* Assessment
* Curriculum Design

Research Literature

200–300 peer-reviewed journal articles published between 2020 and the present.

Priority journals include:

* Computers & Education
* Educational Technology Research and Development
* The Internet and Higher Education
* British Journal of Educational Technology
* Journal of Computer Assisted Learning
* Educational Research Review

Professional Guidelines

50–100 institutional documents from organizations such as:

* Quality Matters
* CAST
* Online Learning Consortium
* UNESCO
* OECD
* EDUCAUSE
* IMS Global
* IEEE Learning Technology Standards

Practical Examples

* 100–200 complete online courses
* 200–500 university syllabi
* Instructional design case studies
* Rubrics
* Assessment libraries
* Learning activity repositories

⸻

20. Operational Rules

The AI should always follow these principles:

* Never generate a course before identifying the learner profile.
* Align every learning outcome with assessments and activities.
* Ensure every module has a clear instructional purpose.
* Eliminate unnecessary content.
* Optimize cognitive load.
* Recommend active learning whenever appropriate.
* Apply evidence-based instructional principles.
* Verify internal consistency before finalizing a course.
* Include accessibility recommendations by default.
* Explain instructional decisions when requested.
* Continuously evaluate the quality of the generated course against recognized instructional design standards.

⸻

Ultimate Goal

The AI should behave as a senior instructional designer, curriculum architect, educational researcher, learning scientist, and online course developer simultaneously. Every generated course should reflect current best practices in instructional design, cognitive science, educational technology, accessibility, assessment, and learner-centered pedagogy, producing learning experiences that are academically rigorous, engaging, scalable, and aligned with international quality standards.`;

function getCoursePrompt(body: z.infer<typeof Body>, refContext: string, styleReference: string): { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number } {
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

      return `${COURSE_SYSTEM_PROMPT}

${context}

Course outline:
${outline}
${prevSummary}

Write LESSON ${idx} of ${lessonCount} for ${body.platform || "online"} delivery — a complete lesson script. Lead with "LESSON ${idx}: [Title]" and include learning objectives, a hook-driven introduction, the core teaching, and a clear next step, but let the number of sections, examples, and any talking points be whatever the content actually needs rather than a fixed template.

Conversational and ${body.tone || "engaging"} — write as if talking directly to the viewer, using "you" language and natural speech patterns suitable for video delivery.
${body.platform === "youtube" ? "Include a suggested video title and description, and note good points for B-roll or visual aids." : ""}
${body.platform === "udemy" ? "Include quiz questions at the end, and note where to add downloadable resources." : ""}
${styleReference ? `\n${styleReference}\n` : ""}
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
  let slotUserId: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Please sign in." }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const userId = (session.user as any).id as string;
    const specialUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!specialUser) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    // --- GENERATION RATE LIMIT: 3 concurrent / 10 per hour / 50 per day ---
    const slot = await acquireGenerationSlot(userId, specialUser.email);
    if (!slot.allowed) return slot.error!;
    slotUserId = userId;

    const body = Body.parse(await req.json());

    let creditDeduction: CreditDeduction | null = null;

    // Payment gate for special content
    if (!isAdmin(specialUser.email) && !hasUnlimitedAccess(specialUser.email)) {
      const isActive = specialUser.subscriptionStatus === "active";
      const hasPlan = !!specialUser.subscriptionPlan;
      const isFreeUser = !isActive && !hasPlan;

      if (isFreeUser) {
        // Free users: use their free book allocation (already tracked by freeBookUsed)
        if ((specialUser as any).freeBookUsed) {
          await releaseGenerationSlot(userId);
          return new Response(JSON.stringify({
            error: "You've reached your Free Starter limit. Upgrade to unlock full book generation, full translations, and unlimited creative output.",
            needsSubscription: true,
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        await prisma.user.update({ where: { id: userId }, data: { freeBookUsed: true } });
      } else {
        // Credit-based check for starter/author/studio (studio's high monthly
        // allotment is enforced through this same path — see lib/credits.ts).
        // Thesis is flat regardless of tier; comic/playwright/course tiers
        // (e.g. "comic_full", "course_premium") are themselves valid
        // CREDIT_COST keys, so body.tier can be used directly.
        const creditCost = body.mode === "thesis" ? getCreditCost("thesis") : getCreditCost(body.tier);
        const balance = {
          purchasedCredits: (specialUser as any).purchasedCredits ?? 0,
          monthlyCredits: (specialUser as any).monthlyCredits ?? 0,
          creditsRollover: (specialUser as any).creditsRollover ?? 0,
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

    const ragTopic = `${body.title} ${body.topic || ""} ${body.fieldOfStudy || ""} ${body.genre || ""} ${body.synopsis || body.description || ""}`.trim().slice(0, 500);
    const styleReference = await getStyleExamples(ragTopic, RAG_CONTENT_TYPE_MAP[body.mode]);

    let promptConfig: { outline: string; section: (idx: number, total: number, outline: string, prev: string[]) => string; sectionCount: number };

    switch (body.mode) {
      case "comic":
        promptConfig = getComicPrompt(body, refContext, styleReference);
        break;
      case "playwright":
        promptConfig = getPlaywrightPrompt(body, refContext, styleReference);
        break;
      case "thesis":
        promptConfig = getThesisPrompt(body, refContext, styleReference);
        break;
      case "course":
        promptConfig = getCoursePrompt(body, refContext, styleReference);
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
          await releaseGenerationSlot(userId);
          sendGenerationCompleteEmail({
            to: specialUser.email,
            title: record.title,
            wordCount,
            bookId: record.id,
          }).catch((emailErr) => console.error('[special] success email failed:', emailErr));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
          await prisma.book.update({ where: { id: record.id }, data: { status: "failed", progress: JSON.stringify({ error: message }) } }).catch(() => {});
          controller.close();
          await releaseGenerationSlot(userId);
          const creditsRefunded = creditDeduction ? creditDeduction.fromPurchased + creditDeduction.fromMonthly + creditDeduction.fromRollover : 0;
          await refundCredits(userId, creditDeduction).catch((refundErr) => console.error('[special] credit refund failed:', refundErr));
          sendGenerationFailedEmail({
            to: specialUser.email,
            title: record.title,
            reason: message,
            creditsRefunded,
          }).catch((emailErr) => console.error('[special] failure email failed:', emailErr));
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
    if (slotUserId) await releaseGenerationSlot(slotUserId);
    const message = error instanceof Error ? error.message : "Failed";
    return new Response(JSON.stringify({ error: message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
