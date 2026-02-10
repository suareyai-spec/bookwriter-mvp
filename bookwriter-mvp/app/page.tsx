"use client";

import { useState } from "react";

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

export default function Home() {
  const [step, setStep] = useState<"input" | "generating" | "result">("input");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Non-Fiction");
  const [tone, setTone] = useState("Professional & Authoritative");
  const [audience, setAudience] = useState("");
  const [bookLength, setBookLength] = useState("50,000 words (~200 pages)");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    if (!title.trim() || !description.trim()) return;
    setStep("generating");
    setResult("");
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, genre, tone, audience, bookLength }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setStep("input");
      } else {
        setResult(data.text || "No output");
        setStep("result");
      }
    } catch {
      setError("Network error — please try again.");
      setStep("input");
    }
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
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="MyBook" className="w-9 h-9" />
            <span className="text-xl font-bold tracking-tight">MyBook</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="hidden sm:inline">AI-Powered Book Generator</span>
          </div>
        </nav>

        {/* Hero */}
        {step === "input" && (
          <div className="text-center pt-8 pb-12 px-4">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              Powered by Claude Opus
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
              Write your next
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                bestseller
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-lg mx-auto">
              Describe your vision. We'll write a professional book with chapters, structure, and export-ready formatting.
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
                  <option value="10,000 words (~40 pages)" className="bg-gray-900">Short — ~40 pages (10k words)</option>
                  <option value="25,000 words (~100 pages)" className="bg-gray-900">Medium — ~100 pages (25k words)</option>
                  <option value="50,000 words (~200 pages)" className="bg-gray-900">Standard — ~200 pages (50k words)</option>
                  <option value="75,000 words (~300 pages)" className="bg-gray-900">Long — ~300 pages (75k words)</option>
                  <option value="100,000 words (~400 pages)" className="bg-gray-900">Epic — ~400 pages (100k words)</option>
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
                ✨ Generate Book
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex justify-center gap-6 mt-8 text-xs text-gray-600">
              <span>🔒 Your content stays private</span>
              <span>⚡ ~30 second generation</span>
              <span>📄 PDF & Google Docs export</span>
            </div>
          </div>
        )}

        {/* Generating State */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-32 px-4">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">✍️</span>
            </div>
            <h2 className="mt-8 text-2xl font-bold">Writing your book...</h2>
            <p className="mt-2 text-gray-400">Creating outline, chapters, and structure</p>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              This usually takes 15-30 seconds
            </div>
          </div>
        )}

        {/* Result */}
        {step === "result" && (
          <div className="mx-auto max-w-3xl px-4 py-8 pb-20">
            {/* Back + Title */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setStep("input")}
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                ← New Book
              </button>
              <div className="flex gap-3">
                <a
                  className="inline-flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-xl px-4 py-2 text-sm font-medium transition-all"
                  href={`/api/export/pdf?title=${encodeURIComponent(title)}&content=${encodeURIComponent(result)}`}
                  target="_blank"
                >
                  📄 Export PDF
                </a>
                <a
                  className="inline-flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-xl px-4 py-2 text-sm font-medium transition-all"
                  href={`/api/export/google/start?title=${encodeURIComponent(title)}&content=${encodeURIComponent(result)}`}
                  target="_blank"
                >
                  📝 Download .docx
                </a>
              </div>
            </div>

            {/* Book Content Card */}
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
              {/* Book Header */}
              <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-white/[0.06] p-8 text-center">
                <h2 className="text-3xl font-bold">{title}</h2>
                <div className="flex justify-center gap-3 mt-3 text-sm text-gray-400">
                  <span>{genre}</span>
                  <span>·</span>
                  <span>{tone}</span>
                  <span>·</span>
                  <span>{bookLength}</span>
                </div>
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
