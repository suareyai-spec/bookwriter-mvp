'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState, useMemo } from 'react';
import PatientSearchInput from '@/components/PatientSearchInput';

const claimStatuses = ['Draft', 'Scrubbed', 'Submitted', 'Accepted', 'Denied', 'Paid', 'Appealed'] as const;
const payers = ['Simply Health', 'Sunshine Health', 'Humana', 'Florida Blue', 'WellCare'];
const patients = ['Maria Santos', 'Robert Chen', 'James Williams', 'Patricia Brown', 'John Garcia', 'Jennifer Miller', 'Michael Davis', 'Linda Rodriguez', 'David Martinez', 'Elizabeth Wilson', 'William Anderson', 'Barbara Thomas'];
const providerNames = ['Dr. Maria Santos', 'Dr. James Chen', 'Dr. Patricia Williams', 'Dr. Robert Kumar', 'Dr. Angela Martinez', 'Dr. David Thompson'];

const claims = Array.from({ length: 300 }, (_, i) => ({
  id: `CLM-2026-${String(10000 + i).slice(1)}`,
  patient: patients[i % patients.length],
  provider: providerNames[i % providerNames.length],
  dateOfService: `2026-${String(1 + (i % 3)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
  cptCodes: [['99213', '99214'], ['99215', '36415'], ['99213'], ['99214', '93000'], ['99283', '71046']][i % 5],
  icdCodes: [['E11.9', 'I10'], ['I50.9'], ['J44.1', 'N18.3'], ['E78.5'], ['M17.11', 'F41.1']][i % 5],
  charges: Math.round(150 + Math.random() * 2500),
  payer: payers[i % payers.length],
  status: claimStatuses[i % claimStatuses.length],
  denialReason: i % claimStatuses.length === 4 ? ['CO-4', 'CO-16', 'CO-97', 'PR-1', 'CO-45'][i % 5] : null,
  paidAmount: i % claimStatuses.length === 5 ? Math.round(100 + Math.random() * 2000) : 0,
}));

const statusColor: Record<string, string> = { Draft: 'bg-gray-100 text-gray-600', Scrubbed: 'bg-blue-100 text-blue-700', Submitted: 'bg-indigo-100 text-indigo-700', Accepted: 'bg-cyan-100 text-cyan-700', Denied: 'bg-red-100 text-red-700', Paid: 'bg-green-100 text-green-700', Appealed: 'bg-orange-100 text-orange-700' };

export default function ClaimsQueuePage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayer, setFilterPayer] = useState('');
  const [sortField, setSortField] = useState('dateOfService');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<typeof claims[0] | null>(null);

  const filtered = useMemo(() => {
    let d = claims.filter(c =>
      (!search || c.id.toLowerCase().includes(search.toLowerCase()) || c.patient.toLowerCase().includes(search.toLowerCase()) || c.provider.toLowerCase().includes(search.toLowerCase())) &&
      (!filterStatus || c.status === filterStatus) &&
      (!filterPayer || c.payer === filterPayer)
    );
    d.sort((a, b) => {
      const av = (a as any)[sortField], bv = (b as any)[sortField];
      const cmp = typeof av === 'number' ? av - bv : String(av || '').localeCompare(String(bv || ''));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return d;
  }, [search, filterStatus, filterPayer, sortField, sortDir]);

  const toggleSort = (f: string) => { if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('desc'); } };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Claims Queue</h1>
            <p className="text-sm text-[#86868b]">All claims with real-time status tracking</p>
          </div>
          <button onClick={() => showToast('New claim created')} className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-purple-700">+ New Claim</button>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <PatientSearchInput
            filterMode
            onSelect={(p) => setSearch(`${p.lastName}, ${p.firstName}`)}
            onInputChange={(v) => setSearch(v)}
            placeholder="Search claims, patients, providers..."
            className="w-72"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Statuses</option>
            {claimStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPayer} onChange={e => setFilterPayer(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Payers</option>
            {payers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <span className="text-xs text-[#86868b] self-center ml-auto">{filtered.length} claims</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              {[['id','Claim ID'],['patient','Patient'],['provider','Provider'],['dateOfService','DOS'],['charges','Charges'],['payer','Payer'],['status','Status'],['paidAmount','Paid']].map(([f,l]) => (
                <th key={f} className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3 cursor-pointer hover:text-[#1d1d1f]" onClick={() => toggleSort(f)}>
                  {l} {sortField === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.slice(0, 50).map((c, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 cursor-pointer text-xs" onClick={() => setSelected(c)}>
                  <td className="px-3 py-3 font-mono text-[#7C3AED]">{c.id}</td>
                  <td className="px-3 py-3 text-[#1d1d1f]">{c.patient}</td>
                  <td className="px-3 py-3 text-[#6e6e73]">{c.provider}</td>
                  <td className="px-3 py-3 text-[#86868b]">{c.dateOfService}</td>
                  <td className="px-3 py-3 font-semibold text-[#1d1d1f]">${c.charges.toLocaleString()}</td>
                  <td className="px-3 py-3 text-[#6e6e73]">{c.payer}</td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[c.status]}`}>{c.status}</span></td>
                  <td className="px-3 py-3 text-[#059669] font-semibold">{c.paidAmount ? `$${c.paidAmount.toLocaleString()}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Claim ${selected?.id || ''}`} width="max-w-2xl">
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#86868b]">Patient</p><p className="text-sm font-medium">{selected.patient}</p></div>
                <div><p className="text-xs text-[#86868b]">Provider</p><p className="text-sm font-medium">{selected.provider}</p></div>
                <div><p className="text-xs text-[#86868b]">Date of Service</p><p className="text-sm font-medium">{selected.dateOfService}</p></div>
                <div><p className="text-xs text-[#86868b]">Payer</p><p className="text-sm font-medium">{selected.payer}</p></div>
                <div><p className="text-xs text-[#86868b]">CPT Codes</p><p className="text-sm font-mono">{selected.cptCodes.join(', ')}</p></div>
                <div><p className="text-xs text-[#86868b]">ICD-10 Codes</p><p className="text-sm font-mono">{selected.icdCodes.join(', ')}</p></div>
                <div><p className="text-xs text-[#86868b]">Total Charges</p><p className="text-sm font-bold text-[#7C3AED]">${selected.charges.toLocaleString()}</p></div>
                <div><p className="text-xs text-[#86868b]">Status</p><p className="text-sm"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[selected.status]}`}>{selected.status}</span></p></div>
                {selected.denialReason && <div><p className="text-xs text-[#86868b]">Denial Reason</p><p className="text-sm font-medium text-[#DC2626]">{selected.denialReason}</p></div>}
                {selected.paidAmount > 0 && <div><p className="text-xs text-[#86868b]">Paid Amount</p><p className="text-sm font-bold text-[#059669]">${selected.paidAmount.toLocaleString()}</p></div>}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { showToast('Claim submitted'); setSelected(null); }} className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-purple-700">Submit Claim</button>
                <button onClick={() => { showToast('Claim scrubbed'); setSelected(null); }} className="px-4 py-2 bg-gray-100 text-[#1d1d1f] text-sm rounded-lg hover:bg-gray-200">Scrub</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
