'use client';
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import PatientSearchInput, { PatientResult } from '@/components/PatientSearchInput';

const ACCENT = '#059669';
const STATUSES = ['In Progress', 'Signed', 'Addendum'];
const PROVIDERS = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];
const VISIT_TYPES = ['Office Visit', 'Telehealth', 'Annual Wellness', 'Follow-up'];

const TEMPLATES: Record<string, { subjective: string; objective: string; assessment: string; plan: string }> = {
  'Diabetes Follow-up': {
    subjective: 'Patient returns for diabetes management follow-up. Reports checking blood sugars regularly. Fasting levels ___. Denies polyuria, polydipsia, or vision changes. Medication adherence: ___.',
    objective: 'General: Alert, NAD. Vitals as recorded. Foot exam: Sensation intact/diminished bilaterally. Monofilament: ___/10 sites. Skin: No ulcers or lesions.',
    assessment: 'E11.9 - Type 2 diabetes mellitus. Current control: ___. Last HbA1c: ___.',
    plan: '1. Continue current diabetes medications\n2. Order HbA1c, BMP\n3. Diabetic foot exam performed\n4. Diet and exercise counseling\n5. RTC in 3 months',
  },
  'Hypertension Follow-up': {
    subjective: 'Patient returns for blood pressure management. Home BP readings: ___. Denies headaches, vision changes, or chest pain. Medication adherence: ___.',
    objective: 'General: Alert, NAD. BP as recorded. Heart: RRR, no murmurs. Lungs: CTA bilaterally.',
    assessment: 'I10 - Essential hypertension. Current control: ___.',
    plan: '1. Continue antihypertensive medication\n2. Order BMP for renal function\n3. Continue home BP monitoring\n4. Low sodium diet counseling\n5. RTC in 3 months',
  },
  'Annual Wellness': {
    subjective: 'Patient presents for annual wellness examination. Current medications reviewed. No new complaints. Review of systems: ___.',
    objective: 'General: Well-appearing, NAD. HEENT: NCAT, PERRL. Neck: Supple. Lungs: CTA. Heart: RRR. Abdomen: Soft, NT, ND. Extremities: No edema. Neuro: A&Ox3.',
    assessment: 'Z00.00 - Annual wellness visit. Health maintenance review performed.',
    plan: '1. Age-appropriate screening labs ordered\n2. Immunizations reviewed and updated\n3. Cancer screening reviewed\n4. Advance directive discussion\n5. RTC in 1 year or PRN',
  },
};

const ICD10_COMMON = [
  { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications' },
  { code: 'I10', desc: 'Essential hypertension' },
  { code: 'E78.5', desc: 'Hyperlipidemia, unspecified' },
  { code: 'E03.9', desc: 'Hypothyroidism, unspecified' },
  { code: 'J06.9', desc: 'Acute upper respiratory infection' },
  { code: 'M54.5', desc: 'Low back pain' },
  { code: 'K21.0', desc: 'GERD with esophagitis' },
  { code: 'I25.10', desc: 'Atherosclerotic heart disease' },
  { code: 'F32.1', desc: 'Major depressive disorder, moderate' },
  { code: 'G47.33', desc: 'Obstructive sleep apnea' },
  { code: 'M17.11', desc: 'Primary osteoarthritis, right knee' },
  { code: 'N39.0', desc: 'Urinary tract infection' },
];

const CPT_COMMON = [
  { code: '99213', desc: 'Office visit, established, low complexity', charge: 150 },
  { code: '99214', desc: 'Office visit, established, moderate complexity', charge: 220 },
  { code: '99215', desc: 'Office visit, established, high complexity', charge: 310 },
  { code: '99396', desc: 'Preventive visit, 40-64', charge: 280 },
  { code: '99397', desc: 'Preventive visit, 65+', charge: 300 },
  { code: '99490', desc: 'Chronic care management, 20 min', charge: 65 },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'In Progress': 'bg-purple-50 text-purple-700', Signed: 'bg-emerald-50 text-emerald-700', Addendum: 'bg-orange-50 text-orange-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

export default function EncountersPage() {
  const [encounters, setEncounters] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showNew, setShowNew] = useState(false);
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/coreiq/encounters').then(r => r.json()).then(setEncounters);
  }, []);

  const filtered = useMemo(() => {
    return encounters.filter(e => {
      if (search && !`${e.patient?.firstName} ${e.patient?.lastName} ${e.patient?.mrn} ${e.chiefComplaint}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && e.status !== filterStatus) return false;
      if (filterProvider && e.providerName !== filterProvider) return false;
      return true;
    }).sort((a, b) => {
      const va = sortCol === 'patient' ? a.patient?.lastName : a[sortCol];
      const vb = sortCol === 'patient' ? b.patient?.lastName : b[sortCol];
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [encounters, search, filterStatus, filterProvider, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const parseJSON = (s: string | null) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Encounters</h1>
          <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>+ New Encounter</button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
          <PatientSearchInput
            filterMode
            onSelect={(p) => setSearch(`${p.lastName}, ${p.firstName}`)}
            onInputChange={(v) => setSearch(v)}
            placeholder="Search patient, complaint..."
            className="w-64"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
            <option value="">All Providers</option>
            {PROVIDERS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f5f5f7]">
                {[{ key: 'date', label: 'Date' }, { key: 'patient', label: 'Patient' }, { key: 'chiefComplaint', label: 'Chief Complaint' }, { key: 'providerName', label: 'Provider' }, { key: 'visitType', label: 'Visit Type' }, { key: 'status', label: 'Status' }].map(c => (
                  <th key={c.key} onClick={() => toggleSort(c.key)} className="text-left py-3 px-4 text-[#86868b] font-medium cursor-pointer hover:text-[#1d1d1f]">
                    {c.label} {sortCol === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(e => (
                <tr key={e.id} onClick={() => setShowDetail(e)} className="border-t border-gray-50 hover:bg-[#f5f5f7] cursor-pointer">
                  <td className="py-3 px-4">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-medium">{e.patient?.lastName}, {e.patient?.firstName} <span className="text-[#86868b] text-xs">{e.patient?.mrn}</span></td>
                  <td className="py-3 px-4 max-w-xs truncate">{e.chiefComplaint}</td>
                  <td className="py-3 px-4">{e.providerName}</td>
                  <td className="py-3 px-4">{e.visitType}</td>
                  <td className="py-3 px-4"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-xs text-[#86868b] border-t border-gray-100">
            {filtered.length} encounters
          </div>
        </div>

        {/* Encounter Detail Modal */}
        <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Encounter Detail" width="max-w-4xl">
          {showDetail && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{showDetail.patient?.lastName}, {showDetail.patient?.firstName}</p>
                  <p className="text-sm text-[#86868b]">{showDetail.patient?.mrn} · {new Date(showDetail.date).toLocaleDateString()} · {showDetail.providerName}</p>
                </div>
                <StatusBadge status={showDetail.status} />
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-sm"><strong>Chief Complaint:</strong> {showDetail.chiefComplaint}</div>

              {/* Vitals */}
              {showDetail.vitals && (() => {
                const v = parseJSON(showDetail.vitals);
                return v ? (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Vital Signs</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {[['BP', `${v.bloodPressureSys}/${v.bloodPressureDia}`], ['HR', `${v.heartRate} bpm`], ['Temp', `${v.temperature}°F`], ['RR', `${v.respiratoryRate}`], ['SpO2', `${v.oxygenSat}%`], ['Weight', `${v.weight} lbs`], ['Height', `${v.height} in`], ['BMI', v.bmi], ['Pain', `${v.painLevel}/10`]].map(([k, val]) => (
                        <div key={k} className="p-2 rounded-lg bg-[#f5f5f7] text-center">
                          <p className="text-[10px] text-[#86868b]">{k}</p>
                          <p className="text-sm font-semibold">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* SOAP */}
              {['Subjective', 'Objective', 'Assessment', 'Plan'].map(section => {
                const key = section.toLowerCase() as string;
                const val = showDetail[key];
                return val ? (
                  <div key={section}>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: ACCENT }}>{section}</h3>
                    <p className="text-sm text-[#1d1d1f] whitespace-pre-wrap bg-[#f5f5f7] p-3 rounded-xl">{val}</p>
                  </div>
                ) : null;
              })}

              {/* Diagnoses */}
              {showDetail.diagnoses && (() => {
                const dx = parseJSON(showDetail.diagnoses);
                return dx?.length ? (
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Diagnoses (ICD-10)</h3>
                    <div className="space-y-1">{dx.map((d: any, i: number) => (
                      <div key={i} className="text-sm p-2 rounded-lg bg-[#f5f5f7]"><span className="font-mono font-medium" style={{ color: ACCENT }}>{d.code}</span> — {d.desc}</div>
                    ))}</div>
                  </div>
                ) : null;
              })()}

              {/* Procedures */}
              {showDetail.procedures && (() => {
                const px = parseJSON(showDetail.procedures);
                return px?.length ? (
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Procedures (CPT)</h3>
                    <div className="space-y-1">{px.map((p: any, i: number) => (
                      <div key={i} className="text-sm p-2 rounded-lg bg-[#f5f5f7]"><span className="font-mono font-medium" style={{ color: ACCENT }}>{p.code}</span> — {p.desc} {p.charge && <span className="text-[#86868b]">(${p.charge})</span>}</div>
                    ))}</div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </Modal>

        {/* New Encounter Modal */}
        <Modal open={showNew} onClose={() => setShowNew(false)} title="New Encounter" width="max-w-4xl">
          <NewEncounterForm onSave={async (data: any) => {
            const res = await fetch('/api/coreiq/encounters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (res.ok) { showToast('Encounter created'); setShowNew(false); fetch('/api/coreiq/encounters').then(r => r.json()).then(setEncounters); }
          }} onCancel={() => setShowNew(false)} />
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function NewEncounterForm({ onSave, onCancel }: { onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    patientId: '', providerName: PROVIDERS[0], date: new Date().toISOString().split('T')[0],
    chiefComplaint: '', subjective: '', objective: '', assessment: '', plan: '',
    vitals: '{}', diagnoses: '[]', procedures: '[]', visitType: 'Office Visit', status: 'In Progress',
  });
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const applyTemplate = (name: string) => {
    const t = TEMPLATES[name];
    if (t) setForm(f => ({ ...f, subjective: t.subjective, objective: t.objective, assessment: t.assessment, plan: t.plan }));
    setSelectedTemplate(name);
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[#86868b] block mb-1">Patient Search</label>
          <PatientSearchInput
            onSelect={(p: PatientResult) => setForm(f => ({ ...f, patientId: p.id }))}
            placeholder="Search patient..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#86868b] block mb-1">Template</label>
          <select value={selectedTemplate} onChange={e => applyTemplate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
            <option value="">None</option>
            {Object.keys(TEMPLATES).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-[#86868b] block mb-1">Provider</label>
          <select value={form.providerName} onChange={e => setForm(f => ({ ...f, providerName: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
            {PROVIDERS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[#86868b] block mb-1">Visit Type</label>
          <select value={form.visitType} onChange={e => setForm(f => ({ ...f, visitType: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
            {VISIT_TYPES.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[#86868b] block mb-1">Date</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-[#86868b] block mb-1">Chief Complaint</label>
        <input value={form.chiefComplaint} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
      </div>
      {['Subjective', 'Objective', 'Assessment', 'Plan'].map(section => (
        <div key={section}>
          <label className="text-xs font-medium block mb-1" style={{ color: ACCENT }}>{section}</label>
          <textarea value={(form as any)[section.toLowerCase()]} onChange={e => setForm(f => ({ ...f, [section.toLowerCase()]: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
        </div>
      ))}
      <div>
        <label className="text-xs font-medium text-[#86868b] block mb-1">ICD-10 Diagnoses</label>
        <div className="flex flex-wrap gap-1 mb-1">
          {ICD10_COMMON.slice(0, 6).map(d => (
            <button key={d.code} onClick={() => {
              const current = JSON.parse(form.diagnoses || '[]');
              if (!current.find((c: any) => c.code === d.code)) {
                setForm(f => ({ ...f, diagnoses: JSON.stringify([...current, d]) }));
              }
            }} className="text-xs px-2 py-1 rounded-lg bg-[#f5f5f7] hover:bg-gray-200">{d.code}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave({ ...form, date: new Date(form.date) })} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>Save Encounter</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-sm">Cancel</button>
      </div>
    </div>
  );
}
