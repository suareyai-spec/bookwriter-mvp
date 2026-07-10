import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up Free | PlotGhost",
  description: "Create a free PlotGhost account — no credit card required. Generate your first AI-written book in minutes.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
