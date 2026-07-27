"use client";

import { useState } from "react";
import Link from "next/link";
import { useCredits } from "@/lib/useCredits";
import ZeroCreditsModal from "@/components/ZeroCreditsModal";

interface GenerateButtonProps {
  cost: number;
  label?: string;
  loadingLabel?: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Shared submit button for every generation form — shows the credit cost up
 * front, greys out with a "Buy Credits" link when the balance is too low,
 * and opens the blocking ZeroCreditsModal instead of submitting when the
 * user has exactly 0 total credits.
 */
export default function GenerateButton({
  cost,
  label = "Generate",
  loadingLabel = "Starting...",
  onClick,
  loading = false,
  disabled = false,
  className = "",
}: GenerateButtonProps) {
  const { totalCredits, loading: creditsLoading } = useCredits();
  const [showZeroModal, setShowZeroModal] = useState(false);

  const known = totalCredits !== null;
  const hasEnough = !known || totalCredits! >= cost;
  const isZero = known && totalCredits === 0;

  function handleClick() {
    if (isZero) {
      setShowZeroModal(true);
      return;
    }
    onClick();
  }

  const baseClass = "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl p-4 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg";

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={handleClick}
          disabled={loading || disabled || creditsLoading || (!hasEnough && !isZero)}
          className={`flex-1 ${baseClass} ${className}`}
        >
          {loading ? loadingLabel : !hasEnough ? "Not enough credits" : `${label} — ${cost} credit${cost === 1 ? "" : "s"}`}
        </button>
        {!hasEnough && (
          <Link href="/credits" className="text-sm font-medium text-blue-400 hover:text-blue-300 whitespace-nowrap">
            Buy Credits →
          </Link>
        )}
      </div>
      <ZeroCreditsModal isOpen={showZeroModal} onClose={() => setShowZeroModal(false)} />
    </>
  );
}
