"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface CreditsState {
  totalCredits: number | null;
  monthlyCredits: number;
  packCredits: number;
  creditsRollover: number;
  rolloverCap: number;
  planMonthlyAllowance: number;
  isAdmin: boolean;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  loading: boolean;
  refetch: () => void;
}

/**
 * Shared client-side credit balance fetcher — every page that shows a
 * balance pill, a "Generate — N credits" button, or a low-credit
 * banner/modal reads from this single hook instead of re-implementing the
 * /api/user/usage fetch. `totalCredits` is null (not 0) until the first
 * successful fetch resolves, so callers can tell "unknown yet" from
 * "genuinely zero" (unauthenticated users, or the request failing, both
 * leave it null forever and should not block generation on a false 0).
 */
export function useCredits(): CreditsState {
  const { data: session, status } = useSession();
  const [state, setState] = useState<Omit<CreditsState, "loading" | "refetch">>({
    totalCredits: null,
    monthlyCredits: 0,
    packCredits: 0,
    creditsRollover: 0,
    rolloverCap: 0,
    planMonthlyAllowance: 0,
    isAdmin: false,
    subscriptionPlan: null,
    subscriptionStatus: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(() => {
    if (status !== "authenticated" || !session?.user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/user/usage")
      .then((r) => r.json())
      .then((d) => {
        setState({
          totalCredits: typeof d.totalCredits === "number" ? d.totalCredits : null,
          monthlyCredits: d.monthlyCredits ?? 0,
          packCredits: d.packCredits ?? d.purchasedCredits ?? 0,
          creditsRollover: d.creditsRollover ?? 0,
          rolloverCap: d.rolloverCap ?? 0,
          planMonthlyAllowance: d.planMonthlyAllowance ?? 0,
          isAdmin: !!d.isAdmin,
          subscriptionPlan: d.subscriptionPlan ?? null,
          subscriptionStatus: d.subscriptionStatus ?? null,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, session]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { ...state, loading, refetch: fetchCredits };
}
