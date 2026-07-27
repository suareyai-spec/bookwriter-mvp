import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "University Course Generator | PlotGhost",
  description: "Generate a full 12-15 week academic course for online asynchronous delivery — syllabus, weekly lectures, discussion prompts, and a complete assessment package.",
  alternates: { canonical: "/special/university-course" },
};

export default function UniversityCourseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
