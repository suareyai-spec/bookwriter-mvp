"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const GENRES = [
  "Non-Fiction", "Fantasy", "Sci-Fi", "Mystery", "Romance",
  "Thriller", "Self-Help", "Business", "Biography", "Historical",
  "Horror", "Literary Fiction", "Children's", "Poetry", "Other",
];

const TONES = [
  "Professional & Authoritative",
  "Conversational & Friendly",
  "Academic & Research-Driven",
  "Inspirational & Motivational",
  "Narrative & Story-Driven",
  "Humorous & Lighthearted",
];

interface ChapterInfo {
  number: number;
  title: string;
  status: "pending" | "writing" | "done";
  content?: string;
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const bookIdParam = searchParams.get("bookId");
  const isNewVersion = searchParams.get("newVersion") === "true";

  const [step, setStep] = useState<"input" | "generating" | "result">("input");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Non-Fiction");
  const [tone, setTone] = useState("Professional & Authoritative");
  const [audience, setAudience] = useState("");
  const [bookLength, setBookLength] = useState("50,000 words (~200 pages)");
  const [language, setLanguage] = useState("English");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Streaming state
  const [outline, setOutline] = useState("");
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [statusText, setStatusText] = useState("Preparing...");
  const [startTime, setStartTime] = useState<number>(0);
  const [chapterTimes, setChapterTimes] = useState<number[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  const progressPercent = totalChapters > 0 ? Math.round((chapters.filter(c => c.status === "done").length / totalChapters) * 100) : 0;

  const estimatedRemaining = useCallback(() => {
    const done = chapterTimes.length;
    if (done === 0) return null;
    const avg = chapterTimes.reduce((a, b) => a + b, 0) / done;
    const remaining = totalChapters - chapters.filter(c => c.status === "done").length;
    const secs = Math.round(avg * remaining / 1000);
    if (secs < 60) return `~${secs} seconds`;
    return `~${Math.ceil(secs / 60)} minute${Math.ceil(secs / 60) > 1 ? "s" : ""}`;
  }, [chapterTimes, totalChapters, chapters]);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
    }
  }, [outline, chapters]);

  async function autoSave(content: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/books/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: isNewVersion ? bookIdParam : undefined,
          title,
          description,
          genre,
          tone,
          audience,
          language,
          bookLength,
          content,
          notes: isNewVersion ? "New version" : "Initial generation",
        }),
      });
      if (res.ok) setSaved(true);
    } catch {
      // Silent fail
    }
    setSaving(false);
  }

  async function generate() {
    if (!title.trim() || !description.trim()) return;
    setStep("generating");
    setResult("");
    setError("");
    setSaved(false);
    setOutline("");
    setChapters([]);
    setCurrentChapter(0);
    setTotalChapters(0);
    setStatusText("Generating outline...");
    setStartTime(Date.now());
    setChapterTimes([]);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 600000);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, genre, tone, audience, bookLength, language }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Failed to connect" }));
        setError(data.error || "Generation failed");
        setStep("input");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let chapterStartTime = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const jsonStr = trimmed.slice(6);
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          switch (event.type) {
            case "progress": {
              const tc = event.totalChapters as number;
              setTotalChapters(tc);
              if (event.status === "outline") {
                setStatusText("Generating outline...");
              } else {
                const ch = event.chapter as number;
                setCurrentChapter(ch);
                setStatusText(`Writing Chapter ${ch}: ${event.title}...`);
                chapterStartTime = Date.now();
                setChapters(prev => {
                  const updated = [...prev];
                  // Initialize pending chapters if needed
                  while (updated.length < tc) {
                    updated.push({ number: updated.length + 1, title: `Chapter ${updated.length + 1}`, status: "pending" });
                  }
                  if (updated[ch - 1]) {
                    updated[ch - 1] = { ...updated[ch - 1], title: event.title as string, status: "writing" };
                  }
                  return updated;
                });
              }
              break;
            }
            case "outline": {
              setOutline(event.content as string);
              const tc = event.totalChapters as number;
              setTotalChapters(tc);
              setStatusText("Outline complete. Starting chapters...");
              // Try to extract chapter titles from outline
              const titles: string[] = [];
              const regex = /chapter\s+\d+[:\s]+(.+)/gi;
              let m;
              while ((m = regex.exec(event.content as string)) !== null) {
                titles.push(m[1].trim().replace(/\*+/g, "").trim());
              }
              const initial: ChapterInfo[] = [];
              for (let i = 0; i < tc; i++) {
                initial.push({ number: i + 1, title: titles[i] || `Chapter ${i + 1}`, status: "pending" });
              }
              setChapters(initial);
              break;
            }
            case "chapter": {
              const ch = event.chapter as number;
              const elapsed = Date.now() - chapterStartTime;
              setChapterTimes(prev => [...prev, elapsed]);
              setChapters(prev => {
                const updated = [...prev];
                if (updated[ch - 1]) {
                  updated[ch - 1] = { ...updated[ch - 1], title: event.title as string, status: "done", content: event.content as string };
                }
                return updated;
              });
              break;
            }
            case "complete": {
              const fullText = event.fullText as string;
              setResult(fullText);
              setStep("result");
              if (session?.user) {
                autoSave(fullText);
              }
              break;
            }
            case "error": {
              setError(event.message as string);
              setStep("input");
              break;
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("Generation timed out. Try a shorter book length.");
      } else {
        setError("Network error — please try again. Longer books may take 3-8 minutes.");
      }
      setStep("input");
    }
  }

  async function saveToLibrary() {
    if (!session?.user || !result) return;
    await autoSave(result);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white selection:bg-blue-500/30">
      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        {step === "input" && (
          <div className="text-center pt-8 pb-12 px-4">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Write your next
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent italic">
                bestseller
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-lg mx-auto">
              Describe your vision. We&apos;ll write a professional book with chapters, structure, and export-ready formatting.
            </p>
          </div>
        )}

        {/* Input Form */}
        {step === "input" && (
          <div className="mx-auto max-w-2xl px-4 pb-20">
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Book Title</label>
                <input
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="e.g. Value Based Care for the Healthcare CEO"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Genre + Tone Row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                  <select
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g} className="bg-gray-900">{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                  <select
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    {TONES.map((t) => (
                      <option key={t} value={t} className="bg-gray-900">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Book Length */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Book Length</label>
                <select
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                  value={bookLength}
                  onChange={(e) => setBookLength(e.target.value)}
                >
                  <option value="10,000 words (~40 pages)" className="bg-gray-900">Short -- 10,000 words - ~40 pages - 5 chapters</option>
                  <option value="25,000 words (~100 pages)" className="bg-gray-900">Medium -- 24,000 words - ~100 pages - 8 chapters</option>
                  <option value="50,000 words (~200 pages)" className="bg-gray-900">Standard -- 50,000 words - ~200 pages - 10 chapters</option>
                  <option value="75,000 words (~300 pages)" className="bg-gray-900">Long -- 72,000 words - ~300 pages - 12 chapters</option>
                  <option value="100,000 words (~400 pages)" className="bg-gray-900">Epic -- 97,500 words - ~400 pages - 15 chapters</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                <select
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="English" className="bg-gray-900">English</option>
                  <option value="Spanish" className="bg-gray-900">Spanish / Espanol</option>
                  <option value="French" className="bg-gray-900">French / Francais</option>
                  <option value="Portuguese" className="bg-gray-900">Portuguese / Portugues</option>
                  <option value="German" className="bg-gray-900">German / Deutsch</option>
                  <option value="Italian" className="bg-gray-900">Italian / Italiano</option>
                  <option value="Chinese" className="bg-gray-900">Chinese</option>
                  <option value="Japanese" className="bg-gray-900">Japanese</option>
                  <option value="Korean" className="bg-gray-900">Korean</option>
                  <option value="Arabic" className="bg-gray-900">Arabic</option>
                </select>
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience <span className="text-gray-600">(optional)</span></label>
                <input
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="e.g. Healthcare executives, startup founders, general readers"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Describe Your Book</label>
                <textarea
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                  placeholder="What should this book cover? Include the main topics, structure ideas, key points, any specific chapters or sections you want, and what makes this book unique..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>

              {/* Generate Button */}
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl p-4 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:shadow-none"
                onClick={generate}
                disabled={!title.trim() || !description.trim()}
              >
                Generate Book
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex justify-center gap-6 mt-8 text-xs text-gray-600">
              <span>Your content stays private</span>
              <span>~30 second generation</span>
              <span>PDF and DOCX export</span>
            </div>
          </div>
        )}

        {/* Generating State — Progress UI */}
        {step === "generating" && (
          <div className="mx-auto max-w-3xl px-4 py-8 pb-20">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Writing &ldquo;{title}&rdquo;
                </h2>
                <p className="text-gray-400 text-sm">{statusText}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-gray-400">{progressPercent}% complete</span>
                  {estimatedRemaining() && (
                    <span className="text-gray-500">Est. remaining: {estimatedRemaining()}</span>
                  )}
                </div>
                <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-right mt-1 text-xs text-gray-600">
                  {chapters.filter(c => c.status === "done").length} / {totalChapters} chapters
                </div>
              </div>

              {/* Chapter Checklist */}
              {chapters.length > 0 && (
                <div className="mb-6 max-h-48 overflow-y-auto pr-2">
                  <div className="space-y-1.5">
                    {chapters.map((ch) => (
                      <div key={ch.number} className="flex items-center gap-3 text-sm">
                        {ch.status === "done" && (
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 text-xs">✓</span>
                        )}
                        {ch.status === "writing" && (
                          <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-blue-400/60 border-t-transparent animate-spin" />
                        )}
                        {ch.status === "pending" && (
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08]" />
                        )}
                        <span className={ch.status === "done" ? "text-gray-300" : ch.status === "writing" ? "text-blue-300 font-medium" : "text-gray-600"}>
                          Ch. {ch.number}: {ch.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Preview */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Live Preview</span>
                </div>
                <div ref={previewRef} className="max-h-[50vh] overflow-y-auto bg-white/[0.02] rounded-xl p-4 text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {outline && (
                    <div className="mb-4">
                      <div className="text-xs text-blue-400 uppercase tracking-wider mb-2 font-medium">Outline</div>
                      {outline}
                    </div>
                  )}
                  {chapters.filter(c => c.content).map((ch) => (
                    <div key={ch.number} className="mb-4 border-t border-white/[0.04] pt-4">
                      <div className="text-xs text-purple-400 uppercase tracking-wider mb-2 font-medium">Chapter {ch.number}</div>
                      {ch.content}
                    </div>
                  ))}
                  {!outline && <span className="text-gray-600">Waiting for content...</span>}
                </div>
              </div>

              {/* Keep tab open notice */}
              <p className="text-center text-xs text-gray-600 mt-4">Please keep this tab open. Do not refresh.</p>
            </div>
          </div>
        )}

        {/* Result */}
        {step === "result" && (
          <div className="mx-auto max-w-3xl px-4 py-8 pb-20">
            {/* Back + Title */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <button
                onClick={() => setStep("input")}
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                &larr; New Book
              </button>
              <div className="flex gap-3 flex-wrap">
                {session?.user && !saved && (
                  <button
                    className="inline-flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
                    onClick={saveToLibrary}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save to Library"}
                  </button>
                )}
                {saved && (
                  <Link
                    href="/library"
                    className="inline-flex items-center gap-2 bg-green-600/20 border border-green-500/30 text-green-400 rounded-xl px-4 py-2 text-sm font-medium"
                  >
                    Saved — View Library
                  </Link>
                )}
                <button
                  className="inline-flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-xl px-4 py-2 text-sm font-medium transition-all"
                  onClick={async () => {
                    const res = await fetch("/api/export/pdf", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title, content: result }),
                    });
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${title || "book"}.pdf`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export PDF
                </button>
                <button
                  className="inline-flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-xl px-4 py-2 text-sm font-medium transition-all"
                  onClick={async () => {
                    const res = await fetch("/api/export/google/start", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title, content: result }),
                    });
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${title || "book"}.docx`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download .docx
                </button>
              </div>
            </div>

            {!session && (
              <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
                <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium underline">Sign up</Link> to save this book to your library and access it anytime.
              </div>
            )}

            {/* Book Content Card */}
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
              {/* Book Header */}
              <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-white/[0.06] p-8 text-center">
                <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{title}</h2>
                <div className="flex justify-center gap-3 mt-3 text-sm text-gray-400">
                  <span>{genre}</span>
                  <span>·</span>
                  <span>{tone}</span>
                  <span>·</span>
                  <span>{bookLength}</span>
                  <span>·</span>
                  <span>{language}</span>
                </div>
              </div>

              {/* Word count bar */}
              <div className="flex justify-center gap-6 py-3 border-b border-white/[0.06] text-sm text-gray-400">
                <span>{result.split(/\s+/).filter(Boolean).length.toLocaleString()} words</span>
                <span>~{Math.ceil(result.split(/\s+/).filter(Boolean).length / 250)} pages</span>
              </div>

              {/* Book Text */}
              <div className="p-6 sm:p-10">
                <div className="whitespace-pre-wrap text-gray-300 leading-[1.8] text-[15px] max-h-[80vh] overflow-y-auto pr-2">
                  {result}
                </div>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </main>
  );
}
