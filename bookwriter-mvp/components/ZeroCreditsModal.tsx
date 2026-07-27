"use client";

import { useState } from "react";
import Link from "next/link";
import { CREDIT_PACKS } from "@/lib/credits";

interface ZeroCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Blocking modal shown when a user with 0 total credits tries to generate.
 * Has an explicit close button (per spec) but no backdrop-click-to-dismiss,
 * since the point is to make the "you're out" moment impossible to miss.
 */
export default function ZeroCreditsModal({ isOpen, onClose }: ZeroCreditsModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  async function buyPack(packId: string) {
    setLoading(packId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "credit_pack", packId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setLoading(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-lg" aria-label="Close">
          &times;
        </button>

        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          You&apos;ve used all your credits for this month.
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Buy a credit pack to keep generating right now, or upgrade your plan for a bigger monthly allowance.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {CREDIT_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => buyPack(pack.id)}
              disabled={loading !== null}
              className="text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-4 transition-all disabled:opacity-50"
            >
              <div className="text-sm font-medium text-gray-200">{pack.label}</div>
              <div className="text-xs text-gray-500 mb-2">{pack.credits} credits</div>
              <div className="text-lg font-bold">{loading === pack.id ? "..." : `$${(pack.price / 100).toFixed(0)}`}</div>
            </button>
          ))}
        </div>

        <Link
          href="/pricing"
          className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg shadow-blue-500/20"
        >
          Upgrade Your Plan Instead
        </Link>
      </div>
    </div>
  );
}
