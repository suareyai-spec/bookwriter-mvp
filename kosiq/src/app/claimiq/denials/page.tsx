'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const denialReasons = [
  { code: 'CO-4', desc: 'Procedure code inconsistent with modifier', count: 67, amount: 134000 },
  { code: 'CO-16', desc: 'Claim lacks information or has submission errors', count: 54, amount: 98000 },
  { code: 'CO-97', desc: 'Payment adjusted—already adjudicated', count: 43, amount: 76000 },
  { code: 'PR-1', desc: 'Deductible amount', count: 38, amount: 45000 },
  { code: 'CO-45', desc: 'Charges exceed fee schedule/maximum allowable', count: 31, amount: 89000 },
  { code: 'CO-50', desc: 'Non-covered services', count: 28, amount: 67000 },
  { code: 'CO-18', desc: 'Duplicate claim/service', count: 24, amount: 43000 },
  { code: 'CO-29', desc: 'Timely filing limit exceeded', count: 19, amount: 38000 },
];

const denialsByPayer = [
  { payer: 'Simply Health', rate: 6.2, count: 89 },
  { payer: 'Sunshine Health', rate: 7.8, count: 76 },
  { payer: 'Humana', rate: 5.4, count: 34 },
  { payer: 'Florida Blue', rate: 8.1, count: 42 },
  { payer: 'WellCare', rate: 9.2, count: 28 },
];

const reworkQueue = Array.from({ length: 40 }, (_, i) => ({
  claimId: `CLM-2026-${String(20000 + i).slice(1)}`,
  patient: ['Maria Santos', 'Robert Chen', 'James Williams', 'Patricia Brown', 'John Garcia', 'Jennifer Miller'][i % 6],
  payer: ['Simply Health', 'Sunshine Health', 'Humana', 'Florida Blue', 'WellCare'][i % 5],
  denialCode: denialReasons[i % denialReasons.length].code,
  denialDesc: denialReasons[i % denialReasons.length].desc,
  amount: Math.round(200 + Math.random() * 3000),
  deniedDate: `2026-${String(1 + (i % 3)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
  status: ['Pending Rework', 'In Rework', 'Ready for Appeal', 'Resubmitted'][i % 4],
}));

const statusColor: Record<string, string> = { 'Pending Rework': 'bg-red-100 text-red-700', 'In Rework': 'bg-yellow-100 text-yellow-700', 'Ready for Appeal': 'bg-purple-100 text-purple-700', 'Resubmitted': 'bg-green-100 text-green-700' };

export default function DenialsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterPayer, setFilterPayer] = useState('');

  const filtered = useMemo(() => reworkQueue.filter(r =>
    (!search || r.claimId.toLowerCase().includes(search.toLowerCase()) || r.patient.toLowerCase().includes(search.toLowerCase())) &&
    (!filterPayer || r.payer === filterPayer)
  ), [search, filterPayer]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Denial Management</h1>
        <p className="text-sm text-[#86868b] mb-6">Denial reasons, rework queue & analysis</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Top Denial Reasons</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={denialReasons} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="code" type="category" tick={{ fontSize: 10 }} width={50} />
                <Tooltip formatter={(v: number, name: string) => name === 'amount' ? `$${v.toLocaleString()}` : v} />
                <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Denial Rate by Payer</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={denialsByPayer}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="payer" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="rate" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <input placeholder="Search claims, patients..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-72" />
          <select value={filterPayer} onChange={e => setFilterPayer(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Payers</option>
            {['Simply Health', 'Sunshine Health', 'Humana', 'Florida Blue', 'WellCare'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-sm font-semibold text-[#1d1d1f] px-4 py-3 border-b border-gray-100">Rework Queue</h3>
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Claim</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Patient</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Payer</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Denial Code</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Amount</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Status</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Action</th>
            </tr></thead>
            <tbody>
              {filtered.slice(0, 30).map((r, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 text-xs">
                  <td className="px-3 py-3 font-mono text-[#7C3AED]">{r.claimId}</td>
                  <td className="px-3 py-3 text-[#1d1d1f]">{r.patient}</td>
                  <td className="px-3 py-3 text-[#6e6e73]">{r.payer}</td>
                  <td className="px-3 py-3"><span className="font-mono text-[#DC2626]">{r.denialCode}</span> <span className="text-[#86868b]">— {r.denialDesc}</span></td>
                  <td className="px-3 py-3 font-semibold text-[#1d1d1f]">${r.amount.toLocaleString()}</td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[r.status]}`}>{r.status}</span></td>
                  <td className="px-3 py-3">
                    <button onClick={() => showToast('Appeal template generated')} className="text-[#7C3AED] hover:underline">Appeal</button>
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
