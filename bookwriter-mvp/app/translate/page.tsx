"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian", "Japanese",
  "Chinese (Simplified)", "Chinese (Traditional)", "Korean", "Arabic",
  "Russian", "Hindi", "Dutch", "Swedish", "Polish", "Turkish",
  "Vietnamese", "Thai", "Hebrew", "Greek",
];

function calculatePrice(wordCount: number): { price: number; tier: string; description: string } {
  if (wordCount <= 0) return { price: 0, tier: "—", description: "Enter text to see pricing" };
  if (wordCount <= 5000) return { price: 0, tier: "Short Text", description: "Included with all plans (under 5,000 words)" };
  if (wordCount <= 20000) return { price: 0, tier: "Full Book — Short", description: "Counts as a book credit (Studio: included)" };
  if (wordCount <= 40000) return { price: 0, tier: "Full Book — Medium", description: "Counts as a book credit (Studio: included)" };
  if (wordCount <= 60000) return { price: 0, tier: "Full Book — Standard", description: "Counts as a book credit (Studio: included)" };
  return { price: 299, tier: "Full Book — Epic", description: "Epic translation: $299" };
}

interface TranslatedSection {
  title: string;
  content: string;
  index: number;
  history: string[];
  editing: boolean;
  editContent: string;
}

interface LibraryBook {
  id: string;
  title: string;
  genre?: string;
}

export default function TranslatePage() {
  const { data: session } = useSession();

  // Source
  const [sourceTab, setSourceTab] = useState<"library" | "paste" | "upload">("paste");
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Controls
  const [targetLang, setTargetLang] = useState("Spanish");

  // Output
  const [translatedSections, setTranslatedSections] = useState<TranslatedSection[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState({ section: 0, total: 0, percent: 0, title: "" });
  const [sourceWordCount, setSourceWordCount] = useState(0);
  const [targetWordCount, setTargetWordCount] = useState(0);
  const [error, setError] = useState("");
  const [savingToLibrary, setSavingToLibrary] = useState(false);
  const [savedToLibrary, setSavedToLibrary] = useState(false);

  // Load library books
  useEffect(() => {
    if (session?.user) {
      fetch("/api/books")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setBooks(data);
          else if (data.books) setBooks(data.books);
        })
        .catch(() => {});
    }
  }, [session]);

  // Word count
  useEffect(() => {
    const words = sourceText.split(/\s+/).filter(Boolean).length;
    setSourceWordCount(words);
  }, [sourceText]);

  // Load book content when selected
  useEffect(() => {
    if (!selectedBookId) return;
    fetch(`/api/books/${selectedBookId}`)
      .then((r) => r.json())
      .then((data) => {
        const content = data.versions?.[0]?.content || data.content || "";
        setSourceText(content);
      })
      .catch(() => setError("Failed to load book"));
  }, [selectedBookId]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10MB)");
      return;
    }
    setUploadedFileName(file.name);
    if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const text = await file.text();
      setSourceText(text);
    } else {
      const formData = new FormData();
      formData.append("files", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.files?.[0]?.content) {
          setSourceText(data.files[0].content);
        } else {
          setError("Failed to extract text from file");
        }
      } catch {
        setError("Upload failed");
      }
    }
  }, []);

  const pricing = calculatePrice(sourceWordCount);

  const startTranslation = useCallback(async () => {
    if (!sourceText.trim()) {
      setError("Please provide text to translate");
      return;
    }
    setError("");
    setIsTranslating(true);
    setTranslatedSections([]);
    setTargetWordCount(0);
    setSavedToLibrary(false);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBookId || undefined,
          text: selectedBookId ? undefined : sourceText,
          targetLanguage: targetLang,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Translation failed");
        setIsTranslating(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "start") {
              setProgress({ section: 0, total: event.totalSections, percent: 0, title: "Starting..." });
              setSourceWordCount(event.sourceWordCount);
            } else if (event.type === "progress") {
              setProgress({
                section: event.section || 0,
                total: event.totalSections || 0,
                percent: event.percent || 0,
                title: event.title || "",
              });
            } else if (event.type === "section") {
              setTranslatedSections((prev) => [
                ...prev,
                {
                  title: event.title,
                  content: event.content,
                  index: event.index,
                  history: [],
                  editing: false,
                  editContent: event.content,
                },
              ]);
            } else if (event.type === "complete") {
              setTargetWordCount(event.targetWordCount);
              setProgress((p) => ({ ...p, percent: 100 }));
            } else if (event.type === "error") {
              setError(event.message);
            }
          } catch {}
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    }
    setIsTranslating(false);
  }, [sourceText, selectedBookId, targetLang]);

  const retranslateSection = useCallback(
    async (sectionIdx: number) => {
      const section = translatedSections[sectionIdx];
      if (!section) return;

      setTranslatedSections((prev) =>
        prev.map((s, i) =>
          i === sectionIdx ? { ...s, history: [s.content, ...s.history] } : s
        )
      );

      try {
        const res = await fetch("/api/translate/section", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: sourceText,
            targetLanguage: targetLang,
            sectionIndex: sectionIdx,
          }),
        });

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "complete") {
                setTranslatedSections((prev) =>
                  prev.map((s, i) =>
                    i === sectionIdx ? { ...s, content: event.content, editContent: event.content } : s
                  )
                );
              }
            } catch {}
          }
        }
      } catch {
        setError("Re-translation failed");
      }
    },
    [translatedSections, sourceText, targetLang]
  );

  const toggleEdit = useCallback((idx: number) => {
    setTranslatedSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, editing: !s.editing } : s))
    );
  }, []);

  const saveEdit = useCallback((idx: number) => {
    setTranslatedSections((prev) =>
      prev.map((s, i) =>
        i === idx
          ? { ...s, content: s.editContent, editing: false, history: [s.content, ...s.history] }
          : s
      )
    );
  }, []);

  const handleExport = useCallback(
    async (format: "pdf" | "docx") => {
      const fullText = translatedSections.map((s) => s.content).join("\n\n---\n\n");
      try {
        const res = await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: fullText, format, title: `Translation - ${targetLang}` }),
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `translation-${targetLang.toLowerCase()}.${format}`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch {
        setError("Export failed");
      }
    },
    [translatedSections, targetLang]
  );

  const saveToLibrary = useCallback(async () => {
    if (!translatedSections.length) return;
    setSavingToLibrary(true);
    const fullText = translatedSections.map((s) => s.content).join("\n\n");
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Translation (${targetLang})${selectedBookId ? "" : " - Custom Text"}`,
          content: fullText,
          language: targetLang,
          description: `Translated to ${targetLang} — literary translation`,
        }),
      });
      if (res.ok) setSavedToLibrary(true);
      else setError("Failed to save");
    } catch {
      setError("Failed to save");
    }
    setSavingToLibrary(false);
  }, [translatedSections, targetLang, selectedBookId]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Literary Translation
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Translate your work while preserving tone, voice, and structure.
          </p>
        </div>

        {/* Sign up prompt when not signed in */}
        {!session?.user && (
          <div className="mb-10 text-center">
            <p className="text-sm text-gray-500">
              <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">Sign up</Link> to get started with translations.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
            <button onClick={() => setError("")} className="ml-3 text-red-300 hover:text-white">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SOURCE SECTION */}
          <div className="space-y-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-200">Source Text</h2>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {(["library", "paste", "upload"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSourceTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      sourceTab === tab
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                        : "bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08]"
                    }`}
                  >
                    {tab === "library" ? "📚 Library" : tab === "paste" ? "📋 Paste Text" : "📄 Upload"}
                  </button>
                ))}
              </div>

              {sourceTab === "library" && (
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">Select a book...</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              )}

              {sourceTab === "paste" && (
                <textarea
                  value={sourceText}
                  onChange={(e) => { setSourceText(e.target.value); setSelectedBookId(""); }}
                  placeholder="Paste your text here..."
                  rows={12}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                />
              )}

              {sourceTab === "upload" && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                >
                  <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf,.docx" onChange={handleFileUpload} className="hidden" />
                  <p className="text-gray-400">{uploadedFileName || "Click or drag to upload PDF, DOCX, TXT"}</p>
                </div>
              )}

              <div className="mt-3 text-sm text-gray-500">
                {sourceWordCount.toLocaleString()} words
              </div>
            </div>

            {/* TRANSLATION CONTROLS */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm space-y-5">
              <h2 className="text-lg font-semibold text-gray-200">Translation Settings</h2>

              {/* Target Language */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Language</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Translate Button */}
              <button
                onClick={startTranslation}
                disabled={isTranslating || !sourceText.trim()}
                className="w-full py-4 rounded-xl font-semibold text-lg transition-all bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isTranslating ? "Translating..." : "Translate"}
              </button>
            </div>
          </div>

          {/* OUTPUT SECTION */}
          <div className="space-y-4">
            {/* Progress */}
            {isTranslating && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>{progress.title}</span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Section {progress.section} of {progress.total}
                </p>
              </div>
            )}

            {/* Translated sections */}
            {translatedSections.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-200">Translation Output</h2>
                  <div className="flex gap-2">
                    <button onClick={() => handleExport("pdf")} className="px-3 py-1.5 bg-white/[0.06] rounded-lg text-sm text-gray-300 hover:bg-white/[0.1] transition-colors">
                      PDF
                    </button>
                    <button onClick={() => handleExport("docx")} className="px-3 py-1.5 bg-white/[0.06] rounded-lg text-sm text-gray-300 hover:bg-white/[0.1] transition-colors">
                      DOCX
                    </button>
                    <button
                      onClick={saveToLibrary}
                      disabled={savingToLibrary || savedToLibrary}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        savedToLibrary
                          ? "bg-green-600/20 text-green-400"
                          : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                      }`}
                    >
                      {savedToLibrary ? "✓ Saved" : savingToLibrary ? "Saving..." : "Save to Library"}
                    </button>
                  </div>
                </div>

                {/* Word count comparison */}
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Source: {sourceWordCount.toLocaleString()} words</span>
                  <span>→</span>
                  <span>Target: {targetWordCount.toLocaleString()} words</span>
                </div>

                {translatedSections.map((section, idx) => (
                  <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-300">{section.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => retranslateSection(idx)}
                          className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-xs hover:bg-purple-600/30 transition-colors"
                        >
                          Re-translate
                        </button>
                        <button
                          onClick={() => (section.editing ? saveEdit(idx) : toggleEdit(idx))}
                          className="px-2 py-1 bg-white/[0.06] text-gray-400 rounded-lg text-xs hover:bg-white/[0.1] transition-colors"
                        >
                          {section.editing ? "Save" : "Edit"}
                        </button>
                      </div>
                    </div>

                    {section.editing ? (
                      <textarea
                        value={section.editContent}
                        onChange={(e) =>
                          setTranslatedSections((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, editContent: e.target.value } : s))
                          )
                        }
                        rows={10}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none"
                      />
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                        {section.content}
                      </div>
                    )}

                    {section.history.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                          Revision History ({section.history.length})
                        </summary>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                          {section.history.map((h, hi) => (
                            <div key={hi} className="bg-white/[0.02] rounded-lg p-3 text-xs text-gray-500 whitespace-pre-wrap">
                              {h.slice(0, 300)}...
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isTranslating && translatedSections.length === 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 backdrop-blur-sm text-center">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Ready to Translate</h3>
                <p className="text-gray-500 text-sm">
                  Add your source text, select a language, and hit Translate.
                  <br />
                  Your literary translation will appear here section by section.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
