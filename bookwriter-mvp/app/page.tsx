"use client";

import { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [targetWords, setTargetWords] = useState(20000);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setResult("");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, genre, targetWords }),
    });
    const data = await res.json();
    setResult(data.text || data.error || "No output");
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-3xl font-bold">BookWriter MVP</h1>
      <p className="text-sm opacity-80">Generate original books with export hooks (PDF + Google Docs).</p>

      <div className="grid gap-3">
        <input className="border rounded p-2" placeholder="Book title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="border rounded p-2" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
        <input
          className="border rounded p-2"
          type="number"
          min={5000}
          max={100000}
          value={targetWords}
          onChange={(e) => setTargetWords(Number(e.target.value))}
        />
        <button className="bg-black text-white rounded p-2" onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate Sample Chapters"}
        </button>
      </div>

      <textarea className="w-full h-96 border rounded p-3" value={result} onChange={(e) => setResult(e.target.value)} />

      <div className="flex gap-2">
        <a className="border rounded p-2" href="/api/export/pdf" target="_blank">Export PDF</a>
        <a className="border rounded p-2" href="/api/export/google/start">Export Google Doc</a>
      </div>
    </main>
  );
}
