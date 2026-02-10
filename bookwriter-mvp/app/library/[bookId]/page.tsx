"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
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
}

export default function BookDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<BookDetail | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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
            </div>
          </div>

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
          {book.versions.length > 1 && (
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
                      <span className="font-medium">Version {v.version}</span>
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
