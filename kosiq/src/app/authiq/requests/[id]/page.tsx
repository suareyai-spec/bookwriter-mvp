'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const auths = Array.from({ length: 15 }, (_, i) => {
  const status = ['Approved', 'Pending', 'Under Review', 'Denied', 'Pended'][i % 5];
  const expirationDate = `2026-${String(4 + (i % 6)).padStart(2, '0')}-${String(15 + (i % 15)).padStart(2, '0')}`;
  const now = new Date('2026-03-12');
  const exp = new Date(expirationDate);
  const daysRemaining = Math.max(0, Math.round((exp.getTime() - now.getTime()) / 86400000));
  return {
    id: String(i + 1),
    authNumber: `PA-2026-${String(3000 + i).padStart(5, '0')}`,
    status,
    patient: ['Maria Santos', 'James Wilson', 'Lisa Chen', 'Robert Brown', 'Emily Davis', 'Michael Garcia', 'Sarah Johnson', 'David Lee', 'Jennifer Martinez', 'William Anderson'][i % 10],
    provider: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Jones'][i % 5],
    insurance: ['Aetna', 'Blue Cross', 'Cigna', 'United Healthcare', 'Humana'][i % 5],
    cptCodes: [['27447', 'Total knee replacement'], ['99223', 'Initial hospital care'], ['70553', 'MRI brain with/without contrast'], ['43239', 'Upper GI endoscopy with biopsy'], ['27130', 'Total hip arthroplasty']][i % 5],
    diagnosis: ['M17.11 Primary osteoarthritis, right knee', 'I50.9 Heart failure, unspecified', 'G43.909 Migraine, unspecified', 'K21.0 GERD with esophagitis', 'M16.11 Primary osteoarthritis, right hip'][i % 5],
    clinicalJustification: 'Patient has failed conservative management including 6 months of physical therapy, NSAIDs, and corticosteroid injections. Imaging confirms severe degenerative changes. Surgical intervention is medically necessary.',
    clinicalDocs: [
      { type: 'Clinical Note', date: '2026-02-15', summary: 'Patient reports persistent pain (8/10), limited ROM, inability to perform ADLs. Failed conservative tx x 6 months.' },
      { type: 'Imaging', date: '2026-02-10', summary: 'X-ray shows Kellgren-Lawrence Grade IV changes with joint space narrowing and osteophyte formation.' },
      { type: 'Lab Results', date: '2026-02-12', summary: 'Pre-operative labs within normal limits. CRP 1.2, ESR 18.' },
      { type: 'PT Records', date: '2026-01-20', summary: '12 sessions completed with minimal improvement. Therapist recommends surgical consultation.' },
    ],
    timeline: [
      { date: '2026-02-20', event: 'Request submitted', detail: 'Electronic submission via AuthIQ' },
      { date: '2026-02-21', event: 'Acknowledged by payer', detail: `${['Aetna', 'Blue Cross', 'Cigna', 'United Healthcare', 'Humana'][i % 5]} confirmed receipt` },
      ...(status === 'Under Review' || status === 'Pended' ? [{ date: '2026-02-25', event: 'Under clinical review', detail: 'Assigned to medical director for review' }] : []),
      ...(status === 'Approved' ? [
        { date: '2026-03-01', event: 'Approved', detail: `Authorized for ${[['27447'], ['99223'], ['70553'], ['43239'], ['27130']][i % 5][0]}. Valid through ${expirationDate}` },
      ] : []),
      ...(status === 'Denied' ? [
        { date: '2026-03-01', event: 'Denied', detail: 'Reason: Medical necessity not established per clinical guidelines' },
      ] : []),
      ...(status === 'Pended' ? [{ date: '2026-03-05', event: 'Additional info requested', detail: 'Payer requests updated imaging and PT records' }] : []),
    ],
    payerResponse: status === 'Approved' ? 'Approved. Service authorized per clinical policy guidelines. Auth valid for 90 days.' : status === 'Denied' ? 'Denied. The requested service does not meet medical necessity criteria per InterQual guidelines. Peer-to-peer review available upon request.' : status === 'Pended' ? 'Additional clinical documentation required: updated imaging within 30 days, PT progress notes.' : 'Under review by medical director.',
    expirationDate,
    daysRemaining,
    p2p: status === 'Denied' || i % 4 === 0 ? {
      scheduledDate: `2026-03-${String(15 + (i % 10)).padStart(2, '0')}`,
      scheduledTime: `${9 + (i % 4)}:${i % 2 === 0 ? '00' : '30'} AM`,
      reviewer: ['Dr. Karen Phillips', 'Dr. Michael Torres', 'Dr. Rebecca Stone'][i % 3],
      talkingPoints: [
        'Emphasize 6 months of failed conservative therapy',
        'Reference imaging findings (KL Grade IV)',
        'Cite clinical guidelines supporting surgical intervention',
        'Note functional limitations and impact on quality of life',
        'Discuss pre-operative optimization already completed',
      ],
    } : null,
  };
});

const statusColor: Record<string, string> = {
  Approved: 'bg-green-100 text-green-700', Pending: 'bg-yellow-100 text-yellow-700',
  'Under Review': 'bg-blue-100 text-blue-700', Denied: 'bg-red-100 text-red-700',
  Pended: 'bg-orange-100 text-orange-700',
};

export default function AuthDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [p2pModal, setP2pModal] = useState(false);

  const auth = auths.find(a => a.id === id) || auths[0];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <button onClick={() => router.push('/authiq/queue')} className="text-sm text-[#0891B2] hover:underline">← Back to Auth Queue</button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[#1d1d1f]">{auth.authNumber}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[auth.status]}`}>{auth.status}</span>
              </div>
              <div className="flex gap-6 mt-2 text-xs text-[#86868b]">
                <span>Patient: <strong className="text-[#1d1d1f]">{auth.patient}</strong></span>
                <span>Provider: <strong className="text-[#1d1d1f]">{auth.provider}</strong></span>
                <span>Insurance: <strong className="text-[#1d1d1f]">{auth.insurance}</strong></span>
              </div>
            </div>
            {auth.status === 'Approved' && (
              <div className="text-right">
                <p className="text-xs text-[#86868b]">Expires</p>
                <p className="text-lg font-bold text-[#1d1d1f]">{auth.expirationDate}</p>
                <p className={`text-xs font-medium ${auth.daysRemaining < 14 ? 'text-red-600' : 'text-green-600'}`}>{auth.daysRemaining} days remaining</p>
              </div>
            )}
          </div>
        </div>

        {/* Requested Service */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-3">Requested Service</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-[#86868b]">CPT Code:</span> <strong className="text-[#0891B2]">{auth.cptCodes[0]}</strong> — {auth.cptCodes[1]}</div>
            <div><span className="text-[#86868b]">Diagnosis:</span> <strong>{auth.diagnosis}</strong></div>
            <div><span className="text-[#86868b]">Justification:</span> <span className="text-[#6e6e73]">{auth.clinicalJustification.substring(0, 100)}...</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Clinical Documentation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Clinical Documentation</h2>
            <div className="space-y-3">
              {auth.clinicalDocs.map((d, i) => (
                <div key={i} className="p-3 bg-[#f5f5f7] rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${d.type === 'Imaging' ? 'bg-blue-100 text-blue-700' : d.type === 'Lab Results' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{d.type}</span>
                    <span className="text-[10px] text-[#86868b]">{d.date}</span>
                  </div>
                  <p className="text-xs text-[#6e6e73]">{d.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Authorization Timeline</h2>
            <div className="space-y-4">
              {auth.timeline.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${t.event.includes('Denied') ? 'bg-red-500' : t.event.includes('Approved') ? 'bg-green-500' : 'bg-[#0891B2]'}`} />
                    {i < auth.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
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

        {/* Payer Response */}
        <div className={`bg-white rounded-2xl shadow-sm border p-6 ${auth.status === 'Denied' ? 'border-red-200 border-l-4 border-l-red-500' : 'border-gray-200/60'}`}>
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">Payer Response</h2>
          <p className="text-sm text-[#6e6e73]">{auth.payerResponse}</p>
        </div>

        {/* P2P Review */}
        {auth.p2p && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#0891B2]/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1d1d1f]">Peer-to-Peer Review</h2>
              {!auth.p2p.scheduledDate.includes('25') && <span className="text-xs px-3 py-1 bg-[#0891B2]/10 text-[#0891B2] rounded-full font-medium">Scheduled</span>}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm mb-4">
              <div><span className="text-[#86868b]">Date:</span> <strong>{auth.p2p.scheduledDate}</strong></div>
              <div><span className="text-[#86868b]">Time:</span> <strong>{auth.p2p.scheduledTime}</strong></div>
              <div><span className="text-[#86868b]">Reviewer:</span> <strong>{auth.p2p.reviewer}</strong></div>
            </div>
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-2">Talking Points</h3>
            <ul className="space-y-1">
              {auth.p2p.talkingPoints.map((tp, i) => (
                <li key={i} className="text-xs text-[#6e6e73] flex items-start gap-2">
                  <span className="text-[#0891B2] mt-0.5">•</span>{tp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!auth.p2p && auth.status === 'Denied' && (
          <div className="flex justify-center">
            <button onClick={() => setP2pModal(true)} className="px-6 py-3 text-sm font-medium bg-[#0891B2] text-white rounded-xl hover:bg-cyan-700">Schedule P2P Review</button>
          </div>
        )}

        <Modal open={p2pModal} onClose={() => setP2pModal(false)} title="Schedule Peer-to-Peer Review">
          <div className="space-y-4">
            <div><label className="text-xs text-[#86868b] block mb-1">Preferred Date</label><input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-xs text-[#86868b] block mb-1">Preferred Time</label><input type="time" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-xs text-[#86868b] block mb-1">Notes for Reviewer</label><textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setP2pModal(false)} className="px-4 py-2 text-sm text-[#6e6e73]">Cancel</button>
            <button onClick={() => { setP2pModal(false); showToast('P2P review scheduled', 'success'); }} className="px-4 py-2 text-sm bg-[#0891B2] text-white rounded-lg">Schedule</button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
