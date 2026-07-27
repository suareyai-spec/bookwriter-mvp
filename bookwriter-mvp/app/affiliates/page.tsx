"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AffiliatesLandingPage() {
  const { status } = useSession();
  const [form, setForm] = useState({ name: "", payPalEmail: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/affiliates/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      setCode(data.code);
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-6">
            <span>💸</span>
            <span>Earn 30% recurring commission</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Join the{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PlotGhost Affiliate Program
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Earn 30% of every payment — not just the first one — for as long as your referral stays subscribed.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: "🔗", title: "Get your link", desc: "A unique referral link tied to your account" },
            { icon: "📣", title: "Share it", desc: "Anywhere your audience already is" },
            { icon: "💰", title: "Earn 30% recurring", desc: "On every payment, every renewal, forever" },
          ].map((s) => (
            <div key={s.title} className="text-center bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="font-semibold text-sm mb-1">{s.title}</p>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>

        {status === "unauthenticated" ? (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
            <p className="text-gray-300 mb-4">Sign in to apply for the affiliate program.</p>
            <Link
              href="/auth/login?callbackUrl=/affiliates"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all"
            >
              Sign in to apply
            </Link>
          </div>
        ) : done ? (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-2">Application received!</h2>
            <p className="text-gray-400 mb-6">
              We&apos;ll review your application shortly. Your link is live for tracking now — commissions are paid out once approved.
            </p>
            <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4 mb-2">
              <p className="text-xs text-gray-400 mb-1">Your referral link</p>
              <p className="font-mono text-blue-400 text-sm break-all">https://www.plotghost.ai/?ref={code}</p>
            </div>
            <Link href="/affiliates/dashboard" className="text-sm text-blue-400 hover:text-blue-300">
              Go to your affiliate dashboard →
            </Link>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-6">Apply Now</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Your Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500/50 text-white placeholder-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">PayPal Email *</label>
                <input
                  required
                  type="email"
                  value={form.payPalEmail}
                  onChange={(e) => setForm((p) => ({ ...p, payPalEmail: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500/50 text-white placeholder-gray-600"
                />
                <p className="text-xs text-gray-600 mt-1">This is where we&apos;ll send your commission payouts.</p>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Apply →"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
