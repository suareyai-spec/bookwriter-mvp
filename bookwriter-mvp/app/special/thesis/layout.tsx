import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research & Thesis Assistant | PlotGhost",
  description: "Generate a rigorously structured thesis, dissertation, research paper, or literature review — proper citations, section-by-section academic writing.",
  alternates: { canonical: "/special/thesis" },
};

export default function ThesisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
