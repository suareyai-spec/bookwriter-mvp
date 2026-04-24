'use client';
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import PatientSearchInput, { PatientResult } from '@/components/PatientSearchInput';

const ACCENT = '#059669';
const LAB_STATUSES = ['Ordered', 'Collected', 'Processing', 'Results Available'];
const PROVIDERS = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];
const LAB_PANELS = [
  { name: 'CBC', tests: ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'Platelets', 'MCV', 'MCH', 'MCHC'] },
  { name: 'BMP', tests: ['Glucose', 'BUN', 'Creatinine', 'Sodium', 'Potassium', 'Chloride', 'CO2', 'Calcium'] },
  { name: 'CMP', tests: ['Glucose', 'BUN', 'Creatinine', 'Sodium', 'Potassium', 'Chloride', 'CO2', 'Calcium', 'Total Protein', 'Albumin', 'Bilirubin', 'ALP', 'AST', 'ALT'] },
  { name: 'Lipid Panel', tests: ['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides'] },
  { name: 'HbA1c', tests: ['Hemoglobin A1c'] },
  { name: 'TSH', tests: ['TSH'] },
  { name: 'Urinalysis', tests: ['pH', 'Specific Gravity', 'Protein', 'Glucose', 'Ketones', 'Blood'] },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Ordered: 'bg-blue-50 text-blue-700', Collected: 'bg-yellow-50 text-yellow-700',
    Processing: 'bg-purple-50 text-purple-700', 'Results Available': 'bg-emerald-50 text-emerald-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

export default function LabOrdersPage() {
  const [labs, setLabs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showResults, setShowResults] = useState<any>(null);
  const [sortCol, setSortCol] = useState('orderDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { showToast } = useToast();

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterStatus) params.set('status', filterStatus);
    fetch(`/api/coreiq/labs?${params}`).then(r => r.json()).then(setLabs);
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const parseJSON = (s: string | null) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };

  const filtered = useMemo(() => {
    return [...labs].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [labs, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const pendingCount = labs.filter(l => l.status !== 'Results Available').length;
  const abnormalCount = labs.filter(l => { const f = parseJSON(l.abnormalFlags); return f && f.length > 0; }).length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Lab Orders</h1>
          <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>+ New Lab Order</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm" style={{ borderLeft: `3px solid ${ACCENT}` }}>
            <p className="text-xs text-[#86868b]">Total Orders</p>
            <p className="text-2xl font-bold" style={{ color: ACCENT }}>{labs.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm" style={{ borderLeft: '3px solid #F59E0B' }}>
            <p className="text-xs text-[#86868b]">Pending Results</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm" style={{ borderLeft: '3px solid #EF4444' }}>
            <p className="text-xs text-[#86868b]">Abnormal Results</p>
            <p className="text-2xl font-bold text-red-500">{abnormalCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
          <PatientSearchInput
            filterMode
            onSelect={(p) => setSearch(`${p.lastName}, ${p.firstName}`)}
            onInputChange={(v) => setSearch(v)}
            placeholder="Search patient, test..."
            className="w-64"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
            <option value="">All Statuses</option>
            {LAB_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f5f5f7]">
                {[{ key: 'orderDate', label: 'Order Date' }, { key: 'patient', label: 'Patient' }, { key: 'tests', label: 'Panel/Tests' }, { key: 'providerName', label: 'Provider' }, { key: 'priority', label: 'Priority' }, { key: 'status', label: 'Status' }].map(c => (
                  <th key={c.key} onClick={() => toggleSort(c.key)} className="text-left py-3 px-4 text-[#86868b] font-medium cursor-pointer hover:text-[#1d1d1f] text-xs">
                    {c.label} {sortCol === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
                <th className="py-3 px-4 text-[#86868b] font-medium text-xs">Flags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(lab => {
                const tests = parseJSON(lab.tests);
                const abnormals = parseJSON(lab.abnormalFlags) || [];
                return (
                  <tr key={lab.id} onClick={() => setShowResults(lab)} className="border-t border-gray-50 hover:bg-[#f5f5f7] cursor-pointer">
                    <td className="py-3 px-4">{new Date(lab.orderDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium">{lab.patient?.lastName}, {lab.patient?.firstName}</td>
                    <td className="py-3 px-4 text-xs">{tests?.panelName || 'Lab'}</td>
                    <td className="py-3 px-4">{lab.providerName}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs ${lab.priority === 'STAT' ? 'text-red-600 font-semibold' : lab.priority === 'Urgent' ? 'text-yellow-600' : 'text-[#86868b]'}`}>{lab.priority}</span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={lab.status} /></td>
                    <td className="py-3 px-4">
                      {abnormals.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">{abnormals.length} abnormal</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 text-xs text-[#86868b] border-t border-gray-100">{filtered.length} lab orders</div>
        </div>

        {/* Results Modal */}
        <Modal open={!!showResults} onClose={() => setShowResults(null)} title="Lab Results" width="max-w-3xl">
          {showResults && (() => {
            const tests = parseJSON(showResults.tests);
            const results = parseJSON(showResults.results);
            const abnormals = parseJSON(showResults.abnormalFlags) || [];
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{tests?.panelName || 'Lab Order'}</p>
                    <p className="text-sm text-[#86868b]">{showResults.patient?.lastName}, {showResults.patient?.firstName} · {new Date(showResults.orderDate).toLocaleDateString()} · {showResults.providerName}</p>
                  </div>
                  <StatusBadge status={showResults.status} />
                </div>
                {showResults.fasting && <div className="p-2 rounded-lg bg-blue-50 text-xs text-blue-700">🍽️ Fasting specimen required</div>}
                {results ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-[#f5f5f7]">
                        <th className="text-left py-2 px-3 text-[#86868b] font-medium">Test</th>
                        <th className="text-left py-2 px-3 text-[#86868b] font-medium">Value</th>
                        <th className="text-left py-2 px-3 text-[#86868b] font-medium">Unit</th>
                        <th className="text-left py-2 px-3 text-[#86868b] font-medium">Reference Range</th>
                        <th className="text-left py-2 px-3 text-[#86868b] font-medium">Flag</th>
                      </tr></thead>
                      <tbody>
                        {Object.entries(results).map(([test, val]: [string, any]) => (
                          <tr key={test} className={`border-t border-gray-50 ${val.flag ? 'bg-red-50' : ''}`}>
                            <td className="py-2 px-3 font-medium">{test}</td>
                            <td className={`py-2 px-3 font-semibold ${val.flag ? 'text-red-600' : ''}`}>{val.value}</td>
                            <td className="py-2 px-3 text-[#86868b]">{val.unit}</td>
                            <td className="py-2 px-3 text-[#86868b]">{val.normalRange}</td>
                            <td className="py-2 px-3">{val.flag && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">{val.flag}</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-[#86868b]">
                    <p className="text-2xl mb-2">⏳</p>
                    <p className="text-sm">Results pending — Status: {showResults.status}</p>
                  </div>
                )}
                {showResults.resultDate && <p className="text-xs text-[#86868b]">Results received: {new Date(showResults.resultDate).toLocaleDateString()}</p>}
              </div>
            );
          })()}
        </Modal>

        {/* New Order Modal */}
        <Modal open={showNew} onClose={() => setShowNew(false)} title="New Lab Order" width="max-w-lg">
          <NewLabForm onSave={async (data: any) => {
            const res = await fetch('/api/coreiq/labs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (res.ok) { showToast('Lab order created'); setShowNew(false); load(); }
          }} onCancel={() => setShowNew(false)} />
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function NewLabForm({ onSave, onCancel }: { onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    patientId: '', providerName: PROVIDERS[0], orderDate: new Date().toISOString().split('T')[0],
    selectedPanel: '', priority: 'Routine', fasting: false, notes: '',
  });
  const panel = LAB_PANELS.find(p => p.name === form.selectedPanel);

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
        <label className="text-xs font-medium text-[#86868b] block mb-1">Lab Panel</label>
        <div className="grid grid-cols-4 gap-2">
          {LAB_PANELS.map(p => (
            <button key={p.name} onClick={() => setForm(f => ({ ...f, selectedPanel: p.name, fasting: p.name === 'Lipid Panel' || p.name === 'BMP' || p.name === 'CMP' }))} className={`p-2 rounded-xl text-xs font-medium border ${form.selectedPanel === p.name ? 'text-white border-transparent' : 'border-gray-200 hover:bg-[#f5f5f7]'}`} style={form.selectedPanel === p.name ? { background: ACCENT } : {}}>
              {p.name}
            </button>
          ))}
        </div>
        {panel && <p className="text-xs text-[#86868b] mt-1">Tests: {panel.tests.join(', ')}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Provider</label><select value={form.providerName} onChange={e => setForm(f => ({ ...f, providerName: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">{PROVIDERS.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Priority</label><select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"><option>Routine</option><option>Urgent</option><option>STAT</option></select></div>
      </div>
      {form.fasting && <div className="p-2 rounded-lg bg-blue-50 text-xs text-blue-700">🍽️ Fasting specimen required for this panel</div>}
      <div className="flex gap-3 pt-2">
        <button onClick={() => {
          if (!panel) return;
          onSave({
            patientId: form.patientId, providerName: form.providerName,
            orderDate: new Date(form.orderDate),
            tests: JSON.stringify({ panelName: panel.name, tests: panel.tests }),
            status: 'Ordered', priority: form.priority, fasting: form.fasting,
          });
        }} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>Order Labs</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-sm">Cancel</button>
      </div>
    </div>
  );
}
