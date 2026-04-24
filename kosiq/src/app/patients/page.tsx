'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const RISK_COLORS: Record<string, string> = { Low: '#34c759', Medium: '#ff9f0a', High: '#ff6482', Critical: '#ff3b30' };

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n}`;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [payer, setPayer] = useState('');
  const [sort, setSort] = useState('riskScore');
  const [order, setOrder] = useState('desc');
  const [limit, setLimit] = useState(50);
  const router = useRouter();

  const fetchPatients = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (riskLevel) params.set('riskLevel', riskLevel);
    if (payer) params.set('payer', payer);
    params.set('sort', sort);
    params.set('order', order);
    params.set('limit', String(limit));
    fetch(`/api/patients?${params}`).then(r => r.json()).then(d => {
      setPatients(d.patients);
      setTotal(d.total);
      setLoading(false);
    });
  };

  useEffect(() => { fetchPatients(); }, [search, riskLevel, payer, sort, order, limit]);

  const toggleSort = (field: string) => {
    if (sort === field) setOrder(order === 'desc' ? 'asc' : 'desc');
    else { setSort(field); setOrder('desc'); }
  };

  const inputClass = "bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/20 text-[#1d1d1f] placeholder-[#86868b]";

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Patient Population</h1>
        <p className="text-base text-[#86868b] mt-1">{total} patients managed</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input type="text" placeholder="Search by name or ID..."
          value={search} onChange={e => setSearch(e.target.value)}
          className={`${inputClass} w-64`} />
        <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} className={inputClass}>
          <option value="">All Risk Levels</option>
          <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
        <select value={payer} onChange={e => setPayer(e.target.value)} className={inputClass}>
          <option value="">All Payers</option>
          {['Simply Health','Sunshine Health','Humana','Aetna Better Health','Molina Healthcare','WellCare'].map(p => <option key={p}>{p}</option>)}
        </select>
        <button onClick={() => { setRiskLevel(''); setSearch(''); setLimit(100); }}
          className="border border-gray-200 text-[#0071e3] rounded-xl px-4 py-2.5 text-sm hover:bg-gray-50 font-medium">
          Top 100
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {[
                    { key: 'lastName', label: 'Patient' },
                    { key: 'riskScore', label: 'Risk Score' },
                    { key: 'totalCost', label: 'Total Cost' },
                    { key: 'pharmacy', label: 'Pharmacy' },
                    { key: 'inpatient', label: 'Inpatient' },
                    { key: 'erVisits', label: 'ER Visits' },
                    { key: 'specialist', label: 'Specialist' },
                    { key: 'primaryPayer', label: 'Payer' },
                    { key: 'lastER', label: 'Last ER' },
                  ].map(col => (
                    <th key={col.key} className="cursor-pointer hover:text-[#0071e3]" onClick={() => toggleSort(col.key)}>
                      {col.label} {sort === col.key ? (order === 'desc' ? '↓' : '↑') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} className="cursor-pointer" onClick={() => router.push(`/patients/${p.id}`)}>
                    <td className="font-medium text-[#1d1d1f]">{p.lastName}, {p.firstName}<br/><span className="text-xs text-[#86868b]">{p.externalId}</span></td>
                    <td>
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLORS[p.riskLevel] }} />
                        <span className="font-mono font-medium" style={{ color: RISK_COLORS[p.riskLevel] }}>{p.riskScore}</span>
                      </span>
                    </td>
                    <td className="font-mono text-[#1d1d1f]">{formatCurrency(p.totalCost)}</td>
                    <td className="font-mono text-[#86868b]">{formatCurrency(p.pharmacy)}</td>
                    <td className="font-mono text-[#86868b]">{formatCurrency(p.inpatient)}</td>
                    <td className="font-mono text-[#1d1d1f]">{p.erVisits}</td>
                    <td className="font-mono text-[#86868b]">{formatCurrency(p.specialist)}</td>
                    <td className="text-xs text-[#424245]">{p.primaryPayer}</td>
                    <td className="text-xs text-[#86868b]">{p.lastER ? new Date(p.lastER).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
