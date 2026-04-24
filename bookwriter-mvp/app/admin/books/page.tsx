"use client";

import { useEffect, useState, useCallback } from "react";

export default function AdminBooks() {
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [size, setSize] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (genre) params.set("genre", genre);
    if (size) params.set("size", size);
    if (status) params.set("status", status);
    fetch(`/api/admin/books?${params}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page, search, genre, size, status]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Books</h1>
        <span className="text-gray-500 text-sm">{data?.total || 0} total</span>
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase">Total Books</p>
            <p className="text-xl font-bold text-white">{data.stats.totalBooks}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase">Top Genre</p>
            <p className="text-lg font-bold text-purple-400">{data.stats.byGenre?.[0]?.genre || "N/A"}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase">By Size</p>
            <div className="text-xs text-gray-400 mt-1">
              {(data.stats.bySize || []).map((s: any) => (
                <span key={s.size} className="mr-2">{s.size}: {s.count}</span>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase">By Status</p>
            <div className="text-xs text-gray-400 mt-1">
              {(data.stats.byStatus || []).map((s: any) => (
                <span key={s.status} className="mr-2">{s.status}: {s.count}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search title..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 w-64"
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-gray-300">
          <option value="">All Statuses</option>
          <option value="complete">Complete</option>
          <option value="generating">Generating</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Title</th>
                  <th className="text-left p-3">Author</th>
                  <th className="text-left p-3">Genre</th>
                  <th className="text-left p-3">Size</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Words</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {(data?.books || []).map((b: any) => (
                  <tr key={b.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-3 text-white max-w-[200px] truncate">{b.title}</td>
                    <td className="p-3 text-gray-300 text-xs">{b.author}</td>
                    <td className="p-3 text-gray-400">{b.genre || "-"}</td>
                    <td className="p-3 text-gray-400">{b.bookLength || "-"}</td>
                    <td className="p-3">
                      <span className={`text-xs ${b.status === "complete" ? "text-green-400" : b.status === "failed" ? "text-red-400" : "text-amber-400"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400">{b.wordCount?.toLocaleString() || "-"}</td>
                    <td className="p-3 text-gray-500 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!data?.books || data.books.length === 0) && (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500">No books found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Prev</button>
          <span className="text-gray-500 text-sm">Page {page} of {data.totalPages}</span>
          <button onClick={() => setPage(Math.min(data.totalPages, page + 1))} disabled={page === data.totalPages} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}
