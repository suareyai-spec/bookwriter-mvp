'use client';
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';

const ACCENT = '#059669';

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Low: 'bg-green-50 text-green-700', Moderate: 'bg-yellow-50 text-yellow-700', High: 'bg-orange-50 text-orange-700', 'Very High': 'bg-red-50 text-red-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[level] || 'bg-gray-100 text-gray-600'}`}>{level}</span>;
}

function CarePlanBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700', 'Due for Review': 'bg-yellow-50 text-yellow-700', Expired: 'bg-red-50 text-red-700', 'Not Started': 'bg-gray-100 text-gray-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

export default function SeniorCarePage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterCarePlan, setFilterCarePlan] = useState('');
  const [filterPCP, setFilterPCP] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [sortCol, setSortCol] = useState('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/coreiq/senior-care').then(r => r.json()).then(setPatients);
  }, []);

  const pcps = useMemo(() => [...new Set(patients.map(p => p.pcp))], [patients]);

  const stats = useMemo(() => {
    const total = patients.length;
    const awvComplete = patients.filter(p => new Date(p.lastVisit) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)).length;
    const avgRisk = patients.length ? +(patients.reduce((a, p) => a + p.riskScore, 0) / patients.length).toFixed(2) : 0;
    const openGaps = patients.filter(p => p.hccGaps !== 'None').length;
    return { total, awvRate: total ? Math.round((awvComplete / total) * 100) : 0, avgRisk, openGaps };
  }, [patients]);

  const filtered = useMemo(() => {
    let result = patients.filter(p => {
      if (filterRisk && p.riskLevel !== filterRisk) return false;
      if (filterCarePlan && p.carePlanStatus !== filterCarePlan) return false;
      if (filterPCP && p.pcp !== filterPCP) return false;
      if (search && !p.patientName.toLowerCase().includes(search.toLowerCase()) && !p.medicareId.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    result.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return result;
  }, [patients, search, filterRisk, filterCarePlan, filterPCP, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Senior Care Roster</h1>
          <p className="text-sm text-[#86868b] mt-1">Medicare patient risk stratification & AWV tracking</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Medicare Patients', value: stats.total, color: 'text-gray-900' },
            { label: 'AWV Completion Rate', value: `${stats.awvRate}%`, color: stats.awvRate > 70 ? 'text-emerald-600' : 'text-orange-600' },
            { label: 'Average Risk Score', value: stats.avgRisk, color: 'text-blue-600' },
            { label: 'Open HCC Gaps', value: stats.openGaps, color: stats.openGaps > 20 ? 'text-red-600' : 'text-yellow-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-[#86868b] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input type="text" placeholder="Search patients or Medicare ID..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 max-w-xs px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
            <option value="">All Risk Levels</option>
            {['Low', 'Moderate', 'High', 'Very High'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterCarePlan} onChange={e => setFilterCarePlan(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
            <option value="">All Care Plans</option>
            {['Active', 'Due for Review', 'Expired', 'Not Started'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPCP} onChange={e => setFilterPCP(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
            <option value="">All PCPs</option>
            {pcps.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f5f5f7]">
                  {[
                    { key: 'patientName', label: 'Patient' }, { key: 'age', label: 'Age' }, { key: 'medicareId', label: 'Medicare ID' },
                    { key: 'riskScore', label: 'Risk Score' }, { key: 'hccGaps', label: 'HCC Gaps' }, { key: 'lastVisit', label: 'Last Visit' },
                    { key: 'nextAWVDue', label: 'Next AWV Due' }, { key: 'carePlanStatus', label: 'Care Plan' }, { key: 'pcp', label: 'PCP' },
                  ].map(col => (
                    <th key={col.key} onClick={() => toggleSort(col.key)} className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b] cursor-pointer hover:text-gray-700">
                      {col.label} {sortCol === col.key && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} onClick={() => setSelected(p)} className="border-b border-gray-50 hover:bg-emerald-50/30 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{p.patientName}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.age}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 font-mono">{p.medicareId}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: p.riskScore > 2 ? '#DC2626' : p.riskScore > 1.5 ? '#F97316' : ACCENT }}>{p.riskScore}</span>
                        <RiskBadge level={p.riskLevel} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 max-w-[150px] truncate">{p.hccGaps}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{new Date(p.lastVisit).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{new Date(p.nextAWVDue).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5"><CarePlanBadge status={p.carePlanStatus} /></td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.pcp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.patientName || ''} width="max-w-2xl">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Age', value: selected.age },
                { label: 'Medicare ID', value: selected.medicareId },
                { label: 'Risk Score', value: selected.riskScore },
                { label: 'Risk Level', value: selected.riskLevel },
                { label: 'PCP', value: selected.pcp },
                { label: 'Medications', value: selected.medications },
                { label: 'Last Visit', value: new Date(selected.lastVisit).toLocaleDateString() },
                { label: 'Next AWV Due', value: new Date(selected.nextAWVDue).toLocaleDateString() },
              ].map(item => (
                <div key={item.label} className="text-xs">
                  <span className="text-[#86868b]">{item.label}</span>
                  <div className="text-gray-900 font-medium mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
            <div>
              <span className="text-xs text-[#86868b]">Conditions</span>
              <div className="text-xs text-gray-900 mt-0.5">{selected.conditions}</div>
            </div>
            <div>
              <span className="text-xs text-[#86868b]">HCC Gaps</span>
              <div className="text-xs text-orange-700 font-medium mt-0.5">{selected.hccGaps}</div>
            </div>
            <div>
              <span className="text-xs text-[#86868b]">Care Plan Status</span>
              <div className="mt-0.5"><CarePlanBadge status={selected.carePlanStatus} /></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { showToast('AWV scheduled', 'success'); setSelected(null); }} className="px-4 py-2 text-xs text-white rounded-lg" style={{ backgroundColor: ACCENT }}>Schedule AWV</button>
              <button onClick={() => showToast('Care plan opened', 'info')} className="px-4 py-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg">View Care Plan</button>
              <button onClick={() => showToast('HCC review started', 'info')} className="px-4 py-2 text-xs text-orange-700 bg-orange-50 rounded-lg">HCC Review</button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
