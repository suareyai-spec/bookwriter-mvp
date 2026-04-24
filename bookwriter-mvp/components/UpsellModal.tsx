"use client";

import { useState } from "react";
import Link from "next/link";

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string | null;
  requestedSize: string;
  message: string;
  upsellType?: "book" | "revision";
  revisionPrices?: { single: number; pack: { count: number; price: number }; unlimited: number };
}

const CREDIT_LABELS: Record<string, string> = {
  short: "Short Book (~20k words)",
  medium: "Medium Book (~40k words)",
  standard: "Standard Book (~60k words)",
  epic: "Epic Book (80k+ words)",
};

const BOOK_OPTIONS: Record<string, { size: string; label: string; price: number }[]> = {
  creator: [
    { size: "short", label: "Short Book Credit", price: 129 },
    { size: "medium", label: "Medium Book Credit", price: 179 },
    { size: "standard", label: "Standard Book Credit", price: 249 },
    { size: "epic", label: "Epic Book Credit", price: 499 },
  ],
  "author-pro": [
    { size: "short", label: "Short Book Credit", price: 99 },
    { size: "medium", label: "Medium Book Credit", price: 149 },
    { size: "standard", label: "Standard Book Credit", price: 199 },
    { size: "epic", label: "Epic Book Credit", price: 499 },
  ],
  studio: [
    { size: "short", label: "Short Book Credit", price: 79 },
    { size: "medium", label: "Medium Book Credit", price: 129 },
    { size: "standard", label: "Standard Book Credit", price: 179 },
    { size: "epic", label: "Epic Book Credit", price: 499 },
  ],
  none: [
    { size: "short", label: "Short Book Credit", price: 129 },
    { size: "medium", label: "Medium Book Credit", price: 179 },
    { size: "standard", label: "Standard Book Credit", price: 249 },
    { size: "epic", label: "Epic Book Credit", price: 499 },
  ],
};

export default function UpsellModal({ isOpen, onClose, currentPlan, requestedSize, message, upsellType = "book", revisionPrices }: UpsellModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const isRevisionUpsell = upsellType === "revision";

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

  async function buyRevision(revisionType: string) {
    setLoading(revisionType);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "revision", revisionType }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(null);
  }

  const bookOptions = BOOK_OPTIONS[currentPlan || "none"] || BOOK_OPTIONS.none;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-lg">&times;</button>

        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          {!currentPlan ? "Upgrade to unlock more" : isRevisionUpsell ? "Need more revisions?" : "Need more books?"}
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

        {currentPlan && isRevisionUpsell && revisionPrices && (
          <>
            <div className="space-y-2 mb-4">
              <button
                onClick={() => buyRevision("single")}
                disabled={loading !== null}
                className="w-full flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-4 transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-200">Single Revision</div>
                  <div className="text-xs text-gray-500">One additional revision</div>
                </div>
                <div className="text-lg font-bold">${(revisionPrices.single / 100).toFixed(0)}</div>
              </button>
              {revisionPrices.pack.count > 0 && (
                <button
                  onClick={() => buyRevision("pack")}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-4 transition-all disabled:opacity-50"
                >
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-200">{revisionPrices.pack.count}-Pack Revisions</div>
                    <div className="text-xs text-gray-500">Best value — save {Math.round((1 - revisionPrices.pack.price / (revisionPrices.single * revisionPrices.pack.count)) * 100)}%</div>
                  </div>
                  <div className="text-lg font-bold">${(revisionPrices.pack.price / 100).toFixed(0)}</div>
                </button>
              )}
              <button
                onClick={() => buyRevision("unlimited")}
                disabled={loading !== null}
                className="w-full flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-4 transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-200">Unlimited Revisions</div>
                  <div className="text-xs text-gray-500">Unlimited revisions for this book</div>
                </div>
                <div className="text-lg font-bold">${(revisionPrices.unlimited / 100).toFixed(0)}</div>
              </button>
            </div>
            <Link href="/pricing" className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Or upgrade your plan
            </Link>
          </>
        )}

        {currentPlan && !isRevisionUpsell && (
          <>
            <div className="space-y-2 mb-4">
              {bookOptions
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
            <Link href="/pricing" className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Or upgrade your plan
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
