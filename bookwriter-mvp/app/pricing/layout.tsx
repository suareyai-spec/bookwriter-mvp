import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | PlotGhost",
  description: "Simple, transparent pricing for AI-generated books, scripts, theses, and courses. Starter, Author, and Studio plans with credits that roll over.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
