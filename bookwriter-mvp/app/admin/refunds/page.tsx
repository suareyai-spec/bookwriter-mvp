"use client";

import { useEffect, useState } from "react";

export default function AdminRefunds() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<string | null>(null);
  const [refundForm, setRefundForm] = useState<{ chargeId: string; amount: string; reason: string } | null>(null);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    fetch(`/api/admin/refunds?${params}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const issueRefund = async () => {
    if (!refundForm) return;
    setRefunding(refundForm.chargeId);
    const body: any = { chargeId: refundForm.chargeId };
    if (refundForm.amount) body.amount = parseFloat(refundForm.amount);
    if (refundForm.reason) body.reason = refundForm.reason;

    await fetch("/api/admin/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setRefunding(null);
    setRefundForm(null);
    fetchData();
  };

  const fmt = (n: number) => "$" + n.toFixed(2);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Refunds</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by email or charge ID..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 w-80"
      />

      {/* Refund Form */}
      {refundForm && (
        <div className="bg-white/[0.03] border border-amber-500/20 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold">Issue Refund for {refundForm.chargeId}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-500 text-xs block mb-1">Amount (leave blank for full)</label>
              <input type="number" step="0.01" value={refundForm.amount} onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white w-full" placeholder="Full refund" />
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">Reason</label>
              <select value={refundForm.reason} onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white w-full">
                <option value="">Select reason</option>
                <option value="duplicate">Duplicate</option>
                <option value="fraudulent">Fraudulent</option>
                <option value="requested_by_customer">Requested by customer</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={issueRefund} disabled={refunding === refundForm.chargeId}
              className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">
              {refunding ? "Processing..." : "Issue Refund"}
            </button>
            <button onClick={() => setRefundForm(null)} className="text-gray-400 hover:text-white text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Charges Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]"><h3 className="text-white font-semibold">Recent Charges</h3></div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.charges || []).map((c: any) => (
                  <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-3 text-gray-400 text-xs">{new Date(c.date).toLocaleString()}</td>
                    <td className="p-3 text-gray-300">{c.email}</td>
                    <td className="p-3 text-green-400">{fmt(c.amount)}</td>
                    <td className="p-3 text-gray-400 max-w-[200px] truncate">{c.description}</td>
                    <td className="p-3">
                      <span className={`text-xs ${c.refunded ? "text-red-400" : "text-green-400"}`}>
                        {c.refunded ? `Refunded (${fmt(c.amountRefunded)})` : c.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {!c.refunded && c.status === "succeeded" && (
                        <button onClick={() => setRefundForm({ chargeId: c.id, amount: "", reason: "" })}
                          className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!data?.charges || data.charges.length === 0) && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">No charges found</td></tr>
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

      {/* Refund History */}
      {data?.refunds && data.refunds.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]"><h3 className="text-white font-semibold">Refund History</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Charge</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Reason</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.refunds.map((r: any) => (
                  <tr key={r.id} className="border-b border-white/[0.04]">
                    <td className="p-3 text-gray-400 text-xs">{new Date(r.created).toLocaleString()}</td>
                    <td className="p-3 text-gray-300 text-xs font-mono">{r.chargeId}</td>
                    <td className="p-3 text-red-400">{fmt(r.amount)}</td>
                    <td className="p-3 text-gray-400">{r.reason || "-"}</td>
                    <td className="p-3 text-gray-400">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
