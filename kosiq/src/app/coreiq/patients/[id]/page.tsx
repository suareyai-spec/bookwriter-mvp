'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import PatientCrossProductSummary from '@/components/PatientCrossProductSummary';
import ProductBadge from '@/components/ProductBadge';

const ACCENT = '#059669';
const TABS = ['Demographics', 'Insurance', 'Encounters', 'Medications', 'Lab Results', 'Documents', 'Billing', 'Cross-Product'];

function StatusBadge({ status, type }: { status: string; type?: string }) {
  const colors: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700', Completed: 'bg-emerald-50 text-emerald-700',
    Signed: 'bg-emerald-50 text-emerald-700', 'In Progress': 'bg-purple-50 text-purple-700',
    Scheduled: 'bg-blue-50 text-blue-700', Ordered: 'bg-blue-50 text-blue-700',
    'Results Available': 'bg-emerald-50 text-emerald-700', Processing: 'bg-yellow-50 text-yellow-700',
    Paid: 'bg-emerald-50 text-emerald-700', Denied: 'bg-red-50 text-red-700',
    Draft: 'bg-gray-100 text-gray-500', Discontinued: 'bg-red-50 text-red-700',
    'On Hold': 'bg-yellow-50 text-yellow-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [tab, setTab] = useState('Demographics');
  const [showEdit, setShowEdit] = useState(false);
  const [crossProduct, setCrossProduct] = useState<any>(null);
  const [crossProductLoading, setCrossProductLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/coreiq/patients/${id}`).then(r => r.json()).then(setPatient);
  }, [id]);

  useEffect(() => {
    if (id && tab === 'Cross-Product') {
      setCrossProductLoading(true);
      fetch(`/api/patients/${id}/cross-product`)
        .then(r => r.json())
        .then(res => { if (res.success) setCrossProduct(res.data); })
        .catch(() => {})
        .finally(() => setCrossProductLoading(false));
    }
  }, [id, tab]);

  if (!patient) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div></DashboardLayout>;

  const parseJSON = (s: string | null) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };
  const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <button onClick={() => router.push('/coreiq/patients')} className="text-sm" style={{ color: ACCENT }}>← Back to Patients</button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl text-white font-bold" style={{ background: ACCENT }}>
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1d1d1f]">{patient.lastName}, {patient.firstName}</h1>
                <p className="text-sm text-[#86868b]">MRN: {patient.mrn} · {age} yo {patient.gender} · DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                <p className="text-sm text-[#86868b]">{patient.phone} · {patient.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={patient.status} />
              <button onClick={() => setShowEdit(true)} className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm">Edit</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'text-white' : 'text-[#86868b] hover:text-[#1d1d1f]'}`} style={tab === t ? { background: ACCENT } : {}}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'Demographics' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                ['Full Name', `${patient.firstName} ${patient.lastName}`],
                ['Date of Birth', new Date(patient.dateOfBirth).toLocaleDateString()],
                ['Age', `${age} years`],
                ['Gender', patient.gender],
                ['Marital Status', patient.maritalStatus],
                ['Language', patient.language],
                ['Race', patient.race],
                ['Ethnicity', patient.ethnicity],
                ['Phone', patient.phone],
                ['Email', patient.email],
                ['Address', `${patient.address || ''}, ${patient.city || ''}, ${patient.state || ''} ${patient.zip || ''}`],
                ['SSN', patient.ssn],
                ['Emergency Contact', patient.emergencyContactName],
                ['Emergency Phone', patient.emergencyContactPhone],
                ['Pharmacy', patient.pharmacyName],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-[#86868b] font-medium uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium text-[#1d1d1f] mt-1">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Insurance' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Insurance Information</h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                ['Primary Insurance', patient.insuranceName],
                ['Insurance ID', patient.insuranceId],
                ['Group Number', patient.insuranceGroup],
                ['Secondary Insurance', patient.secondaryInsurance],
                ['Secondary ID', patient.secondaryInsuranceId],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-[#86868b] font-medium">{label}</p>
                  <p className="text-sm font-medium mt-1">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Encounters' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f5f5f7]">
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Date</th>
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Chief Complaint</th>
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Provider</th>
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Type</th>
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Status</th>
              </tr></thead>
              <tbody>
                {(patient.encounters || []).map((e: any) => (
                  <tr key={e.id} className="border-t border-gray-50 hover:bg-[#f5f5f7]">
                    <td className="py-3 px-4">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{e.chiefComplaint}</td>
                    <td className="py-3 px-4">{e.providerName}</td>
                    <td className="py-3 px-4">{e.visitType}</td>
                    <td className="py-3 px-4"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!patient.encounters || patient.encounters.length === 0) && <p className="text-sm text-[#86868b] p-6 text-center">No encounters</p>}
          </div>
        )}

        {tab === 'Medications' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f5f5f7]">
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Medication</th>
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Dosage</th>
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Frequency</th>
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Prescribed</th>
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Refills</th>
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Status</th>
              </tr></thead>
              <tbody>
                {(patient.prescriptions || []).map((rx: any) => (
                  <tr key={rx.id} className="border-t border-gray-50 hover:bg-[#f5f5f7]">
                    <td className="py-3 px-4 font-medium">
                      {rx.medication}
                      {rx.controlledSubstance && <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600">C{rx.deaSchedule}</span>}
                    </td>
                    <td className="py-3 px-4">{rx.dosage}</td>
                    <td className="py-3 px-4">{rx.frequency}</td>
                    <td className="py-3 px-4">{new Date(rx.prescribedDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{rx.refillsRemaining}</td>
                    <td className="py-3 px-4"><StatusBadge status={rx.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!patient.prescriptions || patient.prescriptions.length === 0) && <p className="text-sm text-[#86868b] p-6 text-center">No prescriptions</p>}
          </div>
        )}

        {tab === 'Lab Results' && (
          <div className="space-y-4">
            {(patient.labOrders || []).map((lab: any) => {
              const tests = parseJSON(lab.tests);
              const results = parseJSON(lab.results);
              const abnormals = parseJSON(lab.abnormalFlags) || [];
              return (
                <div key={lab.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm">{tests?.panelName || 'Lab Order'}</p>
                      <p className="text-xs text-[#86868b]">{new Date(lab.orderDate).toLocaleDateString()} · {lab.providerName}</p>
                    </div>
                    <StatusBadge status={lab.status} />
                  </div>
                  {results && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(results).map(([test, val]: [string, any]) => (
                        <div key={test} className={`p-2 rounded-lg text-xs ${val.flag ? 'bg-red-50 border border-red-200' : 'bg-[#f5f5f7]'}`}>
                          <p className="text-[#86868b]">{test}</p>
                          <p className={`font-semibold ${val.flag ? 'text-red-600' : 'text-[#1d1d1f]'}`}>
                            {val.value} {val.unit} {val.flag && <span className="text-red-500">({val.flag})</span>}
                          </p>
                          <p className="text-[10px] text-[#86868b]">Ref: {val.normalRange}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {(!patient.labOrders || patient.labOrders.length === 0) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center text-sm text-[#86868b]">No lab orders</div>
            )}
          </div>
        )}

        {tab === 'Documents' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-sm text-[#86868b]">Document management is available. Upload and manage patient documents here.</p>
            <div className="mt-4 space-y-2">
              {['Consent Form - Signed 01/15/2026', 'Insurance Card - Front & Back', 'Referral Letter - Cardiology', 'Prior Authorization - MRI'].map(doc => (
                <div key={doc} className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]">
                  <span className="text-sm">{doc}</span>
                  <button className="text-xs px-2 py-1 rounded-lg" style={{ color: ACCENT }}>View</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Billing' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f5f5f7]">
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">DOS</th>
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Payer</th>
                <th className="text-right py-3 px-4 text-[#86868b] font-medium">Charge</th>
                <th className="text-right py-3 px-4 text-[#86868b] font-medium">Paid</th>
                <th className="text-right py-3 px-4 text-[#86868b] font-medium">Balance</th>
                <th className="text-left py-3 px-4 text-[#86868b] font-medium">Status</th>
              </tr></thead>
              <tbody>
                {(patient.claims || []).map((c: any) => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-[#f5f5f7]">
                    <td className="py-3 px-4">{new Date(c.dateOfService).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-xs">{c.payer}</td>
                    <td className="py-3 px-4 text-right">${c.totalCharge.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${c.paidAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${c.patientBalance.toFixed(2)}</td>
                    <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!patient.claims || patient.claims.length === 0) && <p className="text-sm text-[#86868b] p-6 text-center">No claims</p>}
          </div>
        )}

        {tab === 'Cross-Product' && (
          <div className="space-y-4">
            {/* Quick cross-product cards */}
            {crossProductLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
                <p className="text-sm text-[#86868b] mt-3">Loading cross-product data...</p>
              </div>
            ) : crossProduct ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1d1d1f]">Cross-Product Overview</h2>
                  <Link href={`/patient360/${id}`} className="text-sm font-medium px-4 py-2 rounded-xl text-white" style={{ background: ACCENT }}>
                    Open Patient 360 →
                  </Link>
                </div>
                <PatientCrossProductSummary data={crossProduct} />
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center text-sm text-[#86868b]">No cross-product data available</div>
            )}
          </div>
        )}

        <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Patient" width="max-w-2xl">
          <EditPatientForm patient={patient} onSave={async (data: any) => {
            const res = await fetch(`/api/coreiq/patients/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (res.ok) { showToast('Patient updated'); setShowEdit(false); fetch(`/api/coreiq/patients/${id}`).then(r => r.json()).then(setPatient); }
          }} onCancel={() => setShowEdit(false)} />
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function EditPatientForm({ patient, onSave, onCancel }: { patient: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    firstName: patient.firstName, lastName: patient.lastName,
    phone: patient.phone || '', email: patient.email || '',
    address: patient.address || '', city: patient.city || '', state: patient.state || '', zip: patient.zip || '',
    insuranceName: patient.insuranceName || '', insuranceId: patient.insuranceId || '',
    pharmacyName: patient.pharmacyName || '', status: patient.status,
  });
  const u = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">First Name</label><input value={form.firstName} onChange={u('firstName')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Last Name</label><input value={form.lastName} onChange={u('lastName')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Phone</label><input value={form.phone} onChange={u('phone')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Email</label><input value={form.email} onChange={u('email')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
      </div>
      <div><label className="text-xs font-medium text-[#86868b] block mb-1">Status</label><select value={form.status} onChange={u('status')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"><option>Active</option><option>Inactive</option><option>Deceased</option></select></div>
      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>Save</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-sm">Cancel</button>
      </div>
    </div>
  );
}
