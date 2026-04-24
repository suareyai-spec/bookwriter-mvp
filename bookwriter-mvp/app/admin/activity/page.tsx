"use client";

import { useEffect, useState } from "react";

const TYPE_COLORS: Record<string, string> = {
  signup: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  book: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  subscription: "text-green-400 bg-green-500/10 border-green-500/20",
  payment: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  refund: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function AdminActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (type) params.set("type", type);
    fetch(`/api/admin/activity?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setActivities(d.activities || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, type]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Activity Log</h1>
        <span className="text-gray-500 text-sm">{total} events</span>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["", "signup", "book", "subscription"].map((t) => (
          <button key={t} onClick={() => { setType(t); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${type === t ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-gray-400 hover:text-white"}`}>
            {t || "All"}
          </button>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No activity found</div>
        ) : (
          activities.map((a, i) => {
            const colors = TYPE_COLORS[a.type] || "text-gray-400 bg-gray-500/10 border-gray-500/20";
            return (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 flex items-center gap-4">
                <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${colors}`}>
                  {a.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-200 text-sm truncate">{a.description}</p>
                  <p className="text-gray-500 text-xs">{a.email}</p>
                </div>
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {new Date(a.date).toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Prev</button>
          <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}
