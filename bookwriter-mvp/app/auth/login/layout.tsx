import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | PlotGhost",
  description: "Sign in to your PlotGhost account to continue generating AI-written books, articles, and courses.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
