'use client';
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import PatientSearchInput, { PatientResult } from '@/components/PatientSearchInput';

const ACCENT = '#059669';
const STATUSES = ['Active', 'Completed', 'Discontinued', 'On Hold'];
const PROVIDERS = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];
const PHARMACIES = ['CVS Pharmacy', 'Walgreens', 'Walmart Pharmacy', 'Rite Aid', 'Publix Pharmacy'];

const DRUG_INTERACTIONS: Record<string, string[]> = {
  'Warfarin': ['Aspirin - Increased bleeding risk', 'Ibuprofen - Increased bleeding risk', 'Metronidazole - Increased INR'],
  'Metformin': ['Contrast dye - Risk of lactic acidosis'],
  'Lisinopril': ['Potassium supplements - Hyperkalemia risk', 'Spironolactone - Hyperkalemia risk'],
  'Alprazolam': ['Opioids - Respiratory depression risk', 'Alcohol - Enhanced CNS depression'],
};

const MEDICATION_DATABASE = [
  'Metformin 500mg', 'Metformin 1000mg', 'Lisinopril 10mg', 'Lisinopril 20mg', 'Atorvastatin 20mg', 'Atorvastatin 40mg',
  'Amlodipine 5mg', 'Amlodipine 10mg', 'Omeprazole 20mg', 'Omeprazole 40mg', 'Levothyroxine 50mcg', 'Levothyroxine 75mcg',
  'Metoprolol Succinate 25mg', 'Metoprolol Succinate 50mg', 'Losartan 50mg', 'Furosemide 20mg', 'Furosemide 40mg',
  'Gabapentin 300mg', 'Sertraline 50mg', 'Warfarin 5mg', 'Aspirin 81mg', 'Clopidogrel 75mg',
  'Hydrocodone/APAP 5/325mg', 'Tramadol 50mg', 'Alprazolam 0.25mg', 'Zolpidem 5mg',
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700', Completed: 'bg-gray-100 text-gray-600',
    Discontinued: 'bg-red-50 text-red-700', 'On Hold': 'bg-yellow-50 text-yellow-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [controlledOnly, setControlledOnly] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [sortCol, setSortCol] = useState('prescribedDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { showToast } = useToast();

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterStatus) params.set('status', filterStatus);
    if (controlledOnly) params.set('controlled', 'true');
    fetch(`/api/coreiq/prescriptions?${params}`).then(r => r.json()).then(setPrescriptions);
  };

  useEffect(() => { load(); }, [search, filterStatus, controlledOnly]);

  const filtered = useMemo(() => {
    return [...prescriptions].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [prescriptions, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const controlledCount = prescriptions.filter(p => p.controlledSubstance).length;
  const activeCount = prescriptions.filter(p => p.status === 'Active').length;
  const refillNeeded = prescriptions.filter(p => p.status === 'Active' && p.refillsRemaining === 0).length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1d1d1f]">E-Prescribing</h1>
          <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>+ New Prescription</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm" style={{ borderLeft: `3px solid ${ACCENT}` }}>
            <p className="text-xs text-[#86868b]">Active Prescriptions</p>
            <p className="text-2xl font-bold" style={{ color: ACCENT }}>{activeCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm" style={{ borderLeft: '3px solid #EF4444' }}>
            <p className="text-xs text-[#86868b]">Controlled Substances</p>
            <p className="text-2xl font-bold text-red-500">{controlledCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm" style={{ borderLeft: '3px solid #F59E0B' }}>
            <p className="text-xs text-[#86868b]">Needs Refill (0 remaining)</p>
            <p className="text-2xl font-bold text-yellow-600">{refillNeeded}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3 items-center">
          <PatientSearchInput
            filterMode
            onSelect={(p) => setSearch(`${p.lastName}, ${p.firstName}`)}
            onInputChange={(v) => setSearch(v)}
            placeholder="Search medication, patient..."
            className="w-64"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={controlledOnly} onChange={e => setControlledOnly(e.target.checked)} className="rounded" />
            Controlled Only
          </label>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f7]">
                  {[{ key: 'medication', label: 'Medication' }, { key: 'patient', label: 'Patient' }, { key: 'dosage', label: 'Dosage' }, { key: 'frequency', label: 'Frequency' }, { key: 'prescribedDate', label: 'Prescribed' }, { key: 'refillsRemaining', label: 'Refills' }, { key: 'pharmacy', label: 'Pharmacy' }, { key: 'status', label: 'Status' }].map(c => (
                    <th key={c.key} onClick={() => toggleSort(c.key)} className="text-left py-3 px-4 text-[#86868b] font-medium cursor-pointer hover:text-[#1d1d1f] text-xs">
                      {c.label} {sortCol === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map(rx => (
                  <tr key={rx.id} onClick={() => setShowDetail(rx)} className="border-t border-gray-50 hover:bg-[#f5f5f7] cursor-pointer">
                    <td className="py-3 px-4 font-medium">
                      {rx.medication}
                      {rx.controlledSubstance && <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600">C{rx.deaSchedule}</span>}
                    </td>
                    <td className="py-3 px-4">{rx.patient?.lastName}, {rx.patient?.firstName}</td>
                    <td className="py-3 px-4">{rx.dosage}</td>
                    <td className="py-3 px-4 text-xs">{rx.frequency}</td>
                    <td className="py-3 px-4">{new Date(rx.prescribedDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={rx.refillsRemaining === 0 ? 'text-red-600 font-semibold' : ''}>{rx.refillsRemaining}</span>
                    </td>
                    <td className="py-3 px-4 text-xs">{rx.pharmacy}</td>
                    <td className="py-3 px-4"><StatusBadge status={rx.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs text-[#86868b] border-t border-gray-100">{filtered.length} prescriptions</div>
        </div>

        {/* Detail Modal */}
        <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Prescription Details" width="max-w-lg">
          {showDetail && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50">
                <p className="font-semibold">{showDetail.medication} {showDetail.dosage}</p>
                <p className="text-sm text-[#86868b]">{showDetail.frequency} · {showDetail.duration}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-[#86868b]">Patient</p><p className="font-medium">{showDetail.patient?.lastName}, {showDetail.patient?.firstName}</p></div>
                <div><p className="text-xs text-[#86868b]">Provider</p><p className="font-medium">{showDetail.providerName}</p></div>
                <div><p className="text-xs text-[#86868b]">Pharmacy</p><p className="font-medium">{showDetail.pharmacy}</p></div>
                <div><p className="text-xs text-[#86868b]">Quantity</p><p className="font-medium">{showDetail.quantity}</p></div>
                <div><p className="text-xs text-[#86868b]">Refills Remaining</p><p className="font-medium">{showDetail.refillsRemaining}</p></div>
                <div><p className="text-xs text-[#86868b]">Prescribed</p><p className="font-medium">{new Date(showDetail.prescribedDate).toLocaleDateString()}</p></div>
              </div>
              {showDetail.controlledSubstance && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm font-semibold text-red-700">⚠️ Controlled Substance — Schedule {showDetail.deaSchedule}</p>
                </div>
              )}
              {DRUG_INTERACTIONS[showDetail.medication.split(' ')[0]] && (
                <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Drug Interaction Warnings</p>
                  {DRUG_INTERACTIONS[showDetail.medication.split(' ')[0]].map((w, i) => (
                    <p key={i} className="text-xs text-yellow-700">• {w}</p>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={async () => {
                  await fetch(`/api/coreiq/prescriptions/${showDetail.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refillsRemaining: showDetail.refillsRemaining + 1 }) });
                  showToast('Refill added');
                  setShowDetail(null);
                  load();
                }} className="px-3 py-1.5 rounded-xl text-white text-sm" style={{ background: ACCENT }}>Add Refill</button>
                <button onClick={async () => {
                  await fetch(`/api/coreiq/prescriptions/${showDetail.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Discontinued' }) });
                  showToast('Prescription discontinued');
                  setShowDetail(null);
                  load();
                }} className="px-3 py-1.5 rounded-xl text-white text-sm bg-red-500">Discontinue</button>
              </div>
            </div>
          )}
        </Modal>

        {/* New Rx Modal */}
        <Modal open={showNew} onClose={() => setShowNew(false)} title="New Prescription" width="max-w-lg">
          <NewRxForm onSave={async (data: any) => {
            const res = await fetch('/api/coreiq/prescriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (res.ok) { showToast('Prescription created'); setShowNew(false); load(); }
          }} onCancel={() => setShowNew(false)} />
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function NewRxForm({ onSave, onCancel }: { onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    patientId: '', providerName: PROVIDERS[0], medication: '', dosage: '', frequency: 'once daily',
    duration: '30 days', quantity: 30, refillsRemaining: 3, pharmacy: PHARMACIES[0],
    controlledSubstance: false, prescribedDate: new Date().toISOString().split('T')[0],
  });
  const [medSearch, setMedSearch] = useState('');
  const filteredMeds = MEDICATION_DATABASE.filter(m => m.toLowerCase().includes(medSearch.toLowerCase()));

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-[#86868b] block mb-1">Patient</label>
        <PatientSearchInput
          onSelect={(p: PatientResult) => setForm(f => ({ ...f, patientId: p.id }))}
          placeholder="Search patient..."
        />
      </div>
      <div>
        <label className="text-xs font-medium text-[#86868b] block mb-1">Medication</label>
        <input value={medSearch} onChange={e => setMedSearch(e.target.value)} placeholder="Search medication..." className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
        {medSearch && filteredMeds.length > 0 && (
          <div className="mt-1 border rounded-xl max-h-24 overflow-y-auto">{filteredMeds.slice(0, 8).map(m => (
            <button key={m} onClick={() => { const parts = m.split(' '); setForm(f => ({ ...f, medication: parts.slice(0, -1).join(' '), dosage: parts[parts.length - 1] })); setMedSearch(m); }} className="w-full text-left px-3 py-1.5 hover:bg-[#f5f5f7] text-sm">{m}</button>
          ))}</div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Frequency</label><input value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Duration</label><input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Quantity</label><input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Refills</label><input type="number" value={form.refillsRemaining} onChange={e => setForm(f => ({ ...f, refillsRemaining: +e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Pharmacy</label><select value={form.pharmacy} onChange={e => setForm(f => ({ ...f, pharmacy: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">{PHARMACIES.map(p => <option key={p}>{p}</option>)}</select></div>
      </div>
      <div><label className="text-xs font-medium text-[#86868b] block mb-1">Provider</label><select value={form.providerName} onChange={e => setForm(f => ({ ...f, providerName: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">{PROVIDERS.map(p => <option key={p}>{p}</option>)}</select></div>
      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave({ ...form, prescribedDate: new Date(form.prescribedDate), status: 'Active' })} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>Prescribe</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-sm">Cancel</button>
      </div>
    </div>
  );
}
