"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

interface AccountData {
  email: string;
  name: string | null;
  createdAt: string;
  isAdmin: boolean;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  subscriptionId: string | null;
  stripeCustomerId: string | null;
  monthlyBooksUsed: number;
  monthlyCreditsTotal: number;
  monthlyCreditsRemaining: number;
  monthlyResetDate: string | null;
  revisionCount: number;
  monthlyRevisionLimit: number;
  revisionsRemaining: number;
  creditCounts: Record<string, number>;
  totalCredits: number;
  monthlyArticlesUsed: number;
  monthlyArticleLimit: number;
  monthlyNewslettersUsed: number;
  monthlyNewsletterLimit: number;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free Starter",
  creator: "Creator",
  "author-pro": "Author Pro",
  studio: "Studio",
};

const PLAN_BADGE_STYLES: Record<string, string> = {
  free: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  creator: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "author-pro": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  studio: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const PLAN_PRICES: Record<string, number> = {
  creator: 99,
  "author-pro": 199,
  studio: 349,
};

function AccountContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "billing" ? "billing" : "account";
  const [activeTab, setActiveTab] = useState<"account" | "billing">(initialTab);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit name
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Cancel modal
  const [showCancel, setShowCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelDate, setCancelDate] = useState<string | null>(null);

  // Delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Action loading
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // Billing tab loading
  const [billingLoading, setBillingLoading] = useState<string | null>(null);

  // Team
  const [teamMembers, setTeamMembers] = useState<{ id: string; email: string; role: string; createdAt: string }[]>([]);
  const [teamEmail, setTeamEmail] = useState("");
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetchAccount();
      fetchTeam();
    }
  }, [status]);

  async function fetchTeam() {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
      }
    } catch {}
  }

  async function addTeamMember() {
    if (!teamEmail.trim()) return;
    setTeamLoading(true);
    setTeamError(null);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: teamEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setTeamEmail("");
        fetchTeam();
      } else {
        setTeamError(data.error || "Failed to add member");
      }
    } catch {
      setTeamError("Connection error");
    }
    setTeamLoading(false);
  }

  async function removeTeamMember(memberId: string) {
    try {
      await fetch(`/api/team/${memberId}`, { method: "DELETE" });
      fetchTeam();
    } catch {}
  }

  async function fetchAccount() {
    try {
      const res = await fetch("/api/account");
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
        setNameValue(data.name || "");
        // Check if subscription is set to cancel
        if (data.subscriptionId && data.subscriptionStatus === "canceling") {
          // We'll show the cancel date from Stripe subscription info
        }
      }
    } catch {}
    setLoading(false);
  }

  async function saveName() {
    setSavingName(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue }),
      });
      if (res.ok) {
        setAccount((prev) => prev ? { ...prev, name: nameValue.trim() || null } : prev);
        setEditingName(false);
      }
    } catch {}
    setSavingName(false);
  }

  async function handleCancel() {
    setCanceling(true);
    try {
      const res = await fetch("/api/account/cancel", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setCancelDate(data.cancelAt);
        setShowCancel(false);
        fetchAccount();
      }
    } catch {}
    setCanceling(false);
  }

  async function handleReactivate() {
    setActionLoading("reactivate");
    try {
      const res = await fetch("/api/account/reactivate", { method: "POST" });
      if (res.ok) {
        setCancelDate(null);
        fetchAccount();
      }
    } catch {}
    setActionLoading(null);
  }

  async function handleUpgrade(plan: string) {
    setActionLoading(plan);
    try {
      const res = await fetch("/api/account/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.success) {
        fetchAccount();
      }
    } catch {}
    setActionLoading(null);
  }

  async function handleManageBilling() {
    setActionLoading("billing");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setActionLoading(null);
  }

  async function handleDelete() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      }
    } catch {}
    setDeleting(false);
  }

  async function billingSubscribe(plan: string) {
    setBillingLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription", plan }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      alert(data.error || "Something went wrong.");
    } catch { alert("Connection error."); }
    setBillingLoading(null);
  }

  async function billingBuyCredit(creditSize: string) {
    setBillingLoading(creditSize);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "credit", creditSize }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      alert(data.error || "Something went wrong.");
    } catch { alert("Connection error."); }
    setBillingLoading(null);
  }

  async function billingBuyPackage(packageType: string) {
    setBillingLoading(packageType);
    try {
      const res = await fetch("/api/special/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageType }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      alert(data.error || "Something went wrong.");
    } catch { alert("Connection error."); }
    setBillingLoading(null);
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <div className="relative z-10">
          <Navbar />
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-blue-400/60 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (!account) return null;

  const hasSubscription = account.subscriptionPlan && (account.subscriptionStatus === "active" || account.subscriptionStatus === "canceling");
  const isCanceling = account.subscriptionStatus === "canceling";
  const allPlans = ["creator", "author-pro", "studio"];
  const otherPlans = allPlans.filter((p) => p !== account.subscriptionPlan);

  const booksPercent = account.monthlyCreditsTotal > 0
    ? Math.min(100, Math.round((account.monthlyBooksUsed / account.monthlyCreditsTotal) * 100))
    : 0;
  const revisionsPercent = account.monthlyRevisionLimit === Infinity
    ? 0
    : account.monthlyRevisionLimit > 0
      ? Math.min(100, Math.round((account.revisionCount / account.monthlyRevisionLimit) * 100))
      : 0;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white selection:bg-blue-500/30">
      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Account
          </h1>

          {/* Tab Switcher */}
          <div className="flex gap-1 mb-8 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
            <button
              onClick={() => { setActiveTab("account"); window.history.replaceState(null, "", "/account"); }}
              className={`text-sm font-medium rounded-lg px-5 py-2 transition-all ${
                activeTab === "account"
                  ? "bg-white/[0.08] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => { setActiveTab("billing"); window.history.replaceState(null, "", "/account?tab=billing"); }}
              className={`text-sm font-medium rounded-lg px-5 py-2 transition-all ${
                activeTab === "billing"
                  ? "bg-white/[0.08] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              Billing & Plans
            </button>
          </div>

          {activeTab === "billing" && (
            <div className="space-y-6">
              {/* Current Plan Overview */}
              <section className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
                {account.isAdmin ? (
                  <div className="text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm font-medium">
                    ⚡ Admin — Unlimited Access
                  </div>
                ) : hasSubscription ? (
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold border rounded-full px-3 py-1 ${PLAN_BADGE_STYLES[account.subscriptionPlan!] || "bg-white/10 text-white border-white/20"}`}>
                      {PLAN_LABELS[account.subscriptionPlan!] || account.subscriptionPlan}
                    </span>
                    <span className="text-2xl font-bold">${PLAN_PRICES[account.subscriptionPlan!]}<span className="text-sm text-gray-500 font-normal">/mo</span></span>
                    {isCanceling && (
                      <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">Canceling</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold border rounded-full px-3 py-1 bg-gray-500/20 text-gray-400 border-gray-500/30">Free Starter</span>
                    <span className="text-gray-400">Explore the engine before publishing your full work.</span>
                  </div>
                )}
                {account.stripeCustomerId && (
                  <button
                    onClick={handleManageBilling}
                    disabled={actionLoading === "billing"}
                    className="mt-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-all disabled:opacity-50"
                  >
                    {actionLoading === "billing" ? "Loading..." : "Manage Billing on Stripe →"}
                  </button>
                )}
              </section>

              {/* Subscription Tiers */}
              <section>
                <h2 className="text-lg font-semibold mb-4">Subscription Plans</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      key: "creator", name: "Creator", price: 99, color: "emerald",
                      features: ["1 Short or 1 Medium book/month", "10 newsletters/month", "5 articles/month", "Unlimited short-text translation", "30 revisions/month", "All formats", "1 concurrent generation"],
                      extras: "Additional: Short $129 · Medium $179 · Standard $249",
                    },
                    {
                      key: "author-pro", name: "Author Pro", price: 199, color: "blue", popular: true,
                      features: ["1 Standard book/month (~60K words)", "30 newsletters/month", "15 articles/month", "Unlimited short-text translation", "Unlimited revisions (fair use)", "Priority queue", "All formats"],
                      extras: "Additional: Short $99 · Medium $149 · Standard $199",
                    },
                    {
                      key: "studio", name: "Studio", price: 349, color: "purple",
                      features: ["1 Standard + 1 Medium book/month", "Unlimited newsletters (fair use)", "~50 articles/month (fair use)", "Full-book translation", "Unlimited revisions", "Highest priority", "2 concurrent generations"],
                      extras: "Additional: Short $79 · Medium $129 · Standard $179",
                    },
                  ].map((plan) => {
                    const isCurrent = account.subscriptionPlan === plan.key && hasSubscription;
                    const colorStyles: Record<string, { border: string; badge: string; button: string }> = {
                      emerald: { border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", button: "from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600" },
                      blue: { border: "border-blue-500/30", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30", button: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500" },
                      purple: { border: "border-purple-500/30", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30", button: "from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600" },
                    };
                    const cs = colorStyles[plan.color];
                    return (
                      <div key={plan.key} className={`relative bg-white/[0.03] border rounded-2xl p-5 flex flex-col ${isCurrent ? cs.border + " bg-white/[0.02]" : "border-white/[0.06]"}`}>
                        {plan.popular && !isCurrent && (
                          <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold border rounded-full px-3 py-1 ${cs.badge}`}>Most Popular</div>
                        )}
                        {isCurrent && (
                          <div className="absolute -top-3 right-4 text-xs font-semibold bg-white/10 text-white border border-white/20 rounded-full px-3 py-1">Current</div>
                        )}
                        <div className="mb-3">
                          <h3 className="text-base font-bold">{plan.name}</h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">${plan.price}</span>
                            <span className="text-gray-500 text-sm">/month</span>
                          </div>
                        </div>
                        <ul className="space-y-2 mb-3 flex-1">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className={`mt-0.5 text-xs ${cs.badge} rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0`}>✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div className="text-xs text-gray-500 mb-4 bg-white/[0.02] rounded-lg p-2 border border-white/[0.04]">{plan.extras}</div>
                        {isCurrent ? (
                          <button onClick={handleManageBilling} disabled={actionLoading === "billing"} className="w-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white font-medium rounded-xl p-3 text-sm transition-all">
                            {actionLoading === "billing" ? "Loading..." : "Manage Plan"}
                          </button>
                        ) : hasSubscription ? (
                          <button onClick={() => handleUpgrade(plan.key)} disabled={actionLoading !== null} className={`w-full bg-gradient-to-r text-white font-medium rounded-xl p-3 text-sm transition-all ${cs.button} disabled:opacity-50`}>
                            {actionLoading === plan.key ? "..." : `${PLAN_PRICES[plan.key] > PLAN_PRICES[account.subscriptionPlan!] ? "Upgrade" : "Downgrade"} to ${plan.name}`}
                          </button>
                        ) : (
                          <button onClick={() => billingSubscribe(plan.key)} disabled={billingLoading !== null} className={`w-full bg-gradient-to-r text-white font-medium rounded-xl p-3 text-sm transition-all ${cs.button} disabled:opacity-50`}>
                            {billingLoading === plan.key ? "Loading..." : "Subscribe"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Additional Book Pricing */}
              <section className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-2">Additional Book Pricing</h2>
                <p className="text-sm text-gray-400 mb-4">Need more books beyond your monthly allocation? Credits never expire.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-white/[0.06]">
                        <th className="text-left py-2 px-2">Book Size</th>
                        <th className="text-center py-2 px-2">Creator</th>
                        <th className="text-center py-2 px-2">Author Pro</th>
                        <th className="text-center py-2 px-2">Studio</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {[
                        ["Short (~20k words)", "$129", "$99", "$79"],
                        ["Medium (~40k words)", "$179", "$149", "$129"],
                        ["Standard (~60k words)", "$249", "$199", "$179"],
                        ["Epic (~80k+ words)", "$499", "$499", "$499"],
                      ].map(([size, c, a, s], i) => (
                        <tr key={i} className="border-b border-white/[0.04] last:border-0">
                          <td className={`py-2.5 px-2 ${i === 3 ? "font-medium text-amber-400" : ""}`}>{size}</td>
                          <td className="text-center py-2.5 px-2">{c}</td>
                          <td className="text-center py-2.5 px-2">{a}</td>
                          <td className="text-center py-2.5 px-2">{s}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Epic Books */}
              <section className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-2">🏆 Epic Books</h2>
                <p className="text-sm text-gray-400 mb-4">
                  80,000+ words. Not included in any subscription — always a separate <span className="text-amber-400 font-semibold">$499</span> purchase. Epic translation: $299.
                </p>
                <button
                  onClick={() => billingBuyCredit("epic")}
                  disabled={billingLoading === "epic"}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium rounded-xl px-6 py-2.5 text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {billingLoading === "epic" ? "Loading..." : "Buy Epic Credit — $499"}
                </button>
              </section>

              {/* Premium Packages */}
              <section>
                <h2 className="text-lg font-semibold mb-2">Premium Packages</h2>
                <p className="text-sm text-gray-400 mb-4">One-time purchases for specialized, high-quality content.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: "doctoral-thesis", emoji: "🎓", title: "Doctoral-Level Thesis", price: 499, features: ["Comprehensive academic thesis draft", "Abstract, lit review, methodology", "Citation formatting (APA/MLA/Chicago)", "Advanced argument flow"], color: "from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500" },
                    { key: "premium-playwright", emoji: "🎭", title: "Premium Playwright", price: 399, features: ["Complete theatrical script", "Acts and scenes structure", "Character-driven dialogue", "Stage direction and pacing"], color: "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500" },
                    { key: "premium-comic", emoji: "💥", title: "Premium Comic Script", price: 399, features: ["Full comic issue or arc", "Panel-by-panel breakdown", "Character voice consistency", "Built for illustrators"], color: "from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500" },
                    { key: "course-builder-pro", emoji: "📚", title: "Course Builder Pro", price: 399, features: ["10–20 structured lessons", "Lesson scripts & engagement hooks", "CTA framework & module sequencing", "For creators, coaches, educators"], color: "from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500" },
                    { key: "multi-language-bundle", emoji: "🌍", title: "Multi-Language Expansion", price: 249, features: ["Translate one completed project", "Up to 3 additional languages", "Full literary preservation", "Maintains tone & style"], color: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500" },
                  ].map((pkg) => (
                    <div key={pkg.key} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col">
                      <div className="text-2xl mb-2">{pkg.emoji}</div>
                      <h3 className="text-base font-bold mb-1">{pkg.title}</h3>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-2xl font-bold">${pkg.price}</span>
                        <span className="text-gray-500 text-sm">one-time</span>
                      </div>
                      <ul className="space-y-1.5 mb-4 flex-1">
                        {pkg.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>{f}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => billingBuyPackage(pkg.key)}
                        disabled={billingLoading === pkg.key}
                        className={`w-full bg-gradient-to-r text-white font-medium rounded-xl p-3 text-sm transition-all ${pkg.color} disabled:opacity-50`}
                      >
                        {billingLoading === pkg.key ? "Loading..." : "Purchase"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Team Seats */}
              <section className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-2">👥 Team Seats</h2>
                <p className="text-sm text-gray-400 mb-3">
                  Add team members to your <span className="text-purple-400 font-semibold">Studio</span> subscription.
                </p>
                <div className="text-3xl font-bold mb-2">$10<span className="text-sm text-gray-500 font-normal">/seat/month</span></div>
                <ul className="text-sm text-gray-300 space-y-1.5 mb-4">
                  <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Individual login per member</li>
                  <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Shared workspace access</li>
                  <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Project collaboration</li>
                  <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Studio subscription required</li>
                </ul>
                {account.subscriptionPlan === "studio" ? (
                  <button onClick={() => setActiveTab("account")} className="text-sm text-purple-400 hover:text-purple-300 font-medium">
                    Manage team in Settings →
                  </button>
                ) : (
                  <p className="text-xs text-gray-500">Upgrade to Studio to add team members.</p>
                )}
              </section>

              {/* Buy Extra Credits */}
              {hasSubscription && account.subscriptionPlan && (
                <section className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-2">Need more books?</h2>
                  <p className="text-sm text-gray-400 mb-4">Buy additional book credits. Credits never expire and stack with your subscription.</p>
                  <div className="flex flex-wrap gap-3">
                    {(() => {
                      const extras: Record<string, { size: string; label: string; price: number }[]> = {
                        creator: [{ size: "short", label: "Short", price: 129 }, { size: "medium", label: "Medium", price: 179 }, { size: "standard", label: "Standard", price: 249 }],
                        "author-pro": [{ size: "short", label: "Short", price: 99 }, { size: "medium", label: "Medium", price: 149 }, { size: "standard", label: "Standard", price: 199 }],
                        studio: [{ size: "short", label: "Short", price: 79 }, { size: "medium", label: "Medium", price: 129 }, { size: "standard", label: "Standard", price: 179 }],
                      };
                      return (extras[account.subscriptionPlan!] || extras.creator).map((extra) => (
                        <button
                          key={extra.size}
                          onClick={() => billingBuyCredit(extra.size)}
                          disabled={billingLoading !== null}
                          className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-4 text-center transition-all disabled:opacity-50 w-[160px]"
                        >
                          <div className="text-sm font-medium text-gray-300">{extra.label} Book</div>
                          <div className="text-xl font-bold mt-1">${extra.price}</div>
                          <div className="text-xs text-gray-500 mt-1">one-time</div>
                        </button>
                      ));
                    })()}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === "account" && <>
          {/* 1. Profile */}
          <section className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-gray-200">{account.email}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm text-gray-500">Name</div>
                  {editingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full max-w-xs"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                        autoFocus
                      />
                      <button
                        onClick={saveName}
                        disabled={savingName}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                      >
                        {savingName ? "..." : "Save"}
                      </button>
                      <button
                        onClick={() => { setEditingName(false); setNameValue(account.name || ""); }}
                        className="text-sm text-gray-500 hover:text-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-200">
                      {account.name || <span className="text-gray-600 italic">Not set</span>}
                    </div>
                  )}
                </div>
                {!editingName && (
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-500">Member since</div>
                <div className="text-gray-200">
                  {new Date(account.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* 2. Subscription Management */}
          <section className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Subscription</h2>

            {account.isAdmin ? (
              <div className="text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm font-medium">
                ⚡ Admin — Unlimited Access
              </div>
            ) : hasSubscription ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold border rounded-full px-3 py-1 ${
                      PLAN_BADGE_STYLES[account.subscriptionPlan!] || "bg-white/10 text-white border-white/20"
                    }`}
                  >
                    {PLAN_LABELS[account.subscriptionPlan!] || account.subscriptionPlan}
                  </span>
                  {isCanceling && (
                    <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                      Canceling at period end
                    </span>
                  )}
                </div>

                {account.monthlyResetDate && (
                  <div className="text-sm text-gray-400">
                    Next billing: {new Date(account.monthlyResetDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                )}

                {isCanceling && cancelDate && (
                  <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                    Subscription ending {new Date(cancelDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. You can still use all features until then.
                  </div>
                )}

                {/* Other plans */}
                <div>
                  <div className="text-sm text-gray-500 mb-2">Switch plan</div>
                  <div className="flex flex-wrap gap-2">
                    {otherPlans.map((p) => {
                      const isHigher = PLAN_PRICES[p] > PLAN_PRICES[account.subscriptionPlan!];
                      return (
                        <button
                          key={p}
                          onClick={() => handleUpgrade(p)}
                          disabled={actionLoading !== null}
                          className={`text-sm font-medium rounded-xl px-4 py-2 border transition-all disabled:opacity-50 ${
                            isHigher
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                              : "bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.08]"
                          }`}
                        >
                          {actionLoading === p ? "..." : `${isHigher ? "Upgrade to" : "Downgrade to"} ${PLAN_LABELS[p]} ($${PLAN_PRICES[p]}/mo)`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cancel / Reactivate */}
                <div className="pt-2 border-t border-white/[0.06]">
                  {isCanceling ? (
                    <button
                      onClick={handleReactivate}
                      disabled={actionLoading === "reactivate"}
                      className="text-sm font-medium text-green-400 hover:text-green-300 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 transition-all disabled:opacity-50"
                    >
                      {actionLoading === "reactivate" ? "..." : "Reactivate Subscription"}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCancel(true)}
                      className="text-sm text-red-400 hover:text-red-300 font-medium"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold border rounded-full px-3 py-1 bg-gray-500/20 text-gray-400 border-gray-500/30">Free Starter</span>
                  <span className="text-2xl font-bold">$0<span className="text-sm text-gray-500 font-normal">/forever</span></span>
                </div>
                <p className="text-sm text-gray-500">Explore the engine before publishing your full work.</p>
                <div className="flex flex-wrap gap-2">
                  {allPlans.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleUpgrade(p)}
                      disabled={actionLoading !== null}
                      className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl px-4 py-2 transition-all disabled:opacity-50"
                    >
                      {actionLoading === p ? "..." : `${PLAN_LABELS[p]} — $${PLAN_PRICES[p]}/mo`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 3. Usage This Month */}
          {!hasSubscription && !account.isAdmin && (
            <section className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Free Starter Usage</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Books generated</span>
                    <span className="text-gray-300">{account.monthlyBooksUsed} / 1</span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" style={{ width: `${account.monthlyBooksUsed >= 1 ? 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Revisions used</span>
                    <span className="text-gray-300">{account.revisionCount} / 1</span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${account.revisionCount >= 1 ? 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Newsletters used</span>
                    <span className="text-gray-300">{account.monthlyNewslettersUsed} / 2</span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${Math.min(100, Math.round((account.monthlyNewslettersUsed / 2) * 100))}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Articles generated</span>
                    <span className="text-gray-300">{account.monthlyArticlesUsed} / 2</span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${Math.min(100, Math.round((account.monthlyArticlesUsed / 2) * 100))}%` }} />
                  </div>
                </div>
                <div className="text-xs text-gray-500">One-time allocation — upgrade to unlock monthly limits</div>
              </div>
            </section>
          )}
          {hasSubscription && !account.isAdmin && (
            <section className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Usage This Month</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Books generated</span>
                    <span className="text-gray-300">
                      {account.monthlyBooksUsed} / {account.monthlyCreditsTotal}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                      style={{ width: `${booksPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Revisions used</span>
                    <span className="text-gray-300">
                      {account.monthlyRevisionLimit === Infinity
                        ? `${account.revisionCount} (unlimited)`
                        : `${account.revisionCount} / ${account.monthlyRevisionLimit}`}
                    </span>
                  </div>
                  {account.monthlyRevisionLimit !== Infinity && (
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${revisionsPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                {account.monthlyNewsletterLimit > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Newsletters used</span>
                      <span className="text-gray-300">
                        {account.monthlyNewsletterLimit >= 100
                          ? `${account.monthlyNewslettersUsed} (fair use ~100)`
                          : `${account.monthlyNewslettersUsed} / ${account.monthlyNewsletterLimit}`}
                      </span>
                    </div>
                    {account.monthlyNewsletterLimit < 100 && (
                      <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                          style={{ width: `${Math.min(100, Math.round((account.monthlyNewslettersUsed / account.monthlyNewsletterLimit) * 100))}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {account.monthlyArticleLimit > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Articles generated</span>
                      <span className="text-gray-300">
                        {account.monthlyArticleLimit >= 50
                          ? `${account.monthlyArticlesUsed} (fair use ~50)`
                          : `${account.monthlyArticlesUsed} / ${account.monthlyArticleLimit}`}
                      </span>
                    </div>
                    {account.monthlyArticleLimit < 50 && (
                      <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                          style={{ width: `${Math.min(100, Math.round((account.monthlyArticlesUsed / account.monthlyArticleLimit) * 100))}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {account.monthlyResetDate && (
                  <div className="text-xs text-gray-500">
                    Resets {new Date(account.monthlyResetDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 4. Credits */}
          <section className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Credits</h2>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{account.totalCredits}</span>
                <span className="text-gray-400 ml-2 text-sm">available book credits</span>
              </div>
              <button
                onClick={() => { setActiveTab("billing"); window.history.replaceState(null, "", "/account?tab=billing"); }}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                Purchase more →
              </button>
            </div>
            {account.totalCredits > 0 && (
              <div className="flex gap-3 mt-3 text-xs text-gray-500">
                {Object.entries(account.creditCounts).map(([size, count]) =>
                  count > 0 ? (
                    <span key={size} className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1">
                      {count} {size}
                    </span>
                  ) : null
                )}
              </div>
            )}
          </section>

          {/* 5. Billing History */}
          {account.stripeCustomerId && (
            <section className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Billing</h2>
              <p className="text-sm text-gray-400 mb-4">
                Manage invoices, payment methods, and billing history through the Stripe Customer Portal.
              </p>
              <button
                onClick={handleManageBilling}
                disabled={actionLoading === "billing"}
                className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-all disabled:opacity-50"
              >
                {actionLoading === "billing" ? "Loading..." : "Manage Billing →"}
              </button>
            </section>
          )}

          {/* 6. Team (Studio only) */}
          {account.subscriptionPlan === "studio" && account.subscriptionStatus === "active" && (
            <section className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">👥 Team</h2>
              <p className="text-sm text-gray-400 mb-4">
                Add team members to collaborate on projects. Each seat is <span className="text-purple-400 font-semibold">$10/month</span>.
              </p>

              {teamError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                  {teamError}
                </div>
              )}

              {/* Add member form */}
              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  value={teamEmail}
                  onChange={(e) => setTeamEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTeamMember()}
                  placeholder="team@member.com"
                />
                <button
                  onClick={addTeamMember}
                  disabled={teamLoading || !teamEmail.trim()}
                  className="text-sm font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-4 py-2 transition-all disabled:opacity-50"
                >
                  {teamLoading ? "..." : "Add Member"}
                </button>
              </div>

              {/* Member list */}
              {teamMembers.length > 0 ? (
                <div className="space-y-2">
                  {teamMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                      <div>
                        <div className="text-sm text-gray-200">{m.email}</div>
                        <div className="text-xs text-gray-500">
                          Added {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <button
                        onClick={() => removeTeamMember(m.id)}
                        className="text-xs text-red-400 hover:text-red-300 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500 mt-2">
                    {teamMembers.length} seat{teamMembers.length !== 1 ? "s" : ""} · ${teamMembers.length * 10}/month
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No team members yet.</div>
              )}
            </section>
          )}

          {/* 7. Support */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white/90 mb-4">Support</h2>
            <p className="text-sm text-white/50 mb-3">Need help? Have questions about your account, billing, or features?</p>
            <a href="mailto:support@iamdivid.com" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              support@iamdivid.com
            </a>
          </section>

          {/* 8. Danger Zone */}
          <section className="bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
            <p className="text-sm text-gray-400 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDelete(true)}
              className="text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 transition-all"
            >
              Delete Account
            </button>
          </section>
          </>}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3">Cancel Subscription</h3>
            <p className="text-sm text-gray-400 mb-2">
              Are you sure? You&apos;ll keep access until the end of your current billing period.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Your subscription will not renew, but you can use all features until{" "}
              {account.monthlyResetDate
                ? new Date(account.monthlyResetDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "the end of the period"}
              .
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancel(false)}
                className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-xl px-4 py-2 transition-all disabled:opacity-50"
              >
                {canceling ? "Canceling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-red-400 mb-3">Delete Account</h3>
            <p className="text-sm text-gray-400 mb-4">
              This will permanently delete your account, all books, and all data. This cannot be undone.
            </p>
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-1 block">
                Type <span className="text-red-400 font-mono">DELETE</span> to confirm
              </label>
              <input
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}
                className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "DELETE" || deleting}
                className="text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-xl px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}
