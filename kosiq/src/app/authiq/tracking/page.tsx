'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const payerTracking = [
  { payer: 'Simply Health', pending: 12, avgResponse: 3.2, phone: '1-877-123-4567', portal: 'provider.simplyhealth.com', escalationDays: 5, autoFollowUp: true },
  { payer: 'Sunshine Health', pending: 8, avgResponse: 4.8, phone: '1-866-234-5678', portal: 'provider.sunshinehealth.com', escalationDays: 7, autoFollowUp: true },
  { payer: 'Humana', pending: 6, avgResponse: 5.1, phone: '1-800-345-6789', portal: 'provider.humana.com', escalationDays: 7, autoFollowUp: false },
  { payer: 'Florida Blue', pending: 10, avgResponse: 6.3, phone: '1-800-456-7890', portal: 'provider.floridablue.com', escalationDays: 10, autoFollowUp: true },
  { payer: 'WellCare', pending: 6, avgResponse: 4.5, phone: '1-866-567-8901', portal: 'provider.wellcare.com', escalationDays: 7, autoFollowUp: false },
];

const pendingAuths = [
  { id: 'PA-2026-1045', patient: 'Maria Santos', procedure: 'Knee Replacement', payer: 'Simply Health', submitted: '2026-03-05', daysWaiting: 6, lastContact: '2026-03-08', nextFollowUp: '2026-03-12', status: 'In Review' },
  { id: 'PA-2026-1052', patient: 'Robert Chen', procedure: 'MRI Brain', payer: 'Humana', submitted: '2026-03-03', daysWaiting: 8, lastContact: '2026-03-07', nextFollowUp: '2026-03-11', status: 'Pending Response' },
  { id: 'PA-2026-1058', patient: 'James Williams', procedure: 'Cardiac Cath', payer: 'Sunshine Health', submitted: '2026-03-07', daysWaiting: 4, lastContact: '2026-03-09', nextFollowUp: '2026-03-14', status: 'In Review' },
  { id: 'PA-2026-1063', patient: 'Patricia Brown', procedure: 'Spinal Fusion', payer: 'Florida Blue', submitted: '2026-02-28', daysWaiting: 11, lastContact: '2026-03-05', nextFollowUp: '2026-03-11', status: 'Escalated' },
  { id: 'PA-2026-1067', patient: 'John Garcia', procedure: 'CT Abdomen', payer: 'WellCare', submitted: '2026-03-06', daysWaiting: 5, lastContact: '2026-03-09', nextFollowUp: '2026-03-13', status: 'Pending Response' },
  { id: 'PA-2026-1071', patient: 'Jennifer Miller', procedure: 'Hip Replacement', payer: 'Simply Health', submitted: '2026-03-08', daysWaiting: 3, lastContact: '2026-03-10', nextFollowUp: '2026-03-15', status: 'In Review' },
  { id: 'PA-2026-1075', patient: 'Michael Davis', procedure: 'PET Scan', payer: 'Humana', submitted: '2026-03-01', daysWaiting: 10, lastContact: '2026-03-06', nextFollowUp: '2026-03-11', status: 'Escalated' },
];

const statusColor: Record<string, string> = { 'In Review': 'bg-cyan-100 text-cyan-700', 'Pending Response': 'bg-yellow-100 text-yellow-700', 'Escalated': 'bg-red-100 text-red-700' };

export default function AuthTrackingPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const filtered = pendingAuths.filter(a => !search || a.patient.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Authorization Tracking</h1>
        <p className="text-sm text-[#86868b] mb-6">Real-time status tracking & follow-up management</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <h3 className="text-sm font-semibold text-[#1d1d1f] px-4 py-3 border-b border-gray-100">Payer Overview</h3>
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Payer</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Pending</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Avg Response</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Phone</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Portal</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Escalation</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Auto Follow-Up</th>
            </tr></thead>
            <tbody>
              {payerTracking.map((p, i) => (
                <tr key={i} className="border-t border-gray-50 text-xs">
                  <td className="px-4 py-3 font-medium text-[#1d1d1f]">{p.payer}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: p.pending > 8 ? '#DC2626' : '#0891B2' }}>{p.pending}</td>
                  <td className="px-4 py-3 text-right text-[#6e6e73]">{p.avgResponse} days</td>
                  <td className="px-4 py-3 text-[#6e6e73]">{p.phone}</td>
                  <td className="px-4 py-3 text-[#0891B2]">{p.portal}</td>
                  <td className="px-4 py-3 text-right text-[#6e6e73]">{p.escalationDays} days</td>
                  <td className="px-4 py-3 text-center">{p.autoFollowUp ? <span className="text-[#22C55E]">✓</span> : <span className="text-[#86868b]">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 mb-4">
          <input placeholder="Search auths, patients..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-72" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-sm font-semibold text-[#1d1d1f] px-4 py-3 border-b border-gray-100">Pending Authorizations — Active Tracking</h3>
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Auth ID</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Patient</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Procedure</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Payer</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Days Waiting</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Next Follow-Up</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Status</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Action</th>
            </tr></thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 text-xs">
                  <td className="px-3 py-3 font-mono text-[#0891B2]">{a.id}</td>
                  <td className="px-3 py-3 text-[#1d1d1f]">{a.patient}</td>
                  <td className="px-3 py-3 text-[#6e6e73]">{a.procedure}</td>
                  <td className="px-3 py-3 text-[#6e6e73]">{a.payer}</td>
                  <td className="px-3 py-3 text-right"><span className={`font-semibold ${a.daysWaiting > 7 ? 'text-[#DC2626]' : 'text-[#1d1d1f]'}`}>{a.daysWaiting}</span></td>
                  <td className="px-3 py-3 text-[#6e6e73]">{a.nextFollowUp}</td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[a.status] || ''}`}>{a.status}</span></td>
                  <td className="px-3 py-3">
                    <button onClick={() => showToast('Follow-up call logged')} className="text-[#0891B2] hover:underline">Log Contact</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
