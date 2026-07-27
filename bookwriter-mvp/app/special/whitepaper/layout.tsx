import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "White Papers & Reports Generator | PlotGhost",
  description: "Generate publish-ready white papers, industry reports, and executive briefs — structured, evidence-based, and written for decision-makers.",
  alternates: { canonical: "/special/whitepaper" },
};

export default function WhitepaperLayout({ children }: { children: React.ReactNode }) {
  return children;
}
