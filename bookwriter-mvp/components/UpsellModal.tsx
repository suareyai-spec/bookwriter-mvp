"use client";

import { useState } from "react";
import Link from "next/link";

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string | null;
  requestedSize: string;
  message: string;
}

const CREDIT_LABELS: Record<string, string> = {
  short: "Short Book (10k words)",
  medium: "Medium Book (25k words)",
  standard: "Standard Book (50k words)",
  epic: "Epic Book (100k words)",
};

const UPSELL_OPTIONS: Record<string, { size: string; label: string; price: number }[]> = {
  starter: [
    { size: "short", label: "Extra Short Book", price: 39 },
    { size: "medium", label: "Medium Book Credit", price: 79 },
    { size: "standard", label: "Standard Book Credit", price: 149 },
    { size: "epic", label: "Epic Book Credit", price: 249 },
  ],
  author: [
    { size: "short", label: "Extra Short Book", price: 29 },
    { size: "medium", label: "Extra Medium Book", price: 59 },
    { size: "standard", label: "Standard Book Credit", price: 99 },
    { size: "epic", label: "Epic Book Credit", price: 199 },
  ],
  pro: [
    { size: "short", label: "Extra Short Book", price: 29 },
    { size: "medium", label: "Extra Medium Book", price: 59 },
    { size: "standard", label: "Extra Standard Book", price: 79 },
    { size: "epic", label: "Epic Book Credit", price: 149 },
  ],
  none: [
    { size: "short", label: "Short Book Credit", price: 39 },
    { size: "medium", label: "Medium Book Credit", price: 79 },
    { size: "standard", label: "Standard Book Credit", price: 149 },
    { size: "epic", label: "Epic Book Credit", price: 249 },
  ],
};

export default function UpsellModal({ isOpen, onClose, currentPlan, requestedSize, message }: UpsellModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const options = UPSELL_OPTIONS[currentPlan || "none"] || UPSELL_OPTIONS.none;

  async function buyCredit(size: string) {
    setLoading(size);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "credit", creditSize: size }),
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
          {currentPlan ? "Need more books?" : "Subscribe to get started"}
        </h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>

        {!currentPlan && (
          <div className="mb-6">
            <Link
              href="/pricing"
              className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg shadow-blue-500/20"
            >
              View Plans
            </Link>
          </div>
        )}

        {currentPlan && (
          <>
            <div className="space-y-2 mb-4">
              {options
                .filter((o) => o.size === requestedSize || requestedSize === "any")
                .map((opt) => (
                  <button
                    key={opt.size}
                    onClick={() => buyCredit(opt.size)}
                    disabled={loading !== null}
                    className="w-full flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-4 transition-all disabled:opacity-50"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-200">{opt.label}</div>
                      <div className="text-xs text-gray-500">{CREDIT_LABELS[opt.size]}</div>
                    </div>
                    <div className="text-lg font-bold">${opt.price}</div>
                  </button>
                ))}
            </div>

            <Link
              href="/pricing"
              className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Or upgrade your plan
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
