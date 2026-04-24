'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const appealStatuses = ['Draft', 'Submitted', 'Under Review', 'Won', 'Lost', 'Partial'] as const;

const successByReason = [
  { reason: 'CO-4', rate: 72, total: 34 }, { reason: 'CO-16', rate: 65, total: 28 },
  { reason: 'CO-97', rate: 45, total: 22 }, { reason: 'PR-1', rate: 38, total: 18 },
  { reason: 'CO-45', rate: 56, total: 15 }, { reason: 'CO-50', rate: 42, total: 12 },
];

const appeals = Array.from({ length: 60 }, (_, i) => ({
  id: `APL-2026-${String(500 + i).padStart(4, '0')}`,
  claimId: `CLM-2026-${String(20000 + i).slice(1)}`,
  patient: ['Maria Santos', 'Robert Chen', 'James Williams', 'Patricia Brown', 'John Garcia', 'Jennifer Miller'][i % 6],
  payer: ['Simply Health', 'Sunshine Health', 'Humana', 'Florida Blue', 'WellCare'][i % 5],
  denialCode: ['CO-4', 'CO-16', 'CO-97', 'PR-1', 'CO-45', 'CO-50'][i % 6],
  amount: Math.round(300 + Math.random() * 4000),
  status: appealStatuses[i % appealStatuses.length],
  submitDate: `2026-${String(1 + (i % 3)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
  outcomeDate: i % 6 >= 3 ? `2026-03-${String(1 + (i % 10)).padStart(2, '0')}` : null,
  recoveredAmount: i % 6 === 3 ? Math.round(200 + Math.random() * 3500) : i % 6 === 5 ? Math.round(100 + Math.random() * 2000) : 0,
  template: ['Medical Necessity', 'Timely Filing', 'Coding Correction', 'Clinical Documentation', 'Bundling Override', 'Coverage Determination'][i % 6],
}));

const statusColor: Record<string, string> = { Draft: 'bg-gray-100 text-gray-600', Submitted: 'bg-blue-100 text-blue-700', 'Under Review': 'bg-yellow-100 text-yellow-700', Won: 'bg-green-100 text-green-700', Lost: 'bg-red-100 text-red-700', Partial: 'bg-orange-100 text-orange-700' };

export default function AppealsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<typeof appeals[0] | null>(null);
  const [sortField, setSortField] = useState('submitDate');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  const filtered = useMemo(() => {
    let d = appeals.filter(a =>
      (!search || a.id.toLowerCase().includes(search.toLowerCase()) || a.patient.toLowerCase().includes(search.toLowerCase())) &&
      (!filterStatus || a.status === filterStatus)
    );
    d.sort((a, b) => { const av = (a as any)[sortField], bv = (b as any)[sortField]; const c = typeof av === 'number' ? av - bv : String(av || '').localeCompare(String(bv || '')); return sortDir === 'asc' ? c : -c; });
    return d;
  }, [search, filterStatus, sortField, sortDir]);

  const toggleSort = (f: string) => { if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('desc'); } };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-semibold text-[#1d1d1f]">Appeals</h1><p className="text-sm text-[#86868b]">Appeal tracking, templates & outcomes</p></div>
          <button onClick={() => showToast('New appeal created')} className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-purple-700">+ New Appeal</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Appeals', value: appeals.length, color: '#7C3AED' },
            { label: 'Win Rate', value: '58.3%', color: '#22C55E' },
            { label: 'Pending', value: appeals.filter(a => ['Submitted', 'Under Review'].includes(a.status)).length, color: '#F97316' },
            { label: 'Total Recovered', value: `$${(appeals.reduce((s, a) => s + a.recoveredAmount, 0) / 1000).toFixed(0)}K`, color: '#059669' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Appeal Success Rate by Denial Reason</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={successByReason}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="reason" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="rate" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-3 mb-4">
          <input placeholder="Search appeals..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-72" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Statuses</option>
            {appealStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              {[['id','Appeal ID'],['claimId','Claim'],['patient','Patient'],['payer','Payer'],['denialCode','Denial'],['amount','Amount'],['template','Template'],['status','Status'],['submitDate','Submitted']].map(([f,l]) => (
                <th key={f} className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3 cursor-pointer" onClick={() => toggleSort(f)}>{l} {sortField === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.slice(0, 30).map((a, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 cursor-pointer text-xs" onClick={() => setSelected(a)}>
                  <td className="px-3 py-3 font-mono text-[#7C3AED]">{a.id}</td>
                  <td className="px-3 py-3 text-[#6e6e73]">{a.claimId}</td>
                  <td className="px-3 py-3 text-[#1d1d1f]">{a.patient}</td>
                  <td className="px-3 py-3 text-[#6e6e73]">{a.payer}</td>
                  <td className="px-3 py-3 font-mono text-[#DC2626]">{a.denialCode}</td>
                  <td className="px-3 py-3 font-semibold">${a.amount.toLocaleString()}</td>
                  <td className="px-3 py-3 text-[#6e6e73]">{a.template}</td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[a.status]}`}>{a.status}</span></td>
                  <td className="px-3 py-3 text-[#86868b]">{a.submitDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Appeal ${selected?.id || ''}`} width="max-w-2xl">
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#86868b]">Claim</p><p className="text-sm font-medium">{selected.claimId}</p></div>
                <div><p className="text-xs text-[#86868b]">Patient</p><p className="text-sm font-medium">{selected.patient}</p></div>
                <div><p className="text-xs text-[#86868b]">Payer</p><p className="text-sm font-medium">{selected.payer}</p></div>
                <div><p className="text-xs text-[#86868b]">Denial Code</p><p className="text-sm font-mono text-[#DC2626]">{selected.denialCode}</p></div>
                <div><p className="text-xs text-[#86868b]">Amount</p><p className="text-sm font-bold">${selected.amount.toLocaleString()}</p></div>
                <div><p className="text-xs text-[#86868b]">Template</p><p className="text-sm">{selected.template}</p></div>
                <div><p className="text-xs text-[#86868b]">Status</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[selected.status]}`}>{selected.status}</span></div>
                {selected.recoveredAmount > 0 && <div><p className="text-xs text-[#86868b]">Recovered</p><p className="text-sm font-bold text-[#059669]">${selected.recoveredAmount.toLocaleString()}</p></div>}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { showToast('Appeal submitted'); setSelected(null); }} className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg">Submit Appeal</button>
                <button onClick={() => showToast('Template generated')} className="px-4 py-2 bg-gray-100 text-sm rounded-lg">Generate Letter</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
