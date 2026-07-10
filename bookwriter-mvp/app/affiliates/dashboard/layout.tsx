import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Dashboard | PlotGhost",
  description: "Track your referral clicks, conversions, earnings, and pending payout as a PlotGhost affiliate.",
};

export default function AffiliateDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
