'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const payers = ['Aetna', 'Blue Cross', 'Cigna', 'United Healthcare', 'Humana', 'Medicare', 'Medicaid'];
const claimStatuses = ['Submitted', 'Acknowledged', 'Adjudicated', 'Paid', 'Denied', 'Appealed'];
const adjReasons = ['CO-45 Charges exceed fee schedule', 'CO-4 Procedure not consistent with modifier', 'PR-1 Deductible', 'PR-2 Coinsurance', 'CO-97 Payment adjusted — bundled procedure', 'OA-23 Impact of prior payer adjustment'];

const claims = Array.from({ length: 20 }, (_, i) => {
  const status = claimStatuses[i % 6];
  const isPaid = status === 'Paid';
  const isDenied = status === 'Denied' || status === 'Appealed';
  const totalCharge = 850 + i * 220;
  const allowedAmt = Math.round(totalCharge * 0.78);
  const paidAmt = isPaid ? Math.round(allowedAmt * 0.85) : 0;
  return {
    id: String(i + 1),
    claimNumber: `CIQ-2026-${String(5000 + i).padStart(5, '0')}`,
    status,
    payer: payers[i % 7],
    patient: ['Maria Santos', 'James Wilson', 'Lisa Chen', 'Robert Brown', 'Emily Davis', 'Michael Garcia', 'Sarah Johnson', 'David Lee', 'Jennifer Martinez', 'William Anderson'][i % 10],
    provider: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Jones'][i % 5],
    totalCharge,
    allowedAmount: allowedAmt,
    paidAmount: paidAmt,
    dateOfService: `2026-0${1 + (i % 3)}-${String(5 + i).padStart(2, '0')}`,
    submittedDate: `2026-0${1 + (i % 3)}-${String(6 + i).padStart(2, '0')}`,
    lineItems: [
      { cpt: '99214', desc: 'Office visit, established patient, moderate', modifier: '', units: 1, charge: 250, allowed: 195, paid: isPaid ? 166 : 0, adjReason: adjReasons[0] },
      { cpt: '85025', desc: 'Complete blood count (CBC)', modifier: '', units: 1, charge: 45, allowed: 35, paid: isPaid ? 30 : 0, adjReason: adjReasons[2] },
      { cpt: '80053', desc: 'Comprehensive metabolic panel', modifier: '26', units: 1, charge: 85, allowed: 66, paid: isPaid ? 56 : 0, adjReason: adjReasons[3] },
      { cpt: '93000', desc: 'Electrocardiogram, complete', modifier: '', units: 1, charge: totalCharge - 380, allowed: Math.round((totalCharge - 380) * 0.78), paid: isPaid ? Math.round((totalCharge - 380) * 0.66) : 0, adjReason: adjReasons[4] },
    ],
    diagnosisCodes: [
      { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications', lineItems: [0, 1, 2] },
      { code: 'I10', desc: 'Essential (primary) hypertension', lineItems: [0, 3] },
      { code: 'E78.5', desc: 'Hyperlipidemia, unspecified', lineItems: [1, 2] },
    ],
    timeline: [
      { date: `2026-0${1 + (i % 3)}-${String(6 + i).padStart(2, '0')}`, event: 'Claim submitted', detail: 'Electronic submission via clearinghouse' },
      { date: `2026-0${1 + (i % 3)}-${String(7 + i).padStart(2, '0')}`, event: 'Acknowledged by payer', detail: 'Payer confirmed receipt' },
      ...(isPaid ? [
        { date: `2026-0${1 + (i % 3)}-${String(20 + (i % 8)).padStart(2, '0')}`, event: 'Adjudicated', detail: 'Claim processed and approved' },
        { date: `2026-0${2 + (i % 2)}-${String(1 + (i % 10)).padStart(2, '0')}`, event: 'Payment received', detail: `Check #${78900 + i} — $${paidAmt.toLocaleString()}` },
      ] : isDenied ? [
        { date: `2026-0${1 + (i % 3)}-${String(20 + (i % 8)).padStart(2, '0')}`, event: 'Denied', detail: 'Denial reason: ' + ['Missing modifier', 'Medical necessity not established', 'Timely filing exceeded', 'Duplicate claim'][i % 4] },
      ] : []),
    ],
    remittance: isPaid ? { checkNumber: `CHK-${78900 + i}`, date: `2026-0${2 + (i % 2)}-${String(1 + (i % 10)).padStart(2, '0')}`, amount: paidAmt } : null,
    denial: isDenied ? {
      reasonCode: ['CO-4', 'CO-50', 'CO-29', 'CO-97'][i % 4],
      description: ['Procedure not consistent with modifier', 'Medical necessity not established', 'Timely filing limit exceeded', 'Payment adjusted — bundled procedure'][i % 4],
      appealDeadline: `2026-0${3 + (i % 2)}-${String(20 + (i % 8)).padStart(2, '0')}`,
    } : null,
    priorAuth: i % 3 === 0 ? `PA-2026-${3000 + i}` : null,
  };
});

const statusColor: Record<string, string> = {
  Submitted: 'bg-blue-100 text-blue-700', Acknowledged: 'bg-indigo-100 text-indigo-700',
  Adjudicated: 'bg-purple-100 text-purple-700', Paid: 'bg-green-100 text-green-700',
  Denied: 'bg-red-100 text-red-700', Appealed: 'bg-orange-100 text-orange-700',
};

export default function ClaimDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [appealModal, setAppealModal] = useState(false);

  const claim = claims.find(c => c.id === id) || claims[0];

  const appealLetter = `Dear ${claim.payer} Claims Department,

RE: Appeal for Claim ${claim.claimNumber}
Patient: ${claim.patient}
Date of Service: ${claim.dateOfService}
Denial Reason: ${claim.denial?.reasonCode || 'N/A'} — ${claim.denial?.description || 'N/A'}

We are writing to appeal the denial of the above-referenced claim. After thorough review of the patient's medical records and clinical documentation, we believe the services rendered were medically necessary and appropriately coded.

The patient presented with ${claim.diagnosisCodes.map(d => d.desc).join(', ')}. The treating physician, ${claim.provider}, determined that the procedures billed were essential for proper diagnosis and treatment.

We respectfully request that you reconsider this claim for payment. Enclosed please find supporting clinical documentation.

Sincerely,
Claims Department
KOSIQ Health System`;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <button onClick={() => router.push('/claimiq/queue')} className="text-sm text-[#7C3AED] hover:underline flex items-center gap-1">← Back to Claims Queue</button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[#1d1d1f]">{claim.claimNumber}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[claim.status]}`}>{claim.status}</span>
              </div>
              <div className="flex gap-6 mt-2 text-xs text-[#86868b]">
                <span>Patient: <strong className="text-[#1d1d1f]">{claim.patient}</strong></span>
                <span>Provider: <strong className="text-[#1d1d1f]">{claim.provider}</strong></span>
                <span>Payer: <strong className="text-[#1d1d1f]">{claim.payer}</strong></span>
                <span>DOS: <strong className="text-[#1d1d1f]">{claim.dateOfService}</strong></span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#86868b]">Total Charge</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">${claim.totalCharge.toLocaleString()}</p>
              {claim.paidAmount > 0 && <p className="text-sm text-green-600 font-medium">Paid: ${claim.paidAmount.toLocaleString()}</p>}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Charges', value: '$' + claim.totalCharge.toLocaleString() },
            { label: 'Allowed Amount', value: '$' + claim.allowedAmount.toLocaleString() },
            { label: 'Paid Amount', value: '$' + claim.paidAmount.toLocaleString() },
            { label: 'Patient Responsibility', value: '$' + (claim.allowedAmount - claim.paidAmount).toLocaleString() },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-4">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className="text-xl font-bold text-[#1d1d1f]">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Line Items</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
              <th className="pb-3 font-medium">CPT</th><th className="pb-3 font-medium">Description</th><th className="pb-3 font-medium">Mod</th><th className="pb-3 font-medium">Units</th><th className="pb-3 font-medium text-right">Charge</th><th className="pb-3 font-medium text-right">Allowed</th><th className="pb-3 font-medium text-right">Paid</th><th className="pb-3 font-medium">Adj Reason</th>
            </tr></thead>
            <tbody>
              {claim.lineItems.map((li, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 font-mono text-[#7C3AED] font-medium">{li.cpt}</td>
                  <td className="py-3 text-[#6e6e73]">{li.desc}</td>
                  <td className="py-3">{li.modifier || '—'}</td>
                  <td className="py-3">{li.units}</td>
                  <td className="py-3 text-right">${li.charge}</td>
                  <td className="py-3 text-right">${li.allowed}</td>
                  <td className="py-3 text-right font-medium">${li.paid}</td>
                  <td className="py-3 text-xs text-[#86868b]">{li.adjReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Diagnosis Codes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Diagnosis Codes (ICD-10)</h2>
            <div className="space-y-3">
              {claim.diagnosisCodes.map((d, i) => (
                <div key={i} className="p-3 bg-[#f5f5f7] rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-[#7C3AED]">{d.code}</span>
                    <span className="text-sm text-[#6e6e73]">{d.desc}</span>
                  </div>
                  <p className="text-[10px] text-[#86868b] mt-1">Linked to lines: {d.lineItems.map(l => claim.lineItems[l]?.cpt).join(', ')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Claim Timeline</h2>
            <div className="space-y-4">
              {claim.timeline.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${t.event.includes('Denied') ? 'bg-red-500' : t.event.includes('Payment') ? 'bg-green-500' : 'bg-[#7C3AED]'}`} />
                    {i < claim.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#1d1d1f]">{t.event}</p>
                    <p className="text-[10px] text-[#86868b]">{t.date}</p>
                    <p className="text-xs text-[#6e6e73] mt-0.5">{t.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Remittance / Denial Info */}
        {claim.remittance && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-3">Remittance Information</h2>
            <div className="flex gap-8 text-sm">
              <div><span className="text-[#86868b]">Check #:</span> <strong>{claim.remittance.checkNumber}</strong></div>
              <div><span className="text-[#86868b]">Date:</span> <strong>{claim.remittance.date}</strong></div>
              <div><span className="text-[#86868b]">Amount:</span> <strong className="text-green-600">${claim.remittance.amount.toLocaleString()}</strong></div>
            </div>
          </div>
        )}

        {claim.denial && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-200/60 p-6 border-l-4 border-l-red-500">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-3">Denial Information</h2>
            <div className="flex gap-8 text-sm mb-4">
              <div><span className="text-[#86868b]">Reason Code:</span> <strong className="text-red-600">{claim.denial.reasonCode}</strong></div>
              <div><span className="text-[#86868b]">Description:</span> <strong>{claim.denial.description}</strong></div>
              <div><span className="text-[#86868b]">Appeal Deadline:</span> <strong className="text-orange-600">{claim.denial.appealDeadline}</strong></div>
            </div>
            <button onClick={() => setAppealModal(true)} className="px-4 py-2 text-sm font-medium bg-[#7C3AED] text-white rounded-lg hover:bg-purple-700">Generate Appeal Letter</button>
          </div>
        )}

        {claim.priorAuth && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">Related Prior Authorization</h2>
            <p className="text-sm text-[#7C3AED] font-medium">{claim.priorAuth}</p>
          </div>
        )}

        <Modal open={appealModal} onClose={() => setAppealModal(false)} title="Appeal Letter" width="max-w-2xl">
          <pre className="whitespace-pre-wrap text-sm text-[#1d1d1f] font-sans leading-relaxed bg-[#f5f5f7] p-4 rounded-xl">{appealLetter}</pre>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setAppealModal(false)} className="px-4 py-2 text-sm text-[#6e6e73]">Close</button>
            <button onClick={() => { setAppealModal(false); showToast('Appeal letter copied to clipboard', 'success'); }} className="px-4 py-2 text-sm bg-[#7C3AED] text-white rounded-lg">Copy & Submit</button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
