"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const PIE_COLORS = ["#f43f5e", "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#06b6d4", "#ec4899"];

export default function AdminRevenue() {
  const [data, setData] = useState<any>(null);
  const [costData, setCostData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/revenue?page=${page}`).then(r => r.json()),
      fetch("/api/admin/costs").then(r => r.json()),
    ]).then(([rev, costs]) => {
      setData(rev);
      setCostData(costs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading revenue data...</div>;
  if (!data || data.error) return <div className="text-red-400">Failed to load: {data?.error}</div>;

  const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtShort = (n: number) => n < 0.01 && n > 0 ? "<$0.01" : fmt(n);

  // Profitability calculations
  const totalApiCost = costData?.totalCost || 0;
  const monthlyApiCost = costData?.monthlyCost || 0;
  const netProfit = data.totalRevenue - totalApiCost;
  const profitMargin = data.totalRevenue > 0 ? (netProfit / data.totalRevenue) * 100 : 0;
  const marginColor = profitMargin > 50 ? "text-green-400" : profitMargin > 20 ? "text-yellow-400" : "text-red-400";

  // Dual chart: revenue vs cost by month
  const dualChart = (data.revenueChart || []).map((r: any) => {
    const costMonth = (costData?.byMonth || []).find((c: any) => c.month === r.month);
    return { month: r.month, revenue: r.revenue, cost: costMonth?.cost || 0, profit: r.revenue - (costMonth?.cost || 0) };
  });

  // Profit margin trend
  const marginTrend = dualChart.map((d: any) => ({
    month: d.month,
    margin: d.revenue > 0 ? ((d.revenue - d.cost) / d.revenue) * 100 : 0,
  }));

  // Pie chart data for cost by type
  const pieData = costData?.byType
    ? Object.entries(costData.byType)
        .filter(([, v]) => (v as number) > 0)
        .map(([k, v]) => ({ name: k, value: Math.round((v as number) * 100) / 100 }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Revenue</h1>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase">All Time Revenue</p>
          <p className="text-2xl font-bold text-green-400">{fmt(data.totalRevenue)}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase">This Month</p>
          <p className="text-2xl font-bold text-green-400">{fmt(data.monthlyRevenue)}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase">Last Month</p>
          <p className="text-2xl font-bold text-gray-300">{fmt(data.lastMonthRevenue)}</p>
        </div>
      </div>

      {/* API Costs & Profitability KPIs */}
      <h2 className="text-lg font-semibold text-white mt-8">API Costs & Profitability</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-red-500/20 rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase">Total API Cost</p>
          <p className="text-2xl font-bold text-red-400">{fmt(totalApiCost)}</p>
        </div>
        <div className="bg-white/[0.03] border border-red-500/20 rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase">API Cost This Month</p>
          <p className="text-2xl font-bold text-red-400">{fmt(monthlyApiCost)}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>{fmt(netProfit)}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase">Profit Margin</p>
          <p className={`text-2xl font-bold ${marginColor}`}>{profitMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Revenue by type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase">Subscription Revenue</p>
          <p className="text-xl font-bold text-purple-400">{fmt(data.byType?.subscription || 0)}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase">One-Time Purchases</p>
          <p className="text-xl font-bold text-blue-400">{fmt(data.byType?.one_time || 0)}</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* API Cost by Type Pie */}
        {pieData.length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">API Cost by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label={({ name, value }) => `${name}: $${value.toFixed(2)}`}>
                  {pieData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} formatter={(v: any) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Profit Margin Trend */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Profit Margin Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={marginTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
              <Line type="monotone" dataKey="margin" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Revenue vs API Cost */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Monthly Revenue vs API Cost (Last 12 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dualChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#fff" }} formatter={(v: any) => fmt(v)} />
            <Legend />
            <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="Revenue" />
            <Bar dataKey="cost" fill="#f43f5e" radius={[4, 4, 0, 0]} name="API Cost" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost by Type Table */}
      {costData?.costByTypeDetail && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h3 className="text-white font-semibold">Cost by Type Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Type</th>
                  <th className="text-right p-3">Calls</th>
                  <th className="text-right p-3">Total Tokens</th>
                  <th className="text-right p-3">Total Cost</th>
                  <th className="text-right p-3">Avg/Call</th>
                </tr>
              </thead>
              <tbody>
                {costData.costByTypeDetail.filter((r: any) => r.calls > 0).map((r: any) => (
                  <tr key={r.type} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-3 text-gray-300 capitalize">{r.type}</td>
                    <td className="p-3 text-gray-400 text-right">{r.calls.toLocaleString()}</td>
                    <td className="p-3 text-gray-400 text-right">{r.totalTokens.toLocaleString()}</td>
                    <td className="p-3 text-red-400 text-right font-medium">{fmt(r.totalCost)}</td>
                    <td className="p-3 text-gray-400 text-right">{fmtShort(r.avgCostPerCall)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top 10 Most Expensive Users */}
      {costData?.byUser?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h3 className="text-white font-semibold">Top 10 Most Expensive Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-right p-3">Generations</th>
                  <th className="text-right p-3">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {costData.byUser.map((u: any) => (
                  <tr key={u.email} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-3 text-gray-300">{u.email}</td>
                    <td className="p-3 text-gray-400 capitalize">{u.plan || "None"}</td>
                    <td className="p-3 text-gray-400 text-right">{u.generations}</td>
                    <td className="p-3 text-red-400 text-right font-medium">{fmt(u.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent API Calls */}
      {costData?.recentCosts?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h3 className="text-white font-semibold">Recent API Calls</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-right p-3">Input</th>
                  <th className="text-right p-3">Output</th>
                  <th className="text-right p-3">Cost</th>
                </tr>
              </thead>
              <tbody>
                {costData.recentCosts.map((c: any, i: number) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-3 text-gray-400 text-xs">{new Date(c.date).toLocaleString()}</td>
                    <td className="p-3 text-gray-300">{c.user}</td>
                    <td className="p-3 text-gray-400 capitalize">{c.type}</td>
                    <td className="p-3 text-gray-400 text-right">{c.inputTokens.toLocaleString()}</td>
                    <td className="p-3 text-gray-400 text-right">{c.outputTokens.toLocaleString()}</td>
                    <td className="p-3 text-red-400 text-right font-medium">{fmtShort(c.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Monthly Revenue (Last 12 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.revenueChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#fff" }} />
            <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <h3 className="text-white font-semibold">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data.transactions || []).map((tx: any) => (
                <tr key={tx.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="p-3 text-gray-400 text-xs">{new Date(tx.date).toLocaleString()}</td>
                  <td className="p-3 text-gray-300">{tx.email}</td>
                  <td className="p-3 text-green-400 font-medium">{fmt(tx.amount)}</td>
                  <td className="p-3 text-gray-400">{tx.type === "subscription" ? "Subscription" : "One-time"}</td>
                  <td className="p-3">
                    <span className={`text-xs ${tx.refunded ? "text-red-400" : "text-green-400"}`}>
                      {tx.refunded ? "Refunded" : tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Prev</button>
          <span className="text-gray-500 text-sm">Page {page} of {data.totalPages}</span>
          <button onClick={() => setPage(Math.min(data.totalPages, page + 1))} disabled={page === data.totalPages} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}
