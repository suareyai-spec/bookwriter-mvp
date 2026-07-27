import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comics, Plays, Theses & Courses | PlotGhost",
  description: "Generate comic scripts, theatrical plays, academic theses, and online courses with AI. Professional structure, ready to develop further.",
  alternates: { canonical: "/special" },
};

export default function SpecialLayout({ children }: { children: React.ReactNode }) {
  return children;
}
