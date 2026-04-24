'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';

const initialClaims = [
  { id: 'CLM-4521', patient: 'Maria Garcia', type: 'Inpatient', charged: 45200, paid: 38670, date: '2026-02-28', dx: 'E11.65', payer: 'Simply Health' },
  { id: 'CLM-4520', patient: 'James Wilson', type: 'Inpatient', charged: 67800, paid: 54240, date: '2026-02-27', dx: 'I50.9', payer: 'Humana' },
  { id: 'CLM-4519', patient: 'Robert Johnson', type: 'Emergency', charged: 8900, paid: 7120, date: '2026-02-27', dx: 'J44.1', payer: 'Aetna' },
  { id: 'CLM-4518', patient: 'Patricia Brown', type: 'Outpatient', charged: 2340, paid: 1872, date: '2026-02-26', dx: 'E66.01', payer: 'Simply Health' },
  { id: 'CLM-4517', patient: 'David Martinez', type: 'Pharmacy', charged: 1245, paid: 996, date: '2026-02-26', dx: 'E11.9', payer: 'Humana' },
  { id: 'CLM-4516', patient: 'Susan Anderson', type: 'Professional', charged: 450, paid: 360, date: '2026-02-25', dx: 'I48.91', payer: 'Aetna' },
  { id: 'CLM-4515', patient: 'Karen Thomas', type: 'Inpatient', charged: 32100, paid: 25680, date: '2026-02-24', dx: 'J44.0', payer: 'Simply Health' },
  { id: 'CLM-4514', patient: 'William Jackson', type: 'Emergency', charged: 5600, paid: 4480, date: '2026-02-23', dx: 'R06.02', payer: 'Humana' },
];

const types = ['All', 'Inpatient', 'Outpatient', 'Emergency', 'Pharmacy', 'Professional'];
const payers = ['All', 'Simply Health', 'Humana', 'Aetna'];

type SortKey = 'date' | 'charged' | 'paid' | 'patient';

export default function ClaimsPage() {
  const [claims] = useState(initialClaims);
  const [typeFilter, setTypeFilter] = useState('All');
  const [payerFilter, setPayerFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const si = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  let filtered = claims.filter(c => {
    if (typeFilter !== 'All' && c.type !== typeFilter) return false;
    if (payerFilter !== 'All' && c.payer !== payerFilter) return false;
    if (search && !c.patient.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && c.date < dateFrom) return false;
    if (dateTo && c.date > dateTo) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'patient') return a.patient.localeCompare(b.patient) * dir;
    if (sortKey === 'date') return a.date.localeCompare(b.date) * dir;
    return ((a as any)[sortKey] - (b as any)[sortKey]) * dir;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Claims Analysis</h1>
        <p className="text-sm text-[#86868b] mb-6">Filter by date, payer, type — {filtered.length} claims shown</p>

        <div className="flex gap-3 mb-6 flex-wrap items-center">
          <input placeholder="Search patient/claim..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm w-48" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            {types.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <select value={payerFilter} onChange={e => setPayerFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            {payers.map(p => <option key={p} value={p}>{p === 'All' ? 'All Payers' : p}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          <span className="text-xs text-[#86868b]">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Claim</th>
              <th onClick={() => toggleSort('patient')} className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3 cursor-pointer hover:text-[#1d1d1f]">Patient{si('patient')}</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Type</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Payer</th>
              <th onClick={() => toggleSort('charged')} className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3 cursor-pointer hover:text-[#1d1d1f]">Charged{si('charged')}</th>
              <th onClick={() => toggleSort('paid')} className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3 cursor-pointer hover:text-[#1d1d1f]">Paid{si('paid')}</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Dx</th>
              <th onClick={() => toggleSort('date')} className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3 cursor-pointer hover:text-[#1d1d1f]">Date{si('date')}</th>
            </tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-xs font-mono text-[#EF4444]">{c.id}</td>
                  <td className="px-5 py-3 text-sm font-medium text-[#1d1d1f]">{c.patient}</td>
                  <td className="px-5 py-3 text-center"><span className="px-2 py-0.5 text-[10px] bg-[#EF4444]/10 text-[#EF4444] rounded-full">{c.type}</span></td>
                  <td className="px-5 py-3 text-center text-xs text-[#6e6e73]">{c.payer}</td>
                  <td className="px-5 py-3 text-xs text-right text-[#6e6e73]">${c.charged.toLocaleString()}</td>
                  <td className="px-5 py-3 text-xs text-right font-medium text-[#1d1d1f]">${c.paid.toLocaleString()}</td>
                  <td className="px-5 py-3 text-xs text-center text-[#86868b]">{c.dx}</td>
                  <td className="px-5 py-3 text-xs text-right text-[#86868b]">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
