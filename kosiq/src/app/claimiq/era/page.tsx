'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState, useMemo } from 'react';

const eraRecords = Array.from({ length: 60 }, (_, i) => ({
  eraId: `ERA-2026-${String(3000 + i).padStart(4, '0')}`,
  payer: ['Simply Health', 'Sunshine Health', 'Humana', 'Florida Blue', 'WellCare'][i % 5],
  checkNumber: `CHK-${String(800000 + i * 137)}`,
  checkDate: `2026-${String(1 + (i % 3)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
  totalPaid: Math.round(5000 + Math.random() * 50000),
  claimsCount: Math.round(5 + Math.random() * 30),
  matched: Math.round(3 + Math.random() * 25),
  unmatched: Math.round(0 + Math.random() * 5),
  variance: Math.round(-500 + Math.random() * 1000),
  status: ['Auto-Posted', 'Partially Posted', 'Pending Review', 'Posted with Variances'][i % 4],
}));

const statusColor: Record<string, string> = { 'Auto-Posted': 'bg-green-100 text-green-700', 'Partially Posted': 'bg-yellow-100 text-yellow-700', 'Pending Review': 'bg-blue-100 text-blue-700', 'Posted with Variances': 'bg-orange-100 text-orange-700' };

export default function ERAPostingPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterPayer, setFilterPayer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = useMemo(() => eraRecords.filter(e =>
    (!search || e.eraId.toLowerCase().includes(search.toLowerCase()) || e.checkNumber.toLowerCase().includes(search.toLowerCase())) &&
    (!filterPayer || e.payer === filterPayer) &&
    (!filterStatus || e.status === filterStatus)
  ), [search, filterPayer, filterStatus]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-semibold text-[#1d1d1f]">ERA Posting</h1><p className="text-sm text-[#86868b]">Electronic remittance advice posting & reconciliation</p></div>
          <button onClick={() => showToast('Batch posting started')} className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-purple-700">Batch Post All</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total ERAs', value: eraRecords.length, color: '#7C3AED' },
            { label: 'Auto-Match Rate', value: '91.4%', color: '#22C55E' },
            { label: 'Pending Review', value: eraRecords.filter(e => e.status === 'Pending Review').length, color: '#3B82F6' },
            { label: 'Total Posted', value: `$${(eraRecords.reduce((s, e) => s + e.totalPaid, 0) / 1000000).toFixed(1)}M`, color: '#059669' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <input placeholder="Search ERA, check numbers..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-72" />
          <select value={filterPayer} onChange={e => setFilterPayer(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Payers</option>
            {['Simply Health', 'Sunshine Health', 'Humana', 'Florida Blue', 'WellCare'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Statuses</option>
            {['Auto-Posted', 'Partially Posted', 'Pending Review', 'Posted with Variances'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">ERA ID</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Payer</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Check #</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Date</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Total Paid</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Claims</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Matched</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Variance</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Status</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Action</th>
            </tr></thead>
            <tbody>
              {filtered.slice(0, 30).map((e, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 text-xs">
                  <td className="px-3 py-3 font-mono text-[#7C3AED]">{e.eraId}</td>
                  <td className="px-3 py-3 text-[#1d1d1f]">{e.payer}</td>
                  <td className="px-3 py-3 font-mono text-[#6e6e73]">{e.checkNumber}</td>
                  <td className="px-3 py-3 text-[#86868b]">{e.checkDate}</td>
                  <td className="px-3 py-3 text-right font-semibold text-[#059669]">${e.totalPaid.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right">{e.claimsCount}</td>
                  <td className="px-3 py-3 text-right text-[#22C55E]">{e.matched}</td>
                  <td className="px-3 py-3 text-right"><span className={e.variance < 0 ? 'text-[#DC2626]' : 'text-[#22C55E]'}>${e.variance.toLocaleString()}</span></td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[e.status]}`}>{e.status}</span></td>
                  <td className="px-3 py-3">
                    <button onClick={() => showToast('ERA posted')} className="text-[#7C3AED] hover:underline">Post</button>
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
