'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const monthlyTrend = [
  { month: 'Jul', alerts: 42, savings: 180000 }, { month: 'Aug', alerts: 56, savings: 245000 },
  { month: 'Sep', alerts: 38, savings: 167000 }, { month: 'Oct', alerts: 71, savings: 312000 },
  { month: 'Nov', alerts: 63, savings: 289000 }, { month: 'Dec', alerts: 84, savings: 378000 },
  { month: 'Jan', alerts: 91, savings: 412000 }, { month: 'Feb', alerts: 78, savings: 356000 },
  { month: 'Mar', alerts: 67, savings: 298000 },
];

const riskDistribution = [
  { name: 'Critical', value: 23, color: '#DC2626' },
  { name: 'High', value: 45, color: '#F97316' },
  { name: 'Medium', value: 89, color: '#EAB308' },
  { name: 'Low', value: 134, color: '#22C55E' },
];

const alertsByType = [
  { type: 'Upcoding', count: 87 }, { type: 'Unbundling', count: 64 },
  { type: 'Duplicate Billing', count: 53 }, { type: 'Phantom Billing', count: 31 },
  { type: 'Kickback Patterns', count: 18 }, { type: 'Other', count: 38 },
];

const recentFlags = [
  { id: 'FA-2026-0891', provider: 'Miami Primary Care Associates', type: 'Upcoding', severity: 'Critical', amount: '$34,200', date: '2026-03-10' },
  { id: 'FA-2026-0890', provider: 'South Florida Specialists', type: 'Unbundling', severity: 'High', amount: '$18,750', date: '2026-03-10' },
  { id: 'FA-2026-0889', provider: 'Coral Gables Medical Group', type: 'Duplicate Billing', severity: 'High', amount: '$12,400', date: '2026-03-09' },
  { id: 'FA-2026-0888', provider: 'Aventura Health Center', type: 'Phantom Billing', severity: 'Critical', amount: '$67,800', date: '2026-03-09' },
  { id: 'FA-2026-0887', provider: 'Dade County Internal Medicine', type: 'Kickback Patterns', severity: 'Medium', amount: '$8,300', date: '2026-03-08' },
  { id: 'FA-2026-0886', provider: 'Biscayne Medical Group', type: 'Upcoding', severity: 'Low', amount: '$4,100', date: '2026-03-08' },
];

const sevColor: Record<string, string> = { Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Medium: 'bg-yellow-100 text-yellow-700', Low: 'bg-green-100 text-green-700' };

export default function FraudIQDashboard() {
  const [period, setPeriod] = useState('ytd');
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">FraudIQ Dashboard</h1>
            <p className="text-sm text-[#86868b]">Fraud, Waste & Abuse Detection</p>
          </div>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="ytd">Year to Date</option>
            <option value="q1">Q1 2026</option>
            <option value="q4">Q4 2025</option>
          </select>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Alerts', value: '291', sub: '+12% vs last quarter', color: '#DC2626' },
            { label: 'Total Savings', value: '$2.64M', sub: 'From detected fraud', color: '#059669' },
            { label: 'Open Investigations', value: '34', sub: '8 critical', color: '#F97316' },
            { label: 'Recovery Rate', value: '73.2%', sub: 'Of confirmed fraud', color: '#0891B2' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-xs text-[#86868b] mt-1">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 col-span-2">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Monthly Alert Trend & Savings</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `$${v/1000}K`} />
                <Tooltip formatter={(v: number, name: string) => name === 'savings' ? `$${(v/1000).toFixed(0)}K` : v} />
                <Line yAxisId="left" type="monotone" dataKey="alerts" stroke="#DC2626" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="savings" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Risk Score Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {riskDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Alerts by Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={alertsByType} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#DC2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 col-span-2">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Recent Flags</h3>
            <table className="w-full">
              <thead><tr className="text-left text-[10px] font-semibold text-[#86868b] uppercase">
                <th className="pb-2 pr-2">ID</th><th className="pb-2 pr-2">Provider</th><th className="pb-2 pr-2">Type</th><th className="pb-2 pr-2">Severity</th><th className="pb-2 pr-2">Est. Overpayment</th><th className="pb-2">Date</th>
              </tr></thead>
              <tbody>
                {recentFlags.map((f, i) => (
                  <tr key={i} className="border-t border-gray-50 text-xs">
                    <td className="py-2 pr-2 font-mono text-[#DC2626]">{f.id}</td>
                    <td className="py-2 pr-2 text-[#1d1d1f]">{f.provider}</td>
                    <td className="py-2 pr-2 text-[#6e6e73]">{f.type}</td>
                    <td className="py-2 pr-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sevColor[f.severity]}`}>{f.severity}</span></td>
                    <td className="py-2 pr-2 font-semibold text-[#1d1d1f]">{f.amount}</td>
                    <td className="py-2 text-[#86868b]">{f.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
