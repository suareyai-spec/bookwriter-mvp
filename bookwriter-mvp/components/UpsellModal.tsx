"use client";

import { useState } from "react";
import Link from "next/link";
import { CREDIT_PACKS } from "@/lib/credits";

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string | null;
  requestedSize: string;
  message: string;
}

export default function UpsellModal({ isOpen, onClose, currentPlan, message }: UpsellModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  async function buyCreditPack(packId: string) {
    setLoading(packId);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "credit_pack", packId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-lg">&times;</button>

        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          {!currentPlan ? "Upgrade to unlock more" : "Need more credits?"}
        </h3>
        <p className="text-sm text-gray-400 mb-6">{message || "You've reached your Free Starter limit. Upgrade to unlock full book generation, full translations, and unlimited creative output."}</p>

        {!currentPlan && (
          <div className="mb-6 space-y-3">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4">
              <div className="text-sm text-gray-300 font-medium mb-1">Free Starter — Reached Limit</div>
              <div className="text-xs text-gray-500">Upgrade to unlock full book generation, full translations, and unlimited creative output.</div>
            </div>
            <Link
              href="/pricing"
              className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg shadow-blue-500/20"
            >
              View Plans & Upgrade
            </Link>
          </div>
        )}

        {currentPlan && (
          <>
            <div className="space-y-2 mb-4">
              {CREDIT_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => buyCreditPack(pack.id)}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-4 transition-all disabled:opacity-50"
                >
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-200">{pack.label}</div>
                    <div className="text-xs text-gray-500">Credits never expire — stack with your subscription</div>
                  </div>
                  <div className="text-lg font-bold">${(pack.price / 100).toFixed(0)}</div>
                </button>
              ))}
            </div>
            <Link href="/pricing" className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Or upgrade your plan
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
