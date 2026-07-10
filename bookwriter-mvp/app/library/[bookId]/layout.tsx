import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Book | PlotGhost",
  description: "View, edit, and export your AI-generated book, script, or course as PDF or Word.",
};

export default function BookDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
