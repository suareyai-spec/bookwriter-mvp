import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Book Translator | PlotGhost",
  description: "Translate your book or manuscript into 10+ languages with AI — preserving tone, formatting, and meaning, not just words.",
  alternates: { canonical: "/translate" },
};

export default function TranslateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
