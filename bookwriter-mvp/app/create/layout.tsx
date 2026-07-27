import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Book | PlotGhost",
  description: "Describe your book and let AI write it chapter by chapter. Choose genre, tone, length, and language — export-ready in minutes.",
  alternates: { canonical: "/create" },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
