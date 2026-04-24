"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

interface UsageData {
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  monthlyBooksUsed: number;
  monthlyCreditsTotal: number;
  monthlyCreditsRemaining: number;
  revisionCount: number;
  monthlyRevisionLimit: number;
  revisionsRemaining: number;
  monthlyNewslettersUsed: number;
  monthlyNewsletterLimit: number;
}

function PricingContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/account?tab=billing");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/usage").then((r) => r.json()).then(setUsage);
    }
  }, [session]);

  async function subscribe(plan: string) {
    if (!session?.user) {
      window.location.href = "/auth/signup";
      return;
    }
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription", plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error || "Something went wrong. Please try again.");
    } catch {
      alert("Connection error. Please try again.");
    }
    setLoading(null);
  }

  async function buyCredit(creditSize: string) {
    if (!session?.user) {
      window.location.href = "/auth/signup";
      return;
    }
    setLoading(creditSize);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "credit", creditSize }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error || "Something went wrong. Please try again.");
    } catch {
      alert("Connection error. Please try again.");
    }
    setLoading(null);
  }

  async function manageSubscription() {
    setLoading("portal");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(null);
  }

  const currentPlan = usage?.subscriptionPlan;
  const isActive = usage?.subscriptionStatus === "active";

  const plans = [
    {
      key: "free",
      name: "Free Starter",
      price: 0,
      color: "gray",
      features: [
        "1 Short Book (10,000 words max) — 1 revision total",
        "2 short translations monthly (~3,000 words each)",
        "2 newsletters monthly",
        "2 articles monthly (short only)",
        "PDF/DOCX export",
      ],
      extras: "No credit card required",
      newsletterExtra: "One-time allocation, not monthly",
      freeStarter: true,
    },
    {
      key: "creator",
      name: "Creator",
      price: 99,
      color: "emerald",
      features: [
        "1 Short or 1 Medium book/month",
        "10 newsletters/month",
        "Unlimited short-text translation",
        "30 revisions/month",
        "All formats (play, comic, course, thesis)",
        "1 concurrent generation",
      ],
      extras: "Additional: Short $129 · Medium $179 · Standard $249",
      newsletterExtra: "Extra newsletters: $5 each",
    },
    {
      key: "author-pro",
      name: "Author Pro",
      price: 199,
      color: "blue",
      popular: true,
      features: [
        "1 Standard book/month (~60K words)",
        "30 newsletters/month",
        "Unlimited short-text translation",
        "Unlimited revisions (fair use)",
        "Priority generation queue",
        "All formats unlocked",
        "1 concurrent generation",
      ],
      extras: "Additional: Short $99 · Medium $149 · Standard $199",
      newsletterExtra: "Extra newsletters: $4 each",
      equivalency: "1 Standard = 1 Medium + 1 Short = 3 Short",
    },
    {
      key: "studio",
      name: "Studio",
      price: 349,
      color: "purple",
      features: [
        "1 Standard + 1 Medium book/month",
        "Unlimited newsletters (fair use)",
        "Unlimited translation incl. full-book",
        "Unlimited revisions",
        "Highest priority queue",
        "2 concurrent generations",
        "All formats unlocked",
      ],
      extras: "Additional: Short $79 · Medium $129 · Standard $179",
      equivalency: "Flexible combos: 2 Medium + 1 Short, etc.",
    },
  ];

  const colorMap: Record<string, { border: string; bg: string; text: string; badge: string; button: string }> = {
    gray: {
      border: "border-gray-500/30",
      bg: "bg-gray-500/5",
      text: "text-gray-400",
      badge: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      button: "from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 shadow-gray-500/20",
    },
    emerald: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      text: "text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      button: "from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-500/20",
    },
    blue: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      text: "text-blue-400",
      badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      button: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20",
    },
    purple: {
      border: "border-purple-500/30",
      bg: "bg-purple-500/5",
      text: "text-purple-400",
      badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      button: "from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-purple-500/20",
    },
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Choose your plan
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
              Professional AI book generation, newsletters, translation, and more. Every plan includes all formats.
            </p>
          </div>

          {/* Status messages */}
          {success && (
            <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-center">
              Subscription activated successfully. Welcome aboard!
            </div>
          )}
          {canceled && (
            <div className="mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-yellow-400 text-center">
              Checkout was canceled. No charges were made.
            </div>
          )}

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plans.map((plan) => {
              const colors = colorMap[plan.color];
              const isCurrent = currentPlan === plan.key && isActive;

              return (
                <div
                  key={plan.key}
                  className={`relative bg-white/[0.03] backdrop-blur-sm border rounded-2xl p-6 flex flex-col ${
                    plan.popular ? colors.border + " " + colors.bg : "border-white/[0.06]"
                  }`}
                >
                  {plan.popular && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold border rounded-full px-3 py-1 ${colors.badge}`}>
                      Most Popular
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 right-4 text-xs font-semibold bg-white/10 text-white border border-white/20 rounded-full px-3 py-1">
                      Current Plan
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${colors.text.replace("text-", "bg-")}`} />
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                      {plan.price > 0 && <span className="text-gray-500">/month</span>}
                      {plan.price === 0 && <span className="text-gray-500">forever</span>}
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-4 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${colors.badge}`}>
                          &#10003;
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Extra pricing info */}
                  <div className="mb-6 bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] space-y-1">
                    <div className="text-xs text-gray-400">{plan.extras}</div>
                    {plan.newsletterExtra && <div className="text-xs text-gray-500">{plan.newsletterExtra}</div>}
                    {plan.equivalency && <div className="text-xs text-gray-500 italic">{plan.equivalency}</div>}
                  </div>

                  {(plan as any).freeStarter ? (
                    <Link
                      href="/auth/signup"
                      className={`w-full text-center bg-gradient-to-r text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg ${colors.button} block`}
                    >
                      Get Started Free
                    </Link>
                  ) : !session ? (
                    <Link
                      href="/auth/signup"
                      className={`w-full text-center bg-gradient-to-r text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg ${colors.button}`}
                    >
                      Get Started
                    </Link>
                  ) : isCurrent ? (
                    <button
                      onClick={manageSubscription}
                      disabled={loading === "portal"}
                      className="w-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white font-semibold rounded-xl p-3.5 transition-all"
                    >
                      {loading === "portal" ? "Loading..." : "Manage Subscription"}
                    </button>
                  ) : (
                    <button
                      onClick={() => subscribe(plan.key)}
                      disabled={loading === plan.key}
                      className={`w-full bg-gradient-to-r text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg ${colors.button} disabled:opacity-50`}
                    >
                      {loading === plan.key ? "Loading..." : "Subscribe"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Premium Packages */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Premium Packages
              </h2>
              <p className="mt-3 text-gray-400 max-w-xl mx-auto">
                One-time purchases for specialized, high-quality content generation.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  key: "doctoral-thesis",
                  emoji: "🎓",
                  title: "Doctoral-Level Thesis",
                  price: 499,
                  features: [
                    "Comprehensive academic thesis draft",
                    "Abstract, lit review, methodology, analysis, conclusion",
                    "Formal academic tone",
                    "Citation formatting (APA / MLA / Chicago)",
                    "Advanced argument flow",
                    "User responsible for final verification",
                  ],
                  color: "from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/20",
                },
                {
                  key: "premium-playwright",
                  emoji: "🎭",
                  title: "Premium Playwright",
                  price: 399,
                  features: [
                    "Complete theatrical script",
                    "Acts and scenes structure",
                    "Character-driven dialogue",
                    "Stage direction and pacing",
                    "Natural conversational flow",
                    "Performance-ready structure",
                  ],
                  color: "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/20",
                },
                {
                  key: "premium-comic",
                  emoji: "💥",
                  title: "Premium Comic Book Script",
                  price: 399,
                  features: [
                    "Full comic issue or arc",
                    "Panel-by-panel breakdown",
                    "Scene direction",
                    "Character voice consistency",
                    "Dialogue pacing & narrative continuity",
                    "Built for illustrators & production",
                  ],
                  color: "from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-500/20",
                },
                {
                  key: "course-builder-pro",
                  emoji: "📚",
                  title: "Full Course Builder Pro",
                  price: 399,
                  features: [
                    "10–20 fully structured lessons",
                    "Lesson scripts & engagement hooks",
                    "CTA framework",
                    "Module sequencing",
                    "Workbook outline",
                    "For creators, coaches, educators",
                  ],
                  color: "from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-500/20",
                },
                {
                  key: "multi-language-bundle",
                  emoji: "🌍",
                  title: "Multi-Language Expansion",
                  price: 249,
                  features: [
                    "Translate one completed project",
                    "Up to 3 additional languages",
                    "Full literary preservation",
                    "Uses advanced literary translation",
                    "Maintains tone & style across languages",
                  ],
                  color: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20",
                },
              ].map((pkg) => (
                <div
                  key={pkg.key}
                  className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 flex flex-col"
                >
                  <div className="text-3xl mb-3">{pkg.emoji}</div>
                  <h3 className="text-lg font-bold mb-1">{pkg.title}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">${pkg.price}</span>
                    <span className="text-gray-500">one-time</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={async () => {
                      if (!session?.user) { window.location.href = "/auth/signup"; return; }
                      setLoading(pkg.key);
                      try {
                        const res = await fetch("/api/special/checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ packageType: pkg.key }),
                        });
                        const data = await res.json();
                        if (data.url) { window.location.href = data.url; return; }
                        alert(data.error || "Something went wrong.");
                      } catch { alert("Connection error."); }
                      setLoading(null);
                    }}
                    disabled={loading === pkg.key}
                    className={`w-full bg-gradient-to-r text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg ${pkg.color} disabled:opacity-50`}
                  >
                    {loading === pkg.key ? "Loading..." : "Purchase"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Team Seats */}
          <div className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 mb-16">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                👥 Team Seat Add-On
              </h2>
              <p className="text-gray-400 mt-2">
                Add team members to your <span className="text-purple-400 font-semibold">Studio</span> subscription.
              </p>
            </div>
            <div className="max-w-lg mx-auto text-center">
              <div className="text-4xl font-bold mb-1">$10<span className="text-lg text-gray-500 font-normal">/seat/month</span></div>
              <ul className="text-sm text-gray-300 space-y-2 mt-4 text-left max-w-xs mx-auto">
                <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Individual login per member</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Shared workspace access</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Project collaboration permissions</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Studio subscription required</li>
              </ul>
              {session?.user ? (
                <Link
                  href="/account"
                  className="inline-block mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl px-8 py-3 transition-all shadow-lg shadow-purple-500/20"
                >
                  Manage Team →
                </Link>
              ) : (
                <Link
                  href="/auth/signup"
                  className="inline-block mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl px-8 py-3 transition-all shadow-lg shadow-purple-500/20"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>

          {/* Extra Book Prices Table */}
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 mb-16">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Additional Book Pricing
              </h2>
              <p className="text-gray-400 mt-2">
                Need more books beyond your monthly allocation? Credits never expire.
              </p>
            </div>

            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[400px] max-w-2xl mx-auto text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/[0.06]">
                    <th className="text-left py-3 px-2">Book Size</th>
                    <th className="text-center py-3 px-2">Creator</th>
                    <th className="text-center py-3 px-2">Author Pro</th>
                    <th className="text-center py-3 px-2">Studio</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-3 px-2">Short (~20k words)</td>
                    <td className="text-center py-3 px-2">$129</td>
                    <td className="text-center py-3 px-2">$99</td>
                    <td className="text-center py-3 px-2">$79</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-3 px-2">Medium (~40k words)</td>
                    <td className="text-center py-3 px-2">$179</td>
                    <td className="text-center py-3 px-2">$149</td>
                    <td className="text-center py-3 px-2">$129</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-3 px-2">Standard (~60k words)</td>
                    <td className="text-center py-3 px-2">$249</td>
                    <td className="text-center py-3 px-2">$199</td>
                    <td className="text-center py-3 px-2">$179</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-medium text-amber-400">Epic (~80k+ words)</td>
                    <td className="text-center py-3 px-2">$499</td>
                    <td className="text-center py-3 px-2">$499</td>
                    <td className="text-center py-3 px-2">$499</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Epic Books Section */}
          <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-8 mb-16">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                🏆 Epic Books
              </h2>
              <p className="text-gray-400 mt-2">
                80,000+ words of AI-generated content. Not included in any subscription — always a separate <span className="text-amber-400 font-semibold">$499</span> purchase.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Includes extended capacity, premium structure support. Epic translation: $299.
              </p>
            </div>

            {session && (
              <div className="text-center">
                <button
                  onClick={() => buyCredit("epic")}
                  disabled={loading === "epic"}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl px-8 py-3 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {loading === "epic" ? "Loading..." : "Buy Epic Book Credit — $499"}
                </button>
              </div>
            )}
          </div>

          {/* Global Rules */}
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 mb-16">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              How it works
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">📖</span>
                <span>1 Medium = 2 Short books in monthly quota</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">🔄</span>
                <span>Full-book translation counts as a book credit</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">✏️</span>
                <span>Rewriting &gt;70% of a book counts as a new book</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">♾️</span>
                <span>Credits never expire</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">⚡</span>
                <span>1 generation at a time (Studio: 2)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">🛡️</span>
                <span>Fair use applies to prevent automation abuse</span>
              </div>
            </div>
          </div>

          {/* Special Content Modes */}
          <div className="bg-gradient-to-br from-violet-500/5 to-rose-500/5 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-8 mb-16">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Special Content Modes
              </h2>
              <p className="text-gray-400 mt-2">
                All formats included with every plan. Generate comic scripts, plays, theses, and courses.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
              {[
                { label: "Comic Book", desc: "Full scripts with panels", color: "text-rose-400" },
                { label: "Playwright", desc: "Acts, scenes, stage directions", color: "text-amber-400" },
                { label: "Thesis", desc: "Academic with citations", color: "text-cyan-400" },
                { label: "Course Builder", desc: "Lessons & modules", color: "text-violet-400" },
              ].map((m) => (
                <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                  <div className={`text-sm font-semibold ${m.color}`}>{m.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{m.desc}</div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/special"
                className="bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 text-white font-semibold rounded-xl px-8 py-3 transition-all shadow-lg shadow-violet-500/20 inline-block"
              >
                Explore Special Modes
              </Link>
            </div>
          </div>

          {/* Extra Credits Section for active subscribers */}
          {isActive && currentPlan && (
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Need more books?
                </h2>
                <p className="text-gray-400 mt-2">
                  Buy additional book credits. Credits never expire and stack with your subscription.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
                {(() => {
                  const extras: Record<string, { size: string; label: string; price: number }[]> = {
                    creator: [
                      { size: "short", label: "Short Book", price: 129 },
                      { size: "medium", label: "Medium Book", price: 179 },
                      { size: "standard", label: "Standard Book", price: 249 },
                    ],
                    "author-pro": [
                      { size: "short", label: "Short Book", price: 99 },
                      { size: "medium", label: "Medium Book", price: 149 },
                      { size: "standard", label: "Standard Book", price: 199 },
                    ],
                    studio: [
                      { size: "short", label: "Short Book", price: 79 },
                      { size: "medium", label: "Medium Book", price: 129 },
                      { size: "standard", label: "Standard Book", price: 179 },
                    ],
                  };
                  const planExtras = extras[currentPlan] || extras.creator;
                  return planExtras.map((extra) => (
                    <button
                      key={extra.size}
                      onClick={() => buyCredit(extra.size)}
                      disabled={loading !== null}
                      className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-4 text-center transition-all disabled:opacity-50 w-[180px]"
                    >
                      <div className="text-sm font-medium text-gray-300">{extra.label}</div>
                      <div className="text-xl font-bold mt-1">${extra.price}</div>
                      <div className="text-xs text-gray-500 mt-1">one-time</div>
                    </button>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}
