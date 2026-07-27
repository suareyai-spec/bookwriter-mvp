"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Tier {
  label: string;
  price?: number;
  credits?: number;
}

interface Mode {
  key: string;
  title: string;
  description: string;
  includes: string[];
  tiers: Tier[];
  color: string;
}

const MODES: Mode[] = [
  {
    key: "thesis",
    title: "Research & Thesis Assistant",
    description:
      "Organize research, develop outlines, and get citation formatting assistance for academic work — proper structure, formal university-level tone, and logical argumentation. Drafting assistance, not a submit-ready thesis.",
    includes: [
      "Abstract, introduction, literature review",
      "Methodology, discussion, conclusion",
      "Citation formatting assistance (APA / MLA / Chicago)",
      "Reference list with sources",
      "Formal academic tone throughout",
    ],
    tiers: [
      { label: "Standard", price: 199 },
      { label: "Advanced Research Project", price: 299 },
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
  {
    key: "university-course",
    title: "University Course",
    description:
      "A full 12-15 week accredited-style academic course for online asynchronous delivery, modeled after Harvard DCE's course structure — syllabus, weekly lectures, discussion prompts, and a complete assessment package with rubrics.",
    includes: [
      "Full syllabus — objectives, grading, policies",
      "Week-by-week outline with Bloom's-mapped objectives",
      "2,000-4,000 word lecture per week, discussion prompts & readings",
      "Quizzes with answer keys, midterm, final, and rubrics",
      "15-25 min generation — this is a full semester course",
    ],
    tiers: [
      { label: "12-15 week course", credits: 45 },
    ],
    color: "indigo",
  },
  {
    key: "whitepaper",
    title: "White Papers & Reports",
    description:
      "Publish-ready white papers, industry reports, and executive briefs that establish your authority — structured, evidence-based, and written for decision-makers.",
    includes: [
      "Executive summary + structured outline",
      "Section-by-section body content",
      "Conclusion, recommendations & references",
      "Citation formatting assistance (APA / Chicago)",
      "PDF & Word export",
    ],
    tiers: [
      { label: "White paper / report", credits: 8 },
    ],
    color: "slate",
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
  indigo: {
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/5",
    text: "text-indigo-400",
    badge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    button: "from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-500/20",
  },
  slate: {
    border: "border-slate-400/30",
    bg: "bg-slate-400/5",
    text: "text-slate-300",
    badge: "bg-slate-400/20 text-slate-300 border-slate-400/30",
    button: "from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-slate-500/20",
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
              Go beyond books. Generate research assistance, online courses, university courses, and professional white papers — all powered by AI.
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
                          <span className="text-white font-bold">
                            {tier.credits != null ? `${tier.credits} credits` : `$${tier.price}`}
                          </span>
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
