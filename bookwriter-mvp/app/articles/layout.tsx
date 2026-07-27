import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Article Generator | PlotGhost",
  description: "Generate publication-ready articles, news pieces, opinion editorials, and how-to guides with AI. SEO-optimized and fact-checked against your sources.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
