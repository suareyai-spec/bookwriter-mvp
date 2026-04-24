'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const plans = ['Gold PPO', 'Silver HMO', 'Bronze EPO', 'Platinum PPO', 'Medicare Advantage', 'Medicaid Managed Care'];
const insurers = ['Aetna', 'Blue Cross', 'Cigna', 'United Healthcare', 'Humana', 'Medicare', 'Medicaid'];
const eligStatuses = ['Active', 'Active', 'Active', 'Active', 'Inactive', 'Expired', 'Pending'] as const;

const eligibilityRecords = Array.from({ length: 30 }, (_, i) => {
  const status = eligStatuses[i % 7] as string;
  const verifyStatus = i % 5 === 0 ? 'Failed' : i % 7 === 4 ? 'Expired' : i % 8 === 0 ? 'Pending' : 'Verified';
  return {
    id: i + 1,
    patient: ['Maria Santos', 'James Wilson', 'Lisa Chen', 'Robert Brown', 'Emily Davis', 'Michael Garcia', 'Sarah Johnson', 'David Lee', 'Jennifer Martinez', 'William Anderson', 'Amanda Thompson', 'Christopher White', 'Jessica Harris', 'Daniel Clark', 'Ashley Lewis'][i % 15],
    dob: `19${60 + (i % 40)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    memberId: `MBR${String(100000 + i * 37)}`,
    insurer: insurers[i % 7],
    plan: plans[i % 6],
    insuranceStatus: status,
    copay: [25, 30, 40, 20, 0, 15][i % 6],
    deductible: [1500, 3000, 5000, 750, 0, 2000][i % 6],
    deductibleMet: Math.round([1500, 3000, 5000, 750, 0, 2000][i % 6] * (0.3 + Math.random() * 0.7)),
    oopMax: [6000, 8000, 10000, 4000, 2000, 7000][i % 6],
    oopMet: Math.round([6000, 8000, 10000, 4000, 2000, 7000][i % 6] * Math.random() * 0.5),
    remainingBenefits: Math.round(50000 + Math.random() * 200000),
    verifyStatus,
    lastVerified: verifyStatus === 'Verified' ? `2026-03-${String(1 + (i % 12)).padStart(2, '0')}` : verifyStatus === 'Expired' ? '2026-01-15' : null,
    scheduledToday: i < 12,
  };
});

const verifyColor: Record<string, string> = {
  Verified: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Failed: 'bg-red-100 text-red-700',
  Expired: 'bg-gray-100 text-gray-600',
};

const statusColor: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-red-100 text-red-700',
  Expired: 'bg-gray-100 text-gray-600',
  Pending: 'bg-yellow-100 text-yellow-700',
};

export default function EligibilityPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<typeof eligibilityRecords[0] | null>(null);
  const [tab, setTab] = useState<'today' | 'all'>('today');

  const todayRecords = eligibilityRecords.filter(r => r.scheduledToday);
  const displayRecords = tab === 'today' ? todayRecords : eligibilityRecords;
  const filtered = search ? displayRecords.filter(r => r.patient.toLowerCase().includes(search.toLowerCase()) || r.memberId.toLowerCase().includes(search.toLowerCase())) : displayRecords;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Eligibility Verification</h1>
          <p className="text-sm text-[#86868b] mt-1">Verify patient insurance eligibility and benefits</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Today\'s Patients', value: todayRecords.length },
            { label: 'Verified', value: todayRecords.filter(r => r.verifyStatus === 'Verified').length },
            { label: 'Pending', value: todayRecords.filter(r => r.verifyStatus === 'Pending').length },
            { label: 'Failed/Expired', value: todayRecords.filter(r => r.verifyStatus === 'Failed' || r.verifyStatus === 'Expired').length },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or member ID..." className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] outline-none" />
          <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
            {(['today', 'all'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium ${tab === t ? 'bg-[#7C3AED] text-white' : 'text-[#6e6e73] hover:bg-gray-50'}`}>
                {t === 'today' ? "Today's Schedule" : 'All Records'}
              </button>
            ))}
          </div>
          <button onClick={() => showToast('Batch verification started for ' + todayRecords.length + ' patients', 'success')} className="px-4 py-2.5 text-sm font-medium bg-[#7C3AED] text-white rounded-xl hover:bg-purple-700">Batch Verify</button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
              <th className="pb-3 font-medium">Patient</th><th className="pb-3 font-medium">Member ID</th><th className="pb-3 font-medium">Insurer</th><th className="pb-3 font-medium">Plan</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Verification</th><th className="pb-3 font-medium">Last Verified</th><th className="pb-3 font-medium"></th>
            </tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelectedRecord(r)}>
                  <td className="py-3 font-medium">{r.patient}</td>
                  <td className="py-3 font-mono text-xs">{r.memberId}</td>
                  <td className="py-3 text-[#6e6e73]">{r.insurer}</td>
                  <td className="py-3 text-[#6e6e73]">{r.plan}</td>
                  <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusColor[r.insuranceStatus]}`}>{r.insuranceStatus}</span></td>
                  <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${verifyColor[r.verifyStatus]}`}>{r.verifyStatus}</span></td>
                  <td className="py-3 text-xs text-[#86868b]">{r.lastVerified || '—'}</td>
                  <td className="py-3"><button onClick={e => { e.stopPropagation(); showToast('Verifying ' + r.patient + '...', 'info'); }} className="text-xs text-[#7C3AED] hover:underline">Verify</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selectedRecord && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1d1d1f]">Eligibility Details — {selectedRecord.patient}</h2>
              <button onClick={() => setSelectedRecord(null)} className="text-sm text-[#86868b] hover:text-[#1d1d1f]">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Insurance Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#86868b]">Insurer</span><span className="font-medium">{selectedRecord.insurer}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Plan</span><span className="font-medium">{selectedRecord.plan}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Member ID</span><span className="font-mono font-medium">{selectedRecord.memberId}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Status</span><span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[selectedRecord.insuranceStatus]}`}>{selectedRecord.insuranceStatus}</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Cost Sharing</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#86868b]">Copay</span><span className="font-medium">${selectedRecord.copay}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Deductible</span><span className="font-medium">${selectedRecord.deductible.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Deductible Met</span><span className="font-medium">${selectedRecord.deductibleMet.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Remaining</span><span className="font-medium text-orange-600">${(selectedRecord.deductible - selectedRecord.deductibleMet).toLocaleString()}</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Benefits</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#86868b]">OOP Max</span><span className="font-medium">${selectedRecord.oopMax.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">OOP Met</span><span className="font-medium">${selectedRecord.oopMet.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Remaining Benefits</span><span className="font-medium text-green-600">${selectedRecord.remainingBenefits.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
