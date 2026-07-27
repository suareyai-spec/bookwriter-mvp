import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "About | PlotGhost",
  description: "PlotGhost is the AI publishing studio for experts, creators and agencies — turning expertise into published books, courses and content.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            About PlotGhost
          </h1>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed text-lg">
            <p>
              PlotGhost is the AI publishing studio for experts, creators and agencies. We built it for people
              who have deep knowledge — coaches, consultants, educators, founders — but not the months it
              traditionally takes to turn that knowledge into a finished, professional publication.
            </p>
            <p>
              Give PlotGhost your ideas, notes or research, and it generates a complete, export-ready book,
              university-level course or content campaign in hours instead of months — with the structure,
              formatting and polish of professionally produced work.
            </p>
            <p>
              Every project stays yours. You keep full ownership of everything you generate, and every file
              exports publish-ready: PDF or Word, formatted for Amazon KDP, client delivery, or your own
              distribution channel.
            </p>
            <p>
              PlotGhost is used by coaches, consultants, educators and agencies who need to publish
              consistently — books, university courses, newsletters, articles and more — without slowing
              down to write everything by hand.
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-white/[0.06]">
            <p className="text-gray-400">
              Questions? Reach us at{" "}
              <a href="mailto:support@plotghost.ai" className="text-blue-400 hover:text-blue-300 transition-colors">
                support@plotghost.ai
              </a>
              .
            </p>
            <Link href="/pricing" className="inline-block mt-4 text-blue-400 hover:text-blue-300 transition-colors">
              See plans & pricing →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
