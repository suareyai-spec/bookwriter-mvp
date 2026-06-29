"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BookAIEditor from "@/components/BookAIEditor";

interface Version {
  id: string;
  version: number;
  content: string;
  wordCount: number | null;
  notes: string | null;
  createdAt: string;
}

interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  content: string;
  wordCount: number | null;
  createdAt: string;
  updatedAt: string;
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
  contentType: string;
  mature: boolean;
  humanize: boolean;
  status: string;
  progress: string | null;
  versions: Version[];
  references: BookReference[];
}

function getContentLabel(contentType: string): string {
  switch (contentType) {
    case "newsletter": return "newsletter";
    case "article": return "article";
    case "comic": return "comic book";
    case "playwright": return "play";
    case "thesis": return "thesis";
    case "course": return "course";
    case "translation": return "translation";
    default: return "book";
  }
}

function getContentLabelCap(contentType: string): string {
  const label = getContentLabel(contentType);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface RevisionChapter {
  number: number;
  title: string;
  status: "pending" | "revising" | "done" | "skipped";
}

export default function BookDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<BookDetail | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Series state
  const [showSeriesModal, setShowSeriesModal] = useState(false);
  const [seriesLength, setSeriesLength] = useState(3);
  const [seriesDescription, setSeriesDescription] = useState("");
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [seriesProgress, setSeriesProgress] = useState("");
  const [seriesCurrentBook, setSeriesCurrentBook] = useState(0);
  const [seriesTotalBooks, setSeriesTotalBooks] = useState(0);
  const [seriesError, setSeriesError] = useState("");

  // Revision state
  const [showRevision, setShowRevision] = useState(false);
  const [revisionInstructions, setRevisionInstructions] = useState("");
  const [revisionTone, setRevisionTone] = useState("");
  const [lengthAdjustment, setLengthAdjustment] = useState("keep");
  const [translateLanguage, setTranslateLanguage] = useState("");
  const [newReferences, setNewReferences] = useState<ReferenceItem[]>([]);
  const [revisionLoading, setRevisionLoading] = useState(false);

  // Revision progress state
  const [revisionChapters, setRevisionChapters] = useState<RevisionChapter[]>([]);
  const [revisionCurrentChapter, setRevisionCurrentChapter] = useState(0);
  const [revisionTotalChapters, setRevisionTotalChapters] = useState(0);
  const [revisionPercent, setRevisionPercent] = useState(0);
  const [revisionStatusText, setRevisionStatusText] = useState("");
  const [revisionStartTime, setRevisionStartTime] = useState(0);
  const [revisionChapterTimes, setRevisionChapterTimes] = useState<number[]>([]);
  const [chapterStartTime, setChapterStartTime] = useState(0);

  const TONES = [
    "Professional & Authoritative",
    "Conversational & Friendly",
    "Academic & Research-Driven",
    "Inspirational & Motivational",
    "Narrative & Story-Driven",
    "Humorous & Lighthearted",
  ];

  const LENGTH_OPTIONS = [
    { value: "keep", label: "Keep current length" },
    { value: "extend", label: "Extend (add more detail/chapters)" },
    { value: "shorten", label: "Shorten (condense content)" },
  ];

  const [revisionMature, setRevisionMature] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // Chapter view state
  const [viewMode, setViewMode] = useState<'read' | 'chapters' | 'edit'>('read');
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [chapterEditContent, setChapterEditContent] = useState('');
  const [chapterEditTitle, setChapterEditTitle] = useState('');
  const [chapterSaving, setChapterSaving] = useState(false);

  const [revisionError, setRevisionError] = useState("");
  const [gdocUrl, setGdocUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [refLoading, setRefLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const revisionEstimatedRemaining = useCallback(() => {
    const done = revisionChapterTimes.length;
    if (done === 0) return null;
    const avg = revisionChapterTimes.reduce((a, b) => a + b, 0) / done;
    const remaining = revisionTotalChapters - revisionChapters.filter(c => c.status === "done" || c.status === "skipped").length;
    const secs = Math.round(avg * remaining / 1000);
    if (secs < 60) return `~${secs} seconds`;
    return `~${Math.ceil(secs / 60)} minute${Math.ceil(secs / 60) > 1 ? "s" : ""}`;
  }, [revisionChapterTimes, revisionTotalChapters, revisionChapters]);

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

  // Poll for status if book is generating/revising (came back to page)
  useEffect(() => {
    if (!book || (book.status !== "generating" && book.status !== "revising")) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/books/${bookId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "complete") {
            clearInterval(interval);
            await fetchBook();
          } else if (data.status === "failed") {
            clearInterval(interval);
            await fetchBook();
          } else {
            // Update progress display from rich status data
            if (data.totalChapters > 0) {
              setRevisionTotalChapters(data.totalChapters);
              setRevisionCurrentChapter(data.currentChapter);
              setRevisionPercent(data.percentComplete || 0);
              setRevisionStatusText(
                data.progressStatus === "outline"
                  ? "Generating outline..."
                  : data.currentTitle
                  ? `Writing chapter ${data.currentChapter}: ${data.currentTitle}...`
                  : `Writing chapter ${data.currentChapter} of ${data.totalChapters}...`
              );
            } else if (data.progress) {
              setRevisionPercent(data.progress.percent || 0);
              setRevisionTotalChapters(data.progress.totalChapters || 0);
              setRevisionCurrentChapter(data.progress.currentChapter || 0);
              setRevisionStatusText(
                data.progress.status === "revising"
                  ? `Revising chapter ${data.progress.currentChapter}...`
                  : data.progress.status === "writing"
                  ? `Writing chapter ${data.progress.currentChapter}: ${data.progress.currentTitle || ""}...`
                  : data.progress.status || "Processing..."
              );
            }
          }
        }
      } catch {}
    }, 10000);

    // Set initial state from book progress
    if (book.progress) {
      try {
        const p = JSON.parse(book.progress);
        setRevisionPercent(p.percent || 0);
        setRevisionTotalChapters(p.totalChapters || 0);
        setRevisionCurrentChapter(p.currentChapter || 0);
        if (book.status === "generating") setRevisionLoading(true);
      } catch {}
    }

    return () => clearInterval(interval);
  }, [book?.status, bookId, fetchBook]);

  // Fetch chapters when in chapters view
  useEffect(() => {
    if (!bookId || !book || book.status !== 'complete') return;
    fetch(`/api/books/${bookId}/chapters`)
      .then(r => r.json())
      .then(d => setChapterList(d.chapters || []))
      .catch(() => {});
  }, [bookId, book?.status, viewMode]);

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

  function enterEditMode() {
    if (!book || !currentVersion) return;
    setEditTitle(book.title);
    setEditContent(currentVersion.content);
    setEditMode(true);
  }

  async function saveEdit() {
    if (!book || !editContent.trim()) return;
    setEditSaving(true);
    try {
      const res = await fetch("/api/books/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          title: editTitle.trim() || book.title,
          content: editContent,
          notes: "Manual edit",
        }),
      });
      if (res.ok) {
        setEditMode(false);
        await fetchBook();
      }
    } catch {}
    setEditSaving(false);
  }

  async function saveChapter() {
    if (!book || editingChapter === null || !chapterEditContent.trim()) return;
    setChapterSaving(true);
    try {
      const res = await fetch(`/api/books/${bookId}/chapters/${editingChapter}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: chapterEditContent, title: chapterEditTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        setChapterList(prev => prev.map(ch => ch.number === editingChapter ? { ...ch, content: chapterEditContent, title: chapterEditTitle } : ch));
        setEditingChapter(null);
        await fetchBook();
      }
    } catch {}
    setChapterSaving(false);
  }

  async function startSeries() {
    if (!book) return;
    setSeriesLoading(true);
    setSeriesError("");
    setSeriesProgress("Creating series plan...");
    setSeriesCurrentBook(0);
    setSeriesTotalBooks(seriesLength);

    try {
      const res = await fetch("/api/series/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          seriesLength,
          seriesDescription: seriesDescription.trim() || undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Failed" }));
        setSeriesError(data.error || "Failed to create series");
        setSeriesLoading(false);
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
                setSeriesProgress(event.message || "Planning...");
                break;
              case "series_plan":
                setSeriesProgress("Series plan created. Generating books...");
                break;
              case "book_start":
                setSeriesCurrentBook(event.bookNumber);
                setSeriesProgress(`Writing Book ${event.bookNumber} of ${event.totalBooks}...`);
                break;
              case "book_outline":
                setSeriesProgress(`Book ${event.bookNumber}: "${event.bookTitle}" — Writing chapters...`);
                break;
              case "book_chapter_progress":
                setSeriesProgress(`Book ${event.bookNumber} — Chapter ${event.chapter}/${event.totalChapters}: ${event.title}`);
                break;
              case "book_complete":
                setSeriesProgress(`Book ${event.bookNumber}: "${event.bookTitle}" complete! (${event.wordCount?.toLocaleString()} words)`);
                break;
              case "series_complete":
                setSeriesProgress("Series complete!");
                setTimeout(() => {
                  setShowSeriesModal(false);
                  setSeriesLoading(false);
                  window.location.href = "/library";
                }, 2000);
                return;
              case "error":
                setSeriesError(event.message);
                setSeriesLoading(false);
                return;
            }
          } catch {}
        }
      }
    } catch {
      setSeriesError("Failed to create series. Please try again.");
    }
    setSeriesLoading(false);
  }

  async function startRevision() {
    if (!book || (!revisionInstructions.trim() && newReferences.length === 0 && !gdocUrl.trim() && !pasteText.trim() && !translateLanguage)) return;
    const instructions = revisionInstructions.trim() || (translateLanguage ? `Translate the entire content into ${translateLanguage}. Maintain the same tone, style, and meaning.` : "Revise and improve the content using the provided reference materials. Incorporate the new information naturally while maintaining the existing tone and style.");
    setRevisionLoading(true);
    setRevisionError("");
    setRevisionChapters([]);
    setRevisionCurrentChapter(0);
    setRevisionTotalChapters(0);
    setRevisionPercent(0);
    setRevisionStatusText("Analyzing revision instructions...");
    setRevisionStartTime(Date.now());
    setRevisionChapterTimes([]);

    // Auto-add pending references before starting
    const pendingRefs: ReferenceItem[] = [...newReferences];
    if (gdocUrl.trim()) {
      try {
        const res = await fetch("/api/fetch-doc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: gdocUrl.trim() }),
        });
        const data = await res.json();
        if (data.content) {
          pendingRefs.push({ type: "gdoc", name: data.name || "Google Doc", content: data.content });
          setGdocUrl("");
        }
      } catch { /* continue without it */ }
    }
    if (pasteText.trim()) {
      pendingRefs.push({ type: "text", name: "Pasted Text", content: pasteText.trim() });
      setPasteText("");
    }
    setNewReferences(pendingRefs);

    const currentVersion = book.versions[selectedVersion];
    const allRefs: ReferenceItem[] = [
      ...book.references.map(r => ({ type: r.type as "pdf" | "gdoc" | "text", name: r.name, content: r.content })),
      ...pendingRefs,
    ];

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 600000);
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          title: book.title,
          genre: book.genre,
          tone: revisionTone || book.tone,
          translateTo: translateLanguage || undefined,
          audience: book.audience,
          language: book.language,
          references: allRefs,
          revisionInstructions: instructions,
          previousContent: currentVersion.content,
          lengthAdjustment,
          mature: revisionMature,
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
      let lastChapterStart = Date.now();

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
              case "progress": {
                const tc = event.totalChapters as number;
                setRevisionTotalChapters(tc);
                setRevisionCurrentChapter(event.chapter as number);
                if (event.percent !== undefined) setRevisionPercent(event.percent);
                
                if (event.status === "analyzing") {
                  setRevisionStatusText("Analyzing revision instructions...");
                } else {
                  setRevisionStatusText(`Revising Chapter ${event.chapter}: ${event.title}...`);
                  lastChapterStart = Date.now();
                  setChapterStartTime(Date.now());
                  setRevisionChapters(prev => {
                    const updated = [...prev];
                    while (updated.length < tc) {
                      updated.push({ number: updated.length + 1, title: `Chapter ${updated.length + 1}`, status: "pending" });
                    }
                    if (updated[event.chapter - 1]) {
                      updated[event.chapter - 1] = { ...updated[event.chapter - 1], title: event.title, status: "revising" };
                    }
                    return updated;
                  });
                }
                break;
              }
              case "analysis": {
                const tc = event.totalChapters as number;
                setRevisionTotalChapters(tc);
                const chaptersToRevise = event.chaptersToRevise as number[];
                const initial: RevisionChapter[] = [];
                for (let i = 0; i < tc; i++) {
                  initial.push({
                    number: i + 1,
                    title: `Chapter ${i + 1}`,
                    status: chaptersToRevise.includes(i + 1) ? "pending" : "skipped",
                  });
                }
                setRevisionChapters(initial);
                setRevisionStatusText(event.message as string);
                break;
              }
              case "chapter": {
                const ch = event.chapter as number;
                const elapsed = Date.now() - lastChapterStart;
                if (event.revised) {
                  setRevisionChapterTimes(prev => [...prev, elapsed]);
                }
                lastChapterStart = Date.now();
                if (event.percent !== undefined) setRevisionPercent(event.percent);
                setRevisionChapters(prev => {
                  const updated = [...prev];
                  if (updated[ch - 1]) {
                    updated[ch - 1] = { ...updated[ch - 1], title: event.title, status: event.revised ? "done" : "skipped" };
                  }
                  return updated;
                });
                break;
              }
              case "complete": {
                fullText = event.fullText;
                break;
              }
              case "error": {
                setRevisionError(event.message);
                setRevisionLoading(false);
                return;
              }
            }
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
            notes: `Revision: ${instructions}${lengthAdjustment !== "keep" ? ` (${lengthAdjustment})` : ""}${translateLanguage ? ` [Translated to ${translateLanguage}]` : ""}`,
            references: newReferences.map(r => ({ name: r.name, type: r.type, content: r.content })),
          }),
        });
        setShowRevision(false);
        setRevisionInstructions("");
        setNewReferences([]);
        setLengthAdjustment("keep");
        setRevisionChapters([]);
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

  async function downloadEpub() {
    if (!book) return;
    const v = book.versions[selectedVersion];
    const res = await fetch("/api/export/epub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: book.title, content: v.content }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.title}.epub`;
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

  // Show in-progress indicator if book is generating/revising and we're not actively doing it client-side
  const isInProgress = (book.status === "generating" || book.status === "revising") && !revisionLoading;
  const currentVersion = book.versions[selectedVersion];

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="flex">
        <div className={`transition-all duration-300 px-4 sm:px-6 py-8 ${aiOpen ? "w-[58%] overflow-y-auto" : "w-full max-w-3xl mx-auto"}`}>
          {/* In-progress banner (when returning to page) */}
          {isInProgress && (
            <div className="mb-6 bg-white/[0.03] backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-blue-300">
                  {book.status === "generating" ? `${getContentLabelCap(book.contentType)} is being generated...` : "Revision in progress..."}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{revisionStatusText || "Processing..."}</p>
              </div>
              <div className="mb-2">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-gray-400">{revisionPercent}% complete</span>
                  {revisionTotalChapters > 0 && (
                    <span className="text-gray-500">{revisionCurrentChapter} / {revisionTotalChapters} chapters</span>
                  )}
                </div>
                <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-700 ease-out"
                    style={{ width: `${revisionPercent}%` }}
                  />
                </div>
              </div>
              <p className="text-center text-xs text-gray-600 mt-3">This page will update automatically when complete.</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <Link href="/library" className="text-sm text-gray-400 hover:text-white transition-colors py-2">
              &larr; Back to Library
            </Link>
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
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
                disabled={!currentVersion}
                className="text-sm bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-lg px-3 py-1.5 transition-all disabled:opacity-40"
              >
                Download PDF
              </button>
              <button
                onClick={downloadDocx}
                disabled={!currentVersion}
                className="text-sm bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg px-3 py-1.5 transition-all disabled:opacity-40"
              >
                Download .docx
              </button>
              <button
                onClick={downloadEpub}
                disabled={!currentVersion}
                className="text-sm bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-400 rounded-lg px-3 py-1.5 transition-all disabled:opacity-40"
              >
                Download .epub
              </button>
              <Link
                href={`/?bookId=${book.id}&newVersion=true`}
                className="text-sm bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg px-3 py-1.5 transition-all"
              >
                New Version
              </Link>
              <button
                onClick={() => setShowRevision(true)}
                disabled={isInProgress}
                className="text-sm bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg px-3 py-1.5 transition-all disabled:opacity-40"
              >
                Create Revision
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'chapters' ? 'read' : 'chapters')}
                disabled={isInProgress || book.status !== 'complete'}
                className={`text-sm rounded-lg px-3 py-1.5 transition-all disabled:opacity-40 ${
                  viewMode === 'chapters'
                    ? 'bg-teal-600/30 border-2 border-teal-500/50 text-teal-300'
                    : 'bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 text-teal-400'
                }`}
              >
                Chapters
              </button>
              <button
                onClick={enterEditMode}
                disabled={isInProgress || !currentVersion || editMode}
                className="text-sm bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 rounded-lg px-3 py-1.5 transition-all disabled:opacity-40"
              >
                Edit
              </button>
              <button
                onClick={() => setShowSeriesModal(true)}
                disabled={isInProgress || seriesLoading}
                className="text-sm bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 rounded-lg px-3 py-1.5 transition-all disabled:opacity-40"
              >
                Create Series
              </button>
              <button
                onClick={() => setAiOpen(!aiOpen)}
                disabled={!currentVersion}
                className={`text-sm rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 disabled:opacity-40 ${
                  aiOpen
                    ? "bg-blue-600/30 border-2 border-blue-500/50 text-blue-300"
                    : "bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Editor
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
                <button onClick={() => { setShowRevision(false); setRevisionError(""); setRevisionChapters([]); }} className="text-gray-500 hover:text-white text-lg">&times;</button>
              </div>

              {revisionError && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{revisionError}</div>}

              {/* Revision Progress UI */}
              {revisionLoading && (
                <div className="bg-white/[0.02] border border-blue-500/20 rounded-xl p-5 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-blue-300 font-medium">{revisionStatusText || "Processing..."}</p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-400">{revisionPercent}% complete</span>
                      {revisionEstimatedRemaining() && (
                        <span className="text-gray-500">Est. remaining: {revisionEstimatedRemaining()}</span>
                      )}
                    </div>
                    <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 transition-all duration-700 ease-out"
                        style={{ width: `${revisionPercent}%` }}
                      />
                    </div>
                    {revisionTotalChapters > 0 && (
                      <div className="text-right mt-1 text-xs text-gray-600">
                        {revisionChapters.filter(c => c.status === "done" || c.status === "skipped").length} / {revisionTotalChapters} chapters
                      </div>
                    )}
                  </div>

                  {/* Chapter Checklist */}
                  {revisionChapters.length > 0 && (
                    <div className="max-h-48 overflow-y-auto pr-2">
                      <div className="space-y-1.5">
                        {revisionChapters.map((ch) => (
                          <div key={ch.number} className="flex items-center gap-3 text-sm">
                            {ch.status === "done" && (
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 text-xs">✓</span>
                            )}
                            {ch.status === "revising" && (
                              <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-purple-400/60 border-t-transparent animate-spin" />
                            )}
                            {ch.status === "skipped" && (
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-500/20 border border-gray-500/40 flex items-center justify-center text-gray-500 text-xs">—</span>
                            )}
                            {ch.status === "pending" && (
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08]" />
                            )}
                            <span className={
                              ch.status === "done" ? "text-gray-300" : 
                              ch.status === "revising" ? "text-purple-300 font-medium" : 
                              ch.status === "skipped" ? "text-gray-600" : "text-gray-600"
                            }>
                              Ch. {ch.number}: {ch.title}
                              {ch.status === "skipped" && <span className="text-xs text-gray-600 ml-1">(unchanged)</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-center text-xs text-gray-600">You can navigate away — the revision will continue in the background.</p>
                </div>
              )}

              {!revisionLoading && (
                <>
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
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/[0.1] rounded-xl p-4 text-center cursor-pointer hover:border-purple-500/30 hover:bg-purple-500/5 transition-all"
                      >
                        <div className="text-sm text-gray-400">{refLoading ? "Processing..." : "Click to upload PDF files"}</div>
                        <div className="text-xs text-gray-600 mt-1">Max 5 files, 10MB each</div>
                      </div>
                      <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handlePdfUpload} />

                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                          placeholder="Google Docs URL..."
                          value={gdocUrl}
                          onChange={(e) => setGdocUrl(e.target.value)}
                        />
                        <button onClick={handleGdocAdd} disabled={!gdocUrl.trim() || refLoading} className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-3 transition-all disabled:opacity-40">Add</button>
                      </div>

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

                  {/* Tone + Length Row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Tone</label>
                      <select
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
                        value={revisionTone}
                        onChange={(e) => setRevisionTone(e.target.value)}
                      >
                        <option value="" className="bg-gray-900">Keep current tone ({book?.tone || "not set"})</option>
                        {TONES.map((t) => (
                          <option key={t} value={t} className="bg-gray-900">{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Content Length</label>
                      <select
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
                        value={lengthAdjustment}
                        onChange={(e) => setLengthAdjustment(e.target.value)}
                      >
                        {LENGTH_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Translate */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Translate</label>
                    <select
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
                      value={translateLanguage}
                      onChange={(e) => setTranslateLanguage(e.target.value)}
                    >
                      <option value="" className="bg-gray-900">Keep original language</option>
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

                  {/* Mature Content Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        className={`relative w-11 h-6 rounded-full transition-colors ${revisionMature ? "bg-rose-600" : "bg-white/[0.1]"}`}
                        onClick={() => setRevisionMature(!revisionMature)}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${revisionMature ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-300">Mature Content (18+)</span>
                    </label>
                    {revisionMature && (
                      <span className="text-xs text-rose-400/70">Enables explicit, adult-only content</span>
                    )}
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
                    disabled={(!revisionInstructions.trim() && newReferences.length === 0 && !gdocUrl.trim() && !pasteText.trim() && !translateLanguage) || revisionLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none"
                  >
                    Start Revision
                  </button>
                </>
              )}
            </div>
          )}

          {/* Series Modal */}
          {showSeriesModal && (
            <div className="mb-6 bg-white/[0.03] backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Create Series
                </h3>
                <button onClick={() => { setShowSeriesModal(false); setSeriesError(""); }} className="text-gray-500 hover:text-white text-lg">&times;</button>
              </div>

              {seriesError && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{seriesError}</div>}

              {seriesLoading ? (
                <div className="bg-white/[0.02] border border-indigo-500/20 rounded-xl p-5 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-indigo-300 font-medium">{seriesProgress}</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-400">
                        {seriesCurrentBook > 0 ? `Book ${seriesCurrentBook} of ${seriesTotalBooks}` : "Planning..."}
                      </span>
                      <span className="text-gray-500">
                        {seriesTotalBooks > 0 ? `${Math.round((Math.max(0, seriesCurrentBook - 1) / seriesTotalBooks) * 100)}%` : ""}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 transition-all duration-700 ease-out"
                        style={{ width: `${seriesTotalBooks > 0 ? Math.round((Math.max(0, seriesCurrentBook - 1) / seriesTotalBooks) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-600">This may take several minutes. You can navigate away.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Number of Books in Series</label>
                    <select
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                      value={seriesLength}
                      onChange={(e) => setSeriesLength(Number(e.target.value))}
                    >
                      <option value={2} className="bg-gray-900">2 Books (Duology)</option>
                      <option value={3} className="bg-gray-900">3 Books (Trilogy)</option>
                      <option value={4} className="bg-gray-900">4 Books (Quartet)</option>
                      <option value={5} className="bg-gray-900">5 Books (Pentalogy)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Series Direction (optional)</label>
                    <textarea
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                      placeholder="Describe how the series should evolve... e.g. 'Each book explores a different era, building toward a unified conclusion'"
                      value={seriesDescription}
                      onChange={(e) => setSeriesDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    This will use &ldquo;{book?.title}&rdquo; as Part 1 and generate {seriesLength - 1} additional part{seriesLength - 1 > 1 ? "s" : ""}.
                  </p>

                  <button
                    onClick={startSeries}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl p-3.5 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Generate {seriesLength}-Book Series
                  </button>
                </>
              )}
            </div>
          )}

          {/* Chapters View */}
          {viewMode === 'chapters' && book.status === 'complete' && (
            <div className="mb-6 bg-white/[0.03] backdrop-blur-sm border border-teal-500/20 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border-b border-white/[0.06] p-4 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Chapters</h3>
                <button onClick={() => { setViewMode('read'); setEditingChapter(null); }} className="text-gray-500 hover:text-white text-lg">&times;</button>
              </div>

              {editingChapter !== null ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <input
                      className="flex-1 bg-white/[0.04] border border-teal-500/30 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                      value={chapterEditTitle}
                      onChange={(e) => setChapterEditTitle(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveChapter}
                        disabled={chapterSaving}
                        className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {chapterSaving ? "Saving..." : "Save Chapter"}
                      </button>
                      <button
                        onClick={() => setEditingChapter(null)}
                        className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-gray-400 rounded-lg px-4 py-2 text-sm transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{chapterEditContent.split(/\s+/).filter(Boolean).length.toLocaleString()} words</div>
                  <textarea
                    className="w-full bg-white/[0.02] border border-teal-500/20 rounded-xl p-4 text-gray-300 leading-[1.8] text-[15px] focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-none"
                    value={chapterEditContent}
                    onChange={(e) => setChapterEditContent(e.target.value)}
                    style={{ minHeight: '60vh' }}
                  />
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {chapterList.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">No individual chapters saved. This book was generated before the chapter-by-chapter system.</div>
                  ) : (
                    chapterList.map((ch) => (
                      <button
                        key={ch.number}
                        onClick={() => {
                          setEditingChapter(ch.number);
                          setChapterEditContent(ch.content);
                          setChapterEditTitle(ch.title);
                        }}
                        className="w-full text-left p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="font-medium text-gray-200">Ch. {ch.number}: {ch.title}</div>
                          {ch.wordCount && <div className="text-xs text-gray-500 mt-0.5">{ch.wordCount.toLocaleString()} words</div>}
                        </div>
                        <span className="text-xs text-teal-400 border border-teal-500/30 rounded px-2 py-0.5">Edit</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Book Content */}
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-white/[0.06] p-5 sm:p-8 text-center">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {book.title}
                </h2>
                {book.mature && (
                  <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full px-2.5 py-1 font-medium">
                    18+
                  </span>
                )}
                {book.humanize && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2.5 py-1 font-medium">
                    Natural Voice
                  </span>
                )}
              </div>
              <div className="flex justify-center gap-3 mt-3 text-sm text-gray-400 flex-wrap">
                {book.genre && <span>{book.genre}</span>}
                {book.tone && <><span>·</span><span>{book.tone}</span></>}
                {book.language && <><span>·</span><span>{book.language}</span></>}
              </div>
            </div>

            {currentVersion && !editMode && (
              <>
                <div className="flex justify-center gap-6 py-3 border-b border-white/[0.06] text-sm text-gray-400">
                  <span>{(currentVersion.wordCount || currentVersion.content.split(/\s+/).filter(Boolean).length).toLocaleString()} words</span>
                  <span>~{Math.ceil((currentVersion.wordCount || currentVersion.content.split(/\s+/).filter(Boolean).length) / 300)} pages</span>
                  <span>Version {currentVersion.version}</span>
                </div>
                <div className="p-6 sm:p-10">
                  <div className="whitespace-pre-wrap text-gray-300 leading-[1.8] text-[15px] max-h-[80vh] overflow-y-auto pr-2">
                    {currentVersion.content}
                  </div>
                </div>
              </>
            )}

            {currentVersion && editMode && (
              <>
                <div className="border-b border-white/[0.06] p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs text-gray-500 mb-1">Title</label>
                      <input
                        className="w-full bg-white/[0.04] border border-amber-500/30 rounded-lg px-3 py-2 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={editSaving}
                        className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {editSaving ? "Saving..." : "Save as New Version"}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-gray-400 rounded-lg px-4 py-2 text-sm transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {editContent.split(/\s+/).filter(Boolean).length.toLocaleString()} words · Editing will save as a new version
                  </div>
                </div>
                <div className="p-4">
                  <textarea
                    className="w-full bg-white/[0.02] border border-amber-500/20 rounded-xl p-6 text-gray-300 leading-[1.8] text-[15px] focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{ minHeight: "70vh" }}
                  />
                </div>
              </>
            )}

            {!currentVersion && book.status !== "complete" && (
              <div className="p-6 text-center text-gray-500">
                <p>{getContentLabelCap(book.contentType)} content is being generated...</p>
              </div>
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

        {/* AI Editor Panel */}
        {aiOpen && session?.user && currentVersion && (
          <div className="w-[42%] flex-shrink-0 border-l border-white/[0.06] h-[calc(100vh-64px)] sticky top-16">
            <BookAIEditor
              bookId={bookId}
              content={currentVersion.content}
              contentType={book.contentType || "book"}
              onContentUpdated={fetchBook}
            />
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
