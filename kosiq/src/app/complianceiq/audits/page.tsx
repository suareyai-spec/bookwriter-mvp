'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const audits = [
  { id: 'AUD-001', type: 'HIPAA Security', date: '2026-02-15', auditor: 'ComplianceFirst LLC', score: 92, findings: 3, status: 'Completed', remediationStatus: 'In Progress' },
  { id: 'AUD-002', type: 'Coding Compliance', date: '2026-01-20', auditor: 'MedAudit Group', score: 88, findings: 7, status: 'Completed', remediationStatus: 'In Progress' },
  { id: 'AUD-003', type: 'OSHA Workplace Safety', date: '2025-12-10', auditor: 'SafeWork Consultants', score: 95, findings: 2, status: 'Completed', remediationStatus: 'Completed' },
  { id: 'AUD-004', type: 'Medicare Billing', date: '2025-11-15', auditor: 'CMS Regional Office', score: 85, findings: 5, status: 'Completed', remediationStatus: 'Completed' },
  { id: 'AUD-005', type: 'Clinical Quality', date: '2025-10-01', auditor: 'NCQA', score: 90, findings: 4, status: 'Completed', remediationStatus: 'Completed' },
  { id: 'AUD-006', type: 'Privacy Practices', date: '2025-09-15', auditor: 'ComplianceFirst LLC', score: 91, findings: 2, status: 'Completed', remediationStatus: 'Completed' },
  { id: 'AUD-007', type: 'Credentialing', date: '2025-08-01', auditor: 'Internal Team', score: 97, findings: 1, status: 'Completed', remediationStatus: 'Completed' },
  { id: 'AUD-008', type: 'HIPAA Privacy', date: '2025-06-15', auditor: 'ComplianceFirst LLC', score: 89, findings: 4, status: 'Completed', remediationStatus: 'Completed' },
  { id: 'AUD-009', type: 'HEDIS Quality', date: '2026-05-01', auditor: 'NCQA', score: null, findings: null, status: 'Scheduled', remediationStatus: null },
  { id: 'AUD-010', type: 'CMS Annual', date: '2026-06-15', auditor: 'CMS Regional Office', score: null, findings: null, status: 'Scheduled', remediationStatus: null },
  { id: 'AUD-011', type: 'HIPAA Security Annual', date: '2026-04-01', auditor: 'ComplianceFirst LLC', score: null, findings: null, status: 'Scheduled', remediationStatus: null },
  { id: 'AUD-012', type: 'Fire Safety', date: '2025-07-20', auditor: 'Miami-Dade Fire Dept', score: 100, findings: 0, status: 'Completed', remediationStatus: 'N/A' },
  { id: 'AUD-013', type: 'DEA Controlled Substances', date: '2025-05-10', auditor: 'DEA Division', score: 98, findings: 1, status: 'Completed', remediationStatus: 'Completed' },
  { id: 'AUD-014', type: 'Lab CLIA', date: '2025-04-15', auditor: 'CMS CLIA Program', score: 93, findings: 3, status: 'Completed', remediationStatus: 'Completed' },
  { id: 'AUD-015', type: 'IT Security Penetration', date: '2026-03-01', auditor: 'CyberShield Inc', score: 86, findings: 6, status: 'Completed', remediationStatus: 'In Progress' },
];

const statusColor: Record<string, string> = { Completed: 'bg-green-100 text-green-700', Scheduled: 'bg-blue-100 text-blue-700', 'In Progress': 'bg-yellow-100 text-yellow-700' };

export default function AuditsPage() {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<typeof audits[0] | null>(null);
  const [search, setSearch] = useState('');

  const filtered = audits.filter(a => !search || a.type.toLowerCase().includes(search.toLowerCase()) || a.auditor.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-semibold text-[#1d1d1f]">Audit Management</h1><p className="text-sm text-[#86868b]">Audit schedule, results & remediation tracking</p></div>
          <button onClick={() => showToast('New audit scheduled')} className="px-4 py-2 bg-[#065F46] text-white text-sm rounded-lg">+ Schedule Audit</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Audits', value: audits.length, color: '#065F46' },
            { label: 'Avg Score', value: `${Math.round(audits.filter(a => a.score).reduce((s, a) => s + (a.score || 0), 0) / audits.filter(a => a.score).length)}%`, color: '#22C55E' },
            { label: 'Scheduled', value: audits.filter(a => a.status === 'Scheduled').length, color: '#3B82F6' },
            { label: 'Open Findings', value: audits.filter(a => a.remediationStatus === 'In Progress').reduce((s, a) => s + (a.findings || 0), 0), color: '#F97316' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <input placeholder="Search audits..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-72" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">ID</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Type</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Date</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Auditor</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Score</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Findings</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Status</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Remediation</th>
            </tr></thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 cursor-pointer text-xs" onClick={() => setSelected(a)}>
                  <td className="px-4 py-3 font-mono text-[#065F46]">{a.id}</td>
                  <td className="px-4 py-3 text-[#1d1d1f] font-medium">{a.type}</td>
                  <td className="px-4 py-3 text-[#86868b]">{a.date}</td>
                  <td className="px-4 py-3 text-[#6e6e73]">{a.auditor}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: a.score ? (a.score >= 90 ? '#22C55E' : a.score >= 80 ? '#F97316' : '#DC2626') : '#86868b' }}>{a.score ? `${a.score}%` : '—'}</td>
                  <td className="px-4 py-3 text-right">{a.findings ?? '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[a.status] || ''}`}>{a.status}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${a.remediationStatus === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : a.remediationStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{a.remediationStatus || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Audit ${selected?.id || ''}`} width="max-w-2xl">
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#86868b]">Type</p><p className="text-sm font-medium">{selected.type}</p></div>
                <div><p className="text-xs text-[#86868b]">Auditor</p><p className="text-sm">{selected.auditor}</p></div>
                <div><p className="text-xs text-[#86868b]">Date</p><p className="text-sm">{selected.date}</p></div>
                <div><p className="text-xs text-[#86868b]">Score</p><p className="text-sm font-bold" style={{ color: selected.score ? (selected.score >= 90 ? '#22C55E' : '#F97316') : '#86868b' }}>{selected.score ? `${selected.score}%` : 'Pending'}</p></div>
                <div><p className="text-xs text-[#86868b]">Findings</p><p className="text-sm">{selected.findings ?? 'Pending'}</p></div>
                <div><p className="text-xs text-[#86868b]">Status</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[selected.status]}`}>{selected.status}</span></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { showToast('Remediation plan updated'); setSelected(null); }} className="px-4 py-2 bg-[#065F46] text-white text-sm rounded-lg">Update Remediation</button>
                <button onClick={() => showToast('Document uploaded')} className="px-4 py-2 bg-gray-100 text-sm rounded-lg">Upload Document</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
