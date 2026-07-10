import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Newsletter Generator | PlotGhost",
  description: "Generate ready-to-send email newsletters with AI — subject lines, sections, and CTAs tailored to your brand and audience.",
};

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
