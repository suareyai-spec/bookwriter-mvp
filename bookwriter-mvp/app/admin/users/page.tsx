"use client";

import { useEffect, useState, useCallback } from "react";

interface User {
  id: string; name: string | null; email: string;
  subscriptionPlan: string | null; subscriptionStatus: string | null;
  booksCount: number; createdAt: string; monthlyBooksUsed: number;
  revisionCount: number; monthlyNewslettersUsed: number;
  stripeCustomerId: string | null; subscriptionId: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (planFilter) params.set("plan", planFilter);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search, planFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateUser = async (userId: string, data: any) => {
    setActionLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...data }),
    });
    setActionLoading(false);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <span className="text-gray-500 text-sm">{total} total</span>
      </div>

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
          <option value="none">No Plan</option>
          <option value="creator">Creator</option>
          <option value="author-pro">Author Pro</option>
          <option value="studio">Studio</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="canceled">Canceled</option>
          <option value="none">No Plan</option>
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
                  <th className="text-left p-3">Books</th>
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
                      <td className="p-3 text-white">{u.name || "-"}</td>
                      <td className="p-3 text-gray-300">{u.email}</td>
                      <td className="p-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          u.subscriptionPlan === "studio" ? "bg-purple-500/20 text-purple-400" :
                          u.subscriptionPlan === "author-pro" ? "bg-blue-500/20 text-blue-400" :
                          u.subscriptionPlan === "creator" ? "bg-green-500/20 text-green-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {u.subscriptionPlan || "No Plan"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs ${u.subscriptionStatus === "active" ? "text-green-400" : "text-gray-500"}`}>
                          {u.subscriptionStatus || "none"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300">{u.booksCount}</td>
                      <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                    {expanded === u.id && (
                      <tr key={`${u.id}-detail`}>
                        <td colSpan={6} className="p-4 bg-white/[0.01]">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                            <div><span className="text-gray-500">Monthly Books Used:</span> <span className="text-white ml-1">{u.monthlyBooksUsed}</span></div>
                            <div><span className="text-gray-500">Revisions:</span> <span className="text-white ml-1">{u.revisionCount}</span></div>
                            <div><span className="text-gray-500">Newsletters:</span> <span className="text-white ml-1">{u.monthlyNewslettersUsed}</span></div>
                            <div><span className="text-gray-500">Stripe ID:</span> <span className="text-white ml-1 text-xs">{u.stripeCustomerId || "None"}</span></div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <select
                              defaultValue={u.subscriptionPlan || ""}
                              onChange={(e) => updateUser(u.id, { subscriptionPlan: e.target.value || null, subscriptionStatus: e.target.value ? "active" : null })}
                              disabled={actionLoading}
                              className="bg-white/[0.05] border border-white/[0.1] rounded px-2 py-1 text-xs text-white"
                            >
                              <option value="">Free</option>
                              <option value="creator">Creator</option>
                              <option value="author-pro">Author Pro</option>
                              <option value="studio">Studio</option>
                            </select>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateUser(u.id, { resetUsage: true }); }}
                              disabled={actionLoading}
                              className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded px-3 py-1 text-xs hover:bg-amber-500/20 transition-colors"
                            >
                              Reset Usage
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">No users found</td></tr>
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
