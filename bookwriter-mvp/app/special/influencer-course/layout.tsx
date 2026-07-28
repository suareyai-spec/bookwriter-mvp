import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Influencer Course Generator | PlotGhost",
  description: "Generate a premium, sellable online course — named frameworks, hook-driven modules, worksheets, and sales copy — the kind top creators and coaches sell for $97-$997.",
  alternates: { canonical: "/special/influencer-course" },
};

export default function InfluencerCourseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
