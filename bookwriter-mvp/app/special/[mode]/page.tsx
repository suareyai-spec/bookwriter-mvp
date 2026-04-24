"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { generateSpecialPremise } from "@/lib/auto-generate";

const MODE_CONFIG: Record<string, {
  title: string;
  contentType: string;
  tiers: { key: string; label: string; price: number; premium?: boolean }[];
  color: string;
  premiumPackage?: string;
}> = {
  comic: {
    title: "Comic Book",
    contentType: "comic",
    tiers: [
      { key: "comic_single", label: "Single Issue", price: 99 },
      { key: "comic_full", label: "Full Story Arc", price: 249 },
      { key: "premium-comic", label: "⭐ Premium Package", price: 399, premium: true },
    ],
    color: "rose",
    premiumPackage: "premium-comic",
  },
  playwright: {
    title: "Playwright",
    contentType: "play",
    tiers: [
      { key: "play_standard", label: "Standard Play", price: 149 },
      { key: "play_long", label: "Long Multi-Act Play", price: 249 },
      { key: "premium-playwright", label: "⭐ Premium Package", price: 399, premium: true },
    ],
    color: "amber",
    premiumPackage: "premium-playwright",
  },
  thesis: {
    title: "Educational / Thesis",
    contentType: "thesis",
    tiers: [
      { key: "thesis_standard", label: "Standard", price: 199 },
      { key: "thesis_doctoral", label: "Doctoral-Level", price: 299 },
      { key: "doctoral-thesis", label: "⭐ Premium Doctoral", price: 499, premium: true },
    ],
    color: "cyan",
    premiumPackage: "doctoral-thesis",
  },
  course: {
    title: "Influencer Course Builder",
    contentType: "course",
    tiers: [
      { key: "course_mini", label: "Mini (5-7 lessons)", price: 99 },
      { key: "course_full", label: "Full (10-20 lessons)", price: 199 },
      { key: "course_premium", label: "Premium + Workbook", price: 249 },
      { key: "course-builder-pro", label: "⭐ Pro Package", price: 399, premium: true },
    ],
    color: "violet",
    premiumPackage: "course-builder-pro",
  },
};

interface Reference {
  type: "pdf" | "gdoc" | "text";
  name: string;
  content: string;
}

export default function SpecialModePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const mode = params.mode as string;
  const config = MODE_CONFIG[mode];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [tone, setTone] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [characters, setCharacters] = useState("");
  const [selectedTier, setSelectedTier] = useState(config?.tiers[0]?.key || "");

  // Thesis-specific
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [thesisStatement, setThesisStatement] = useState("");
  const [citationStyle, setCitationStyle] = useState("apa");
  const [methodologyType, setMethodologyType] = useState("");
  const [targetLength, setTargetLength] = useState("");

  // Course-specific
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platform, setPlatform] = useState("general");

  // References
  const [language, setLanguage] = useState("English");
  const [references, setReferences] = useState<Reference[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [gdocUrl, setGdocUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation state
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [currentSection, setCurrentSection] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [genStartTime, setGenStartTime] = useState(0);
  const [streamContent, setStreamContent] = useState<string[]>([]);
  const [bookId, setBookId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  if (!config) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Mode not found</h1>
          <p className="text-gray-400">Invalid content mode. Please choose from the available modes.</p>
        </div>
      </main>
    );
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setReferences((prev) => [...prev, { type: "pdf", name: file.name, content: data.text || data.content || "" }]);
      }
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleGdocAdd() {
    if (!gdocUrl.trim()) return;
    try {
      const res = await fetch("/api/fetch-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: gdocUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setReferences((prev) => [...prev, { type: "gdoc", name: gdocUrl, content: data.text || data.content || "" }]);
        setGdocUrl("");
      }
    } catch {}
  }

  function handlePasteAdd() {
    if (!pasteText.trim()) return;
    setReferences((prev) => [...prev, { type: "text", name: `Pasted text ${prev.length + 1}`, content: pasteText }]);
    setPasteText("");
  }

  function removeReference(idx: number) {
    setReferences((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleCheckoutAndGenerate() {
    if (!title.trim()) { setError("Title is required"); return; }
    setError(null);
    setLoading(true);

    // Build params
    const params: Record<string, unknown> = {
      mode,
      tier: selectedTier,
      title,
      description,
      references,
      language,
    };

    if (mode === "comic" || mode === "playwright") {
      params.genre = genre;
      params.tone = tone;
      params.synopsis = synopsis;
      params.characters = characters;
    }
    if (mode === "thesis") {
      params.fieldOfStudy = fieldOfStudy;
      params.thesisStatement = thesisStatement;
      params.citationStyle = citationStyle;
      params.methodologyType = methodologyType;
      params.targetLength = targetLength;
    }
    if (mode === "course") {
      params.topic = topic;
      params.targetAudience = targetAudience;
      params.tone = tone;
      params.platform = platform;
    }

    try {
      // Determine if this is a premium package purchase
      const selectedTierConfig = config.tiers.find((t) => t.key === selectedTier);
      const isPremium = selectedTierConfig?.premium;
      const checkoutBody = isPremium
        ? { packageType: selectedTier }
        : { tier: selectedTier };

      // First, checkout
      const checkoutRes = await fetch("/api/special/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutBody),
      });
      const checkoutData = await checkoutRes.json();

      if (checkoutData.url) {
        // Store params in sessionStorage for after redirect
        sessionStorage.setItem("special_params", JSON.stringify(params));
        window.location.href = checkoutData.url;
        return;
      }

      if (checkoutData.skipPayment) {
        // Admin bypass — go straight to generation
        await startGeneration(params);
        return;
      }

      setError(checkoutData.error || "Checkout failed");
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  }

  async function startGeneration(params: Record<string, unknown>) {
    setGenerating(true);
    setProgress("Starting generation...");
    setCurrentSection(0);
    setTotalSections(0);
    setGenStartTime(Date.now());

    try {
      const res = await fetch("/api/special/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Generation failed");
        setGenerating(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) { setError("No stream"); setGenerating(false); return; }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "bookId") setBookId(data.bookId);
            if (data.type === "outline" && data.totalSections) setTotalSections(data.totalSections);
            if (data.type === "progress") {
              setProgress(data.title || data.status || "Generating...");
              if (data.chapter) setCurrentSection(data.chapter);
              if (data.totalChapters) setTotalSections(data.totalChapters);
            }
            if (data.type === "section" || data.type === "chapter") {
              setStreamContent((prev) => [...prev, data.content]);
              if (data.chapter) setCurrentSection(data.chapter);
            }
            if (data.type === "complete") {
              setGenerating(false);
              if (data.bookId) router.push(`/library/${data.bookId}`);
            }
            if (data.type === "error") {
              setError(data.message);
              setGenerating(false);
            }
          } catch {}
        }
      }
    } catch {
      setError("Generation failed. Please try again.");
      setGenerating(false);
    }
  }

  // Check for returning from Stripe checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("paid") === "true") {
      const stored = sessionStorage.getItem("special_params");
      if (stored) {
        sessionStorage.removeItem("special_params");
        const params = JSON.parse(stored);
        startGeneration(params);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/[0.2] transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  if (generating) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          <Navbar />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <div className="text-center mb-8">
              <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Generating your {config.title}
              </h2>
              <p className="text-gray-400 mb-4">{progress}</p>
              {totalSections > 0 && (
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Section {currentSection} of {totalSections}</span>
                    <span>{Math.round((currentSection / totalSections) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2.5 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, (currentSection / totalSections) * 100)}%` }}
                    />
                  </div>
                  {currentSection > 0 && genStartTime > 0 && (
                    <p className="text-xs text-gray-500">
                      {(() => {
                        const elapsed = (Date.now() - genStartTime) / 1000;
                        const perSection = elapsed / currentSection;
                        const remaining = Math.round(perSection * (totalSections - currentSection));
                        if (remaining < 60) return `~${remaining}s remaining`;
                        return `~${Math.round(remaining / 60)}m ${remaining % 60}s remaining`;
                      })()}
                    </p>
                  )}
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
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Create {config.title}
          </h1>
          <p className="text-gray-400 mb-8">Fill in the details below and choose your tier.</p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className={labelClass}>Title</label>
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Your ${config.title.toLowerCase()} title`} />
            </div>

            {/* Mode-specific fields */}
            {(mode === "comic" || mode === "playwright") && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Genre</label>
                    <input className={inputClass} value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. Sci-Fi, Drama, Fantasy" />
                  </div>
                  <div>
                    <label className={labelClass}>Tone</label>
                    <input className={inputClass} value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g. Dark, Humorous, Epic" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Synopsis</label>
                  <textarea className={inputClass} rows={3} value={synopsis} onChange={(e) => setSynopsis(e.target.value)} placeholder="Brief overview of the story..." />
                </div>
                <div>
                  <label className={labelClass}>Characters</label>
                  <textarea className={inputClass} rows={3} value={characters} onChange={(e) => setCharacters(e.target.value)} placeholder="Describe your main characters, their traits, and relationships..." />
                </div>
              </>
            )}

            {mode === "thesis" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Field of Study</label>
                    <input className={inputClass} value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} placeholder="e.g. Psychology, Computer Science" />
                  </div>
                  <div>
                    <label className={labelClass}>Citation Style</label>
                    <select className={inputClass} value={citationStyle} onChange={(e) => setCitationStyle(e.target.value)}>
                      <option value="apa">APA</option>
                      <option value="mla">MLA</option>
                      <option value="chicago">Chicago</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Thesis Statement</label>
                  <textarea className={inputClass} rows={2} value={thesisStatement} onChange={(e) => setThesisStatement(e.target.value)} placeholder="Your central thesis or research question..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Methodology Type</label>
                    <input className={inputClass} value={methodologyType} onChange={(e) => setMethodologyType(e.target.value)} placeholder="e.g. Qualitative, Quantitative, Mixed" />
                  </div>
                  <div>
                    <label className={labelClass}>Target Length</label>
                    <input className={inputClass} value={targetLength} onChange={(e) => setTargetLength(e.target.value)} placeholder="e.g. 10,000 words, 50 pages" />
                  </div>
                </div>
              </>
            )}

            {mode === "course" && (
              <>
                <div>
                  <label className={labelClass}>Topic</label>
                  <input className={inputClass} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What is this course about?" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Target Audience</label>
                    <input className={inputClass} value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. Beginners, Business owners" />
                  </div>
                  <div>
                    <label className={labelClass}>Tone</label>
                    <input className={inputClass} value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g. Casual, Professional, Motivational" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Platform</label>
                  <select className={inputClass} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    <option value="general">General</option>
                    <option value="youtube">YouTube</option>
                    <option value="udemy">Udemy</option>
                  </select>
                </div>
              </>
            )}

            {/* Description / Vision */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-300">Description / Vision</label>
                <button
                  type="button"
                  onClick={() => {
                    setDescription(generateSpecialPremise(mode, genre, title, tone));
                    const btn = document.getElementById('auto-gen-btn-special');
                    if (btn) { btn.classList.add('animate-spin-once'); setTimeout(() => btn.classList.remove('animate-spin-once'), 500); }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-blue-400 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/30 rounded-lg px-3 py-1.5 transition-all"
                >
                  <span id="auto-gen-btn-special" className="inline-block transition-transform">🎲</span> Random Idea
                </button>
              </div>
              <textarea
                className={inputClass}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your vision, goals, style preferences, and any specific requirements..."
              />
            </div>

            {/* Tier Selection */}
            <div>
              <label className={labelClass}>Select Tier</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {config.tiers.map((tier) => (
                  <button
                    key={tier.key}
                    onClick={() => setSelectedTier(tier.key)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      selectedTier === tier.key
                        ? tier.premium
                          ? "border-amber-500/40 bg-amber-500/10"
                          : "border-white/30 bg-white/[0.08]"
                        : tier.premium
                          ? "border-amber-500/20 bg-amber-500/[0.03] hover:bg-amber-500/[0.06]"
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className={`text-lg font-bold ${tier.premium ? "text-amber-400" : ""}`}>${tier.price}</div>
                    <div className={`text-xs mt-1 ${tier.premium ? "text-amber-400/70" : "text-gray-400"}`}>{tier.label}</div>
                    {tier.premium && <div className="text-[10px] text-amber-500/60 mt-0.5">Enhanced features</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Materials */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Reference Materials (optional)</h3>

              <div className="space-y-3">
                {/* File upload */}
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.doc,.docx" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="text-sm bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-4 py-2 transition-all text-gray-300">
                    Upload PDF / Document
                  </button>
                </div>

                {/* Google Docs */}
                <div className="flex gap-2">
                  <input className={`${inputClass} flex-1`} value={gdocUrl} onChange={(e) => setGdocUrl(e.target.value)} placeholder="Google Docs URL" />
                  <button onClick={handleGdocAdd} className="text-sm bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-4 py-2 transition-all text-gray-300 whitespace-nowrap">
                    Add
                  </button>
                </div>

                {/* Paste text */}
                <div className="flex gap-2">
                  <textarea className={`${inputClass} flex-1`} rows={2} value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="Paste reference text..." />
                  <button onClick={handlePasteAdd} className="text-sm bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-4 py-2 transition-all text-gray-300 self-end whitespace-nowrap">
                    Add
                  </button>
                </div>

                {/* Reference list */}
                {references.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {references.map((ref, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 text-sm">
                        <span className="text-gray-400 flex-1 truncate">{ref.name}</span>
                        <span className="text-xs text-gray-500">{ref.type}</span>
                        <button onClick={() => removeReference(i)} className="text-red-400 hover:text-red-300 text-xs">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <select
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Italian">Italian</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese">Chinese (Simplified)</option>
                <option value="Korean">Korean</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>

            {/* Submit */}
            <button
              onClick={handleCheckoutAndGenerate}
              disabled={loading || !title.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl p-4 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 text-lg"
            >
              {loading ? "Processing..." : `Purchase & Generate — $${config.tiers.find((t) => t.key === selectedTier)?.price || ""}`}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
