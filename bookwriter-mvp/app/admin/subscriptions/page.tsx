"use client";

import { useEffect, useState, useCallback, Fragment } from "react";

interface SubscriptionRow {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  status: string;
  creditsRemaining: number;
  joinDate: string;
  lastGenerationDate: string | null;
  totalGenerations: number;
}

interface DetailData {
  user: SubscriptionRow & { subscriptionId: string | null };
  currentPeriodEnd: string | null;
  subscriptionPriceAmount: number | null;
  cancelAtPeriodEnd: boolean;
  generationsThisMonth: number;
  billingHistory: { id: string; amountPaid: number; status: string | null; created: string; hostedInvoiceUrl: string | null }[];
}

const PLAN_LABELS: Record<string, string> = { free: "Free", starter: "Starter", author: "Author", studio: "Studio" };
const PLAN_BADGES: Record<string, string> = {
  free: "bg-gray-500/20 text-gray-400",
  starter: "bg-emerald-500/20 text-emerald-400",
  author: "bg-blue-500/20 text-blue-400",
  studio: "bg-purple-500/20 text-purple-400",
};
const STATUS_LABELS: Record<string, string> = { active: "Active", canceled: "Cancelled", past_due: "Past Due", none: "—" };
const STATUS_BADGES: Record<string, string> = {
  active: "text-green-400",
  canceled: "text-red-400",
  past_due: "text-amber-400",
  none: "text-gray-500",
};

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<{ totalActive: number; byPlan: { plan: string; count: number }[] } | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const fetchList = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (planFilter) params.set("plan", planFilter);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/subscriptions?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setSubscriptions(d.subscriptions || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setStats(d.stats || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search, planFilter, statusFilter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const toggleExpand = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(id);
    setDetail(null);
    setDetailLoading(true);
    fetch(`/api/admin/subscriptions/${id}`)
      .then((r) => r.json())
      .then((d) => { setDetail(d); setDetailLoading(false); })
      .catch(() => setDetailLoading(false));
  };

  const cancelSub = async (subscriptionId: string, userId: string) => {
    if (!confirm("Cancel this subscription? This will cancel in Stripe.")) return;
    setCanceling(true);
    await fetch("/api/admin/subscriptions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, userId }),
    });
    setCanceling(false);
    fetchList();
    toggleExpand(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <span className="text-gray-500 text-sm">{total} total</span>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider">Active Subscriptions</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalActive}</p>
          </div>
          {stats.byPlan.map((p) => (
            <div key={p.plan} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider">{PLAN_LABELS[p.plan] || p.plan}</p>
              <p className="text-2xl font-bold text-white mt-1">{p.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 w-64"
        />
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
        >
          <option value="">All Plans</option>
          <option value="none">Free (No Plan)</option>
          <option value="starter">Starter</option>
          <option value="author">Author</option>
          <option value="studio">Studio</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="canceled">Cancelled</option>
          <option value="past_due">Past Due</option>
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
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Credits Remaining</th>
                  <th className="text-right p-3">Joined</th>
                  <th className="text-right p-3">Last Generation</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <Fragment key={s.id}>
                    <tr
                      onClick={() => toggleExpand(s.id)}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="p-3 text-white">{s.name || "—"}</td>
                      <td className="p-3 text-gray-300">{s.email}</td>
                      <td className="p-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_BADGES[s.plan] || PLAN_BADGES.free}`}>
                          {PLAN_LABELS[s.plan] || s.plan}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs ${STATUS_BADGES[s.status] || "text-gray-500"}`}>
                          {STATUS_LABELS[s.status] || s.status}
                        </span>
                      </td>
                      <td className="p-3 text-right text-gray-300">{s.creditsRemaining.toLocaleString()}</td>
                      <td className="p-3 text-right text-gray-500">{new Date(s.joinDate).toLocaleDateString()}</td>
                      <td className="p-3 text-right text-gray-500">
                        {s.lastGenerationDate ? new Date(s.lastGenerationDate).toLocaleDateString() : "Never"}
                      </td>
                    </tr>
                    {expanded === s.id && (
                      <tr key={`${s.id}-detail`}>
                        <td colSpan={7} className="p-4 bg-white/[0.01]">
                          {detailLoading ? (
                            <div className="text-center text-gray-500 py-4">Loading detail...</div>
                          ) : detail ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Current Period End</span>
                                  <span className="text-white">{detail.currentPeriodEnd ? new Date(detail.currentPeriodEnd).toLocaleDateString() : "—"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Subscription Price</span>
                                  <span className="text-white">{detail.subscriptionPriceAmount != null ? `$${detail.subscriptionPriceAmount}/mo` : "—"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Generations This Month</span>
                                  <span className="text-white">{detail.generationsThisMonth}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Total Generations</span>
                                  <span className="text-white">{s.totalGenerations}</span>
                                </div>
                              </div>

                              {detail.cancelAtPeriodEnd && (
                                <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                                  Cancelling at period end
                                </div>
                              )}

                              <div>
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Billing History</h3>
                                {detail.billingHistory.length === 0 ? (
                                  <p className="text-xs text-gray-600">No billing history.</p>
                                ) : (
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-gray-500">
                                        <th className="text-left pb-1">Date</th>
                                        <th className="text-left pb-1">Status</th>
                                        <th className="text-right pb-1">Amount</th>
                                        <th className="text-right pb-1"></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detail.billingHistory.map((inv) => (
                                        <tr key={inv.id} className="border-t border-white/[0.04]">
                                          <td className="py-1 text-gray-400">{new Date(inv.created).toLocaleDateString()}</td>
                                          <td className="py-1 text-gray-300 capitalize">{inv.status || "—"}</td>
                                          <td className="py-1 text-right text-white">${inv.amountPaid.toFixed(2)}</td>
                                          <td className="py-1 text-right">
                                            {inv.hostedInvoiceUrl && (
                                              <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                View →
                                              </a>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>

                              {s.status === "active" && detail.user.subscriptionId && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); cancelSub(detail.user.subscriptionId!, s.id); }}
                                  disabled={canceling}
                                  className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 rounded px-3 py-1.5 disabled:opacity-50"
                                >
                                  {canceling ? "Cancelling..." : "Cancel Subscription"}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-4">Failed to load detail.</div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {subscriptions.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
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
