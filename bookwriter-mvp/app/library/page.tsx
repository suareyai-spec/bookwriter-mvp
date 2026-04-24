"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface UsageData {
  isAdmin?: boolean;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  monthlyBooksUsed: number;
  monthlyCreditsTotal: number;
  monthlyCreditsRemaining: number;
  creditCounts: Record<string, number>;
}

interface BookData {
  id: string;
  title: string;
  genre: string | null;
  status: string;
  progress: string | null;
  mature: boolean;
  createdAt: string;
  seriesId: string | null;
  seriesOrder: number | null;
  contentType: string | null;
  _count: { versions: number };
  latestVersion: { wordCount: number | null } | null;
}

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageData | null>(null);

  const fetchBooks = useCallback(async () => {
    const res = await fetch("/api/books");
    if (res.ok) {
      const data = await res.json();
      setBooks(data.books || []);
    }
    setLoading(false);
  }, []);

  const fetchUsage = useCallback(async () => {
    const res = await fetch("/api/user/usage");
    if (res.ok) setUsage(await res.json());
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchBooks();
      fetchUsage();
    }
  }, [status, router, fetchBooks, fetchUsage]);

  // Poll for updates if any books are in progress
  useEffect(() => {
    const hasInProgress = books.some(b => b.status === "generating" || b.status === "revising");
    if (!hasInProgress) return;
    const interval = setInterval(() => { fetchBooks(); }, 5000);
    return () => clearInterval(interval);
  }, [books, fetchBooks]);

  async function deleteBook(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    }
  }

  async function downloadPdf(id: string, title: string) {
    const res = await fetch(`/api/export/pdf?bookId=${id}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadDocx(id: string, title: string) {
    const res = await fetch(`/api/export/google/start?bookId=${id}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
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

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Your Library
            </h1>
            <Link
              href="/create"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl px-5 py-3 transition-all shadow-lg shadow-blue-500/20 text-sm sm:text-base w-full sm:w-auto text-center"
            >
              Create New
            </Link>
          </div>

          {/* Subscription Status Bar */}
          {usage && (
            <div className="mb-8 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  {usage.isAdmin ? (
                    <div className="text-sm font-medium text-amber-400">
                      Admin — Unlimited Access
                    </div>
                  ) : usage.subscriptionPlan && usage.subscriptionStatus === "active" ? (
                    <>
                      <div className="text-sm font-medium text-gray-300">
                        {usage.subscriptionPlan === "starter" ? "Starter" : usage.subscriptionPlan === "author" ? "Author" : "Pro Author"} Plan
                        <span className="text-gray-500 ml-2">
                          {usage.monthlyBooksUsed} of {usage.monthlyCreditsTotal} monthly credits used
                        </span>
                      </div>
                      <div className="mt-2 w-48 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (usage.monthlyBooksUsed / usage.monthlyCreditsTotal) * 100)}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-400">No active subscription</div>
                  )}
                  {(usage.creditCounts.short > 0 || usage.creditCounts.medium > 0 || usage.creditCounts.standard > 0 || usage.creditCounts.epic > 0) && (
                    <div className="mt-2 flex gap-3 text-xs text-gray-500">
                      {usage.creditCounts.short > 0 && <span>{usage.creditCounts.short} short credit{usage.creditCounts.short > 1 ? "s" : ""}</span>}
                      {usage.creditCounts.medium > 0 && <span>{usage.creditCounts.medium} medium credit{usage.creditCounts.medium > 1 ? "s" : ""}</span>}
                      {usage.creditCounts.standard > 0 && <span>{usage.creditCounts.standard} standard credit{usage.creditCounts.standard > 1 ? "s" : ""}</span>}
                      {usage.creditCounts.epic > 0 && <span>{usage.creditCounts.epic} epic credit{usage.creditCounts.epic > 1 ? "s" : ""}</span>}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/pricing"
                    className="text-sm bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-gray-300 rounded-lg px-4 py-2 transition-all"
                  >
                    {usage.subscriptionPlan ? "Upgrade Plan" : "Subscribe"}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {books.length === 0 ? (
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
              <p className="text-gray-400 text-lg mb-4">You haven&apos;t created anything yet. Create your first one!</p>
              <Link
                href="/create"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl px-6 py-3 transition-all"
              >
                Get Started
              </Link>
            </div>
          ) : (
            (() => {
              // Group books: series books grouped together, standalone books separate
              const seriesMap = new Map<string, BookData[]>();
              const standaloneBooks: BookData[] = [];
              
              for (const book of books) {
                if (book.seriesId) {
                  const existing = seriesMap.get(book.seriesId) || [];
                  existing.push(book);
                  seriesMap.set(book.seriesId, existing);
                } else {
                  standaloneBooks.push(book);
                }
              }

              // Sort series books by order
              for (const [, seriesBooks] of seriesMap) {
                seriesBooks.sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
              }

              const renderBookCard = (book: BookData, seriesLabel?: string) => (
                <Link
                  key={book.id}
                  href={`/library/${book.id}`}
                  className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 flex flex-col hover:bg-white/[0.06] hover:border-white/[0.10] transition-all cursor-pointer"
                >
                  <div className="flex gap-2 mb-2">
                    {seriesLabel && (
                      <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full px-2 py-0.5">
                        {seriesLabel}
                      </span>
                    )}
                    {book.contentType && book.contentType !== "book" && (() => {
                      const badges: Record<string, { label: string; color: string }> = {
                        comic: { label: "Comic", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
                        play: { label: "Play", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
                        thesis: { label: "Thesis", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
                        course: { label: "Course", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
                      };
                      const b = badges[book.contentType];
                      return b ? (
                        <span className={`text-xs border rounded-full px-2 py-0.5 ${b.color}`}>{b.label}</span>
                      ) : null;
                    })()}
                    {book.mature && (
                      <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full px-2 py-0.5">
                        18+
                      </span>
                    )}
                  </div>
                  <h3
                    className="text-lg font-bold mb-1 line-clamp-2"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {book.title}
                  </h3>
                  
                  {(book.status === "generating" || book.status === "revising") && (() => {
                    let percent = 0;
                    let progressText = book.status === "generating" ? "Generating..." : "Revising...";
                    if (book.progress) {
                      try {
                        const p = JSON.parse(book.progress);
                        percent = p.percent || 0;
                        if (p.currentChapter && p.totalChapters) {
                          progressText = `${book.status === "generating" ? "Writing" : "Revising"} ch. ${p.currentChapter}/${p.totalChapters}`;
                        }
                      } catch {}
                    }
                    return (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                          <span className="text-xs text-blue-400 font-medium">{progressText}</span>
                          <span className="text-xs text-gray-500 ml-auto">{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {book.status === "failed" && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />
                      <span className="text-xs text-red-400 font-medium">Generation failed</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-4">
                    {book.genre && <span className="bg-white/[0.06] rounded-full px-2 py-0.5">{book.genre}</span>}
                    <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                    <span>{book._count.versions} version{book._count.versions !== 1 ? "s" : ""}</span>
                    {book.latestVersion?.wordCount && (
                      <span>{book.latestVersion.wordCount.toLocaleString()} words</span>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2" onClick={(e) => e.preventDefault()}>
                    <button
                      onClick={(e) => { e.preventDefault(); downloadPdf(book.id, book.title); }}
                      className="text-sm bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-lg px-3 py-1.5 transition-all"
                    >
                      PDF
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); downloadDocx(book.id, book.title); }}
                      className="text-sm bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg px-3 py-1.5 transition-all"
                    >
                      .docx
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); deleteBook(book.id); }}
                      className="text-sm bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg px-3 py-1.5 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </Link>
              );

              return (
                <div className="space-y-8">
                  {/* Series groups */}
                  {Array.from(seriesMap.entries()).map(([seriesId, seriesBooks]) => (
                    <div key={seriesId} className="bg-white/[0.02] border border-indigo-500/20 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        
                        <h2 className="text-lg font-bold text-indigo-300" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                          Series ({seriesBooks.length} books)
                        </h2>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {seriesBooks.map((book) => renderBookCard(book, `Book ${book.seriesOrder}`))}
                      </div>
                    </div>
                  ))}

                  {/* Standalone books */}
                  {standaloneBooks.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {standaloneBooks.map((book) => renderBookCard(book))}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>

        
      </div>
    </main>
  );
}
