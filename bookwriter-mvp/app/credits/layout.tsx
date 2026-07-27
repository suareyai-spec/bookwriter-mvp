import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credits | PlotGhost",
  description: "Check your PlotGhost credit balance and buy credit packs for extra generation capacity on top of your subscription.",
  alternates: { canonical: "/credits" },
};

export default function CreditsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
