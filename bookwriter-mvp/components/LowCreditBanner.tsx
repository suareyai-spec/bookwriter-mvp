"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LOW_CREDIT_THRESHOLD = 10;
const DISMISS_KEY = "plotghost_low_credit_dismissed_at";

export default function LowCreditBanner({ totalCredits }: { totalCredits: number | null }) {
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(DISMISS_KEY);
    if (stored) setDismissedAt(Number(stored));
  }, []);

  if (totalCredits === null || totalCredits >= LOW_CREDIT_THRESHOLD || totalCredits <= 0) return null;
  if (dismissedAt === totalCredits) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap text-sm">
        <span className="text-amber-300">
          You have <strong>{totalCredits}</strong> credit{totalCredits === 1 ? "" : "s"} remaining. Buy more or upgrade your plan.
        </span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/credits"
            className="text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-full px-3 py-1.5 transition-colors"
          >
            Buy Credits
          </Link>
          <Link
            href="/pricing"
            className="text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 rounded-full px-3 py-1.5 transition-colors"
          >
            Upgrade Plan
          </Link>
          <button
            onClick={() => {
              sessionStorage.setItem(DISMISS_KEY, String(totalCredits));
              setDismissedAt(totalCredits);
            }}
            className="text-amber-300/60 hover:text-amber-300 text-lg leading-none"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}
