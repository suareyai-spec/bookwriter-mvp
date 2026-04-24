'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const quarterlyData = [
  { quarter: 'Q1 2025', alerts: 156, confirmed: 89, recovered: 412000, savings: 890000 },
  { quarter: 'Q2 2025', alerts: 178, confirmed: 102, recovered: 534000, savings: 1120000 },
  { quarter: 'Q3 2025', alerts: 201, confirmed: 118, recovered: 623000, savings: 1340000 },
  { quarter: 'Q4 2025', alerts: 234, confirmed: 141, recovered: 756000, savings: 1580000 },
  { quarter: 'Q1 2026', alerts: 212, confirmed: 128, recovered: 689000, savings: 1450000 },
];

const reports = [
  { id: 'RPT-001', title: 'Q1 2026 FWA Summary', type: 'Quarterly Summary', date: '2026-03-01', status: 'Final' },
  { id: 'RPT-002', title: 'Provider Outlier Analysis - February 2026', type: 'Provider Analysis', date: '2026-02-28', status: 'Final' },
  { id: 'RPT-003', title: 'Upcoding Detection Report', type: 'Anomaly Report', date: '2026-02-15', status: 'Final' },
  { id: 'RPT-004', title: 'Recovery Tracking Q4 2025', type: 'Recovery Report', date: '2026-01-15', status: 'Final' },
  { id: 'RPT-005', title: 'Annual FWA Compliance Review 2025', type: 'Compliance Report', date: '2026-01-05', status: 'Final' },
  { id: 'RPT-006', title: 'SIU Referral Summary', type: 'Investigation Report', date: '2025-12-31', status: 'Final' },
  { id: 'RPT-007', title: 'Billing Pattern Benchmark Report', type: 'Benchmark Report', date: '2025-12-15', status: 'Final' },
  { id: 'RPT-008', title: 'Q3 2025 FWA Summary', type: 'Quarterly Summary', date: '2025-10-01', status: 'Final' },
];

const recoveryByType = [
  { type: 'Upcoding', amount: 890000 }, { type: 'Unbundling', amount: 567000 },
  { type: 'Duplicate Billing', amount: 423000 }, { type: 'Phantom Billing', amount: 312000 },
  { type: 'Kickback', amount: 178000 }, { type: 'Other', amount: 94000 },
];

export default function FraudReportsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');

  const filtered = reports.filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">FWA Reports</h1>
            <p className="text-sm text-[#86868b]">Compliance reports, quarterly summaries & recovery tracking</p>
          </div>
          <button onClick={() => showToast('Report generation started')} className="px-4 py-2 bg-[#DC2626] text-white text-sm rounded-lg hover:bg-red-700">Generate Report</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Quarterly Alert & Recovery Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="alerts" fill="#DC2626" name="Total Alerts" radius={[4, 4, 0, 0]} />
                <Bar dataKey="confirmed" fill="#F97316" name="Confirmed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Recovery by Fraud Type</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recoveryByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v/1000}K`} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-72" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Report ID</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Title</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Type</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Date</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Status</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 text-xs">
                  <td className="px-4 py-3 font-mono text-[#DC2626]">{r.id}</td>
                  <td className="px-4 py-3 text-[#1d1d1f] font-medium">{r.title}</td>
                  <td className="px-4 py-3 text-[#6e6e73]">{r.type}</td>
                  <td className="px-4 py-3 text-[#86868b]">{r.date}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">{r.status}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => showToast('Report exported')} className="text-[#DC2626] hover:underline mr-3">Export PDF</button>
                    <button onClick={() => showToast('Report exported')} className="text-[#0071e3] hover:underline">Export CSV</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
