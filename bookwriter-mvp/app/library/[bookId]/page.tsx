"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Version {
  id: string;
  version: number;
  content: string;
  wordCount: number | null;
  notes: string | null;
  createdAt: string;
}

interface BookReference {
  id: string;
  name: string;
  type: string;
  content: string;
}

interface ReferenceItem {
  type: "pdf" | "gdoc" | "text";
  name: string;
  content: string;
}

interface BookDetail {
  id: string;
  title: string;
  description: string;
  genre: string | null;
  tone: string | null;
  audience: string | null;
  language: string | null;
  bookLength: string | null;
  versions: Version[];
  references: BookReference[];
}

export default function BookDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<BookDetail | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Revision state
  const [showRevision, setShowRevision] = useState(false);
  const [revisionInstructions, setRevisionInstructions] = useState("");
  const [newReferences, setNewReferences] = useState<ReferenceItem[]>([]);
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [revisionError, setRevisionError] = useState("");
  const [gdocUrl, setGdocUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [refLoading, setRefLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBook = useCallback(async () => {
    const res = await fetch(`/api/books/${bookId}`);
    if (res.ok) {
      const data = await res.json();
      setBook(data.book);
      if (data.book?.versions?.length) {
        setSelectedVersion(data.book.versions.length - 1);
      }
    } else {
      router.push("/library");
    }
    setLoading(false);
  }, [bookId, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchBook();
    }
  }, [status, router, fetchBook]);

  // Reference upload handlers
  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setRefLoading(true);
    setRevisionError("");
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          setRevisionError(`File "${file.name}" exceeds 10MB limit`);
          setRefLoading(false);
          return;
        }
        formData.append("files", file);
      }
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setRevisionError(data.error); setRefLoading(false); return; }
      setNewReferences(prev => [...prev, ...data.files.map((f: { name: string; content: string }) => ({ type: "pdf" as const, name: f.name, content: f.content }))]);
    } catch { setRevisionError("Failed to upload PDF"); }
    setRefLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleGdocAdd() {
    if (!gdocUrl.trim()) return;
    setRefLoading(true);
    setRevisionError("");
    try {
      const res = await fetch("/api/fetch-doc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: gdocUrl }) });
      const data = await res.json();
      if (!res.ok) { setRevisionError(data.error); setRefLoading(false); return; }
      setNewReferences(prev => [...prev, { type: "gdoc", name: data.name, content: data.content }]);
      setGdocUrl("");
    } catch { setRevisionError("Failed to fetch document"); }
    setRefLoading(false);
  }

  function handlePasteAdd() {
    if (!pasteText.trim()) return;
    setNewReferences(prev => [...prev, { type: "text", name: `Pasted Text ${prev.filter(r => r.type === "text").length + 1}`, content: pasteText }]);
    setPasteText("");
  }

  async function startRevision() {
    if (!book || !revisionInstructions.trim()) return;
    setRevisionLoading(true);
    setRevisionError("");

    const currentVersion = book.versions[selectedVersion];
    const allRefs: ReferenceItem[] = [
      ...book.references.map(r => ({ type: r.type as "pdf" | "gdoc" | "text", name: r.name, content: r.content })),
      ...newReferences,
    ];

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 600000);
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: book.title,
          genre: book.genre,
          tone: book.tone,
          audience: book.audience,
          language: book.language,
          references: allRefs,
          revisionInstructions,
          previousContent: currentVersion.content,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Failed to connect" }));
        setRevisionError(data.error || "Revision failed");
        setRevisionLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

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
            if (event.type === "complete") fullText = event.fullText;
            if (event.type === "error") { setRevisionError(event.message); setRevisionLoading(false); return; }
          } catch { /* skip */ }
        }
      }

      if (fullText) {
        // Save as new version
        await fetch("/api/books/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId: book.id,
            title: book.title,
            description: book.description,
            content: fullText,
            notes: `Revision: ${revisionInstructions}`,
            references: newReferences.map(r => ({ name: r.name, type: r.type, content: r.content })),
          }),
        });
        setShowRevision(false);
        setRevisionInstructions("");
        setNewReferences([]);
        await fetchBook();
      }
    } catch {
      setRevisionError("Revision failed. Please try again.");
    }
    setRevisionLoading(false);
  }

  async function downloadPdf() {
    if (!book) return;
    const v = book.versions[selectedVersion];
    const res = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: book.title, content: v.content }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadDocx() {
    if (!book) return;
    const v = book.versions[selectedVersion];
    const res = await fetch("/api/export/google/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: book.title, content: v.content }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.title}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          <Navbar />
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (!book) return null;

  const currentVersion = book.versions[selectedVersion];

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <Link href="/library" className="text-sm text-gray-400 hover:text-white transition-colors">
              &larr; Back to Library
            </Link>
            <div className="flex gap-3 flex-wrap">
              {book.versions.length > 1 && (
                <select
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(Number(e.target.value))}
                >
                  {book.versions.map((v, i) => (
                    <option key={v.id} value={i} className="bg-gray-900">
                      Version {v.version} — {new Date(v.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={downloadPdf}
                className="text-sm bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-lg px-3 py-1.5 transition-all"
              >
                Download PDF
              </button>
              <button
                onClick={downloadDocx}
                className="text-sm bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg px-3 py-1.5 transition-all"
              >
                Download .docx
              </button>
              <Link
                href={`/?bookId=${book.id}&newVersion=true`}
                className="text-sm bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg px-3 py-1.5 transition-all"
              >
                New Version
              </Link>
              <button
                onClick={() => setShowRevision(true)}
                className="text-sm bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg px-3 py-1.5 transition-all"
              >
                Create Revision
              </button>
            </div>
          </div>

          {/* Revision Panel */}
          {showRevision && (
            <div className="mb-6 bg-white/[0.03] backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Create Revision
                </h3>
                <button onClick={() => { setShowRevision(false); setRevisionError(""); }} className="text-gray-500 hover:text-white text-lg">&times;</button>
              </div>

              {revisionError && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{revisionError}</div>}

              {revisionLoading && (
                <div className="flex items-center gap-3 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  Generating revision... This may take several minutes. Please wait.
                </div>
              )}

              {/* Existing references */}
              {book.references.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Existing References</label>
                  <div className="space-y-1.5">
                    {book.references.map((ref) => (
                      <div key={ref.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500 bg-white/[0.06] rounded px-1.5 py-0.5 uppercase">{ref.type}</span>
                        <span className="text-sm text-gray-400 truncate">{ref.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new references */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Add New References</label>
                <div className="space-y-3">
                  {/* PDF */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/[0.1] rounded-xl p-4 text-center cursor-pointer hover:border-purple-500/30 hover:bg-purple-500/5 transition-all"
                  >
                    <div className="text-sm text-gray-400">{refLoading ? "Processing..." : "Click to upload PDF files"}</div>
                    <div className="text-xs text-gray-600 mt-1">Max 5 files, 10MB each</div>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handlePdfUpload} />

                  {/* Google Doc */}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      placeholder="Google Docs URL..."
                      value={gdocUrl}
                      onChange={(e) => setGdocUrl(e.target.value)}
                    />
                    <button onClick={handleGdocAdd} disabled={!gdocUrl.trim() || refLoading} className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-3 transition-all disabled:opacity-40">Add</button>
                  </div>

                  {/* Paste */}
                  <textarea
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                    placeholder="Paste reference text..."
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={3}
                  />
                  {pasteText.trim() && (
                    <button onClick={handlePasteAdd} className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-4 py-2 transition-all">Add as Reference</button>
                  )}

                  {/* New reference cards */}
                  {newReferences.length > 0 && (
                    <div className="space-y-1.5">
                      {newReferences.map((ref, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-2 flex items-start gap-2">
                          <span className="text-xs font-mono text-gray-500 bg-white/[0.06] rounded px-1.5 py-0.5 uppercase">{ref.type}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-300 truncate">{ref.name}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">{ref.content.slice(0, 200)}</div>
                          </div>
                          <button onClick={() => setNewReferences(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-400 text-lg leading-none">&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Revision instructions */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">What changes do you want?</label>
                <textarea
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                  placeholder="e.g. Add more detail about the manufacturing process in Chapter 3, rewrite Chapter 5 with a more conversational tone..."
                  value={revisionInstructions}
                  onChange={(e) => setRevisionInstructions(e.target.value)}
                  rows={4}
                />
              </div>

              <button
                onClick={startRevision}
                disabled={!revisionInstructions.trim() || revisionLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none"
              >
                {revisionLoading ? "Generating Revision..." : "Start Revision"}
              </button>
            </div>
          )}

          {/* Book Content */}
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-white/[0.06] p-8 text-center">
              <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                {book.title}
              </h2>
              <div className="flex justify-center gap-3 mt-3 text-sm text-gray-400 flex-wrap">
                {book.genre && <span>{book.genre}</span>}
                {book.tone && <><span>·</span><span>{book.tone}</span></>}
                {book.language && <><span>·</span><span>{book.language}</span></>}
              </div>
            </div>

            {currentVersion && (
              <>
                <div className="flex justify-center gap-6 py-3 border-b border-white/[0.06] text-sm text-gray-400">
                  <span>{(currentVersion.wordCount || currentVersion.content.split(/\s+/).filter(Boolean).length).toLocaleString()} words</span>
                  <span>~{Math.ceil((currentVersion.wordCount || currentVersion.content.split(/\s+/).filter(Boolean).length) / 250)} pages</span>
                  <span>Version {currentVersion.version}</span>
                </div>
                <div className="p-6 sm:p-10">
                  <div className="whitespace-pre-wrap text-gray-300 leading-[1.8] text-[15px] max-h-[80vh] overflow-y-auto pr-2">
                    {currentVersion.content}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Version History */}
          {book.versions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Version History
              </h3>
              <div className="space-y-2">
                {book.versions.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVersion(i)}
                    className={`w-full text-left bg-white/[0.03] border rounded-xl p-4 transition-all ${
                      i === selectedVersion
                        ? "border-blue-500/40 bg-blue-500/5"
                        : "border-white/[0.06] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Version {v.version}</span>
                        {v.version === 1 ? (
                          <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5">Original</span>
                        ) : (
                          <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full px-2 py-0.5">Revision</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {v.notes && <p className="text-sm text-gray-400 mt-1">{v.notes}</p>}
                    {v.wordCount && <p className="text-xs text-gray-500 mt-1">{v.wordCount.toLocaleString()} words</p>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        
      </div>
    </main>
  );
}
