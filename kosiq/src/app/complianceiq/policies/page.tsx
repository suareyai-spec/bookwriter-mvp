'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState, useMemo } from 'react';

const categories = ['Privacy', 'Security', 'Clinical', 'Administrative'] as const;

const policies = [
  { id: 'POL-001', title: 'Notice of Privacy Practices', category: 'Privacy', version: '4.2', lastReviewed: '2026-02-01', nextReview: '2027-02-01', acknowledgedBy: 48, totalStaff: 52, status: 'Current' },
  { id: 'POL-002', title: 'Information Security Policy', category: 'Security', version: '3.1', lastReviewed: '2026-01-15', nextReview: '2027-01-15', acknowledgedBy: 52, totalStaff: 52, status: 'Current' },
  { id: 'POL-003', title: 'Breach Notification Policy', category: 'Privacy', version: '2.5', lastReviewed: '2025-12-01', nextReview: '2026-12-01', acknowledgedBy: 50, totalStaff: 52, status: 'Current' },
  { id: 'POL-004', title: 'Minimum Necessary Standard', category: 'Privacy', version: '2.0', lastReviewed: '2025-11-15', nextReview: '2026-11-15', acknowledgedBy: 45, totalStaff: 52, status: 'Current' },
  { id: 'POL-005', title: 'Password & Access Control', category: 'Security', version: '5.0', lastReviewed: '2026-02-15', nextReview: '2027-02-15', acknowledgedBy: 52, totalStaff: 52, status: 'Current' },
  { id: 'POL-006', title: 'Incident Response Plan', category: 'Security', version: '3.3', lastReviewed: '2026-01-20', nextReview: '2027-01-20', acknowledgedBy: 47, totalStaff: 52, status: 'Current' },
  { id: 'POL-007', title: 'Clinical Documentation Standards', category: 'Clinical', version: '6.1', lastReviewed: '2026-01-01', nextReview: '2027-01-01', acknowledgedBy: 38, totalStaff: 45, status: 'Current' },
  { id: 'POL-008', title: 'Medication Administration', category: 'Clinical', version: '4.0', lastReviewed: '2025-10-15', nextReview: '2026-10-15', acknowledgedBy: 40, totalStaff: 45, status: 'Current' },
  { id: 'POL-009', title: 'Patient Consent Process', category: 'Clinical', version: '3.2', lastReviewed: '2025-09-01', nextReview: '2026-09-01', acknowledgedBy: 42, totalStaff: 45, status: 'Current' },
  { id: 'POL-010', title: 'Employee Code of Conduct', category: 'Administrative', version: '2.8', lastReviewed: '2025-08-15', nextReview: '2026-08-15', acknowledgedBy: 51, totalStaff: 52, status: 'Current' },
  { id: 'POL-011', title: 'Business Associate Agreement Template', category: 'Privacy', version: '3.0', lastReviewed: '2025-12-15', nextReview: '2026-12-15', acknowledgedBy: 12, totalStaff: 15, status: 'Current' },
  { id: 'POL-012', title: 'Disaster Recovery Plan', category: 'Security', version: '2.1', lastReviewed: '2025-07-01', nextReview: '2026-07-01', acknowledgedBy: 8, totalStaff: 8, status: 'Review Due' },
  { id: 'POL-013', title: 'Telehealth Service Policy', category: 'Clinical', version: '1.5', lastReviewed: '2025-11-01', nextReview: '2026-05-01', acknowledgedBy: 28, totalStaff: 30, status: 'Review Due' },
  { id: 'POL-014', title: 'Social Media Policy', category: 'Administrative', version: '1.2', lastReviewed: '2025-06-01', nextReview: '2026-06-01', acknowledgedBy: 49, totalStaff: 52, status: 'Review Due' },
  { id: 'POL-015', title: 'Remote Work Security', category: 'Security', version: '2.0', lastReviewed: '2026-02-01', nextReview: '2027-02-01', acknowledgedBy: 35, totalStaff: 40, status: 'Current' },
  { id: 'POL-016', title: 'Whistleblower Protection', category: 'Administrative', version: '1.0', lastReviewed: '2025-05-15', nextReview: '2026-05-15', acknowledgedBy: 52, totalStaff: 52, status: 'Review Due' },
  { id: 'POL-017', title: 'Hand Hygiene Protocol', category: 'Clinical', version: '3.5', lastReviewed: '2025-12-01', nextReview: '2026-06-01', acknowledgedBy: 44, totalStaff: 45, status: 'Current' },
  { id: 'POL-018', title: 'Data Retention & Destruction', category: 'Privacy', version: '2.3', lastReviewed: '2025-10-01', nextReview: '2026-10-01', acknowledgedBy: 10, totalStaff: 15, status: 'Current' },
  { id: 'POL-019', title: 'Anti-Fraud & Compliance', category: 'Administrative', version: '3.0', lastReviewed: '2026-01-10', nextReview: '2027-01-10', acknowledgedBy: 50, totalStaff: 52, status: 'Current' },
  { id: 'POL-020', title: 'Infection Prevention & Control', category: 'Clinical', version: '4.1', lastReviewed: '2025-11-15', nextReview: '2026-05-15', acknowledgedBy: 43, totalStaff: 45, status: 'Current' },
  { id: 'POL-021', title: 'Medical Records Access', category: 'Privacy', version: '2.7', lastReviewed: '2025-09-15', nextReview: '2026-09-15', acknowledgedBy: 46, totalStaff: 52, status: 'Current' },
  { id: 'POL-022', title: 'Vendor Risk Management', category: 'Security', version: '1.8', lastReviewed: '2025-08-01', nextReview: '2026-08-01', acknowledgedBy: 8, totalStaff: 10, status: 'Review Due' },
  { id: 'POL-023', title: 'Patient Grievance Procedure', category: 'Administrative', version: '2.5', lastReviewed: '2025-10-15', nextReview: '2026-04-15', acknowledgedBy: 52, totalStaff: 52, status: 'Review Due' },
  { id: 'POL-024', title: 'Lab Specimen Handling', category: 'Clinical', version: '3.0', lastReviewed: '2025-12-15', nextReview: '2026-06-15', acknowledgedBy: 20, totalStaff: 25, status: 'Current' },
  { id: 'POL-025', title: 'Emergency Operations Plan', category: 'Administrative', version: '2.2', lastReviewed: '2025-07-15', nextReview: '2026-07-15', acknowledgedBy: 52, totalStaff: 52, status: 'Review Due' },
];

const statusPillColor: Record<string, string> = { Current: 'bg-green-100 text-green-700', 'Review Due': 'bg-yellow-100 text-yellow-700', Archived: 'bg-gray-100 text-gray-500' };

export default function PoliciesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [selected, setSelected] = useState<typeof policies[0] | null>(null);

  const filtered = useMemo(() => policies.filter(p =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat || p.category === filterCat)
  ), [search, filterCat]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-semibold text-[#1d1d1f]">Policy Library</h1><p className="text-sm text-[#86868b]">Policy management, version control & acknowledgment tracking</p></div>
          <button onClick={() => showToast('New policy template created')} className="px-4 py-2 bg-[#065F46] text-white text-sm rounded-lg">+ Add Policy</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Policies', value: policies.length, color: '#065F46' },
            { label: 'Current', value: policies.filter(p => p.status === 'Current').length, color: '#22C55E' },
            { label: 'Review Due', value: policies.filter(p => p.status === 'Review Due').length, color: '#F97316' },
            { label: 'Avg Acknowledgment', value: `${Math.round(policies.reduce((s, p) => s + (p.acknowledgedBy / p.totalStaff) * 100, 0) / policies.length)}%`, color: '#0891B2' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <input placeholder="Search policies..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-72" />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">ID</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Title</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Category</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Version</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Last Reviewed</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Next Review</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Acknowledged</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Status</th>
            </tr></thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 cursor-pointer text-xs" onClick={() => setSelected(p)}>
                  <td className="px-3 py-3 font-mono text-[#065F46]">{p.id}</td>
                  <td className="px-3 py-3 text-[#1d1d1f] font-medium">{p.title}</td>
                  <td className="px-3 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-[#6e6e73]">{p.category}</span></td>
                  <td className="px-3 py-3 text-center text-[#6e6e73]">v{p.version}</td>
                  <td className="px-3 py-3 text-[#86868b]">{p.lastReviewed}</td>
                  <td className="px-3 py-3 text-[#86868b]">{p.nextReview}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#f0f0f0] rounded-full"><div className="h-1.5 rounded-full bg-[#065F46]" style={{ width: `${(p.acknowledgedBy / p.totalStaff) * 100}%` }} /></div>
                      <span className="text-[10px] text-[#86868b]">{p.acknowledgedBy}/{p.totalStaff}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusPillColor[p.status]}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''} width="max-w-2xl">
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#86868b]">Category</p><p className="text-sm">{selected.category}</p></div>
                <div><p className="text-xs text-[#86868b]">Version</p><p className="text-sm">v{selected.version}</p></div>
                <div><p className="text-xs text-[#86868b]">Last Reviewed</p><p className="text-sm">{selected.lastReviewed}</p></div>
                <div><p className="text-xs text-[#86868b]">Next Review</p><p className="text-sm">{selected.nextReview}</p></div>
                <div><p className="text-xs text-[#86868b]">Acknowledged</p><p className="text-sm">{selected.acknowledgedBy} / {selected.totalStaff} staff</p></div>
                <div><p className="text-xs text-[#86868b]">Status</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusPillColor[selected.status]}`}>{selected.status}</span></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { showToast('Acknowledgment reminder sent'); setSelected(null); }} className="px-4 py-2 bg-[#065F46] text-white text-sm rounded-lg">Send Acknowledgment Request</button>
                <button onClick={() => showToast('New version created')} className="px-4 py-2 bg-gray-100 text-sm rounded-lg">Create New Version</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
