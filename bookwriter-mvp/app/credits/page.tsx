"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useCredits } from "@/lib/useCredits";
import { CREDIT_PACKS } from "@/lib/credits";
import Navbar from "@/components/Navbar";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  author: "Author",
  studio: "Studio",
  creator: "Starter",
  "author-pro": "Author",
};

function CreditsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const purchased = searchParams.get("purchased");
  const {
    totalCredits,
    monthlyCredits,
    packCredits,
    creditsRollover,
    planMonthlyAllowance,
    isAdmin,
    subscriptionPlan,
    subscriptionStatus,
    loading: creditsLoading,
  } = useCredits();
  const [buying, setBuying] = useState<string | null>(null);

  const hasActivePlan = subscriptionPlan && subscriptionStatus === "active";
  const planLabel = subscriptionPlan ? PLAN_LABELS[subscriptionPlan] ?? subscriptionPlan : null;

  async function buyPack(packId: string) {
    if (!session) {
      window.location.href = "/auth/login?callbackUrl=/credits";
      return;
    }
    setBuying(packId);
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
    } catch {}
    setBuying(null);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Credits
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Every generation on PlotGhost — books, courses, articles, white papers, translations —
          runs on credits. Top up any time with a pack on top of your subscription.
        </p>
      </div>

      {purchased && (
        <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-center text-sm">
          Credits added to your account successfully!
        </div>
      )}

      {session && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-8 mb-12">
          {creditsLoading ? (
            <div className="text-gray-500 text-sm">Loading your balance...</div>
          ) : isAdmin ? (
            <div className="text-center">
              <div className="text-sm text-purple-400 font-medium mb-1">Unlimited access</div>
              <div className="text-3xl font-bold">&#8734;</div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Your balance</div>
                <div className="text-3xl font-bold">
                  {totalCredits ?? 0} <span className="text-lg font-normal text-gray-400">credits total</span>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {monthlyCredits + creditsRollover} monthly credits
                  {creditsRollover > 0 && <span className="text-gray-600"> (incl. {creditsRollover} rolled over)</span>}
                  {" "}+ {packCredits} pack credits = {totalCredits ?? 0} total
                </div>
              </div>
              <div className="text-center sm:text-right">
                {hasActivePlan ? (
                  <>
                    <div className="text-sm text-gray-500 mb-1">{planLabel} plan gives you</div>
                    <div className="text-xl font-semibold">{planMonthlyAllowance} credits/month</div>
                  </>
                ) : (
                  <Link
                    href="/pricing"
                    className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-lg px-5 py-2.5 transition-all"
                  >
                    View Plans
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-1">Credit Packs</h2>
        <p className="text-sm text-gray-500">
          One-time top-ups. Never expire. Stack on top of your subscription and are used only after
          your monthly credits run out.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {CREDIT_PACKS.map((pack) => {
          const perCredit = pack.price / 100 / pack.credits;
          return (
            <div
              key={pack.id}
              className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-6 transition-all flex flex-col"
            >
              <div className="text-sm font-semibold text-gray-300 mb-1">{pack.label}</div>
              <div className="text-3xl font-bold mb-1">{pack.credits}</div>
              <div className="text-xs text-gray-500 mb-4">credits</div>
              <div className="text-2xl font-bold mb-1">${(pack.price / 100).toFixed(0)}</div>
              <div className="text-xs text-gray-500 mb-6">${perCredit.toFixed(2)}/credit</div>
              <button
                onClick={() => buyPack(pack.id)}
                disabled={buying !== null}
                className="mt-auto w-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white font-medium rounded-lg py-2.5 transition-all disabled:opacity-50"
              >
                {buying === pack.id ? "Redirecting..." : "Buy Now"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-500 mb-16">
        Subscription credits are always the cheapest per-credit — a plan upgrade goes further than a
        pack if you&apos;re generating regularly.{" "}
        <Link href="/pricing" className="text-blue-400 hover:text-blue-300">
          Compare plans →
        </Link>
      </div>
        </div>
      </div>
    </main>
  );
}

export default function CreditsPage() {
  return (
    <Suspense>
      <CreditsContent />
    </Suspense>
  );
}
