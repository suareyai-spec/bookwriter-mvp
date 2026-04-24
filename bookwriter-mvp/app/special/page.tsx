"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

const MODES = [
  {
    key: "comic",
    title: "Comic Book",
    description:
      "Full comic script with panel-by-panel structure, dialogue, scene and character descriptions, and consistent character voice. Written for illustrators — writing only, no illustrations.",
    includes: [
      "Panel-by-panel script structure",
      "Dialogue per panel in speech bubble format",
      "Scene and character descriptions",
      "Consistent character voice throughout",
      "Written for illustrator handoff",
    ],
    tiers: [
      { label: "Single Issue", price: 99 },
      { label: "Full Story Arc", price: 249 },
    ],
    color: "rose",
  },
  {
    key: "playwright",
    title: "Playwright",
    description:
      "Full theatrical play with acts, scenes, character dialogue, and stage directions. Natural, lifelike conversational writing designed for the stage.",
    includes: [
      "Acts and scenes structure",
      "Character dialogue with natural flow",
      "Stage directions and blocking notes",
      "Lifelike conversational writing",
      "Theater-ready formatting",
    ],
    tiers: [
      { label: "Standard Play", price: 149 },
      { label: "Long Multi-Act Play", price: 249 },
    ],
    color: "amber",
  },
  {
    key: "thesis",
    title: "Educational / Thesis",
    description:
      "Full academic thesis draft with proper structure, formal university-level tone, logical argumentation, and correct citation formatting. Positioned as drafting assistance — not final submission.",
    includes: [
      "Abstract, introduction, literature review",
      "Methodology, discussion, conclusion",
      "Citation formatting (APA / MLA / Chicago)",
      "Reference list with sources",
      "Formal academic tone throughout",
    ],
    tiers: [
      { label: "Standard", price: 199 },
      { label: "Doctoral-Level", price: 299 },
    ],
    color: "cyan",
  },
  {
    key: "course",
    title: "Influencer Course Builder",
    description:
      "Full online course outline with lesson-by-lesson scripts, talking points for video delivery, and engagement prompts. For creators, coaches, and influencers. Writing and structure only.",
    includes: [
      "Full course outline and structure",
      "Lesson-by-lesson scripts",
      "Talking points for video delivery",
      "Calls-to-action and engagement prompts",
      "Conversational, audience-friendly tone",
    ],
    tiers: [
      { label: "Mini (5-7 lessons)", price: 99 },
      { label: "Full (10-20 lessons)", price: 199 },
      { label: "Premium + Workbook", price: 249 },
    ],
    color: "violet",
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; badge: string; button: string }> = {
  rose: {
    border: "border-rose-500/30",
    bg: "bg-rose-500/5",
    text: "text-rose-400",
    badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    button: "from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-500/20",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    button: "from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-amber-500/20",
  },
  cyan: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    text: "text-cyan-400",
    badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    button: "from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 shadow-cyan-500/20",
  },
  violet: {
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    text: "text-violet-400",
    badge: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    button: "from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 shadow-violet-500/20",
  },
};

export default function SpecialPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-cyan-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center mb-12">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Special Content Modes
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Go beyond books. Generate comic scripts, theatrical plays, academic theses, and online courses — all powered by AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {MODES.map((mode) => {
              const colors = colorMap[mode.color];
              return (
                <div
                  key={mode.key}
                  className={`bg-white/[0.03] backdrop-blur-sm border rounded-2xl p-6 flex flex-col ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${colors.text.replace("text-", "bg-")}`} />
                    <h2 className="text-xl font-bold">{mode.title}</h2>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{mode.description}</p>

                  <div className="mb-4 flex-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      What&apos;s Included
                    </div>
                    <ul className="space-y-1.5">
                      {mode.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${colors.badge}`}>
                            &#10003;
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4 bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Pricing
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {mode.tiers.map((tier) => (
                        <div key={tier.label} className="text-sm">
                          <span className="text-white font-bold">${tier.price}</span>
                          <span className="text-gray-500 ml-1">{tier.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/special/${mode.key}`}
                    className={`w-full text-center bg-gradient-to-r text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg ${colors.button}`}
                  >
                    Create {mode.title}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
