"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#ec4899", "#14b8a6"];
const fmt$ = (n: number) => "$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const TABS = ["Overview", "Users", "Books", "Revenue", "Insights"] as const;
type Tab = typeof TABS[number];

// ─── shared ui ───────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.03] border border-white/[0.06] rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function KPI({ label, value, sub, color = "text-white" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <Card className="p-5">
      <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </Card>
  );
}

function Badge({ plan }: { plan: string | null }) {
  const styles: Record<string, string> = {
    studio: "bg-purple-500/20 text-purple-400",
    "author-pro": "bg-blue-500/20 text-blue-400",
    creator: "bg-green-500/20 text-green-400",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[plan || ""] || "bg-gray-500/20 text-gray-400"}`}>
      {plan || "Free"}
    </span>
  );
}

// ─── overview tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data || data.error) return <ErrMsg msg={data?.error} />;

  const growth = data.lastMonthRevenue > 0
    ? (((data.monthlyRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPI label="Total Revenue" value={fmt$(data.totalRevenue)} color="text-green-400" />
        <KPI label="MRR" value={fmt$(data.mrr)} sub={growth ? `${growth > "0" ? "+" : ""}${growth}% vs last month` : undefined} color="text-green-400" />
        <KPI label="Monthly Revenue" value={fmt$(data.monthlyRevenue)} color="text-green-400" />
        <KPI label="Total Users" value={(data.totalUsers || 0).toLocaleString()} color="text-blue-400" />
        <KPI label="Active Subs" value={(data.activeSubscribers || 0).toLocaleString()} color="text-purple-400" />
        <KPI label="Books (Month)" value={(data.booksThisMonth || 0).toLocaleString()} sub={`${(data.totalBooks || 0).toLocaleString()} all time`} />
      </div>

      {/* API Cost */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="API Cost (Total)" value={`$${(data.totalApiCost || 0).toFixed(2)}`} color="text-amber-400" />
        <KPI label="API Cost (Month)" value={`$${(data.monthlyApiCost || 0).toFixed(2)}`} color="text-amber-400" />
        <KPI label="Net Profit" value={fmt$(data.netProfit)} color={data.netProfit >= 0 ? "text-green-400" : "text-red-400"} />
        <KPI label="Last Month Revenue" value={fmt$(data.lastMonthRevenue)} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Revenue — Last 12 Months</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.revenueChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [fmt$(v), "Revenue"]} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">New Signups — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.signupsChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Subscriptions by Plan</h3>
          {data.subscriptionBreakdown?.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={data.subscriptionBreakdown} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={80} innerRadius={40} strokeWidth={0}>
                    {data.subscriptionBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 text-sm flex-1">
                {data.subscriptionBreakdown.map((s: any, i: number) => (
                  <div key={s.plan} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-300 flex-1 capitalize">{s.plan}</span>
                    <span className="text-gray-400 font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">No active subscriptions</div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Books Generated — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.booksChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ─── users tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [editState, setEditState] = useState<Record<string, { plan: string; status: string }>>({});

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page) });
    if (search) p.set("search", search);
    if (planFilter) p.set("plan", planFilter);
    if (statusFilter) p.set("status", statusFilter);
    fetch(`/api/admin/users?${p}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setLoading(false);
        const init: Record<string, { plan: string; status: string }> = {};
        for (const u of d.users || []) {
          init[u.id] = { plan: u.subscriptionPlan || "", status: u.subscriptionStatus || "" };
        }
        setEditState((prev) => ({ ...prev, ...init }));
      })
      .catch(() => setLoading(false));
  }, [page, search, planFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const saveUser = async (userId: string, extra?: { resetUsage?: boolean }) => {
    setSaving(userId);
    const { plan, status } = editState[userId] || {};
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        subscriptionPlan: plan || null,
        subscriptionStatus: status || null,
        ...extra,
      }),
    });
    setSaving(null);
    fetchUsers();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Users</h2>
        <span className="text-gray-500 text-sm">{total.toLocaleString()} total</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 w-64"
        />
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
          <option value="">All Plans</option>
          <option value="none">Free (No Plan)</option>
          <option value="creator">Creator</option>
          <option value="author-pro">Author Pro</option>
          <option value="studio">Studio</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="canceled">Canceled</option>
          <option value="none">No Subscription</option>
        </select>
      </div>

      <Card>
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Books</th>
                  <th className="text-left p-3">Mo. Used</th>
                  <th className="text-left p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <>
                    <tr
                      key={u.id}
                      onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="p-3 text-white">{u.name || <span className="text-gray-600">—</span>}</td>
                      <td className="p-3 text-gray-300 text-xs">{u.email}</td>
                      <td className="p-3"><Badge plan={u.subscriptionPlan} /></td>
                      <td className="p-3">
                        <span className={`text-xs ${u.subscriptionStatus === "active" ? "text-green-400" : "text-gray-500"}`}>
                          {u.subscriptionStatus || "none"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300">{u.booksCount}</td>
                      <td className="p-3 text-gray-400">{u.monthlyBooksUsed}</td>
                      <td className="p-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                    {expanded === u.id && (
                      <tr key={`${u.id}-exp`}>
                        <td colSpan={7} className="bg-white/[0.015] border-b border-white/[0.04]">
                          <div className="p-4 space-y-4">
                            {/* Stats row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div className="bg-white/[0.03] rounded-lg p-3">
                                <p className="text-gray-500">Monthly Books Used</p>
                                <p className="text-white font-medium text-sm mt-0.5">{u.monthlyBooksUsed}</p>
                              </div>
                              <div className="bg-white/[0.03] rounded-lg p-3">
                                <p className="text-gray-500">Revisions Used</p>
                                <p className="text-white font-medium text-sm mt-0.5">{u.revisionCount}</p>
                              </div>
                              <div className="bg-white/[0.03] rounded-lg p-3">
                                <p className="text-gray-500">Newsletters Used</p>
                                <p className="text-white font-medium text-sm mt-0.5">{u.monthlyNewslettersUsed}</p>
                              </div>
                              <div className="bg-white/[0.03] rounded-lg p-3">
                                <p className="text-gray-500">Stripe Customer</p>
                                <p className="text-white font-medium text-xs mt-0.5 truncate">{u.stripeCustomerId || "None"}</p>
                              </div>
                            </div>

                            {/* Edit controls */}
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2">
                                <label className="text-gray-500 text-xs">Plan:</label>
                                <select
                                  value={editState[u.id]?.plan || ""}
                                  onChange={(e) => setEditState((prev) => ({ ...prev, [u.id]: { ...prev[u.id], plan: e.target.value } }))}
                                  className="bg-white/[0.05] border border-white/[0.1] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                >
                                  <option value="">Free</option>
                                  <option value="creator">Creator ($99/mo)</option>
                                  <option value="author-pro">Author Pro ($199/mo)</option>
                                  <option value="studio">Studio ($349/mo)</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-gray-500 text-xs">Status:</label>
                                <select
                                  value={editState[u.id]?.status || ""}
                                  onChange={(e) => setEditState((prev) => ({ ...prev, [u.id]: { ...prev[u.id], status: e.target.value } }))}
                                  className="bg-white/[0.05] border border-white/[0.1] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                >
                                  <option value="">None</option>
                                  <option value="active">Active</option>
                                  <option value="canceled">Canceled</option>
                                  <option value="past_due">Past Due</option>
                                  <option value="trialing">Trialing</option>
                                </select>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); saveUser(u.id); }}
                                disabled={saving === u.id}
                                className="bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded px-3 py-1.5 text-xs font-medium hover:bg-blue-600/30 transition-colors disabled:opacity-50"
                              >
                                {saving === u.id ? "Saving..." : "Save Changes"}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); saveUser(u.id, { resetUsage: true }); }}
                                disabled={saving === u.id}
                                className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded px-3 py-1.5 text-xs hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                              >
                                Reset Usage
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} className="p-10 text-center text-gray-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Prev</button>
          <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages || loading} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}

// ─── books tab ────────────────────────────────────────────────────────────────

function BooksTab() {
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page) });
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    if (genre) p.set("genre", genre);
    fetch(`/api/admin/books?${p}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page, search, status, genre]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const genres = data?.stats?.byGenre?.map((g: any) => g.genre).filter(Boolean) || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Books</h2>
        <span className="text-gray-500 text-sm">{data?.total?.toLocaleString() || 0} total</span>
      </div>

      {/* Stat chips */}
      {data?.stats && (
        <div className="flex flex-wrap gap-3">
          {(data.stats.byStatus || []).map((s: any) => (
            <div key={s.status} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm">
              <span className={`font-medium ${s.status === "complete" ? "text-green-400" : s.status === "generating" ? "text-amber-400" : "text-red-400"}`}>{s.count}</span>
              <span className="text-gray-500 ml-1">{s.status}</span>
            </div>
          ))}
          {(data.stats.bySize || []).map((s: any) => (
            <div key={s.size} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm">
              <span className="text-white font-medium">{s.count}</span>
              <span className="text-gray-500 ml-1 capitalize">{s.size}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search title..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 w-64"
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
          <option value="">All Statuses</option>
          <option value="complete">Complete</option>
          <option value="generating">Generating</option>
          <option value="failed">Failed</option>
        </select>
        {genres.length > 0 && (
          <select value={genre} onChange={(e) => { setGenre(e.target.value); setPage(1); }} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
            <option value="">All Genres</option>
            {genres.map((g: string) => <option key={g} value={g}>{g}</option>)}
          </select>
        )}
      </div>

      <Card>
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Title</th>
                  <th className="text-left p-3">Author</th>
                  <th className="text-left p-3">Genre</th>
                  <th className="text-left p-3">Size</th>
                  <th className="text-left p-3">Words</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {(data?.books || []).map((b: any) => (
                  <tr key={b.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-3 text-white max-w-[200px] truncate" title={b.title}>{b.title}</td>
                    <td className="p-3 text-gray-400 text-xs">
                      <div>{b.author}</div>
                      <div className="text-gray-600">{b.authorEmail}</div>
                    </td>
                    <td className="p-3 text-gray-400 text-xs">{b.genre || "—"}</td>
                    <td className="p-3 text-gray-400 text-xs capitalize">{b.bookLength || "—"}</td>
                    <td className="p-3 text-gray-400 text-xs">{b.wordCount?.toLocaleString() || "—"}</td>
                    <td className="p-3">
                      <span className={`text-xs font-medium ${b.status === "complete" ? "text-green-400" : b.status === "generating" ? "text-amber-400" : "text-red-400"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!data?.books || data.books.length === 0) && (
                  <tr><td colSpan={7} className="p-10 text-center text-gray-500">No books found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Prev</button>
          <span className="text-gray-500 text-sm">Page {page} of {data.totalPages}</span>
          <button onClick={() => setPage(Math.min(data.totalPages, page + 1))} disabled={page === data.totalPages || loading} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}

// ─── revenue tab ──────────────────────────────────────────────────────────────

function RevenueTab() {
  const [stats, setStats] = useState<any>(null);
  const [rev, setRev] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/revenue?page=1").then((r) => r.json()),
    ]).then(([s, r]) => { setStats(s); setRev(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadTxPage = (p: number) => {
    setTxLoading(true);
    fetch(`/api/admin/revenue?page=${p}`)
      .then((r) => r.json())
      .then((r) => { setRev(r); setTxPage(p); setTxLoading(false); })
      .catch(() => setTxLoading(false));
  };

  if (loading) return <Spinner />;

  const planPrices: Record<string, number> = { creator: 99, "author-pro": 199, studio: 349 };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Revenue</h2>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Total Revenue" value={fmt$(rev?.totalRevenue || 0)} color="text-green-400" />
        <KPI label="This Month" value={fmt$(rev?.monthlyRevenue || 0)} color="text-green-400" />
        <KPI label="Last Month" value={fmt$(rev?.lastMonthRevenue || 0)} />
        <KPI label="MRR (Subscriptions)" value={fmt$(stats?.mrr || 0)} color="text-purple-400" />
      </div>

      {/* Revenue by type */}
      {rev?.byType && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wider">Subscription Revenue</p>
            <p className="text-2xl font-bold text-white mt-1">{fmt$(rev.byType.subscription || 0)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wider">One-Time Purchases</p>
            <p className="text-2xl font-bold text-white mt-1">{fmt$(rev.byType.one_time || 0)}</p>
          </Card>
        </div>
      )}

      {/* MRR breakdown by plan */}
      {stats?.subscriptionBreakdown?.length > 0 && (
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Active Subscribers by Plan</h3>
          <div className="space-y-3">
            {stats.subscriptionBreakdown.map((s: any, i: number) => {
              const price = planPrices[s.plan] || 0;
              const planMrr = price * s.count;
              return (
                <div key={s.plan} className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-300 capitalize flex-1 font-medium">{s.plan}</span>
                  <span className="text-gray-400 text-sm">{s.count} subscribers</span>
                  <span className="text-gray-500 text-sm">×</span>
                  <span className="text-gray-400 text-sm">{fmt$(price)}/mo</span>
                  <span className="text-green-400 font-semibold text-sm w-24 text-right">{fmt$(planMrr)}/mo</span>
                </div>
              );
            })}
            <div className="pt-3 border-t border-white/[0.06] flex justify-between">
              <span className="text-gray-300 font-semibold">Total MRR</span>
              <span className="text-green-400 font-bold text-lg">{fmt$(stats.mrr)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Revenue chart */}
      {rev?.revenueChart && (
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Monthly Revenue — Last 12 Months</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rev.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [fmt$(v), "Revenue"]} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Transaction list */}
      {rev?.transactions && (
        <Card>
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-white font-semibold">Transactions</h3>
            <span className="text-gray-500 text-sm">{rev.totalTransactions} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-right p-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rev.transactions.map((t: any) => (
                  <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-3 text-gray-500 text-xs">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-3 text-gray-300 text-xs">{t.email}</td>
                    <td className="p-3 text-gray-400 text-xs max-w-[200px] truncate">{t.description}</td>
                    <td className="p-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${t.type === "subscription" ? "bg-purple-500/15 text-purple-400" : "bg-blue-500/15 text-blue-400"}`}>
                        {t.type === "subscription" ? "sub" : "one-time"}
                      </span>
                      {t.refunded && <span className="ml-1 text-xs text-red-400">refunded</span>}
                    </td>
                    <td className="p-3 text-right text-green-400 font-medium">{fmt$(t.amount)}</td>
                  </tr>
                ))}
                {rev.transactions.length === 0 && (
                  <tr><td colSpan={5} className="p-10 text-center text-gray-500">No transactions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {rev.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-white/[0.06]">
              <button onClick={() => loadTxPage(Math.max(1, txPage - 1))} disabled={txPage === 1 || txLoading} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Prev</button>
              <span className="text-gray-500 text-sm">Page {txPage} of {rev.totalPages}</span>
              <button onClick={() => loadTxPage(Math.min(rev.totalPages, txPage + 1))} disabled={txPage === rev.totalPages || txLoading} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Next</button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── insights tab ─────────────────────────────────────────────────────────────

function InsightsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/insights")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <ErrMsg />;

  const topGenres = (data.byGenre || []).slice(0, 10);
  const topTopics = (data.topTopics || []).slice(0, 35);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Usage Insights</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Total Books" value={(data.totalBooks || 0).toLocaleString()} />
        <KPI label="Total Users" value={(data.totalUsers || 0).toLocaleString()} />
        <KPI label="Avg Books / User" value={String(data.avgBooksPerUser || "0")} />
        <KPI label="Top Genre" value={data.byGenre?.[0]?.genre || "N/A"} color="text-purple-400" />
      </div>

      {/* Genre bar + pie */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Genres Most Requested</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topGenres} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="genre" tick={{ fill: "#d1d5db", fontSize: 11 }} width={110} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {topGenres.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Genre Share</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={230}>
              <PieChart>
                <Pie data={topGenres} dataKey="count" nameKey="genre" cx="50%" cy="50%" outerRadius={95} strokeWidth={0}>
                  {topGenres.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5 text-xs">
              {topGenres.slice(0, 8).map((g: any, i: number) => (
                <div key={g.genre} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-300 truncate flex-1">{g.genre}</span>
                  <span className="text-gray-500">{g.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Full genre table */}
      <Card>
        <div className="p-4 border-b border-white/[0.06]">
          <h3 className="text-white font-semibold">All Genres</h3>
          <p className="text-gray-500 text-xs mt-0.5">All time vs last 30 days</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left p-3">Genre</th>
                <th className="text-right p-3">All Time</th>
                <th className="text-right p-3">Last 30 Days</th>
                <th className="text-right p-3">Share</th>
              </tr>
            </thead>
            <tbody>
              {(data.byGenre || []).map((g: any) => (
                <tr key={g.genre} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="p-3 text-white">{g.genre}</td>
                  <td className="p-3 text-right text-gray-300">{g.count}</td>
                  <td className="p-3 text-right text-blue-400">{g.recent}</td>
                  <td className="p-3 text-right text-gray-500">
                    {data.totalBooks > 0 ? ((g.count / data.totalBooks) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Weekly trend */}
      {data.weeklyTrend?.length > 0 && (
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Weekly Generation Volume — Last 12 Weeks</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Topic word cloud */}
      <Card className="p-5">
        <h3 className="text-white font-semibold mb-1">Top Topics from Book Descriptions</h3>
        <p className="text-gray-500 text-xs mb-4">Most common keywords across all book descriptions</p>
        <div className="flex flex-wrap gap-2 leading-relaxed">
          {topTopics.map((t: any, i: number) => {
            const maxCount = topTopics[0]?.count || 1;
            const size = 0.72 + (t.count / maxCount) * 0.85;
            return (
              <span key={t.word} style={{ fontSize: `${size}rem`, color: COLORS[i % COLORS.length] }} className="font-medium">
                {t.word}<span className="text-gray-600 text-xs ml-0.5">×{t.count}</span>
              </span>
            );
          })}
        </div>
      </Card>

      {/* Breakdowns row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-3">Writing Tones</h3>
          <div className="space-y-2">
            {(data.byTone || []).slice(0, 8).map((t: any, i: number) => (
              <div key={t.tone} className="flex items-center gap-2 text-sm">
                <span className="text-gray-300 capitalize flex-1">{t.tone}</span>
                <div className="w-24 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(t.count / (data.byTone[0]?.count || 1)) * 100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <span className="text-gray-500 text-xs w-5 text-right">{t.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-3">Book Lengths</h3>
          <div className="space-y-2">
            {(data.byLength || []).map((l: any, i: number) => (
              <div key={l.length} className="flex items-center gap-2 text-sm">
                <span className="text-gray-300 capitalize flex-1">{l.length}</span>
                <div className="w-24 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(l.count / (data.byLength[0]?.count || 1)) * 100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <span className="text-gray-500 text-xs w-5 text-right">{l.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-3">Languages</h3>
          <div className="space-y-2">
            {(data.byLanguage || []).slice(0, 8).map((l: any, i: number) => (
              <div key={l.language} className="flex items-center gap-2 text-sm">
                <span className="text-gray-300 capitalize flex-1">{l.language}</span>
                <div className="w-24 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(l.count / (data.byLanguage[0]?.count || 1)) * 100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <span className="text-gray-500 text-xs w-5 text-right">{l.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const tooltipStyle = {
  background: "#13131f",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
};

function Spinner() {
  return <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>;
}

function ErrMsg({ msg }: { msg?: string }) {
  return <div className="p-6 text-red-400 text-sm">Failed to load data{msg ? `: ${msg}` : "."}</div>;
}

// ─── root page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
              tab === t
                ? "text-white border-blue-500 bg-blue-500/10"
                : "text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/[0.03]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "Overview" && <OverviewTab />}
      {tab === "Users" && <UsersTab />}
      {tab === "Books" && <BooksTab />}
      {tab === "Revenue" && <RevenueTab />}
      {tab === "Insights" && <InsightsTab />}
    </div>
  );
}
