"use client";

import { useEffect, useState } from "react";

interface GenerationsData {
  totalUsers: number;
  signups: { today: number; week: number; month: number };
  generationsByType: { type: string; count: number }[];
  subscriptionBreakdown: { plan: string; count: number }[];
  revenueEstimate: number;
  recentFailedGenerations: { id: string; title: string; contentType: string; reason: string | null; createdAt: string; userEmail: string | null }[];
  creditUsage: { totalCreditsSpentThisMonth: number; activeUsersThisMonth: number; avgCreditsPerActiveUser: number };
  users: { id: string; email: string; plan: string; creditsRemaining: number; totalGenerations: number; joinedDate: string }[];
}

export default function AdminGenerationsPage() {
  const [data, setData] = useState<GenerationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/generations")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Generations &amp; Credits</h1>
        <div className="p-8 text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Generations &amp; Credits</h1>

      {/* Top-line cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Total Users" value={data.totalUsers.toLocaleString()} />
        <Card label="Signups Today" value={data.signups.today.toLocaleString()} />
        <Card label="Signups This Week" value={data.signups.week.toLocaleString()} />
        <Card label="Signups This Month" value={data.signups.month.toLocaleString()} />
        <Card label="Est. Monthly Revenue" value={`$${data.revenueEstimate.toLocaleString()}`} />
        <Card label="Credits Spent This Month" value={data.creditUsage.totalCreditsSpentThisMonth.toLocaleString()} />
        <Card label="Active Users This Month" value={data.creditUsage.activeUsersThisMonth.toLocaleString()} />
        <Card label="Avg Credits / Active User" value={data.creditUsage.avgCreditsPerActiveUser.toLocaleString()} />
      </div>

      {/* Generations by type + Subscription breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h2 className="text-white font-semibold">Generations by Type</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left p-3">Type</th>
                <th className="text-right p-3">Count</th>
              </tr>
            </thead>
            <tbody>
              {data.generationsByType.map((g) => (
                <tr key={g.type} className="border-b border-white/[0.04]">
                  <td className="p-3 text-white capitalize">{g.type}</td>
                  <td className="p-3 text-right text-gray-300">{g.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h2 className="text-white font-semibold">Active Subscriptions</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left p-3">Plan</th>
                <th className="text-right p-3">Subscribers</th>
              </tr>
            </thead>
            <tbody>
              {data.subscriptionBreakdown.map((s) => (
                <tr key={s.plan} className="border-b border-white/[0.04]">
                  <td className="p-3 text-white capitalize">{s.plan}</td>
                  <td className="p-3 text-right text-gray-300">{s.count.toLocaleString()}</td>
                </tr>
              ))}
              {data.subscriptionBreakdown.length === 0 && (
                <tr><td colSpan={2} className="p-3 text-gray-500 text-center">No active subscriptions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent failed generations */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">Recent Failed Generations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.recentFailedGenerations.map((f) => (
                <tr key={f.id} className="border-b border-white/[0.04]">
                  <td className="p-3 text-gray-400 whitespace-nowrap">{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-gray-300">{f.userEmail || "—"}</td>
                  <td className="p-3 text-white truncate max-w-[200px]">{f.title}</td>
                  <td className="p-3 text-gray-400 capitalize">{f.contentType}</td>
                  <td className="p-3 text-red-400/80 truncate max-w-[320px]">{f.reason || "—"}</td>
                </tr>
              ))}
              {data.recentFailedGenerations.length === 0 && (
                <tr><td colSpan={5} className="p-3 text-gray-500 text-center">No failed generations recently</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">Users</h2>
          <p className="text-gray-500 text-xs mt-0.5">Most recent 200 signups</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-right p-3">Credits Remaining</th>
                <th className="text-right p-3">Total Generations</th>
                <th className="text-right p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.04]">
                  <td className="p-3 text-white">{u.email}</td>
                  <td className="p-3 text-gray-300 capitalize">{u.plan}</td>
                  <td className="p-3 text-right text-gray-300">{u.creditsRemaining.toLocaleString()}</td>
                  <td className="p-3 text-right text-gray-300">{u.totalGenerations.toLocaleString()}</td>
                  <td className="p-3 text-right text-gray-500">{new Date(u.joinedDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
      <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
