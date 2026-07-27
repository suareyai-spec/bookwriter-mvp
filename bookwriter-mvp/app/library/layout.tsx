import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Library | PlotGhost",
  description: "All your AI-generated books, articles, scripts, and courses in one place. Track progress, edit, and export to PDF or Word.",
  alternates: { canonical: "/library" },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
