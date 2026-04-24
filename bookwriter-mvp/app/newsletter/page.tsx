"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Real Estate", "E-commerce",
  "Education", "Legal", "Marketing", "Food & Beverage", "Travel",
  "Fitness & Wellness", "SaaS", "Consulting", "Nonprofit", "Other",
];

const NEWSLETTER_TYPES = [
  { key: "monthly", label: "Monthly Update", desc: "Company news, highlights, and upcoming events" },
  { key: "launch", label: "Product Launch", desc: "Announce new products or features" },
  { key: "insights", label: "Industry Insights", desc: "Thought leadership and market analysis" },
  { key: "spotlight", label: "Customer Spotlight", desc: "Case studies and success stories" },
  { key: "recap", label: "Event Recap", desc: "Conference, webinar, or event summaries" },
  { key: "seasonal", label: "Holiday/Seasonal", desc: "Seasonal greetings with company updates" },
];

const TONES = ["Professional", "Friendly", "Conversational", "Authoritative", "Inspirational"];

const SECTIONS_OPTIONS = [
  "Header with company branding",
  "CEO/Founder message",
  "Key metrics / numbers",
  "Featured article / blog post",
  "Team spotlight",
  "Upcoming events",
  "Social media links",
  "Footer with unsubscribe",
];

const WORD_COUNTS = [
  { key: "brief", label: "Brief (~300 words)", price: 0 },
  { key: "standard", label: "Standard (~600 words)", price: 0 },
  { key: "detailed", label: "Detailed (~1,000 words)", price: 0 },
  { key: "comprehensive", label: "Comprehensive (~1,500 words)", price: 0 },
];

const LANGUAGES = [
  "English", "Spanish", "French", "Portuguese", "German",
  "Italian", "Chinese", "Japanese", "Korean", "Arabic",
];

export default function NewsletterPage() {
  return (
    <Suspense>
      <NewsletterContent />
    </Suspense>
  );
}

function NewsletterContent() {
  const { data: session } = useSession();

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [newsletterType, setNewsletterType] = useState("monthly");
  const [tone, setTone] = useState("Professional");
  const [keyTopics, setKeyTopics] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [sections, setSections] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState("standard");
  const [language, setLanguage] = useState("English");

  const [step, setStep] = useState<"input" | "generating" | "result">("input");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  function toggleSection(s: string) {
    setSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  const selectedPrice = WORD_COUNTS.find(w => w.key === wordCount)?.price || 19;

  async function generate() {
    if (!companyName.trim() || !keyTopics.trim()) return;
    setStep("generating");
    setResult("");
    setError("");
    setProgress(0);
    setStatusText("Generating newsletter...");

    try {
      const res = await fetch("/api/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName, industry, newsletterType, tone, keyTopics,
          targetAudience, callToAction, sections, wordCount, language,
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
      let accumulated = "";

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
              case "chunk":
                accumulated += event.content;
                setResult(accumulated);
                break;
              case "complete":
                setResult(event.content);
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

      if (step !== "result" && !error) {
        if (accumulated) {
          setResult(accumulated);
          setStep("result");
        }
      }
    } catch {
      setError("Network error — please try again.");
      setStep("input");
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(result);
  }

  function exportAsHtml() {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;line-height:1.6}h1,h2,h3{color:#333}hr{border:none;border-top:1px solid #eee;margin:20px 0}</style></head><body>${result.replace(/\n/g, "<br>")}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${companyName.replace(/\s+/g, "-")}-newsletter.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportAsText() {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${companyName.replace(/\s+/g, "-")}-newsletter.txt`;
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
              Newsletter{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent italic">
                Generator
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-lg mx-auto">
              Professional email newsletters for your business, powered by AI.
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

        {/* Input Form */}
        {step === "input" && (
          <div className="mx-auto max-w-2xl px-4 pb-20">
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
            )}

            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Company Name */}
              <div>
                <label className={labelClass}>Company Name</label>
                <input className={inputClass} placeholder="e.g. Acme Corp" value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>

              {/* Industry + Tone */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Industry</label>
                  <select className={`${inputClass} appearance-none`} value={industry} onChange={e => setIndustry(e.target.value)}>
                    {INDUSTRIES.map(i => <option key={i} value={i} className="bg-gray-900">{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Tone</label>
                  <select className={`${inputClass} appearance-none`} value={tone} onChange={e => setTone(e.target.value)}>
                    {TONES.map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Newsletter Type — card selector */}
              <div>
                <label className={labelClass}>Newsletter Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {NEWSLETTER_TYPES.map(nt => (
                    <button
                      key={nt.key}
                      type="button"
                      onClick={() => setNewsletterType(nt.key)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        newsletterType === nt.key
                          ? "border-blue-500/50 bg-blue-500/10"
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="text-sm font-medium text-white">{nt.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{nt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Topics */}
              <div>
                <label className={labelClass}>Key Topics / Bullet Points</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={5}
                  placeholder="What should the newsletter cover? List key points, announcements, metrics, etc."
                  value={keyTopics}
                  onChange={e => setKeyTopics(e.target.value)}
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className={labelClass}>Target Audience</label>
                <input className={inputClass} placeholder="Who receives this? (e.g., customers, employees, investors, subscribers)" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
              </div>

              {/* Call to Action */}
              <div>
                <label className={labelClass}>Call to Action</label>
                <input className={inputClass} placeholder="What should readers do? (e.g., Visit our website, Register for webinar, Shop now)" value={callToAction} onChange={e => setCallToAction(e.target.value)} />
              </div>

              {/* Include Sections — checkboxes */}
              <div>
                <label className={labelClass}>Include Sections</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SECTIONS_OPTIONS.map(s => (
                    <label key={s} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleSection(s)}
                        className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                          sections.includes(s)
                            ? "bg-blue-600 border-blue-500"
                            : "bg-white/[0.04] border-white/[0.12] group-hover:border-white/[0.2]"
                        }`}
                      >
                        {sections.includes(s) && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="text-sm text-gray-300">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Word Count + Language */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Word Count Target</label>
                  <select className={`${inputClass} appearance-none`} value={wordCount} onChange={e => setWordCount(e.target.value)}>
                    {WORD_COUNTS.map(w => <option key={w.key} value={w.key} className="bg-gray-900">{w.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Language</label>
                  <select className={`${inputClass} appearance-none`} value={language} onChange={e => setLanguage(e.target.value)}>
                    {LANGUAGES.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl p-4 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:shadow-none"
                onClick={generate}
                disabled={!companyName.trim() || !keyTopics.trim() || !session}
              >
                {session ? "Generate Newsletter" : "Sign in to Generate"}
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
                  Generating Newsletter
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

              {/* Live preview */}
              {result && (
                <div ref={previewRef} className="border-t border-white/[0.06] pt-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans leading-relaxed">{result}</pre>
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
                Your Newsletter
              </h2>
              <button
                onClick={() => { setStep("input"); setResult(""); setError(""); }}
                className="text-sm text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-4 py-2 transition-all"
              >
                ← New Newsletter
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={copyToClipboard} className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-4 py-2.5 transition-all">
                📋 Copy to Clipboard
              </button>
              <button onClick={exportAsHtml} className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-4 py-2.5 transition-all">
                🌐 Export HTML
              </button>
              <button onClick={exportAsText} className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-4 py-2.5 transition-all">
                📄 Export Text
              </button>
            </div>

            {/* Rendered newsletter */}
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 sm:p-8">
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-200 font-sans leading-relaxed">{result}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
