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
  monthlyCredits: number;
  purchasedCredits: number;
  totalCredits: number;
}

function PricingContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const creditsPurchased = searchParams.get("credits_purchased");

  useEffect(() => {
    if (status === "authenticated" && session?.user && !success && !canceled && !creditsPurchased) {
      router.replace("/account?tab=billing");
      return;
    }
  }, [status, session, router, success, canceled, creditsPurchased]);

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

  async function manageSubscription() {
    setLoading("portal");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(null);
  }

  async function buyPack(packId: string) {
    if (!session?.user) {
      window.location.href = "/auth/signup";
      return;
    }
    setLoading(packId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "credit_pack", packId }),
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

  const currentPlan = usage?.subscriptionPlan;
  const isActive = usage?.subscriptionStatus === "active";

  const plans = [
    {
      key: "starter",
      name: "Starter",
      price: 19,
      credits: 25,
      color: "emerald",
      features: [
        "25 credits/month",
        "Short, Medium & Standard books",
        "Courses & all special formats",
        "Unused credits roll over (up to 50)",
        "PDF & DOCX export",
      ],
    },
    {
      key: "author",
      name: "Author",
      price: 49,
      credits: 50,
      color: "blue",
      popular: true,
      features: [
        "50 credits/month",
        "All book sizes including Epic & Long",
        "Priority generation queue",
        "Unused credits roll over (up to 100)",
        "All formats & export options",
      ],
    },
    {
      key: "studio",
      name: "Studio",
      price: 99,
      credits: 999,
      color: "purple",
      features: [
        "999 credits/month — generous fair-use limits",
        "All book sizes & special formats",
        "Highest priority queue",
        "2 concurrent generations",
        "All export formats",
        "Fair use policy applies",
      ],
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

  const creditCosts = [
    { label: "Short book (10k words)", cost: 5 },
    { label: "Medium book (25k words)", cost: 10 },
    { label: "Standard book (50k words)", cost: 16 },
    { label: "Long book (75k words)", cost: 22 },
    { label: "Epic book (100k words)", cost: 30 },
    { label: "Thesis / Course", cost: 16 },
    { label: "Comic / Play", cost: 8 },
    { label: "Article / Newsletter", cost: 2 },
    { label: "Translation", cost: 4 },
  ];

  const creditPacks = [
    { id: "pack_15", label: "15 credits", price: 12, perCredit: "0.80" },
    { id: "pack_35", label: "35 credits", price: 25, perCredit: "0.71" },
    { id: "pack_75", label: "75 credits", price: 49, perCredit: "0.65" },
  ];

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
              Credit-based pricing. Pay for what you generate. Unused credits roll over every month.
            </p>
          </div>

          {/* Status messages */}
          {success && (
            <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-center">
              Subscription activated successfully. Welcome aboard!
            </div>
          )}
          {creditsPurchased && (
            <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-center">
              Credits added to your account successfully!
            </div>
          )}
          {canceled && (
            <div className="mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-yellow-400 text-center">
              Checkout was canceled. No charges were made.
            </div>
          )}

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
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
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    <div className={`text-sm mt-1 ${colors.text}`}>
                      {plan.credits} credits/month
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${colors.badge}`}>
                          &#10003;
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {!session ? (
                    <Link
                      href="/auth/signup"
                      className={`w-full text-center bg-gradient-to-r text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg ${colors.button} block`}
                    >
                      Get Started
                    </Link>
                  ) : isCurrent ? (
                    <button
                      onClick={manageSubscription}
                      disabled={loading === "portal"}
                      className="w-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white font-semibold rounded-xl p-3.5 transition-all"
                    >
                      {loading === "portal" ? "Loading..." : "Manage"}
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

          {/* What do credits buy */}
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 mb-16">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                What do credits buy?
              </h2>
              <p className="text-gray-400 mt-2">
                Each content type costs a fixed number of credits. Credits never expire.
              </p>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full max-w-lg mx-auto text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/[0.06]">
                    <th className="text-left py-3 px-3">Content type</th>
                    <th className="text-right py-3 px-3">Credits</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {creditCosts.map((row) => (
                    <tr key={row.label} className="border-b border-white/[0.04]">
                      <td className="py-3 px-3">{row.label}</td>
                      <td className="text-right py-3 px-3 font-semibold text-white">{row.cost} cr</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top up your credits */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Top up your credits
              </h2>
              <p className="mt-3 text-gray-400 max-w-xl mx-auto">
                Need more credits? Buy a pack any time. Purchased credits never expire and are used first.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {creditPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center text-center"
                >
                  <div className="text-3xl font-bold text-white mb-1">{pack.label}</div>
                  <div className="text-4xl font-bold mt-2">${pack.price}</div>
                  <div className="text-xs text-gray-500 mt-1">${pack.perCredit} per credit</div>
                  <div className="text-xs text-gray-500 mt-1">one-time purchase</div>
                  <button
                    onClick={() => buyPack(pack.id)}
                    disabled={loading === pack.id}
                    className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl p-3 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {loading === pack.id ? "Loading..." : "Buy Now"}
                  </button>
                </div>
              ))}
            </div>
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
                  key: "premium-playwright",
                  emoji: "🎭",
                  title: "Premium Play",
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
                  title: "Full Influencer Course Builder Pro",
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
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">&#10003;</span>
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
                <li className="flex items-start gap-2"><span className="text-purple-400">&#10003;</span> Individual login per member</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">&#10003;</span> Shared workspace access</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">&#10003;</span> Project collaboration permissions</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">&#10003;</span> Studio subscription required</li>
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

          {/* How it works */}
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 mb-16">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              How it works
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">📖</span>
                <span>Each book generation costs credits based on length and format</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">🔄</span>
                <span>Unused monthly credits roll over (Starter: up to 50, Author: up to 100)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">💰</span>
                <span>Purchased credits are used first and never expire</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">♾️</span>
                <span>Studio plan includes 999 credits/month — generous fair-use limits</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">⚡</span>
                <span>1 generation at a time (Studio: 2 concurrent)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">🛡️</span>
                <span>Fair use applies to prevent automation abuse</span>
              </div>
            </div>
          </div>
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
