import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Program — Earn 30% Recurring | PlotGhost",
  description: "Join the PlotGhost affiliate program and earn 30% recurring commission on every payment your referrals make, for as long as they stay subscribed.",
  alternates: { canonical: "/affiliates" },
};

export default function AffiliatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
