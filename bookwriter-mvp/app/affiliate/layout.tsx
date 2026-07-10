import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Partner | PlotGhost",
  description: "Apply to the PlotGhost partner program and earn commission for every subscription you refer.",
};

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
