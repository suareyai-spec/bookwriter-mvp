"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

interface UsageData {
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  monthlyBooksUsed: number;
  monthlyCreditsTotal: number;
  monthlyCreditsRemaining: number;
  creditCounts: Record<string, number>;
}

function PricingContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/usage").then((r) => r.json()).then(setUsage);
    }
  }, [session]);

  async function subscribe(plan: string) {
    setLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "subscription", plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(null);
  }

  async function buyCredit(creditSize: string) {
    setLoading(creditSize);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "credit", creditSize }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
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
      key: "starter",
      name: "Starter",
      price: 29,
      color: "emerald",
      features: [
        "1 Short Book per month",
        "Max 2 active projects",
        "Short books (10k words)",
        "PDF and DOCX export",
        "Revision support",
      ],
      extras: [
        { label: "Extra Short Book", price: 39 },
        { label: "Medium Book Credit", price: 79 },
        { label: "Standard Book Credit", price: 149 },
        { label: "Epic Book Credit", price: 249 },
      ],
    },
    {
      key: "author",
      name: "Author",
      price: 79,
      color: "blue",
      popular: true,
      features: [
        "2 Medium OR 3 Short Books/mo",
        "Max 5 active projects",
        "Short + Medium books",
        "PDF and DOCX export",
        "Revision support",
        "Flexible monthly credits",
      ],
      extras: [
        { label: "Extra Short Book", price: 29 },
        { label: "Extra Medium Book", price: 59 },
        { label: "Standard Book Credit", price: 99 },
        { label: "Epic Book Credit", price: 199 },
      ],
    },
    {
      key: "pro",
      name: "Pro Author",
      price: 149,
      color: "purple",
      features: [
        "2 Standard OR 4 Medium OR 6 Short/mo",
        "Unlimited active projects",
        "Short, Medium, Standard books",
        "PDF and DOCX export",
        "Revision support",
        "Flexible monthly credits",
        "Priority generation",
      ],
      extras: [
        { label: "Extra Standard Book", price: 79 },
        { label: "Epic Book Credit", price: 149 },
      ],
    },
  ];

  const colorMap: Record<string, { border: string; bg: string; text: string; badge: string; button: string }> = {
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

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Choose your plan
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
              Start writing professional books today. Every plan includes AI-powered generation, revisions, and export.
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

          {/* Epic Books Section */}
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 mb-16">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Epic Books
              </h2>
              <p className="text-gray-400 mt-2">
                100,000 words of AI-generated content. Available as a one-time credit on any plan.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { plan: "Starter", price: 249 },
                { plan: "Author", price: 199 },
                { plan: "Pro Author", price: 149 },
              ].map((tier) => (
                <div key={tier.plan} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-400 mb-1">{tier.plan} Plan</div>
                  <div className="text-2xl font-bold">${tier.price}</div>
                  <div className="text-xs text-gray-500 mt-1">per Epic Book</div>
                </div>
              ))}
            </div>

            {session && (
              <div className="text-center mt-6">
                <button
                  onClick={() => buyCredit("epic")}
                  disabled={loading === "epic"}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl px-8 py-3 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {loading === "epic" ? "Loading..." : "Buy Epic Book Credit"}
                </button>
              </div>
            )}
          </div>

          {/* Extra Credits Section */}
          {isActive && (
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Need more books?
                </h2>
                <p className="text-gray-400 mt-2">
                  Buy additional book credits. Credits never expire and stack with your subscription.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {plans
                  .find((p) => p.key === currentPlan)
                  ?.extras.filter((e) => !e.label.includes("Epic"))
                  .map((extra) => (
                    <button
                      key={extra.label}
                      onClick={() => {
                        const size = extra.label.toLowerCase().includes("short")
                          ? "short"
                          : extra.label.toLowerCase().includes("medium")
                          ? "medium"
                          : "standard";
                        buyCredit(size);
                      }}
                      disabled={loading !== null}
                      className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-4 text-center transition-all disabled:opacity-50"
                    >
                      <div className="text-sm font-medium text-gray-300">{extra.label}</div>
                      <div className="text-xl font-bold mt-1">${extra.price}</div>
                      <div className="text-xs text-gray-500 mt-1">one-time</div>
                    </button>
                  ))}
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
