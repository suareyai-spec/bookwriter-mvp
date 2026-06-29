"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import UpsellModal from "@/components/UpsellModal";
import Link from "next/link";
import { generateBookPremise } from "@/lib/auto-generate";

interface ReferenceItem {
  type: "pdf" | "gdoc" | "text";
  name: string;
  content: string;
}

const GENRES = [
  "Non-Fiction", "Fantasy", "Sci-Fi", "Mystery", "Romance",
  "Thriller", "Self-Help", "Business", "Biography", "Historical",
  "Horror", "Literary Fiction", "Children's", "Poetry", "Cookbook",
  "Travel Guide", "Memoir", "Health & Wellness", "Religious", "Other",
];

const GENRE_SUBTOPICS: Record<string, string[]> = {
  "Non-Fiction": ["Science & Technology", "Politics & Society", "History", "Philosophy", "Education", "Environment", "True Crime", "Psychology", "Economics"],
  "Fantasy": ["Epic Fantasy", "Urban Fantasy", "Dark Fantasy", "Sword & Sorcery", "Mythological", "Portal Fantasy", "Fairy Tale Retelling", "Low Fantasy"],
  "Sci-Fi": ["Space Opera", "Cyberpunk", "Dystopian", "Hard Sci-Fi", "Time Travel", "Post-Apocalyptic", "First Contact", "Biopunk", "Climate Fiction"],
  "Mystery": ["Cozy Mystery", "Noir", "Police Procedural", "Whodunit", "Legal Thriller", "Cold Case", "Amateur Sleuth", "Locked Room"],
  "Thriller": ["Psychological Thriller", "Political Thriller", "Spy/Espionage", "Medical Thriller", "Techno-Thriller", "Domestic Thriller", "Action Thriller"],
  "Self-Help": ["Productivity", "Relationships", "Mindfulness", "Financial", "Career Development", "Confidence", "Habits", "Emotional Intelligence"],
  "Business": ["Entrepreneurship", "Leadership", "Marketing", "Finance", "Startups", "Management", "Innovation", "Strategy"],
  "Biography": ["Autobiography", "Memoir", "Political", "Celebrity", "Historical Figure", "Sports", "Artistic/Creative"],
  "Historical": ["Ancient World", "Medieval", "Renaissance", "Colonial Era", "World War I/II", "Cold War", "Civil Rights Era", "Ancient Civilizations"],
  "Horror": ["Gothic Horror", "Cosmic Horror", "Slasher", "Psychological Horror", "Supernatural", "Body Horror", "Folk Horror", "Haunted House"],
  "Literary Fiction": ["Coming of Age", "Family Saga", "Social Commentary", "Magical Realism", "Experimental", "Epistolary", "Satire"],
  "Children's": ["Picture Book", "Early Reader", "Middle Grade", "Young Adult", "Educational", "Adventure", "Animal Stories"],
  "Cookbook": ["Regional Cuisine", "Baking & Pastry", "Vegan/Plant-Based", "Quick & Easy", "Meal Prep", "Cultural/Heritage", "Desserts", "Healthy Eating", "BBQ & Grilling"],
  "Health & Wellness": ["Nutrition", "Fitness", "Mental Health", "Alternative Medicine", "Sleep", "Women's Health", "Men's Health", "Aging Well"],
};

const TONE_SAMPLES: Record<string, string> = {
  "Professional & Authoritative": "The evidence clearly demonstrates that organizations implementing these strategies see a 40% improvement in outcomes. This chapter examines the three critical frameworks that drive sustainable growth.",
  "Conversational & Friendly": "Here\u2019s the thing nobody tells you about starting out \u2014 it\u2019s messy, and that\u2019s completely fine. Let me walk you through what actually worked for me, no sugarcoating.",
  "Academic & Research-Driven": "As established by Kahneman and Tversky (1979), cognitive biases systematically influence decision-making processes. This analysis extends their framework to examine contemporary applications in behavioral economics.",
  "Inspirational & Motivational": "You were not built for a small life. Every setback you\u2019ve faced has been shaping you for this exact moment. The question isn\u2019t whether you can \u2014 it\u2019s whether you will.",
  "Narrative & Story-Driven": "The morning Sarah walked into the lab, she had no idea that the next three hours would change everything she believed about her research. The data on her screen told a story nobody expected.",
  "Humorous & Lighthearted": "Look, I\u2019m not saying my first attempt at sourdough could\u2019ve been used as a doorstop, but my dog sniffed it and walked away. And that dog eats everything. Here\u2019s what I learned.",
};

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
  const [format, setFormat] = useState<"book" | "course">("book");
  const [language, setLanguage] = useState("English");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reference materials state
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [refExpanded, setRefExpanded] = useState(false);
  const [gdocUrl, setGdocUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [refLoading, setRefLoading] = useState(false);
  const [refError, setRefError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const currentCount = references.filter(r => r.type === "pdf").length;
    if (currentCount + files.length > 5) {
      setRefError("Maximum 5 PDF files allowed");
      return;
    }
    setRefLoading(true);
    setRefError("");
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          setRefError(`File "${file.name}" exceeds 10MB limit`);
          setRefLoading(false);
          return;
        }
        formData.append("files", file);
      }
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setRefError(data.error); setRefLoading(false); return; }
      setReferences(prev => [...prev, ...data.files.map((f: { name: string; content: string }) => ({ type: "pdf" as const, name: f.name, content: f.content }))]);
    } catch { setRefError("Failed to upload PDF"); }
    setRefLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleGdocAdd() {
    if (!gdocUrl.trim()) return;
    setRefLoading(true);
    setRefError("");
    try {
      const res = await fetch("/api/fetch-doc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: gdocUrl }) });
      const data = await res.json();
      if (!res.ok) { setRefError(data.error); setRefLoading(false); return; }
      setReferences(prev => [...prev, { type: "gdoc", name: data.name, content: data.content }]);
      setGdocUrl("");
    } catch { setRefError("Failed to fetch document"); }
    setRefLoading(false);
  }

  function handlePasteAdd() {
    if (!pasteText.trim()) return;
    setReferences(prev => [...prev, { type: "text", name: `Pasted Text ${prev.filter(r => r.type === "text").length + 1}`, content: pasteText }]);
    setPasteText("");
  }

  function removeReference(index: number) {
    setReferences(prev => prev.filter((_, i) => i !== index));
  }

  // Sub-genre state (for all genres with subtopics)
  const [subGenre, setSubGenre] = useState("");
  useEffect(() => setSubGenre(""), [genre]);

  // Romance-specific fields
  const isRomance = /^romance$/i.test(genre);
  const [romanceSubGenre, setRomanceSubGenre] = useState("");
  const [relationshipDynamic, setRelationshipDynamic] = useState("");
  const [leadOneName, setLeadOneName] = useState("");
  const [leadOneTraits, setLeadOneTraits] = useState("");
  const [leadTwoName, setLeadTwoName] = useState("");
  const [leadTwoTraits, setLeadTwoTraits] = useState("");

  // Series toggle
  const showMatureToggle = /romance|other/i.test(genre);
  const [matureEnabled, setMatureEnabled] = useState(false);
  const [matureLevel, setMatureLevel] = useState("explicit");
  const mature = showMatureToggle && matureEnabled;
  const [createAsSeries, setCreateAsSeries] = useState(false);
  const [seriesLength, setSeriesLength] = useState(3);
  const [seriesDescription, setSeriesDescription] = useState("");
  const [seriesProgress, setSeriesProgress] = useState("");
  const [seriesCurrentBook, setSeriesCurrentBook] = useState(0);

  // Usage/payment state
  const [usage, setUsage] = useState<any>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [upsellMessage, setUpsellMessage] = useState("");
  const [upsellSize, setUpsellSize] = useState("any");

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/usage").then((r) => r.json()).then(setUsage).catch(() => {});
    }
  }, [session]);

  // Streaming state
  const [outline, setOutline] = useState("");
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [statusText, setStatusText] = useState("Preparing...");
  const [startTime, setStartTime] = useState<number>(0);
  const [chapterTimes, setChapterTimes] = useState<number[]>([]);
  const [generatingBookId, setGeneratingBookId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const doneCount = chapters.filter(c => c.status === "done").length;
  const writingCount = chapters.filter(c => c.status === "writing").length;
  const progressPercent = totalChapters > 0
    ? Math.min(99, Math.round(((doneCount + writingCount * 0.5) / totalChapters) * 100))
    : 0;

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
          mature,
          matureLevel: mature ? matureLevel : undefined,
          notes: isNewVersion ? "New version" : "Initial generation",
          references: references.map(r => ({ name: r.name, type: r.type, content: r.content })),
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
        body: JSON.stringify({ title, description, genre, tone, audience, bookLength, language, references, mature, format, matureLevel: mature ? matureLevel : undefined, subGenre: subGenre || undefined, romanceSubGenre: isRomance && romanceSubGenre ? romanceSubGenre : undefined, relationshipDynamic: isRomance && relationshipDynamic ? relationshipDynamic : undefined, leadOne: isRomance && (leadOneName || leadOneTraits) ? { name: leadOneName, traits: leadOneTraits } : undefined, leadTwo: isRomance && (leadTwoName || leadTwoTraits) ? { name: leadTwoName, traits: leadTwoTraits } : undefined }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Failed to connect" }));
        if (data.needsSubscription || data.needsCredit) {
          setUpsellMessage(data.error);
          setUpsellSize(data.creditSize || "any");
          setUpsellOpen(true);
        } else {
          setError(data.error || "Generation failed");
        }
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
            case "bookId": {
              setGeneratingBookId(event.bookId as string);
              break;
            }
            case "progress": {
              const tc = event.totalChapters as number;
              setTotalChapters(tc);
              if (event.status === "outline") {
                setStatusText("Generating outline...");
              } else {
                const ch = event.chapter as number;
                setCurrentChapter(ch);
                setStatusText(`Writing ${format === "course" ? "Module" : "Chapter"} ${ch}: ${event.title}...`);
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
              const regex = /(?:chapter|module)\s+\d+[:\s–\-]+(.+)/gi;
              let m;
              while ((m = regex.exec(event.content as string)) !== null) {
                titles.push(m[1].trim().replace(/\*+/g, "").trim());
              }
              const unitLabel = format === "course" ? "Module" : "Chapter";
              const initial: ChapterInfo[] = [];
              for (let i = 0; i < tc; i++) {
                initial.push({ number: i + 1, title: titles[i] || `${unitLabel} ${i + 1}`, status: "pending" });
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
              // Book is now auto-saved by the API with the bookId
              if (event.bookId) {
                setGeneratingBookId(event.bookId as string);
                setSaved(true);
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
        setStep("input");
      } else if (generatingBookId) {
        // Stream dropped but book is generating in background — poll for completion
        setStatusText("Reconnecting...");
        pollForCompletion(generatingBookId);
      } else {
        setError("Network error — please try again. Longer books may take 3-8 minutes.");
        setStep("input");
      }
    }
  }

  async function pollForCompletion(bookId: string) {
    const maxAttempts = 180; // 15 minutes max
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const res = await fetch(`/api/books/${bookId}/status`);
        if (!res.ok) continue;
        const data = await res.json();
        if (data.status === "complete") {
          // Fetch the full book content
          const bookRes = await fetch(`/api/books/${bookId}`);
          if (bookRes.ok) {
            const book = await bookRes.json();
            setResult(book.content || "");
            setStep("result");
            setSaved(true);
          } else {
            // Still complete, just redirect to library
            window.location.href = `/library/${bookId}`;
          }
          return;
        } else if (data.status === "failed") {
          setError("Generation failed. Please try again.");
          setStep("input");
          return;
        }
        // Still generating — update progress
        if (data.progress) {
          try {
            const prog = typeof data.progress === "string" ? JSON.parse(data.progress) : data.progress;
            if (prog.chapter && prog.totalChapters) {
              setStatusText(`Writing Chapter ${prog.chapter} of ${prog.totalChapters}...`);
              setCurrentChapter(prog.chapter);
              setTotalChapters(prog.totalChapters);
            }
          } catch {}
        }
      } catch {
        // Network error during poll — keep trying
        setStatusText("Connection lost. Retrying...");
      }
    }
    setError("Generation is taking longer than expected. Check your library for the completed book.");
    setStep("input");
  }

  async function generateSeries() {
    if (!title.trim() || !description.trim()) return;
    setStep("generating");
    setResult("");
    setError("");
    setSaved(false);
    setOutline("");
    setChapters([]);
    setStatusText("Creating series plan...");
    setStartTime(Date.now());
    setSeriesProgress("Planning series...");
    setSeriesCurrentBook(0);

    try {
      const res = await fetch("/api/series/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          genre,
          tone,
          audience,
          bookLength,
          language,
          seriesLength,
          seriesDescription: seriesDescription.trim() || undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Failed" }));
        setError(data.error || "Series creation failed");
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
                setStatusText(event.message || "Planning...");
                break;
              case "series_plan":
                setOutline(event.plan);
                setStatusText("Series plan created. Generating books...");
                break;
              case "book_start":
                setSeriesCurrentBook(event.bookNumber);
                setStatusText(`Writing Book ${event.bookNumber} of ${event.totalBooks}...`);
                break;
              case "book_outline":
                setStatusText(`Book ${event.bookNumber}: "${event.bookTitle}" — Writing chapters...`);
                setTotalChapters(event.totalChapters);
                break;
              case "book_chapter_progress":
                setStatusText(`Book ${event.bookNumber} — Ch. ${event.chapter}/${event.totalChapters}: ${event.title}`);
                setCurrentChapter(event.chapter);
                break;
              case "book_chapter_done":
                setChapters(prev => {
                  const updated = [...prev];
                  while (updated.length < event.totalChapters) {
                    updated.push({ number: updated.length + 1, title: `Chapter ${updated.length + 1}`, status: "pending" });
                  }
                  if (updated[event.chapter - 1]) {
                    updated[event.chapter - 1] = { ...updated[event.chapter - 1], title: event.title, status: "done" };
                  }
                  return updated;
                });
                break;
              case "book_complete":
                setStatusText(`Book ${event.bookNumber}: "${event.bookTitle}" complete!`);
                // Reset chapters for next book
                setChapters([]);
                setCurrentChapter(0);
                break;
              case "series_complete":
                setStatusText("Series complete!");
                setSaved(true);
                setResult("Series generated successfully! All books have been saved to your library.");
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
    } catch {
      setError("Series generation failed. Please try again.");
      setStep("input");
    }
  }

  async function saveToLibrary() {
    if (!session?.user || !result) return;
    if (generatingBookId) {
      setSaved(true); // Already saved by API
    } else {
      await autoSave(result);
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
        <Navbar />

        {/* Hero */}
        {step === "input" && (
          <div className="text-center pt-8 pb-12 px-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Write your next{" "}
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
                  placeholder="e.g. The Last Light of Avery Hollow"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Format toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                <div className="flex gap-2">
                  {(["book", "course"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        format === f
                          ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                          : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20 hover:text-gray-200"
                      }`}
                    >
                      {f === "book" ? "📖 Book" : "🎓 Course"}
                    </button>
                  ))}
                </div>
                {format === "course" && (
                  <p className="text-xs text-gray-500 mt-1.5">Generates modules with introductions, core content (3–5k words), key takeaways, exercises, and summaries.</p>
                )}
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

              {/* Sub-Genre / Focus dropdown (for genres with subtopics, excluding Romance which has its own) */}
              {!isRomance && GENRE_SUBTOPICS[genre] && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sub-Genre / Focus</label>
                  <select
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                    value={subGenre}
                    onChange={(e) => setSubGenre(e.target.value)}
                  >
                    <option value="" className="bg-gray-900">Select a focus area (optional)</option>
                    {GENRE_SUBTOPICS[genre].map((s) => (
                      <option key={s} value={s} className="bg-gray-900">{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tone Preview */}
              {tone && TONE_SAMPLES[tone] && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Preview</p>
                  <p className="text-xs text-gray-400 italic leading-relaxed">&ldquo;{TONE_SAMPLES[tone]}&rdquo;</p>
                </div>
              )}

              {/* Mature content toggle - shown for Romance and Other genres */}
              {showMatureToggle && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`relative w-11 h-6 rounded-full transition-colors ${matureEnabled ? "bg-rose-600" : "bg-white/[0.1]"}`}
                      onClick={() => setMatureEnabled(!matureEnabled)}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${matureEnabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-300">Mature Content (18+)</span>
                  </label>
                  {matureEnabled && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Intensity Level</label>
                      <select
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all appearance-none"
                        value={matureLevel}
                        onChange={(e) => setMatureLevel(e.target.value)}
                      >
                        <option value="steamy">Steamy — Sensual and suggestive, tastefully detailed</option>
                        <option value="explicit">Explicit — Full detail, nothing held back</option>
                        <option value="nolimits">No Limits — Maximum intensity, no restrictions</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Romance-specific options */}
              {isRomance && (
                <div className="space-y-4 border border-rose-500/20 rounded-xl p-4 bg-rose-500/[0.03]">
                  <div className="text-xs font-medium text-rose-400 uppercase tracking-wider">Romance Details <span className="text-gray-600 normal-case">(all optional)</span></div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sub-genre</label>
                      <select
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all appearance-none"
                        value={romanceSubGenre}
                        onChange={(e) => setRomanceSubGenre(e.target.value)}
                      >
                        <option value="" className="bg-gray-900">Select sub-genre...</option>
                        {["Enemies to Lovers","Forbidden Romance","Dark Romance","Second Chance","Friends to Lovers","Billionaire/CEO","Paranormal Romance","Historical Romance","Sports Romance","Mafia/Crime Romance","Age Gap","Fake Dating","Arranged Marriage","Reverse Harem","Slow Burn","Other"].map(s => (
                          <option key={s} value={s} className="bg-gray-900">{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Relationship Dynamic</label>
                      <select
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all appearance-none"
                        value={relationshipDynamic}
                        onChange={(e) => setRelationshipDynamic(e.target.value)}
                      >
                        <option value="" className="bg-gray-900">Select dynamic...</option>
                        {["Slow Burn","Instant Chemistry","Love Triangle","Power Imbalance","Rivals/Competition","Boss/Employee","Teacher/Student (of age)","Protector/Protected","Strangers to Lovers","Childhood Friends","Other"].map(d => (
                          <option key={d} value={d} className="bg-gray-900">{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Character Builder */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Character Builder</label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Lead 1</div>
                        <input
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                          placeholder="Name"
                          value={leadOneName}
                          onChange={(e) => setLeadOneName(e.target.value)}
                        />
                        <input
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                          placeholder="e.g. Brooding ex-military, green eyes, emotionally guarded"
                          value={leadOneTraits}
                          onChange={(e) => setLeadOneTraits(e.target.value)}
                        />
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Lead 2</div>
                        <input
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                          placeholder="Name"
                          value={leadTwoName}
                          onChange={(e) => setLeadTwoName(e.target.value)}
                        />
                        <input
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                          placeholder="e.g. Fiery journalist, sharp wit, secretly vulnerable"
                          value={leadTwoTraits}
                          onChange={(e) => setLeadTwoTraits(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                  placeholder="e.g. Young adults who love dark fantasy and morally complex characters"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Describe Your Book</label>
                  <button
                    type="button"
                    onClick={() => {
                      setDescription(generateBookPremise(genre, title, tone, audience));
                      const btn = document.getElementById('auto-gen-btn');
                      if (btn) { btn.classList.add('animate-spin-once'); setTimeout(() => btn.classList.remove('animate-spin-once'), 500); }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-blue-400 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/30 rounded-lg px-3 py-1.5 transition-all"
                  >
                    <span id="auto-gen-btn" className="inline-block transition-transform">🎲</span> Random Idea
                  </button>
                </div>
                <textarea
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                  placeholder="What should this book cover? Include the main topics, structure ideas, key points, any specific chapters or sections you want, and what makes this book unique..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>

              {/* Reference Materials */}
              <div className="border border-white/[0.08] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setRefExpanded(!refExpanded)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-medium text-gray-300">Add Reference Materials <span className="text-gray-600">(optional)</span></span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${refExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {refExpanded && (
                  <div className="border-t border-white/[0.06] p-4 space-y-4">
                    {refError && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{refError}</div>}

                    {/* PDF Upload */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Upload PDFs</label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                      >
                        <div className="text-sm text-gray-400">
                          {refLoading ? "Processing..." : "Click to upload PDF files"}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Max 5 files, 10MB each</div>
                      </div>
                      <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handlePdfUpload} />
                    </div>

                    {/* Google Docs */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Google Docs Link</label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          placeholder="https://docs.google.com/document/d/..."
                          value={gdocUrl}
                          onChange={(e) => setGdocUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={handleGdocAdd}
                          disabled={!gdocUrl.trim() || refLoading}
                          className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-4 transition-all disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Make sure your Google Doc is set to &quot;Anyone with the link can view&quot;</p>
                    </div>

                    {/* Paste Text */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Or paste your reference text here</label>
                      <textarea
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                        placeholder="Paste notes, outlines, research, previous drafts..."
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        rows={4}
                      />
                      {pasteText.trim() && (
                        <button
                          type="button"
                          onClick={handlePasteAdd}
                          className="mt-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm rounded-xl px-4 py-2 transition-all"
                        >
                          Add as Reference
                        </button>
                      )}
                    </div>

                    {/* Reference Cards */}
                    {references.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Added References ({references.length})</label>
                        {references.map((ref, i) => (
                          <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 flex items-start gap-3">
                            <div className="flex-shrink-0 text-xs font-mono text-gray-500 bg-white/[0.06] rounded px-2 py-1 uppercase">{ref.type}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-300 truncate">{ref.name}</div>
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{ref.content.slice(0, 200)}</div>
                            </div>
                            <button type="button" onClick={() => removeReference(i)} className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-colors text-lg leading-none">&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Usage Info */}
              {usage?.isAdmin && (
                <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center font-medium">
                  Admin — Unlimited Access
                </div>
              )}
              {usage && !usage.isAdmin && usage.subscriptionPlan && usage.subscriptionStatus === "active" && (
                <div className="text-sm text-gray-400 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between">
                  <span>
                    {usage.subscriptionPlan === "starter" ? "Starter" : usage.subscriptionPlan === "author" ? "Author" : "Pro Author"} Plan — {usage.monthlyCreditsRemaining} monthly credits remaining
                  </span>
                  <Link href="/pricing" className="text-blue-400 hover:text-blue-300 text-xs">Manage</Link>
                </div>
              )}

              {/* Plan restriction warning */}
              {usage && !usage.isAdmin && usage.subscriptionPlan && usage.subscriptionStatus === "active" && (() => {
                const sizeMap: Record<string, string> = { "10,000": "short", "25,000": "medium", "50,000": "standard", "75,000": "standard", "100,000": "epic" };
                const selectedSize = Object.entries(sizeMap).find(([k]) => bookLength.includes(k))?.[1] || "short";
                if (selectedSize === "epic") {
                  return <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">Epic books require a one-time credit purchase on any plan.</div>;
                }
                if (!usage.allowedSizes.includes(selectedSize)) {
                  return <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">Your plan does not include {selectedSize} books. Upgrade or buy a credit.</div>;
                }
                return null;
              })()}

              {/* Create as Series Toggle */}
              <div className="border border-white/[0.08] rounded-xl p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors ${createAsSeries ? "bg-indigo-600" : "bg-white/[0.1]"}`}
                    onClick={() => setCreateAsSeries(!createAsSeries)}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${createAsSeries ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-300">Create as Series</span>
                </label>

                {createAsSeries && (
                  <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Number of Books</label>
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
                      <label className="block text-xs font-medium text-gray-400 mb-1">Series Direction (optional)</label>
                      <textarea
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                        placeholder="How should the series evolve across books?"
                        value={seriesDescription}
                        onChange={(e) => setSeriesDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl p-4 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:shadow-none"
                onClick={createAsSeries ? generateSeries : generate}
                disabled={!title.trim() || !description.trim()}
              >
                {session ? (createAsSeries ? `Generate ${seriesLength}-Book Series` : "Generate Book") : "Sign in to Generate"}
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
                    className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(progressPercent, 4)}%` }}
                  >
                    <div className="animate-progress-shimmer absolute inset-0" />
                  </div>
                </div>
                <div className="text-right mt-1 text-xs text-gray-600">
                  {totalChapters > 0
                    ? `${doneCount} / ${totalChapters} ${format === "course" ? "modules" : "chapters"}`
                    : "Generating outline..."}
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
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-sm text-gray-400">
                  <span>{genre}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{tone}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{bookLength}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{language}</span>
                </div>
              </div>

              {/* Word count bar */}
              <div className="flex justify-center gap-6 py-3 border-b border-white/[0.06] text-sm text-gray-400">
                <span>{result.split(/\s+/).filter(Boolean).length.toLocaleString()} words</span>
                <span>~{Math.ceil(result.split(/\s+/).filter(Boolean).length / 300)} pages</span>
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

        <UpsellModal
          isOpen={upsellOpen}
          onClose={() => setUpsellOpen(false)}
          currentPlan={usage?.subscriptionPlan || null}
          requestedSize={upsellSize}
          message={upsellMessage}
        />
      </div>
    </main>
  );
}
