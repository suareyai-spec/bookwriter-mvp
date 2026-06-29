"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff", "#3b82f6", "#60a5fa", "#93c5fd", "#06b6d4"];

export default function AdminInsights() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/insights")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Usage Insights</h1>
        <div className="p-8 text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  const topGenres = (data.byGenre || []).slice(0, 10);
  const topTopics = (data.topTopics || []).slice(0, 30);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Usage Insights</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Total Books</p>
          <p className="text-2xl font-bold text-white mt-1">{data.totalBooks}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-bold text-white mt-1">{data.totalUsers}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Avg Books / User</p>
          <p className="text-2xl font-bold text-white mt-1">{data.avgBooksPerUser}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Top Genre</p>
          <p className="text-lg font-bold text-purple-400 mt-1 truncate">{data.byGenre?.[0]?.genre || "N/A"}</p>
        </div>
      </div>

      {/* Genre breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Genres Most Requested</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topGenres} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="genre" tick={{ fill: "#d1d5db", fontSize: 11 }} width={110} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff" }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {topGenres.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Genre Share</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={240}>
              <PieChart>
                <Pie
                  data={topGenres}
                  dataKey="count"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  strokeWidth={0}
                >
                  {topGenres.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff" }}
                />
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
        </div>
      </div>

      {/* Genre table with recent trend */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">All Genres — Activity Breakdown</h2>
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
      </div>

      {/* Weekly generation trend */}
      {data.weeklyTrend?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Weekly Generation Volume (Last 12 Weeks)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.weeklyTrend} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff" }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Topics cloud */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-2">Top Topics from Book Descriptions</h2>
        <p className="text-gray-500 text-xs mb-4">Most common keywords extracted from what users describe in their books</p>
        <div className="flex flex-wrap gap-2">
          {topTopics.map((t: any, i: number) => {
            const maxCount = topTopics[0]?.count || 1;
            const size = 0.7 + (t.count / maxCount) * 0.8;
            return (
              <span
                key={t.word}
                style={{ fontSize: `${size}rem`, color: COLORS[i % COLORS.length] }}
                className="font-medium opacity-90 hover:opacity-100 transition-opacity"
              >
                {t.word}
                <span className="text-gray-600 text-xs ml-0.5">×{t.count}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Additional breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tone */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Writing Tones</h2>
          <div className="space-y-2">
            {(data.byTone || []).slice(0, 8).map((t: any, i: number) => (
              <div key={t.tone} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 capitalize">{t.tone}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(t.count / (data.byTone[0]?.count || 1)) * 100}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-gray-500 text-xs w-6 text-right">{t.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Book length */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Book Lengths</h2>
          <div className="space-y-2">
            {(data.byLength || []).map((l: any, i: number) => (
              <div key={l.length} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 capitalize">{l.length}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(l.count / (data.byLength[0]?.count || 1)) * 100}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-gray-500 text-xs w-6 text-right">{l.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Languages</h2>
          <div className="space-y-2">
            {(data.byLanguage || []).slice(0, 8).map((l: any, i: number) => (
              <div key={l.language} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 capitalize">{l.language}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(l.count / (data.byLanguage[0]?.count || 1)) * 100}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-gray-500 text-xs w-6 text-right">{l.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content types */}
      {data.byContentType?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Content Types Generated</h2>
          <div className="flex flex-wrap gap-3">
            {(data.byContentType || []).map((ct: any, i: number) => (
              <div key={ct.type} className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-gray-300 text-sm capitalize">{ct.type.replace(/-/g, " ")}</span>
                <span className="text-gray-500 text-sm font-medium">{ct.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
