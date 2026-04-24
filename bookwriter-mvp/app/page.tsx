import Link from "next/link";
import Navbar from "@/components/Navbar";

const CREATION_MODES = [
  {
    title: "Books",
    href: "/create",
    description: "Full-length books in any genre. Fiction, non-fiction, romance, educational. Chapter-by-chapter AI generation with streaming progress.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: "Comic Books",
    href: "/special/comic",
    description: "Panel-by-panel comic scripts with dialogue, scene descriptions, and character direction. Ready for illustrators.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
  },
  {
    title: "Plays & Theater",
    href: "/special/playwright",
    description: "Full theatrical scripts with acts, scenes, stage directions, and natural dialogue.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
  },
  {
    title: "Newsletters & Articles",
    href: "/articles",
    description: "SEO-optimized articles, news pieces, opinion editorials, how-to guides, newsletters, and professional content.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
  },
  {
    title: "Academic Theses",
    href: "/special/thesis",
    description: "University-level thesis drafts with proper structure, citations (APA/MLA/Chicago), and references.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    title: "Online Courses",
    href: "/special/course",
    description: "Lesson-by-lesson course scripts with talking points, engagement prompts, and workbook outlines.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: "Smart Revisions",
    description: "Only rewrite what needs changing. Our AI analyzes your instructions and updates only the affected chapters.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    title: "Translation",
    description: "Translate your entire work into 10 languages with one click. Professional-quality, not machine translation.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
  },
  {
    title: "Series & Trilogies",
    description: "Create connected book series with narrative continuity. From duologies to 5-book sagas.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
      </svg>
    ),
  },
  {
    title: "Reference Materials",
    description: "Upload PDFs, paste Google Docs links, or add notes. Your AI writes informed by your research.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    title: "Multiple Export Formats",
    description: "Download as PDF or DOCX. Professional formatting, title pages, and page numbers included.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    title: "Edit & Version History",
    description: "Edit your work directly or let AI revise it. Every version is saved — go back anytime.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const STATS = [
  { value: "10+", label: "Languages Supported" },
  { value: "5", label: "Content Modes" },
  { value: "Live", label: "Chapter-by-Chapter Streaming" },
  { value: "Auto", label: "Professional Citations" },
];

const CITATION_STYLES = ["AMA", "APA", "Bluebook", "IEEE", "Chicago", "Harvard"];

const PLANS_PREVIEW = [
  { name: "Starter", price: "$35", feature: "1 Short Book per month", color: "emerald" },
  { name: "Author", price: "$79", feature: "3 Short OR 2 Medium books/mo", color: "blue", popular: true },
  { name: "Pro Author", price: "$149", feature: "Unlimited standard books", color: "purple" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white selection:bg-blue-500/30">
      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-20 pb-8 px-4 text-center max-w-5xl mx-auto">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Create Any Written Work
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              with AI
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            From idea to finished book in minutes. Generate full-length books, scripts, theses, and courses with professional formatting and export-ready quality.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl px-8 py-3.5 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 text-lg"
            >
              Start Free — No Credit Card Required
            </Link>
            <Link
              href="/pricing"
              className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] text-white font-semibold rounded-xl px-8 py-3.5 transition-all text-lg"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">Free Starter includes 1 short book, 2 translations, and access to all creation modes.</p>
        </section>

        {/* Creation Modes Section */}
        <section className="py-12 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400/70 mb-4">Creation Modes</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Whatever you write, Plot Ghost helps
              <br className="hidden sm:block" />
              you finish it faster.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CREATION_MODES.map((mode) => (
              <Link
                key={mode.title}
                href={mode.href}
                className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-6 transition-all duration-300"
              >
                <div className="text-blue-400/80 mb-4 group-hover:text-blue-400 transition-colors">{mode.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{mode.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{mode.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400/70 mb-4">Powerful Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Everything you need to write better, faster.
            </h2>
          </div>
          <div className="space-y-12">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={`flex flex-col sm:flex-row items-start gap-8 ${i % 2 === 1 ? "sm:flex-row-reverse" : ""}`}
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/[0.06] flex items-center justify-center text-blue-400">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Citation Styles Section */}
        <section className="py-12 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400/70 mb-4">Academic Excellence</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Auto-detected citation styles for every field
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Professional citations generated automatically in the format your discipline requires.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {CITATION_STYLES.map((style) => (
              <div
                key={style}
                className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-6 py-3 text-sm font-medium text-gray-300"
              >
                {style}
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="py-12 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400/70 mb-4">Plans & Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {PLANS_PREVIEW.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white/[0.02] border rounded-2xl p-6 text-center transition-all ${
                  plan.popular ? "border-blue-500/30 ring-1 ring-blue-500/20" : "border-white/[0.06]"
                }`}
              >
                {plan.popular && (
                  <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Most Popular</div>
                )}
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold mb-1">{plan.price}</div>
                <div className="text-xs text-gray-500 mb-4">/month</div>
                <p className="text-sm text-gray-400">{plan.feature}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              View All Plans
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Ready to create?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Start free — no credit card required. Explore the engine before publishing your full work.
          </p>
          <Link
            href="/auth/signup"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl px-10 py-4 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 text-lg inline-block"
          >
            Get Started Free
          </Link>
        </section>
      </div>
    </main>
  );
}
