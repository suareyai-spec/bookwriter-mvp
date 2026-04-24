'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const securityControls = [
  { control: 'Access Controls (164.312(a))', status: 'Compliant', lastReview: '2026-02-15', notes: 'Unique user IDs, emergency access, auto-logoff configured' },
  { control: 'Audit Controls (164.312(b))', status: 'Compliant', lastReview: '2026-02-15', notes: 'Full audit logging enabled across all systems' },
  { control: 'Integrity Controls (164.312(c))', status: 'Compliant', lastReview: '2026-01-20', notes: 'Data integrity verification in place' },
  { control: 'Transmission Security (164.312(e))', status: 'Compliant', lastReview: '2026-02-01', notes: 'TLS 1.3 for all data in transit' },
  { control: 'Encryption (164.312(a)(2)(iv))', status: 'Compliant', lastReview: '2026-02-10', notes: 'AES-256 encryption at rest' },
  { control: 'Contingency Plan (164.308(a)(7))', status: 'Needs Attention', lastReview: '2025-11-15', notes: 'DR test overdue — last tested Nov 2025' },
  { control: 'Workforce Training (164.308(a)(5))', status: 'Needs Attention', lastReview: '2026-01-15', notes: 'Q1 training 78% complete — deadline March 31' },
  { control: 'Physical Safeguards (164.310)', status: 'Compliant', lastReview: '2026-01-30', notes: 'Badge access, visitor logs, workstation security' },
  { control: 'Risk Analysis (164.308(a)(1))', status: 'Needs Attention', lastReview: '2025-12-01', notes: 'Annual risk assessment in progress' },
  { control: 'Incident Procedures (164.308(a)(6))', status: 'Compliant', lastReview: '2026-02-20', notes: 'Response procedures documented and tested' },
];

const baas = [
  { vendor: 'LabCorp South', type: 'Laboratory', signed: '2024-04-15', expires: '2026-04-15', status: 'Active — Renewal Due' },
  { vendor: 'Quest Diagnostics', type: 'Laboratory', signed: '2025-06-01', expires: '2027-06-01', status: 'Active' },
  { vendor: 'AWS Cloud Services', type: 'Cloud Hosting', signed: '2025-01-01', expires: '2027-01-01', status: 'Active' },
  { vendor: 'Surescripts', type: 'E-Prescribing', signed: '2024-09-15', expires: '2026-09-15', status: 'Active' },
  { vendor: 'Iron Mountain', type: 'Records Storage', signed: '2025-03-01', expires: '2027-03-01', status: 'Active' },
  { vendor: 'Zoom Healthcare', type: 'Telehealth', signed: '2025-07-01', expires: '2027-07-01', status: 'Active' },
];

const breachLog = [
  { id: 'BR-2025-003', date: '2025-12-14', type: 'Unauthorized Access', individuals: 3, severity: 'Low', status: 'Closed', resolution: 'Staff re-trained, access revoked' },
  { id: 'BR-2025-002', date: '2025-09-22', type: 'Misdirected Email', individuals: 1, severity: 'Low', status: 'Closed', resolution: 'Recall sent, patient notified' },
  { id: 'BR-2025-001', date: '2025-06-03', type: 'Lost Device', individuals: 0, severity: 'Medium', status: 'Closed', resolution: 'Device encrypted, remote wiped' },
];

const accessLog = [
  { user: 'Dr. Maria Santos', action: 'Viewed patient record', resource: 'Patient #4521', timestamp: '2026-03-11 14:32:15', ip: '10.0.1.45' },
  { user: 'Sarah Mitchell', action: 'Exported report', resource: 'Q1 Claims Report', timestamp: '2026-03-11 14:28:03', ip: '10.0.1.67' },
  { user: 'Dr. James Chen', action: 'Modified prescription', resource: 'Rx #8934', timestamp: '2026-03-11 14:15:42', ip: '10.0.1.23' },
  { user: 'Admin User', action: 'Changed user role', resource: 'User: jgarcia', timestamp: '2026-03-11 13:55:18', ip: '10.0.1.10' },
  { user: 'Dr. Patricia Williams', action: 'Viewed patient record', resource: 'Patient #7823', timestamp: '2026-03-11 13:42:56', ip: '10.0.1.34' },
];

const controlColor: Record<string, string> = { 'Compliant': 'bg-green-100 text-green-700', 'Needs Attention': 'bg-yellow-100 text-yellow-700', 'Non-Compliant': 'bg-red-100 text-red-700' };

export default function HIPAAPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'controls' | 'baa' | 'breaches' | 'access'>('controls');

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">HIPAA Compliance</h1>
        <p className="text-sm text-[#86868b] mb-6">Risk assessment, BAA management, breach log & access auditing</p>

        <div className="flex gap-2 mb-6">
          {(['controls', 'baa', 'breaches', 'access'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm rounded-lg font-medium ${tab === t ? 'bg-[#065F46] text-white' : 'bg-gray-100 text-[#6e6e73] hover:bg-gray-200'}`}>
              {t === 'controls' ? 'Security Controls' : t === 'baa' ? 'BAA Management' : t === 'breaches' ? 'Breach Log' : 'Access Audit'}
            </button>
          ))}
        </div>

        {tab === 'controls' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-[#f5f5f7]">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Control</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Status</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Last Review</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Notes</th>
              </tr></thead>
              <tbody>
                {securityControls.map((c, i) => (
                  <tr key={i} className="border-t border-gray-50 text-xs">
                    <td className="px-4 py-3 text-[#1d1d1f] font-medium">{c.control}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${controlColor[c.status]}`}>{c.status}</span></td>
                    <td className="px-4 py-3 text-[#86868b]">{c.lastReview}</td>
                    <td className="px-4 py-3 text-[#6e6e73]">{c.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'baa' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Business Associate Agreements</h3>
              <button onClick={() => showToast('New BAA form opened')} className="px-3 py-1.5 bg-[#065F46] text-white text-xs rounded-lg">+ Add BAA</button>
            </div>
            <table className="w-full">
              <thead><tr className="bg-[#f5f5f7]">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Vendor</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Type</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Signed</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Expires</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {baas.map((b, i) => (
                  <tr key={i} className="border-t border-gray-50 text-xs">
                    <td className="px-4 py-3 text-[#1d1d1f] font-medium">{b.vendor}</td>
                    <td className="px-4 py-3 text-[#6e6e73]">{b.type}</td>
                    <td className="px-4 py-3 text-[#86868b]">{b.signed}</td>
                    <td className="px-4 py-3 text-[#86868b]">{b.expires}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${b.status.includes('Renewal') ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'breaches' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Breach Log</h3>
              <button onClick={() => showToast('Breach report form opened')} className="px-3 py-1.5 bg-[#DC2626] text-white text-xs rounded-lg">Report Breach</button>
            </div>
            <table className="w-full">
              <thead><tr className="bg-[#f5f5f7]">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">ID</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Date</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Type</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Affected</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Severity</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Status</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Resolution</th>
              </tr></thead>
              <tbody>
                {breachLog.map((b, i) => (
                  <tr key={i} className="border-t border-gray-50 text-xs">
                    <td className="px-4 py-3 font-mono text-[#065F46]">{b.id}</td>
                    <td className="px-4 py-3 text-[#86868b]">{b.date}</td>
                    <td className="px-4 py-3 text-[#1d1d1f]">{b.type}</td>
                    <td className="px-4 py-3 text-right">{b.individuals}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${b.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{b.severity}</span></td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">{b.status}</span></td>
                    <td className="px-4 py-3 text-[#6e6e73]">{b.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'access' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-sm font-semibold text-[#1d1d1f] px-4 py-3 border-b border-gray-100">Recent Access Audit Log</h3>
            <table className="w-full">
              <thead><tr className="bg-[#f5f5f7]">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">User</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Action</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Resource</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Timestamp</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">IP</th>
              </tr></thead>
              <tbody>
                {accessLog.map((l, i) => (
                  <tr key={i} className="border-t border-gray-50 text-xs">
                    <td className="px-4 py-3 text-[#1d1d1f] font-medium">{l.user}</td>
                    <td className="px-4 py-3 text-[#6e6e73]">{l.action}</td>
                    <td className="px-4 py-3 text-[#6e6e73]">{l.resource}</td>
                    <td className="px-4 py-3 text-[#86868b] font-mono">{l.timestamp}</td>
                    <td className="px-4 py-3 text-[#86868b] font-mono">{l.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
