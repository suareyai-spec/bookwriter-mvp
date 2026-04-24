'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState, useMemo } from 'react';

const anomalyTypes = ['Upcoding', 'Unbundling', 'Duplicate Billing', 'Phantom Billing', 'Kickback Patterns'] as const;
const severities = ['Critical', 'High', 'Medium', 'Low'] as const;
const statuses = ['Open', 'Investigating', 'Confirmed', 'Dismissed'] as const;

const providers = ['Miami Primary Care Associates', 'South Florida Specialists', 'Coral Gables Medical Group', 'Aventura Health Center', 'Dade County Internal Medicine', 'Biscayne Medical Group', 'Kendall Family Practice', 'Hialeah Community Health', 'Doral Medical Center', 'Palmetto Bay Clinic'];

function gen(id: number) {
  const type = anomalyTypes[id % anomalyTypes.length];
  const sev = severities[id % severities.length];
  const status = statuses[id % statuses.length];
  const provider = providers[id % providers.length];
  const overpayment = Math.round(2000 + Math.random() * 65000);
  const claimId = `CLM-2026-${String(10000 + id).slice(1)}`;
  const day = String(1 + (id % 28)).padStart(2, '0');
  const month = String(1 + (id % 3)).padStart(2, '0');
  return { id: `FA-2026-${String(800 + id).padStart(4, '0')}`, claimId, type, severity: sev, provider, estimatedOverpayment: overpayment, status, date: `2026-${month}-${day}`, cptCodes: ['99215', '99214', '99213'][id % 3], notes: '' };
}

const allAnomalies = Array.from({ length: 120 }, (_, i) => gen(i));

const sevColor: Record<string, string> = { Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Medium: 'bg-yellow-100 text-yellow-700', Low: 'bg-green-100 text-green-700' };
const statusColor: Record<string, string> = { Open: 'bg-blue-100 text-blue-700', Investigating: 'bg-purple-100 text-purple-700', Confirmed: 'bg-red-100 text-red-700', Dismissed: 'bg-gray-100 text-gray-600' };

export default function AnomaliesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSev, setFilterSev] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<typeof allAnomalies[0] | null>(null);

  const filtered = useMemo(() => {
    let d = allAnomalies.filter(a =>
      (!search || a.id.toLowerCase().includes(search.toLowerCase()) || a.provider.toLowerCase().includes(search.toLowerCase()) || a.claimId.toLowerCase().includes(search.toLowerCase())) &&
      (!filterType || a.type === filterType) &&
      (!filterSev || a.severity === filterSev) &&
      (!filterStatus || a.status === filterStatus)
    );
    d.sort((a, b) => {
      const av = (a as any)[sortField], bv = (b as any)[sortField];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return d;
  }, [search, filterType, filterSev, filterStatus, sortField, sortDir]);

  const toggleSort = (f: string) => { if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('asc'); } };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Anomaly Detection</h1>
        <p className="text-sm text-[#86868b] mb-6">AI-flagged claims with suspicious billing patterns</p>

        <div className="flex gap-3 mb-4 flex-wrap">
          <input placeholder="Search alerts, providers, claims..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-72" />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Types</option>
            {anomalyTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterSev} onChange={e => setFilterSev(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Severities</option>
            {severities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="text-xs text-[#86868b] self-center ml-auto">{filtered.length} alerts</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              {[['id','Alert ID'],['claimId','Claim'],['type','Anomaly Type'],['severity','Severity'],['provider','Provider'],['estimatedOverpayment','Est. Overpayment'],['status','Status'],['date','Detected']].map(([f,l]) => (
                <th key={f} className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3 cursor-pointer hover:text-[#1d1d1f]" onClick={() => toggleSort(f)}>
                  {l} {sortField === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.slice(0, 50).map((a, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 cursor-pointer text-xs" onClick={() => setSelected(a)}>
                  <td className="px-4 py-3 font-mono text-[#DC2626]">{a.id}</td>
                  <td className="px-4 py-3 text-[#6e6e73]">{a.claimId}</td>
                  <td className="px-4 py-3 text-[#1d1d1f]">{a.type}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sevColor[a.severity]}`}>{a.severity}</span></td>
                  <td className="px-4 py-3 text-[#1d1d1f]">{a.provider}</td>
                  <td className="px-4 py-3 font-semibold text-[#1d1d1f]">${a.estimatedOverpayment.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[a.status]}`}>{a.status}</span></td>
                  <td className="px-4 py-3 text-[#86868b]">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Alert ${selected?.id || ''}`} width="max-w-2xl">
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#86868b]">Claim ID</p><p className="text-sm font-medium">{selected.claimId}</p></div>
                <div><p className="text-xs text-[#86868b]">Anomaly Type</p><p className="text-sm font-medium">{selected.type}</p></div>
                <div><p className="text-xs text-[#86868b]">Provider</p><p className="text-sm font-medium">{selected.provider}</p></div>
                <div><p className="text-xs text-[#86868b]">Severity</p><p className="text-sm"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sevColor[selected.severity]}`}>{selected.severity}</span></p></div>
                <div><p className="text-xs text-[#86868b]">Est. Overpayment</p><p className="text-sm font-bold text-[#DC2626]">${selected.estimatedOverpayment.toLocaleString()}</p></div>
                <div><p className="text-xs text-[#86868b]">Status</p><p className="text-sm"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[selected.status]}`}>{selected.status}</span></p></div>
                <div><p className="text-xs text-[#86868b]">CPT Codes Flagged</p><p className="text-sm font-medium">{selected.cptCodes}</p></div>
                <div><p className="text-xs text-[#86868b]">Date Detected</p><p className="text-sm font-medium">{selected.date}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { showToast('Investigation opened'); setSelected(null); }} className="px-4 py-2 bg-[#DC2626] text-white text-sm rounded-lg hover:bg-red-700">Open Investigation</button>
                <button onClick={() => { showToast('Alert dismissed'); setSelected(null); }} className="px-4 py-2 bg-gray-100 text-[#1d1d1f] text-sm rounded-lg hover:bg-gray-200">Dismiss</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
