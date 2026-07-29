"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import GenerateButton from "@/components/GenerateButton";
import { getCreditCost } from "@/lib/credits";

const DOCUMENT_TYPES = ["White Paper", "Industry Report", "Research Report", "Annual Report", "Case Study Report", "Executive Brief"] as const;
const TONES = ["Authoritative", "Academic", "Consultative", "Data-driven"] as const;
const LENGTHS = [
  { key: "short", label: "Short (6-8 pages)" },
  { key: "standard", label: "Standard (10-15 pages)" },
  { key: "comprehensive", label: "Comprehensive (16-25 pages)" },
] as const;
const CITATION_STYLES = [
  { key: "none", label: "None" },
  { key: "apa", label: "APA" },
  { key: "chicago", label: "Chicago" },
] as const;

interface Reference {
  type: "pdf" | "gdoc" | "text";
  name: string;
  content: string;
}

export default function WhitepaperPage() {
  const { status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState<(typeof DOCUMENT_TYPES)[number]>("White Paper");
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [centralThesis, setCentralThesis] = useState("");
  const [supportingPoints, setSupportingPoints] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Authoritative");
  const [length, setLength] = useState<(typeof LENGTHS)[number]["key"]>("standard");
  const [organization, setOrganization] = useState("");
  const [citationStyle, setCitationStyle] = useState<(typeof CITATION_STYLES)[number]["key"]>("none");
  const [language, setLanguage] = useState("English");

  const [references, setReferences] = useState<Reference[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [gdocUrl, setGdocUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to upload PDF");
      } else {
        const uploaded = data.files?.[0];
        setReferences((prev) => [...prev, { type: "pdf", name: uploaded?.name || file.name, content: uploaded?.content || "" }]);
      }
    } catch {
      setError("Failed to upload PDF");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleGdocAdd() {
    if (!gdocUrl.trim()) return;
    setError(null);
    try {
      const res = await fetch("/api/fetch-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: gdocUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch document");
        return;
      }
      setReferences((prev) => [...prev, { type: "gdoc", name: data.name || gdocUrl, content: data.content || "" }]);
      setGdocUrl("");
    } catch {
      setError("Failed to fetch document");
    }
  }

  function handlePasteAdd() {
    if (!pasteText.trim()) return;
    setReferences((prev) => [...prev, { type: "text", name: `Pasted text ${prev.length + 1}`, content: pasteText }]);
    setPasteText("");
  }

  function removeReference(idx: number) {
    setReferences((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("Document title is required"); return; }
    if (!topic.trim()) { setError("Topic / subject matter is required"); return; }
    if (!targetAudience.trim()) { setError("Target audience is required"); return; }
    if (!centralThesis.trim()) { setError("Key argument / central thesis is required"); return; }
    if (!organization.trim()) { setError("Organization / author name is required"); return; }

    setError(null);
    setLoading(true);
    setGenerating(true);
    setProgress("Starting generation...");
    setCurrentSection(0);
    setTotalSections(0);
    setStreamContent([]);

    try {
      const res = await fetch("/api/special/whitepaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          documentType,
          topic,
          targetAudience,
          centralThesis,
          supportingPoints,
          tone,
          length,
          organization,
          citationStyle,
          language,
          references,
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

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-slate-400/40 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  if (generating) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-slate-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          <Navbar />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <div className="text-center mb-8">
              <div className="w-12 h-12 border-2 border-slate-400/20 border-t-slate-300 rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Generating your {documentType}
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
                      className="bg-gradient-to-r from-slate-500 to-slate-300 h-2.5 rounded-full transition-all duration-500"
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
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-slate-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Create a White Paper or Report
          </h1>
          <p className="text-gray-400 mb-8">
            A publish-ready white paper, industry report, or executive brief — structured, evidence-based, and written for decision-makers. Costs <strong className="text-white">{getCreditCost(`whitepaper_${length}`)} credits</strong> for the selected length and takes <strong className="text-white">~3-5 min</strong> to generate.
          </p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className={labelClass}>Document Title</label>
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Hidden Cost of Manual Compliance Reviews" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Document Type</label>
                <select className={inputClass} value={documentType} onChange={(e) => setDocumentType(e.target.value as any)}>
                  {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Organization / Author Name</label>
                <input className={inputClass} value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="e.g. Meridian Consulting" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Topic / Subject Matter</label>
              <input className={inputClass} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. AI adoption risk in mid-market healthcare systems" />
            </div>

            <div>
              <label className={labelClass}>Target Audience</label>
              <input className={inputClass} value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. C-suite executives in healthcare, SMB owners, enterprise procurement teams" />
            </div>

            <div>
              <label className={labelClass}>Key Argument / Central Thesis</label>
              <textarea className={inputClass} rows={3} value={centralThesis} onChange={(e) => setCentralThesis(e.target.value)} placeholder="What position is this document taking?" />
            </div>

            <div>
              <label className={labelClass}>Supporting Points (optional)</label>
              <textarea className={inputClass} rows={4} value={supportingPoints} onChange={(e) => setSupportingPoints(e.target.value)} placeholder={"3-5 points the document should cover, one per line"} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tone</label>
                <select className={inputClass} value={tone} onChange={(e) => setTone(e.target.value as any)}>
                  {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Length</label>
                <select className={inputClass} value={length} onChange={(e) => setLength(e.target.value as any)}>
                  {LENGTHS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Citation Style</label>
              <select className={inputClass} value={citationStyle} onChange={(e) => setCitationStyle(e.target.value as any)}>
                {CITATION_STYLES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>

            {/* Reference Materials */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Reference Materials (optional)</h3>
              <div className="space-y-3">
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="text-sm bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-4 py-2 transition-all text-gray-300">
                    Upload PDF
                  </button>
                </div>
                <div className="flex gap-2">
                  <input className={`${inputClass} flex-1`} value={gdocUrl} onChange={(e) => setGdocUrl(e.target.value)} placeholder="Google Docs URL" />
                  <button onClick={handleGdocAdd} className="text-sm bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-4 py-2 transition-all text-gray-300 whitespace-nowrap">
                    Add
                  </button>
                </div>
                <div className="flex gap-2">
                  <textarea className={`${inputClass} flex-1`} rows={2} value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="Paste reference text..." />
                  <button onClick={handlePasteAdd} className="text-sm bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-4 py-2 transition-all text-gray-300 self-end whitespace-nowrap">
                    Add
                  </button>
                </div>
                {references.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {references.map((ref, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 text-sm">
                        <span className="text-gray-400 flex-1 truncate">{ref.name}</span>
                        <span className="text-xs text-gray-500">{ref.type}</span>
                        <button onClick={() => removeReference(i)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Language</label>
              <select className={inputClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
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

            <GenerateButton
              cost={getCreditCost(`whitepaper_${length}`)}
              label="Generate Document"
              onClick={handleSubmit}
              loading={loading}
              disabled={!title.trim()}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
