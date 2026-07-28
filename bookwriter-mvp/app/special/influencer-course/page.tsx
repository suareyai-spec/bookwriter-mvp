"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import GenerateButton from "@/components/GenerateButton";
import { getCreditCost } from "@/lib/credits";

const TONES = ["Tactical & Direct", "Motivational & Story-Driven", "No-BS & Blunt"] as const;
const MIN_MODULES = 4;
const MAX_MODULES = 10;

export default function InfluencerCoursePage() {
  const { status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [topic, setTopic] = useState("");
  const [targetStudent, setTargetStudent] = useState("");
  const [coreTransformation, setCoreTransformation] = useState("");
  const [moduleCount, setModuleCount] = useState(6);
  const [tone, setTone] = useState<(typeof TONES)[number]>("Tactical & Direct");
  const [pairWithBook, setPairWithBook] = useState(false);
  const [bookTitle, setBookTitle] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [streamContent, setStreamContent] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  async function handleSubmit() {
    if (!title.trim()) { setError("Course title is required"); return; }
    if (!brandName.trim()) { setError("Your name / brand name is required"); return; }
    if (!topic.trim()) { setError("Topic / niche is required"); return; }
    if (!targetStudent.trim()) { setError("Target student is required"); return; }
    if (!coreTransformation.trim()) { setError("Core transformation is required"); return; }
    if (pairWithBook && !bookTitle.trim()) { setError("Book title is required when pairing with a book"); return; }

    setError(null);
    setLoading(true);
    setGenerating(true);
    setProgress("Starting generation...");
    setCurrentSection(0);
    setTotalSections(0);
    setStreamContent([]);

    try {
      const res = await fetch("/api/special/influencer-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          brandName,
          topic,
          targetStudent,
          coreTransformation,
          moduleCount,
          tone,
          pairWithBook,
          bookTitle: pairWithBook ? bookTitle : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Generation failed");
        setGenerating(false);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) { setError("No stream"); setGenerating(false); setLoading(false); return; }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "outline" && data.totalSections) setTotalSections(data.totalSections);
            if (data.type === "progress") {
              setProgress(data.title || data.status || "Generating...");
              if (data.chapter) setCurrentSection(data.chapter);
              if (data.totalChapters) setTotalSections(data.totalChapters);
            }
            if (data.type === "section") {
              setStreamContent((prev) => [...prev, data.content]);
              if (data.chapter) setCurrentSection(data.chapter);
            }
            if (data.type === "complete") {
              setGenerating(false);
              setLoading(false);
              if (data.bookId) router.push(`/library/${data.bookId}`);
            }
            if (data.type === "error") {
              setError(data.message);
              setGenerating(false);
              setLoading(false);
            }
          } catch {}
        }
      }
    } catch {
      setError("Generation failed. Please try again.");
      setGenerating(false);
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/40 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  if (generating) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          <Navbar />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <div className="text-center mb-8">
              <div className="w-12 h-12 border-2 border-amber-400/20 border-t-amber-300 rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Generating your course
              </h2>
              <p className="text-gray-400 mb-4">{progress}</p>
              {totalSections > 0 && (
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Stage {currentSection} of {totalSections}</span>
                    <span>{Math.round((currentSection / totalSections) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2.5 mb-2">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, (currentSection / totalSections) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {streamContent.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 max-h-[60vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">
                  {streamContent.join("\n\n")}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Create an Influencer Course
          </h1>
          <p className="text-gray-400 mb-8">
            A premium, sellable course — named frameworks, hook-driven modules, worksheets, and a sales-ready bonuses stack. The kind top creators and coaches sell for $97-$997. Costs <strong className="text-white">{getCreditCost("influencer_course")} credits</strong>.
          </p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className={labelClass}>Course Title</label>
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Client Acquisition Blueprint" />
            </div>

            <div>
              <label className={labelClass}>Your Name / Brand Name</label>
              <input className={inputClass} value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Jordan Reyes, or Reyes Consulting" />
            </div>

            <div>
              <label className={labelClass}>Topic / Niche</label>
              <input className={inputClass} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. SMMA, real estate investing, fitness coaching" />
            </div>

            <div>
              <label className={labelClass}>Target Student</label>
              <textarea className={inputClass} rows={2} value={targetStudent} onChange={(e) => setTargetStudent(e.target.value)} placeholder="Who is this for, and what's their problem right now?" />
            </div>

            <div>
              <label className={labelClass}>Core Transformation</label>
              <textarea className={inputClass} rows={2} value={coreTransformation} onChange={(e) => setCoreTransformation(e.target.value)} placeholder="What can they DO after this course that they couldn't do before?" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Number of Modules</label>
                <select className={inputClass} value={moduleCount} onChange={(e) => setModuleCount(Number(e.target.value))}>
                  {Array.from({ length: MAX_MODULES - MIN_MODULES + 1 }, (_, i) => MIN_MODULES + i).map((n) => (
                    <option key={n} value={n}>{n} modules</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tone</label>
                <select className={inputClass} value={tone} onChange={(e) => setTone(e.target.value as any)}>
                  {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="border border-white/[0.08] rounded-xl p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${pairWithBook ? "bg-amber-500" : "bg-white/[0.1]"}`}
                  onClick={() => setPairWithBook(!pairWithBook)}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${pairWithBook ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm font-medium text-gray-300">Pair with a book</span>
              </label>

              {pairWithBook && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <label className={labelClass}>Book Title</label>
                  <input className={inputClass} value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="e.g. The Client Acquisition Blueprint (the companion book)" />
                </div>
              )}
            </div>

            <GenerateButton
              cost={getCreditCost("influencer_course")}
              label="Generate Course"
              onClick={handleSubmit}
              loading={loading}
              disabled={!title.trim() || !brandName.trim() || !topic.trim() || !targetStudent.trim() || !coreTransformation.trim()}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
