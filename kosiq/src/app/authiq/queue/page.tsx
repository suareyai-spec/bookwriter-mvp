'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState, useMemo } from 'react';
import PatientSearchInput from '@/components/PatientSearchInput';

const authStatuses = ['Draft', 'Submitted', 'In Review', 'Approved', 'Denied', 'Expired'] as const;
const urgencies = ['Routine', 'Urgent', 'Emergent'] as const;
const payers = ['Simply Health', 'Sunshine Health', 'Humana', 'Florida Blue', 'WellCare'];
const procedures = ['Knee Replacement (27447)', 'MRI Brain w/wo Contrast (70553)', 'Cardiac Catheterization (93458)', 'CT Abdomen/Pelvis (74177)', 'Spinal Fusion (22633)', 'Hip Replacement (27130)', 'Colonoscopy (45378)', 'PET Scan (78815)', 'Shoulder Arthroscopy (29827)', 'Lumbar Epidural (62323)'];
const patients = ['Maria Santos', 'Robert Chen', 'James Williams', 'Patricia Brown', 'John Garcia', 'Jennifer Miller', 'Michael Davis', 'Linda Rodriguez', 'David Martinez', 'Elizabeth Wilson'];

const auths = Array.from({ length: 80 }, (_, i) => ({
  id: `PA-2026-${String(1000 + i).padStart(4, '0')}`,
  patient: patients[i % patients.length],
  provider: ['Dr. Maria Santos', 'Dr. James Chen', 'Dr. Patricia Williams', 'Dr. Robert Kumar'][i % 4],
  procedure: procedures[i % procedures.length],
  payer: payers[i % payers.length],
  urgency: urgencies[i % urgencies.length],
  status: authStatuses[i % authStatuses.length],
  submitDate: `2026-${String(1 + (i % 3)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
  decisionDate: i % authStatuses.length >= 3 ? `2026-03-${String(1 + (i % 10)).padStart(2, '0')}` : null,
  authNumber: i % authStatuses.length === 3 ? `AUTH-${String(50000 + i)}` : null,
  expirationDate: i % authStatuses.length === 3 ? `2026-06-${String(1 + (i % 28)).padStart(2, '0')}` : null,
}));

const statusColor: Record<string, string> = { Draft: 'bg-gray-100 text-gray-600', Submitted: 'bg-blue-100 text-blue-700', 'In Review': 'bg-cyan-100 text-cyan-700', Approved: 'bg-green-100 text-green-700', Denied: 'bg-red-100 text-red-700', Expired: 'bg-gray-200 text-gray-500' };
const urgencyColor: Record<string, string> = { Routine: 'bg-gray-100 text-gray-600', Urgent: 'bg-orange-100 text-orange-700', Emergent: 'bg-red-100 text-red-700' };

export default function AuthQueuePage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayer, setFilterPayer] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [selected, setSelected] = useState<typeof auths[0] | null>(null);
  const [sortField, setSortField] = useState('submitDate');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  const filtered = useMemo(() => {
    let d = auths.filter(a =>
      (!search || a.id.toLowerCase().includes(search.toLowerCase()) || a.patient.toLowerCase().includes(search.toLowerCase()) || a.procedure.toLowerCase().includes(search.toLowerCase())) &&
      (!filterStatus || a.status === filterStatus) &&
      (!filterPayer || a.payer === filterPayer) &&
      (!filterUrgency || a.urgency === filterUrgency)
    );
    d.sort((a, b) => { const av = (a as any)[sortField], bv = (b as any)[sortField]; const c = String(av || '').localeCompare(String(bv || '')); return sortDir === 'asc' ? c : -c; });
    return d;
  }, [search, filterStatus, filterPayer, filterUrgency, sortField, sortDir]);

  const toggleSort = (f: string) => { if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('desc'); } };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-semibold text-[#1d1d1f]">Authorization Queue</h1><p className="text-sm text-[#86868b]">All prior authorization requests</p></div>
          <a href="/authiq/new" className="px-4 py-2 bg-[#0891B2] text-white text-sm rounded-lg hover:bg-cyan-700">+ New Request</a>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <PatientSearchInput
            filterMode
            onSelect={(p) => setSearch(`${p.lastName}, ${p.firstName}`)}
            onInputChange={(v) => setSearch(v)}
            placeholder="Search auths, patients, procedures..."
            className="w-72"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Statuses</option>{authStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPayer} onChange={e => setFilterPayer(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Payers</option>{payers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Urgencies</option>{urgencies.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <span className="text-xs text-[#86868b] self-center ml-auto">{filtered.length} requests</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              {[['id','Auth ID'],['patient','Patient'],['procedure','Procedure'],['payer','Payer'],['urgency','Urgency'],['status','Status'],['submitDate','Submitted'],['decisionDate','Decision']].map(([f,l]) => (
                <th key={f} className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3 cursor-pointer" onClick={() => toggleSort(f)}>{l} {sortField === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.slice(0, 40).map((a, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 cursor-pointer text-xs" onClick={() => setSelected(a)}>
                  <td className="px-3 py-3 font-mono text-[#0891B2]">{a.id}</td>
                  <td className="px-3 py-3 text-[#1d1d1f]">{a.patient}</td>
                  <td className="px-3 py-3 text-[#6e6e73] max-w-[200px] truncate">{a.procedure}</td>
                  <td className="px-3 py-3 text-[#6e6e73]">{a.payer}</td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${urgencyColor[a.urgency]}`}>{a.urgency}</span></td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[a.status]}`}>{a.status}</span></td>
                  <td className="px-3 py-3 text-[#86868b]">{a.submitDate}</td>
                  <td className="px-3 py-3 text-[#86868b]">{a.decisionDate || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Authorization ${selected?.id || ''}`} width="max-w-2xl">
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#86868b]">Patient</p><p className="text-sm font-medium">{selected.patient}</p></div>
                <div><p className="text-xs text-[#86868b]">Provider</p><p className="text-sm font-medium">{selected.provider}</p></div>
                <div><p className="text-xs text-[#86868b]">Procedure</p><p className="text-sm font-medium">{selected.procedure}</p></div>
                <div><p className="text-xs text-[#86868b]">Payer</p><p className="text-sm font-medium">{selected.payer}</p></div>
                <div><p className="text-xs text-[#86868b]">Urgency</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urgencyColor[selected.urgency]}`}>{selected.urgency}</span></div>
                <div><p className="text-xs text-[#86868b]">Status</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[selected.status]}`}>{selected.status}</span></div>
                {selected.authNumber && <div><p className="text-xs text-[#86868b]">Auth Number</p><p className="text-sm font-mono text-[#0891B2]">{selected.authNumber}</p></div>}
                {selected.expirationDate && <div><p className="text-xs text-[#86868b]">Expires</p><p className="text-sm font-medium">{selected.expirationDate}</p></div>}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { showToast('Auth submitted to payer'); setSelected(null); }} className="px-4 py-2 bg-[#0891B2] text-white text-sm rounded-lg">Submit to Payer</button>
                <button onClick={() => showToast('Follow-up scheduled')} className="px-4 py-2 bg-gray-100 text-sm rounded-lg">Schedule Follow-up</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
