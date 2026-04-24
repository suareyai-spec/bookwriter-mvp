"use client";

import { useEffect, useState } from "react";

export default function AdminSubscriptions() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<"active" | "canceled">("active");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/admin/subscriptions?status=${tab}&page=${page}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [tab, page]);

  const cancelSub = async (subscriptionId: string, userId: string) => {
    if (!confirm("Cancel this subscription? This will cancel in Stripe.")) return;
    setCanceling(subscriptionId);
    await fetch("/api/admin/subscriptions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, userId }),
    });
    setCanceling(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Subscriptions</h1>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase">Active</p>
            <p className="text-2xl font-bold text-purple-400">{data.stats.totalActive}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase">Canceled (recent)</p>
            <p className="text-2xl font-bold text-amber-400">{data.stats.canceledRecently}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase">Churn Rate</p>
            <p className="text-2xl font-bold text-red-400">{(data.stats.churnRate * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["active", "canceled"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === t ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-gray-400 hover:text-white"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
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
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Next Billing</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.subscriptions || []).map((s: any) => (
                  <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-3">
                      <div className="text-white">{s.name || "-"}</div>
                      <div className="text-gray-500 text-xs">{s.email}</div>
                    </td>
                    <td className="p-3 text-gray-300">{s.subscriptionPlan}</td>
                    <td className="p-3 text-green-400">{s.priceAmount ? `$${s.priceAmount}` : "-"}</td>
                    <td className="p-3">
                      <span className={`text-xs ${s.subscriptionStatus === "active" ? "text-green-400" : "text-red-400"}`}>
                        {s.subscriptionStatus}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "-"}</td>
                    <td className="p-3">
                      {s.subscriptionStatus === "active" && s.subscriptionId && (
                        <button
                          onClick={() => cancelSub(s.subscriptionId, s.id)}
                          disabled={canceling === s.subscriptionId}
                          className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 rounded px-2 py-1"
                        >
                          {canceling === s.subscriptionId ? "Canceling..." : "Cancel"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!data?.subscriptions || data.subscriptions.length === 0) && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">No subscriptions found</td></tr>
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
