'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const payers = ['Aetna', 'Blue Cross', 'Cigna', 'United Healthcare', 'Humana'];
const reviewers = ['Dr. Karen Phillips', 'Dr. Michael Torres', 'Dr. Rebecca Stone', 'Dr. Alan Wright', 'Dr. Patricia Kim'];
const outcomes = ['Approved', 'Denied', 'Rescheduled', 'Pending', 'Pending'] as const;

const p2pReviews = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  authNumber: `PA-2026-${String(3000 + i).padStart(5, '0')}`,
  patient: ['Maria Santos', 'James Wilson', 'Lisa Chen', 'Robert Brown', 'Emily Davis', 'Michael Garcia', 'Sarah Johnson', 'David Lee', 'Jennifer Martinez', 'William Anderson', 'Amanda Thompson', 'Christopher White', 'Jessica Harris', 'Daniel Clark', 'Ashley Lewis'][i],
  payer: payers[i % 5],
  reviewer: reviewers[i % 5],
  service: ['Total Knee Replacement', 'MRI Brain', 'Cardiac Catheterization', 'Spinal Fusion', 'Upper GI Endoscopy', 'Hip Arthroplasty', 'CT Abdomen', 'Shoulder Arthroscopy', 'Lumbar Discectomy', 'Colonoscopy', 'PET Scan', 'Tonsillectomy', 'ACL Reconstruction', 'Thyroidectomy', 'Gastric Bypass'][i],
  scheduledDate: `2026-03-${String(13 + i).padStart(2, '0')}`,
  scheduledTime: `${9 + (i % 5)}:${i % 2 === 0 ? '00' : '30'} AM`,
  outcome: outcomes[i % 5],
  checklist: [
    { item: 'Review clinical documentation', done: i < 8 },
    { item: 'Prepare talking points', done: i < 6 },
    { item: 'Verify clinical guidelines', done: i < 5 },
    { item: 'Confirm reviewer credentials', done: i < 10 },
    { item: 'Notify requesting physician', done: i < 7 },
  ],
}));

const payerSuccess = payers.map(p => {
  const reviews = p2pReviews.filter(r => r.payer === p);
  const approved = reviews.filter(r => r.outcome === 'Approved').length;
  return { payer: p, total: reviews.length, approved, rate: reviews.length > 0 ? Math.round((approved / reviews.length) * 100) : 0 };
});

const outcomeColor: Record<string, string> = {
  Approved: 'bg-green-100 text-green-700', Denied: 'bg-red-100 text-red-700',
  Rescheduled: 'bg-yellow-100 text-yellow-700', Pending: 'bg-blue-100 text-blue-700',
};

export default function P2PReviewsPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');

  const upcoming = p2pReviews.filter(r => r.outcome === 'Pending');
  const completed = p2pReviews.filter(r => r.outcome !== 'Pending');
  const displayed = tab === 'upcoming' ? upcoming : completed;

  const totalApproved = p2pReviews.filter(r => r.outcome === 'Approved').length;
  const totalDenied = p2pReviews.filter(r => r.outcome === 'Denied').length;
  const totalRescheduled = p2pReviews.filter(r => r.outcome === 'Rescheduled').length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Peer-to-Peer Reviews</h1>
          <p className="text-sm text-[#86868b] mt-1">Schedule and track P2P reviews with payer medical directors</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Reviews', value: p2pReviews.length, color: 'text-[#1d1d1f]' },
            { label: 'Upcoming', value: upcoming.length, color: 'text-blue-600' },
            { label: 'Approved', value: totalApproved, color: 'text-green-600' },
            { label: 'Denied', value: totalDenied, color: 'text-red-600' },
            { label: 'Rescheduled', value: totalRescheduled, color: 'text-yellow-600' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['upcoming', 'completed'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === t ? 'bg-[#0891B2] text-white' : 'bg-white text-[#6e6e73] border border-gray-200 hover:bg-gray-50'}`}>
              {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Completed (${completed.length})`}
            </button>
          ))}
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
              <th className="pb-3 font-medium">Date/Time</th><th className="pb-3 font-medium">Patient</th><th className="pb-3 font-medium">Payer</th><th className="pb-3 font-medium">Reviewer</th><th className="pb-3 font-medium">Service</th><th className="pb-3 font-medium">Outcome</th><th className="pb-3 font-medium">Prep</th>
            </tr></thead>
            <tbody>
              {displayed.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3"><div className="font-medium">{r.scheduledDate}</div><div className="text-[10px] text-[#86868b]">{r.scheduledTime}</div></td>
                  <td className="py-3">{r.patient}</td>
                  <td className="py-3 text-[#6e6e73]">{r.payer}</td>
                  <td className="py-3">{r.reviewer}</td>
                  <td className="py-3 text-[#6e6e73]">{r.service}</td>
                  <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${outcomeColor[r.outcome]}`}>{r.outcome}</span></td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0891B2] rounded-full" style={{ width: `${(r.checklist.filter(c => c.done).length / r.checklist.length) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-[#86868b]">{r.checklist.filter(c => c.done).length}/{r.checklist.length}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Success by Payer */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Success Rate by Payer</h2>
          <div className="grid grid-cols-5 gap-4">
            {payerSuccess.map(p => (
              <div key={p.payer} className="text-center p-4 bg-[#f5f5f7] rounded-xl">
                <p className="text-sm font-medium text-[#1d1d1f] mb-1">{p.payer}</p>
                <p className={`text-2xl font-bold ${p.rate >= 50 ? 'text-green-600' : p.rate > 0 ? 'text-yellow-600' : 'text-[#86868b]'}`}>{p.rate}%</p>
                <p className="text-[10px] text-[#86868b]">{p.approved}/{p.total} approved</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
