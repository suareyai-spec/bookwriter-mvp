'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const severities = ['Critical', 'High', 'Medium', 'Low'];
const statuses = ['Open', 'In Progress', 'Under Review', 'Closed - Confirmed', 'Closed - Dismissed'];

const investigations = Array.from({ length: 35 }, (_, i) => {
  const caseNum = `FI-2026-${String(100 + i).padStart(4, '0')}`;
  const investigator = ['Sarah Mitchell', 'James Rodriguez', 'Emily Chen', 'Marcus Johnson', 'Lisa Park'][i % 5];
  const provider = ['Miami Primary Care Associates', 'South Florida Specialists', 'Coral Gables Medical Group', 'Aventura Health Center', 'Doral Medical Center'][i % 5];
  const npi = `1234567${String(800 + i)}`;
  const specialty = ['Internal Medicine', 'Cardiology', 'Orthopedics', 'Dermatology', 'Neurology'][i % 5];
  const totalBilled = 450000 + i * 32000;
  const avgPerPatient = 1200 + (i % 10) * 150;
  const peerAvg = 950;
  const suspiciousAmt = 15000 + Math.round(Math.random() * 250000);
  const confirmedFraud = Math.round(suspiciousAmt * 0.6);
  const recovered = Math.round(confirmedFraud * 0.4);
  return {
    id: String(i + 1),
    caseNumber: caseNum,
    status: statuses[i % 5],
    severity: severities[i % 4],
    investigator,
    openDate: `2026-${String(1 + (i % 3)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    provider,
    npi,
    specialty,
    totalBilled,
    avgPerPatient,
    peerAvg,
    suspiciousAmount: suspiciousAmt,
    confirmedFraud,
    recoveredAmount: recovered,
    title: ['Systematic upcoding pattern', 'Unbundling of surgical codes', 'Duplicate billing across facilities', 'Phantom billing for DME', 'Kickback referral network', 'Modifier abuse pattern', 'Place of service fraud', 'Identity theft billing'][i % 8],
    evidence: [
      { date: '2026-01-10', type: 'Alert', description: 'AI flagged unusual billing pattern — 3.2x peer average for E/M codes', by: 'System' },
      { date: '2026-01-12', type: 'Alert', description: 'Multiple claims same patient same day — possible duplicate billing', by: 'System' },
      { date: '2026-01-15', type: 'Investigation', description: 'Investigation opened — assigned to ' + investigator, by: investigator },
      { date: '2026-01-20', type: 'Document', description: 'Provider records subpoenaed and received', by: investigator },
      { date: '2026-02-01', type: 'Analysis', description: 'Billing pattern analysis complete — 47 suspicious claims identified', by: investigator },
      { date: '2026-02-15', type: 'Finding', description: 'Confirmed upcoding on 32 of 47 flagged claims', by: investigator },
    ],
    linkedClaims: Array.from({ length: 8 }, (_, j) => ({
      claimId: `CLM-${2026}${String(1000 + i * 10 + j)}`,
      date: `2026-0${1 + (j % 3)}-${String(5 + j * 3).padStart(2, '0')}`,
      cptCode: ['99214', '99215', '99213', '99232', '99223', '99291', '99204', '99205'][j % 8],
      amount: 150 + j * 85,
      status: j < 5 ? 'Flagged' : 'Under Review',
    })),
    notes: [
      { date: '2026-01-15', author: investigator, text: 'Opened investigation based on AI alert. Provider billing 3.2x specialty average for E/M codes.' },
      { date: '2026-01-22', author: investigator, text: 'Records received from provider. Beginning detailed claim-by-claim review.' },
      { date: '2026-02-05', author: 'Lisa Park', text: 'Peer review confirms upcoding pattern. Recommending escalation.' },
      { date: '2026-02-18', author: investigator, text: 'Financial impact assessment complete. Total exposure: $' + suspiciousAmt.toLocaleString() },
    ],
    peerComparison: [
      { name: 'Provider', billingPerPatient: avgPerPatient },
      { name: 'Specialty Avg', billingPerPatient: peerAvg },
      { name: 'Top 10%', billingPerPatient: peerAvg * 1.5 },
      { name: '90th Pctl', billingPerPatient: peerAvg * 1.8 },
    ],
  };
});

const severityColor: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700', Low: 'bg-green-100 text-green-700',
};
const statusColor: Record<string, string> = {
  'Open': 'bg-blue-100 text-blue-700', 'In Progress': 'bg-purple-100 text-purple-700',
  'Under Review': 'bg-yellow-100 text-yellow-700', 'Closed - Confirmed': 'bg-red-100 text-red-700',
  'Closed - Dismissed': 'bg-gray-100 text-gray-600',
};

export default function InvestigationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [noteModal, setNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [actionModal, setActionModal] = useState<string | null>(null);

  const inv = investigations.find(i => i.id === id) || investigations[0];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back button */}
        <button onClick={() => router.push('/fraudiq/investigations')} className="text-sm text-[#DC2626] hover:underline flex items-center gap-1">
          ← Back to Investigations
        </button>

        {/* Case Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[#1d1d1f]">{inv.caseNumber}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[inv.status]}`}>{inv.status}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityColor[inv.severity]}`}>{inv.severity}</span>
              </div>
              <p className="text-[#6e6e73] text-sm">{inv.title}</p>
              <div className="flex gap-6 mt-3 text-xs text-[#86868b]">
                <span>Investigator: <strong className="text-[#1d1d1f]">{inv.investigator}</strong></span>
                <span>Opened: <strong className="text-[#1d1d1f]">{inv.openDate}</strong></span>
                <span>Provider: <strong className="text-[#1d1d1f]">{inv.provider}</strong></span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActionModal('escalate')} className="px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">Escalate</button>
              <button onClick={() => setActionModal('oig')} className="px-4 py-2 text-xs font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700">Refer to OIG</button>
              <button onClick={() => { showToast('Case closed', 'success'); }} className="px-4 py-2 text-xs font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close Case</button>
            </div>
          </div>
        </div>

        {/* Financial Impact */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Suspicious Amount', value: inv.suspiciousAmount, color: 'text-red-600' },
            { label: 'Confirmed Fraud Amount', value: inv.confirmedFraud, color: 'text-orange-600' },
            { label: 'Recovered Amount', value: inv.recoveredAmount, color: 'text-green-600' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className={`text-2xl font-bold ${m.color}`}>${m.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Provider Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Provider Profile</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-[#86868b]">Name</span><span className="font-medium">{inv.provider}</span></div>
              <div className="flex justify-between"><span className="text-[#86868b]">NPI</span><span className="font-medium">{inv.npi}</span></div>
              <div className="flex justify-between"><span className="text-[#86868b]">Specialty</span><span className="font-medium">{inv.specialty}</span></div>
              <div className="flex justify-between"><span className="text-[#86868b]">Total Billed</span><span className="font-medium">${inv.totalBilled.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[#86868b]">Avg Per Patient</span><span className="font-medium text-red-600">${inv.avgPerPatient.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[#86868b]">Peer Average</span><span className="font-medium">${inv.peerAvg.toLocaleString()}</span></div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inv.peerComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="billingPerPatient" fill="#DC2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Evidence Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Evidence Chain</h2>
            <div className="space-y-4">
              {inv.evidence.map((e, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${e.type === 'Alert' ? 'bg-red-500' : e.type === 'Finding' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    {i < inv.evidence.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#1d1d1f]">{e.date}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${e.type === 'Alert' ? 'bg-red-100 text-red-700' : e.type === 'Finding' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{e.type}</span>
                    </div>
                    <p className="text-xs text-[#6e6e73] mt-1">{e.description}</p>
                    <p className="text-[10px] text-[#86868b] mt-0.5">By: {e.by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Linked Claims */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Linked Claims ({inv.linkedClaims.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
                <th className="pb-3 font-medium">Claim ID</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">CPT Code</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {inv.linkedClaims.map(c => (
                  <tr key={c.claimId} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 font-medium text-[#DC2626]">{c.claimId}</td>
                    <td className="py-3 text-[#6e6e73]">{c.date}</td>
                    <td className="py-3">{c.cptCode}</td>
                    <td className="py-3">${c.amount.toLocaleString()}</td>
                    <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${c.status === 'Flagged' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes / Activity Log */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Investigation Notes</h2>
            <button onClick={() => setNoteModal(true)} className="px-4 py-2 text-xs font-medium bg-[#DC2626] text-white rounded-lg hover:bg-red-700">Add Note</button>
          </div>
          <div className="space-y-3">
            {inv.notes.map((n, i) => (
              <div key={i} className="p-4 bg-[#f5f5f7] rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#1d1d1f]">{n.author}</span>
                  <span className="text-[10px] text-[#86868b]">{n.date}</span>
                </div>
                <p className="text-sm text-[#6e6e73]">{n.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Add Note Modal */}
        <Modal open={noteModal} onClose={() => setNoteModal(false)} title="Add Investigation Note">
          <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg p-3 text-sm" placeholder="Enter your note..." />
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setNoteModal(false)} className="px-4 py-2 text-sm text-[#6e6e73] hover:text-[#1d1d1f]">Cancel</button>
            <button onClick={() => { setNoteModal(false); showToast('Note added', 'success'); setNewNote(''); }} className="px-4 py-2 text-sm bg-[#DC2626] text-white rounded-lg">Save</button>
          </div>
        </Modal>

        {/* Action Modal */}
        <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={actionModal === 'escalate' ? 'Escalate Case' : 'Refer to OIG'}>
          <p className="text-sm text-[#6e6e73] mb-4">
            {actionModal === 'escalate'
              ? `Are you sure you want to escalate case ${inv.caseNumber}? This will notify senior investigators and compliance team.`
              : `Are you sure you want to refer case ${inv.caseNumber} to the Office of Inspector General? This action cannot be undone.`}
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setActionModal(null)} className="px-4 py-2 text-sm text-[#6e6e73]">Cancel</button>
            <button onClick={() => { setActionModal(null); showToast(actionModal === 'escalate' ? 'Case escalated' : 'Referred to OIG', 'success'); }} className="px-4 py-2 text-sm bg-[#DC2626] text-white rounded-lg">Confirm</button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
