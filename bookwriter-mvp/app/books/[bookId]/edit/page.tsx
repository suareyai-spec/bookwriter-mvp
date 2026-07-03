"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  wordCount: number | null;
}

export default function BookEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const bookId = params.bookId as string;

  const [bookTitle, setBookTitle] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBook = useCallback(async () => {
    const [bookRes, chaptersRes] = await Promise.all([
      fetch(`/api/books/${bookId}`),
      fetch(`/api/books/${bookId}/chapters`),
    ]);
    if (!bookRes.ok || !chaptersRes.ok) { router.push("/library"); return; }
    const bookData = await bookRes.json();
    const chaptersData = await chaptersRes.json();
    setBookTitle(bookData.book?.title || "");
    const chs: Chapter[] = chaptersData.chapters || [];
    setChapters(chs);
    if (chs.length > 0) {
      setSelectedChapter(chs[0].number);
      setEditContent(chs[0].content);
      setEditTitle(chs[0].title);
    }
    setLoading(false);
  }, [bookId, router]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return; }
    if (status === "authenticated") { loadBook(); }
  }, [status, router, loadBook]);

  function selectChapter(ch: Chapter) {
    setSelectedChapter(ch.number);
    setEditContent(ch.content);
    setEditTitle(ch.title);
    setSaveMsg("");
  }

  async function saveChapter() {
    if (selectedChapter === null) return;
    setSaving(true);
    setSaveMsg("");
    const res = await fetch(`/api/books/${bookId}/chapters/${selectedChapter}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent, title: editTitle }),
    });
    setSaving(false);
    if (res.ok) {
      setSaveMsg("Saved");
      setChapters((prev) =>
        prev.map((c) =>
          c.number === selectedChapter
            ? { ...c, content: editContent, title: editTitle, wordCount: editContent.split(/\s+/).filter(Boolean).length }
            : c
        )
      );
      setTimeout(() => setSaveMsg(""), 2000);
    } else {
      setSaveMsg("Save failed");
    }
  }

  async function downloadPdf() {
    setDownloading(true);
    const res = await fetch(`/api/export/pdf?bookId=${bookId}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bookTitle || "book"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  }

  const currentChapter = chapters.find((c) => c.number === selectedChapter);
  const wordCount = editContent.split(/\s+/).filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-white/[0.08] bg-white/[0.02] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/[0.08]">
            <button
              onClick={() => router.push("/library")}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2 flex items-center gap-1"
            >
              ← Library
            </button>
            <h2
              className="text-sm font-bold text-white line-clamp-2"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {bookTitle}
            </h2>
            <p className="text-xs text-gray-500 mt-1">{chapters.length} chapters</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {chapters.map((ch) => (
              <button
                key={ch.number}
                onClick={() => selectChapter(ch)}
                className={`w-full text-left rounded-lg px-3 py-2.5 mb-1 transition-all text-sm ${
                  selectedChapter === ch.number
                    ? "bg-blue-600/20 border border-blue-500/30 text-blue-300"
                    : "hover:bg-white/[0.04] text-gray-400 hover:text-gray-200"
                }`}
              >
                <div className="font-medium text-xs text-gray-500 mb-0.5">Ch. {ch.number}</div>
                <div className="line-clamp-2 leading-tight">{ch.title}</div>
                {ch.wordCount != null && (
                  <div className="text-xs text-gray-600 mt-0.5">{ch.wordCount.toLocaleString()} words</div>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Editor */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-white/[0.08] bg-white/[0.01] flex-shrink-0">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-transparent text-white font-semibold text-base outline-none w-full"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                placeholder="Chapter title"
              />
            </div>
            <span className="text-xs text-gray-600 flex-shrink-0">{wordCount.toLocaleString()} words</span>
            {saveMsg && (
              <span className={`text-xs flex-shrink-0 ${saveMsg === "Saved" ? "text-green-400" : "text-red-400"}`}>
                {saveMsg}
              </span>
            )}
            <button
              onClick={saveChapter}
              disabled={saving}
              className="flex-shrink-0 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-1.5 transition-all font-medium"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={downloadPdf}
              disabled={downloading}
              className="flex-shrink-0 text-sm bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 disabled:opacity-50 rounded-lg px-4 py-1.5 transition-all"
            >
              {downloading ? "…" : "Download PDF"}
            </button>
          </div>

          {/* Textarea */}
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1 w-full resize-none bg-transparent text-gray-200 px-8 py-6 outline-none leading-relaxed text-base font-mono overflow-y-auto"
            style={{ fontSize: "14px", lineHeight: "1.8" }}
            placeholder="Chapter content…"
            spellCheck
          />
        </main>
      </div>
    </div>
  );
}
