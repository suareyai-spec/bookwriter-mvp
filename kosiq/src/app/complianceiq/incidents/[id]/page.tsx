'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const incidents = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  caseNumber: `CI-2026-${String(200 + i).padStart(4, '0')}`,
  type: ['Data Breach', 'Unauthorized Access', 'Lost Device', 'Improper Disposal', 'Phishing Attack', 'Misdirected PHI', 'System Vulnerability', 'Policy Violation', 'Physical Security', 'Access Control Failure'][i],
  severity: (['Critical', 'High', 'Medium', 'Low', 'High', 'Medium', 'Critical', 'Low', 'Medium', 'High'] as const)[i],
  status: (['Open', 'Under Investigation', 'Remediation', 'Closed', 'Under Investigation', 'Closed', 'Open', 'Closed', 'Remediation', 'Under Investigation'] as const)[i],
  reporter: ['Jane Smith', 'Mike Johnson', 'Sarah Lee', 'Tom Davis', 'Amy Wilson'][i % 5],
  reportedDate: `2026-0${1 + (i % 3)}-${String(5 + i * 2).padStart(2, '0')}`,
  description: [
    'Unauthorized external access to patient records detected via anomalous login patterns from foreign IP addresses.',
    'Employee accessed records of 47 patients without legitimate business need. Activity flagged by access monitoring system.',
    'Company laptop containing unencrypted PHI for 200+ patients was reported stolen from employee vehicle.',
    'Paper records containing PHI found in regular trash bin instead of secure shredding receptacle.',
    'Multiple staff members received targeted phishing emails impersonating IT department, 3 clicked malicious links.',
    'Fax containing lab results for Patient A was accidentally sent to wrong physician office.',
    'Critical vulnerability discovered in patient portal allowing potential unauthorized access to medical records.',
    'Staff member shared login credentials with temporary contractor, violating access control policy.',
    'Server room door found propped open during after-hours cleaning, security camera was non-functional.',
    'Former employee account remained active 30 days after termination, accessed 12 patient records.',
  ][i],
  investigationTimeline: [
    { date: `2026-0${1 + (i % 3)}-${String(5 + i * 2).padStart(2, '0')}`, entry: 'Incident reported and logged', by: ['Jane Smith', 'Mike Johnson', 'Sarah Lee', 'Tom Davis', 'Amy Wilson'][i % 5] },
    { date: `2026-0${1 + (i % 3)}-${String(6 + i * 2).padStart(2, '0')}`, entry: 'Initial assessment completed. Severity classified.', by: 'Compliance Officer' },
    { date: `2026-0${1 + (i % 3)}-${String(8 + i * 2).padStart(2, '0')}`, entry: 'Investigation team assembled. Evidence collection initiated.', by: 'Privacy Officer' },
    { date: `2026-0${2 + (i % 2)}-${String(1 + i).padStart(2, '0')}`, entry: 'Root cause analysis in progress. Interviews conducted with involved parties.', by: 'Compliance Officer' },
    ...(i % 3 === 0 ? [] : [{ date: `2026-0${2 + (i % 2)}-${String(10 + i).padStart(2, '0')}`, entry: 'Corrective actions identified and implementation started.', by: 'IT Security' }]),
  ],
  rootCause: [
    'Weak password policy allowed brute-force attack on remote access portal.',
    'Insufficient access logging and monitoring; role-based access not properly configured.',
    'Lack of full-disk encryption policy for mobile devices; inadequate physical security training.',
    'Insufficient training on proper PHI disposal procedures; missing signage near disposal bins.',
    'No multi-factor authentication on email; outdated phishing awareness training.',
    'Manual fax number entry without verification step; no fax cover sheet with confirmation.',
    'Delayed software patching; vulnerability scan not run in 60+ days.',
    'No automated credential rotation; lax enforcement of access control policies.',
    'Inadequate physical security controls; broken door sensor not reported for 2 weeks.',
    'No automated account deprovisioning process tied to HR termination workflow.',
  ][i],
  correctiveActions: [
    { action: 'Implement stronger password policy', assignee: 'IT Security', dueDate: '2026-03-15', status: 'In Progress' },
    { action: 'Deploy multi-factor authentication', assignee: 'IT Infrastructure', dueDate: '2026-03-20', status: 'Not Started' },
    { action: 'Conduct staff retraining', assignee: 'Compliance', dueDate: '2026-03-10', status: i < 5 ? 'Completed' : 'In Progress' },
    { action: 'Update policies and procedures', assignee: 'Privacy Officer', dueDate: '2026-04-01', status: 'Not Started' },
  ],
  affectedPatients: i * 15 + 5,
  affectedPatientList: Array.from({ length: Math.min(5, i * 3 + 2) }, (_, j) => ({
    name: ['Maria Santos', 'James Wilson', 'Lisa Chen', 'Robert Brown', 'Emily Davis'][j % 5],
    mrn: `MRN-${10000 + i * 100 + j}`,
    notified: j < 3,
  })),
  ocrReported: i < 4,
  stateReported: i < 3,
  resolution: i % 3 === 2 ? 'All corrective actions implemented. Access controls strengthened. Staff retrained. No further unauthorized access detected. Monitoring period of 90 days initiated.' : null,
  lessonsLearned: i % 3 === 2 ? 'Automated account deprovisioning must be tied to HR systems. Regular access audits should be conducted monthly rather than quarterly. Phishing simulation exercises should be conducted monthly.' : null,
}));

const sevColor: Record<string, string> = { Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Medium: 'bg-yellow-100 text-yellow-700', Low: 'bg-green-100 text-green-700' };
const statColor: Record<string, string> = { Open: 'bg-blue-100 text-blue-700', 'Under Investigation': 'bg-purple-100 text-purple-700', Remediation: 'bg-yellow-100 text-yellow-700', Closed: 'bg-gray-100 text-gray-600' };
const actColor: Record<string, string> = { Completed: 'bg-green-100 text-green-700', 'In Progress': 'bg-yellow-100 text-yellow-700', 'Not Started': 'bg-red-100 text-red-700' };

export default function IncidentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const inc = incidents.find(i => i.id === id) || incidents[0];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <button onClick={() => router.push('/complianceiq/incidents')} className="text-sm text-[#065F46] hover:underline">← Back to Incidents</button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#1d1d1f]">{inc.caseNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${sevColor[inc.severity]}`}>{inc.severity}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statColor[inc.status]}`}>{inc.status}</span>
          </div>
          <p className="text-sm font-medium text-[#6e6e73]">{inc.type}</p>
          <div className="flex gap-6 mt-2 text-xs text-[#86868b]">
            <span>Reporter: <strong className="text-[#1d1d1f]">{inc.reporter}</strong></span>
            <span>Reported: <strong className="text-[#1d1d1f]">{inc.reportedDate}</strong></span>
            <span>Affected Patients: <strong className="text-[#1d1d1f]">{inc.affectedPatients}</strong></span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">Description & Circumstances</h2>
          <p className="text-sm text-[#6e6e73]">{inc.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Investigation Timeline</h2>
            <div className="space-y-4">
              {inc.investigationTimeline.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-[#065F46]" />
                    {i < inc.investigationTimeline.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#1d1d1f]">{t.date}</p>
                    <p className="text-xs text-[#6e6e73]">{t.entry}</p>
                    <p className="text-[10px] text-[#86868b]">By: {t.by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Root Cause */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">Root Cause Analysis</h2>
            <p className="text-sm text-[#6e6e73] mb-6">{inc.rootCause}</p>

            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">Regulatory Reporting</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${inc.ocrReported ? 'bg-green-500' : 'bg-red-500'}`}>{inc.ocrReported ? '✓' : '✕'}</span>
                <span>OCR (HHS) Reported</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${inc.stateReported ? 'bg-green-500' : 'bg-red-500'}`}>{inc.stateReported ? '✓' : '✕'}</span>
                <span>State Authority Reported</span>
              </div>
            </div>
          </div>
        </div>

        {/* Corrective Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Corrective Actions</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
              <th className="pb-3 font-medium">Action</th><th className="pb-3 font-medium">Assignee</th><th className="pb-3 font-medium">Due Date</th><th className="pb-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {inc.correctiveActions.map((a, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3">{a.action}</td>
                  <td className="py-3 text-[#6e6e73]">{a.assignee}</td>
                  <td className="py-3 text-[#86868b]">{a.dueDate}</td>
                  <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${actColor[a.status]}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Affected Patients */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Affected Patients ({inc.affectedPatients} total, showing sample)</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
              <th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">MRN</th><th className="pb-3 font-medium">Notified</th>
            </tr></thead>
            <tbody>
              {inc.affectedPatientList.map((p, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 font-medium">{p.name}</td>
                  <td className="py-3 font-mono text-xs">{p.mrn}</td>
                  <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${p.notified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.notified ? 'Yes' : 'No'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resolution */}
        {inc.resolution && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">Resolution</h2>
            <p className="text-sm text-[#6e6e73] mb-4">{inc.resolution}</p>
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-1">Lessons Learned</h3>
            <p className="text-sm text-[#6e6e73]">{inc.lessonsLearned}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
