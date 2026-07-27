import type { Metadata } from "next";

const MODE_META: Record<string, { title: string; description: string }> = {
  comic: {
    title: "AI Comic Book Script Generator | PlotGhost",
    description: "Generate panel-by-panel comic scripts with dialogue, scene descriptions, and character direction — ready for illustrators.",
  },
  playwright: {
    title: "AI Play Generator | PlotGhost",
    description: "Generate full theatrical scripts with acts, scenes, stage directions, and natural dialogue using AI.",
  },
  thesis: {
    title: "Research & Thesis Assistant | PlotGhost",
    description: "Organize research, develop outlines, and get citation formatting assistance for academic work using AI.",
  },
  course: {
    title: "AI Online Course Generator | PlotGhost",
    description: "Generate lesson-by-lesson online course scripts with talking points, engagement prompts, and workbook outlines.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ mode: string }> }): Promise<Metadata> {
  const { mode } = await params;
  const meta = MODE_META[mode] || {
    title: "Special Content Generator | PlotGhost",
    description: "Generate specialized long-form content with AI.",
  };
  return { ...meta, alternates: { canonical: `/special/${mode}` } };
}

export default function SpecialModeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
