"use client";

import { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    setResult("");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();
    setResult(data.text || data.error || "No output");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      {/* Title Card */}
      <div className="flex flex-col items-center justify-center pt-16 pb-10 px-4">
        <h1 className="text-5xl font-bold tracking-tight">📖 MyBook</h1>
        <p className="mt-3 text-lg text-gray-400 text-center max-w-md">
          Tell me what your book should be about and I'll write it for you.
        </p>
      </div>

      {/* Input Section */}
      <div className="mx-auto max-w-2xl px-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Book Title</label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Value Based Care for the Healthcare CEO"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Describe your book
          </label>
          <textarea
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[140px]"
            placeholder="Describe what the book should cover, the audience, tone, structure, and any specific topics or chapters you want included..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg p-3 transition-colors"
          onClick={generate}
          disabled={loading || !title.trim() || !description.trim()}
        >
          {loading ? "✍️ Writing your book..." : "Generate Book"}
        </button>
      </div>

      {/* Output Section */}
      {(result || loading) && (
        <div className="mx-auto max-w-2xl px-4 mt-8 pb-16">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{title || "Your Book"}</h2>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <span className="animate-pulse">✍️</span> Writing... this may take 15-30 seconds
              </div>
            ) : (
              <>
                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed max-h-[600px] overflow-y-auto">
                  {result}
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
                  <a
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    href={`/api/export/pdf?title=${encodeURIComponent(title)}&content=${encodeURIComponent(result)}`}
                    target="_blank"
                  >
                    📄 Export PDF
                  </a>
                  <a
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    href="/api/export/google/start"
                  >
                    📝 Export Google Doc
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
