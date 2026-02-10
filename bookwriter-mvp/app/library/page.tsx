"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface BookData {
  id: string;
  title: string;
  genre: string | null;
  createdAt: string;
  _count: { versions: number };
  latestVersion: { wordCount: number | null } | null;
}

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    const res = await fetch("/api/books");
    if (res.ok) {
      const data = await res.json();
      setBooks(data.books || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchBooks();
    }
  }, [status, router, fetchBooks]);

  async function deleteBook(id: string) {
    if (!confirm("Are you sure you want to delete this book?")) return;
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

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Your Library
            </h1>
            <Link
              href="/"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl px-6 py-3 transition-all shadow-lg shadow-blue-500/20"
            >
              Create New Book
            </Link>
          </div>

          {books.length === 0 ? (
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
              <p className="text-gray-400 text-lg mb-4">You haven&apos;t created any books yet. Create your first one!</p>
              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl px-6 py-3 transition-all"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 flex flex-col"
                >
                  <h3
                    className="text-lg font-bold mb-1 line-clamp-2"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {book.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-4">
                    {book.genre && <span className="bg-white/[0.06] rounded-full px-2 py-0.5">{book.genre}</span>}
                    <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                    <span>{book._count.versions} version{book._count.versions !== 1 ? "s" : ""}</span>
                    {book.latestVersion?.wordCount && (
                      <span>{book.latestVersion.wordCount.toLocaleString()} words</span>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link
                      href={`/library/${book.id}`}
                      className="text-sm bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg px-3 py-1.5 transition-all"
                    >
                      Read
                    </Link>
                    <button
                      onClick={() => downloadPdf(book.id, book.title)}
                      className="text-sm bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-lg px-3 py-1.5 transition-all"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => downloadDocx(book.id, book.title)}
                      className="text-sm bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg px-3 py-1.5 transition-all"
                    >
                      .docx
                    </button>
                    <button
                      onClick={() => deleteBook(book.id)}
                      className="text-sm bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg px-3 py-1.5 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        
      </div>
    </main>
  );
}
