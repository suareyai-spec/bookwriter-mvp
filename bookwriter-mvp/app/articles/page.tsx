"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const ARTICLE_TYPES = [
  { key: "news", label: "News Article" },
  { key: "opinion", label: "Opinion / Editorial" },
  { key: "howto", label: "How-To Guide" },
  { key: "listicle", label: "Listicle" },
  { key: "profile", label: "Profile / Interview" },
  { key: "research", label: "Research & Analysis" },
  { key: "essay", label: "Personal Essay" },
  { key: "review", label: "Product Review" },
  { key: "casestudy", label: "Case Study" },
  { key: "thought", label: "Thought Leadership" },
];

const TONES = [
  { key: "journalistic", label: "Journalistic", desc: "Objective, factual, AP-style" },
  { key: "conversational", label: "Conversational", desc: "Medium/blog style, personal voice" },
  { key: "academic", label: "Academic", desc: "Formal, research-backed" },
  { key: "provocative", label: "Provocative", desc: "Bold takes, engaging hooks" },
  { key: "storytelling", label: "Storytelling", desc: "Narrative-driven, immersive" },
  { key: "professional", label: "Professional", desc: "Business/corporate tone" },
];

const WORD_COUNTS = [
  { key: "short", label: "Short (500-800 words)" },
  { key: "standard", label: "Standard (1,000-1,500 words)" },
  { key: "longform", label: "Long-form (2,000-3,000 words)" },
  { key: "deepdive", label: "Deep Dive (4,000+ words)" },
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian", "Japanese",
  "Chinese (Simplified)", "Chinese (Traditional)", "Korean", "Arabic",
  "Russian", "Hindi", "Dutch", "Swedish", "Polish", "Turkish",
  "Vietnamese", "Thai", "Hebrew", "Greek",
];

export default function ArticlesPage() {
  return (
    <Suspense>
      <ArticlesContent />
    </Suspense>
  );
}

function ArticlesContent() {
  const { data: session } = useSession();

  const [articleType, setArticleType] = useState("news");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("journalistic");
  const [targetAudience, setTargetAudience] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [wordCount, setWordCount] = useState("standard");
  const [seoHeadlines, setSeoHeadlines] = useState(true);
  const [seoMeta, setSeoMeta] = useState(true);
  const [seoTags, setSeoTags] = useState(true);
  const [language, setLanguage] = useState("English");

  // Reference materials
  const [referencePdfs, setReferencePdfs] = useState<{ name: string; content: string }[]>([]);
  const [referenceText, setReferenceText] = useState("");
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  // Direction / style guidance
  const [direction, setDirection] = useState("");

  // Voice matching
  const [writingSample, setWritingSample] = useState("");

  const [step, setStep] = useState<"input" | "generating" | "result">("input");
  const [result, setResult] = useState("");
  const [seoData, setSeoData] = useState<{ headlines: string[]; metaDescription: string; tags: string[] } | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);
  const [copied, setCopied] = useState("");

  // Usage info
  const [usageInfo, setUsageInfo] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/usage")
        .then((r) => r.json())
        .then((d) => {
          if (d.monthlyArticleLimit !== undefined) {
            setUsageInfo({ used: d.monthlyArticlesUsed || 0, limit: d.monthlyArticleLimit });
          }
        })
        .catch(() => {});
    }
  }, [session]);

  async function generate() {
    if (!topic.trim()) return;
    setStep("generating");
    setResult("");
    setSeoData(null);
    setError("");
    setProgress(0);
    setStatusText("Preparing article...");

    try {
      // Combine all reference text (PDFs already extracted at upload time)
      const allRefText = [
        ...referencePdfs.map(p => `[PDF: ${p.name}]\n${p.content}`),
        ...(referenceText.trim() ? [`[Pasted Reference Text]\n${referenceText.trim()}`] : []),
      ].join("\n\n").slice(0, 50000);

      const res = await fetch("/api/articles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleType, topic, tone, targetAudience, keyPoints,
          direction: direction.trim() || undefined,
          referenceUrl: referenceUrl || undefined, wordCount,
          seoHeadlines, seoMeta, seoTags, language,
          referenceText: allRefText || undefined,
          writingSample: writingSample.trim() || undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Failed to connect" }));
        setError(data.error || "Generation failed");
        setStep("input");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(trimmed.slice(6));
            switch (event.type) {
              case "progress":
                setProgress(event.percent || 0);
                setStatusText(event.status || "Generating...");
                break;
              case "content":
                setResult(event.content);
                break;
              case "seo":
                setSeoData({ headlines: event.headlines || [], metaDescription: event.metaDescription || "", tags: event.tags || [] });
                break;
              case "complete":
                setStep("result");
                break;
              case "error":
                setError(event.message);
                setStep("input");
                break;
            }
          } catch {}
        }
      }

      if (step !== "result" && !error && result) {
        setStep("result");
      }
    } catch {
      setError("Network error -- please try again.");
      setStep("input");
    }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  }

  function renderMarkdown(md: string) {
    // Simple markdown to HTML
    let html = md
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-300">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-gray-300"><span class="text-gray-500 mr-1">$1.</span> $2</li>')
      .replace(/\n{2,}/g, '</p><p class="text-gray-300 leading-relaxed mb-4">')
      .replace(/\n/g, "<br>");
    html = '<p class="text-gray-300 leading-relaxed mb-4">' + html + "</p>";
    return html;
  }

  function getArticleAsMarkdown() {
    return editing ? editText : result;
  }

  function getArticleAsHtml() {
    const md = getArticleAsMarkdown();
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Georgia,serif;max-width:720px;margin:0 auto;padding:40px 20px;line-height:1.8;color:#333}h1{font-size:2em;margin-bottom:0.5em}h2{font-size:1.5em;margin-top:1.5em}h3{font-size:1.2em}blockquote{border-left:3px solid #ccc;margin:1em 0;padding-left:1em;color:#666}ul,ol{margin:1em 0;padding-left:2em}strong{font-weight:700}</style></head><body>${renderMarkdown(md)}</body></html>`;
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";
  const labelClass = "block text-sm font-medium text-gray-300 mb-2";

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white selection:bg-blue-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Header */}
        {step === "input" && (
          <div className="text-center pt-8 pb-8 px-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Article{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent italic">
                Writer
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-lg mx-auto">
              Publication-ready articles for any format, powered by AI.
            </p>
          </div>
        )}

        {/* Sign up prompt when not signed in */}
        {step === "input" && !session && (
          <div className="mx-auto max-w-3xl px-4 pb-8">
            <p className="text-center text-sm text-gray-500">
              <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">Sign up</Link> to get started.
            </p>
          </div>
        )}

        {/* Usage info for signed-in users */}
        {step === "input" && session && usageInfo && (
          <div className="mx-auto max-w-2xl px-4 pb-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center text-sm text-gray-400">
              Articles this month: <span className="text-white font-semibold">{usageInfo.used}</span> / <span className="text-white">{usageInfo.limit >= 50 ? "~50 (fair use)" : usageInfo.limit}</span>
              {usageInfo.used >= usageInfo.limit && (
                <span className="text-amber-400 ml-2">-- additional articles available for purchase</span>
              )}
            </div>
          </div>
        )}

        {/* Input Form */}
        {step === "input" && (
          <div className="mx-auto max-w-2xl px-4 pb-20">
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
            )}

            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Article Type */}
              <div>
                <label className={labelClass}>Article Type</label>
                <select className={`${inputClass} appearance-none`} value={articleType} onChange={e => setArticleType(e.target.value)}>
                  {ARTICLE_TYPES.map(t => <option key={t.key} value={t.key} className="bg-gray-900">{t.label}</option>)}
                </select>
              </div>

              {/* Direction */}
              <div>
                <label className={labelClass}>Direction</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={4}
                  placeholder="Tell the AI how to approach this article. What to focus on, what to exclude, what angle to take, what style to write in..."
                  value={direction}
                  onChange={e => setDirection(e.target.value.slice(0, 3000))}
                  maxLength={3000}
                />
                <div className="text-xs text-gray-600 mt-1 text-right">{direction.length}/3,000</div>
              </div>

              {/* Topic */}
              <div>
                <label className={labelClass}>Topic / Subject</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={4}
                  placeholder="Describe what the article is about..."
                  value={topic}
                  onChange={e => setTopic(e.target.value.slice(0, 2000))}
                  maxLength={2000}
                />
                <div className="text-xs text-gray-600 mt-1 text-right">{topic.length}/2,000</div>
              </div>

              {/* Tone + Word Count */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tone</label>
                  <select className={`${inputClass} appearance-none`} value={tone} onChange={e => setTone(e.target.value)}>
                    {TONES.map(t => <option key={t.key} value={t.key} className="bg-gray-900">{t.label} -- {t.desc}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Word Count Target</label>
                  <select className={`${inputClass} appearance-none`} value={wordCount} onChange={e => setWordCount(e.target.value)}>
                    {WORD_COUNTS.map(w => <option key={w.key} value={w.key} className="bg-gray-900">{w.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className={labelClass}>Target Audience</label>
                <input
                  className={inputClass}
                  placeholder='e.g., "startup founders", "healthcare professionals", "general public"'
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                />
              </div>

              {/* Key Points */}
              <div>
                <label className={labelClass}>Key Points / Outline <span className="text-gray-600">(optional)</span></label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={4}
                  placeholder="Bullet points or notes the article should cover..."
                  value={keyPoints}
                  onChange={e => setKeyPoints(e.target.value.slice(0, 5000))}
                  maxLength={5000}
                />
                <div className="text-xs text-gray-600 mt-1 text-right">{keyPoints.length}/5,000</div>
              </div>

              {/* Reference Materials */}
              <div>
                <label className={labelClass}>Reference Materials <span className="text-gray-600">(optional)</span></label>
                <p className="text-xs text-gray-500 mb-3">Upload PDFs or paste text you want the article to draw from.</p>

                {/* PDF Upload */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1.5">PDF Files (up to 3, max 10MB each)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      if (referencePdfs.length + files.length > 3) {
                        setPdfError("Maximum 3 PDF files allowed");
                        return;
                      }
                      for (const f of files) {
                        if (f.size > 10 * 1024 * 1024) {
                          setPdfError(`"${f.name}" exceeds 10MB limit`);
                          return;
                        }
                      }
                      setPdfUploading(true);
                      setPdfError("");
                      try {
                        const formData = new FormData();
                        for (const file of files) formData.append("files", file);
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        if (!res.ok) {
                          const d = await res.json().catch(() => ({ error: "Upload failed" }));
                          setPdfError(d.error || "Upload failed");
                          return;
                        }
                        const data = await res.json();
                        setReferencePdfs(prev => [
                          ...prev,
                          ...data.files.map((f: { name: string; content: string }) => ({ name: f.name, content: f.content })),
                        ]);
                      } catch {
                        setPdfError("Failed to upload PDF");
                      } finally {
                        setPdfUploading(false);
                        e.target.value = "";
                      }
                    }}
                    className="hidden"
                    id="pdf-upload"
                    disabled={pdfUploading}
                  />
                  <label
                    htmlFor="pdf-upload"
                    className={`inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-gray-300 cursor-pointer transition-all ${pdfUploading ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {pdfUploading ? "Processing PDF..." : "Upload PDF"}
                  </label>
                  {pdfError && <p className="text-red-400 text-xs mt-1">{pdfError}</p>}
                  {referencePdfs.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {referencePdfs.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm">
                          <span className="text-gray-300 truncate">{f.name}</span>
                          <span className="text-gray-600 text-xs mx-2">{(f.content.length / 1000).toFixed(0)}K chars</span>
                          <button
                            onClick={() => setReferencePdfs(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-gray-500 hover:text-red-400 text-xs ml-1 flex-shrink-0 transition-colors"
                          >
                            remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reference Text Paste */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Paste Reference Text</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={4}
                    placeholder="Paste notes, research, or any text you want the article to reference..."
                    value={referenceText}
                    onChange={e => setReferenceText(e.target.value.slice(0, 30000))}
                    maxLength={30000}
                  />
                  <div className="text-xs text-gray-600 mt-1 text-right">{referenceText.length}/30,000</div>
                </div>
              </div>

              {/* Writing Sample for Voice Matching */}
              <div>
                <label className={labelClass}>Writing Sample <span className="text-gray-600">(optional)</span></label>
                <p className="text-xs text-gray-500 mb-3">Paste your own writing and we'll match your style.</p>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={5}
                  placeholder="Paste a sample of your writing (500-5,000 words) and the article will match your voice..."
                  value={writingSample}
                  onChange={e => setWritingSample(e.target.value.slice(0, 10000))}
                  maxLength={10000}
                />
                <div className="text-xs text-gray-600 mt-1 text-right">{writingSample.length}/10,000</div>
              </div>

              {/* Reference URL */}
              <div>
                <label className={labelClass}>Reference URL <span className="text-gray-600">(optional)</span></label>
                <input
                  className={inputClass}
                  placeholder="https://example.com/source-article"
                  value={referenceUrl}
                  onChange={e => setReferenceUrl(e.target.value)}
                  type="url"
                />
              </div>

              {/* Language */}
              <div>
                <label className={labelClass}>Language</label>
                <select className={`${inputClass} appearance-none`} value={language} onChange={e => setLanguage(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
                </select>
              </div>

              {/* SEO Options */}
              <div>
                <label className={labelClass}>SEO Options</label>
                <div className="space-y-2">
                  {[
                    { label: "Generate headline alternatives", state: seoHeadlines, set: setSeoHeadlines },
                    { label: "Generate meta description", state: seoMeta, set: setSeoMeta },
                    { label: "Generate suggested tags", state: seoTags, set: setSeoTags },
                  ].map(opt => (
                    <label key={opt.label} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => opt.set(!opt.state)}
                        className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                          opt.state
                            ? "bg-blue-600 border-blue-500"
                            : "bg-white/[0.04] border-white/[0.12] group-hover:border-white/[0.2]"
                        }`}
                      >
                        {opt.state && <span className="text-white text-xs">&#10003;</span>}
                      </div>
                      <span className="text-sm text-gray-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl p-4 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:shadow-none"
                onClick={generate}
                disabled={!topic.trim() || !session}
              >
                {session ? "Generate Article" : "Sign in to Generate"}
              </button>
            </div>
          </div>
        )}

        {/* Generating State */}
        {step === "generating" && (
          <div className="mx-auto max-w-3xl px-4 py-8 pb-20">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Writing Article
                </h2>
                <p className="text-gray-400 text-sm">{statusText}</p>
              </div>

              <div className="mb-6">
                <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(progress, 5)}%` }}
                  />
                </div>
              </div>

              {result && (
                <div className="border-t border-white/[0.06] pt-4 max-h-96 overflow-y-auto">
                  <div className="text-sm text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result State */}
        {step === "result" && (
          <div className="mx-auto max-w-3xl px-4 py-8 pb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Your Article
              </h2>
              <button
                onClick={() => { setStep("input"); setResult(""); setSeoData(null); setError(""); setEditing(false); }}
                className="text-sm text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-4 py-2 transition-all"
              >
                New Article
              </button>
            </div>

            {/* Export buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => copyText(result, "clipboard")} className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-4 py-2.5 transition-all">
                {copied === "clipboard" ? "Copied" : "Copy to Clipboard"}
              </button>
              <button onClick={() => copyText(result, "markdown")} className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-4 py-2.5 transition-all">
                {copied === "markdown" ? "Copied" : "Copy as Markdown"}
              </button>
              <button onClick={() => downloadFile(getArticleAsHtml(), "article.html", "text/html")} className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-4 py-2.5 transition-all">
                Download HTML
              </button>
              <button onClick={() => downloadFile(result, "article.md", "text/markdown")} className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-4 py-2.5 transition-all">
                Download Markdown
              </button>
              <button
                onClick={() => { setEditing(!editing); if (!editing) setEditText(result); }}
                className={`flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 transition-all ${editing ? "bg-blue-600 text-white" : "bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white"}`}
              >
                {editing ? "Preview" : "Edit"}
              </button>
            </div>

            {/* SEO Panel */}
            {seoData && (seoData.headlines.length > 0 || seoData.metaDescription || seoData.tags.length > 0) && (
              <div className="mb-6">
                <button
                  onClick={() => setSeoOpen(!seoOpen)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-left flex items-center justify-between hover:bg-white/[0.05] transition-all"
                >
                  <span className="text-sm font-medium text-gray-300">SEO Elements</span>
                  <span className="text-gray-500 text-xs">{seoOpen ? "collapse" : "expand"}</span>
                </button>
                {seoOpen && (
                  <div className="bg-white/[0.02] border border-white/[0.06] border-t-0 rounded-b-xl p-4 space-y-4">
                    {seoData.headlines.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Headline Alternatives</div>
                        {seoData.headlines.map((h, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 mb-2 group">
                            <span className="text-sm text-gray-300">{h}</span>
                            <button
                              onClick={() => copyText(h, `h${i}`)}
                              className="text-xs text-gray-500 hover:text-white ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copied === `h${i}` ? "copied" : "copy"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {seoData.metaDescription && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Meta Description</div>
                        <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 group">
                          <span className="text-sm text-gray-300">{seoData.metaDescription}</span>
                          <button
                            onClick={() => copyText(seoData.metaDescription, "meta")}
                            className="text-xs text-gray-500 hover:text-white ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copied === "meta" ? "copied" : "copy"}
                          </button>
                        </div>
                      </div>
                    )}
                    {seoData.tags.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Suggested Tags</div>
                        <div className="flex flex-wrap gap-2">
                          {seoData.tags.map((tag, i) => (
                            <button
                              key={i}
                              onClick={() => copyText(tag, `tag${i}`)}
                              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-gray-300 hover:bg-white/[0.08] transition-all"
                            >
                              {copied === `tag${i}` ? "copied" : tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Article content */}
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 sm:p-8">
              {editing ? (
                <textarea
                  className="w-full bg-transparent text-sm text-gray-200 font-sans leading-relaxed resize-none focus:outline-none min-h-[400px]"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={30}
                />
              ) : (
                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(editing ? editText : result) }} />
              )}
            </div>

            <div className="mt-4 text-center text-xs text-gray-600">
              Auto-saved to your library
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
