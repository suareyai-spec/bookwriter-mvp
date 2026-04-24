'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const overallScore = 72;

const categories = [
  { name: 'Administrative Safeguards', score: 78, items: 8 },
  { name: 'Physical Safeguards', score: 65, items: 6 },
  { name: 'Technical Safeguards', score: 71, items: 11 },
];

const riskItems = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  description: [
    'Password policy does not enforce complexity requirements',
    'Lack of encryption on portable devices',
    'No automatic session timeout on EHR workstations',
    'Insufficient backup power for data center',
    'Missing audit trail for PHI access',
    'Incomplete business associate agreements',
    'No formal incident response plan testing',
    'Physical access logs not reviewed regularly',
    'Outdated antivirus signatures on 12 workstations',
    'Missing security awareness training records',
    'No network segmentation for medical devices',
    'Vulnerability scans not performed monthly',
    'Emergency access procedures not documented',
    'Inadequate disposal procedures for electronic media',
    'No formal risk management program documentation',
    'Wireless network using deprecated encryption',
    'Patch management process gaps identified',
    'Lack of data loss prevention controls',
    'Insufficient physical security for server room',
    'No contingency plan testing in past 12 months',
    'Audit controls not monitoring all access points',
    'Missing integrity verification for PHI',
    'Transmission security gaps in email',
    'Access authorization process not documented',
    'Workforce clearance procedures incomplete',
  ][i],
  severity: (['Critical', 'High', 'High', 'Medium', 'High', 'Medium', 'Critical', 'Low', 'High', 'Medium', 'High', 'Medium', 'Medium', 'Low', 'High', 'Critical', 'High', 'Medium', 'High', 'Critical', 'Medium', 'Low', 'High', 'Medium', 'Low'] as const)[i],
  category: (['Technical', 'Technical', 'Technical', 'Physical', 'Technical', 'Administrative', 'Administrative', 'Physical', 'Technical', 'Administrative', 'Technical', 'Technical', 'Administrative', 'Physical', 'Administrative', 'Technical', 'Technical', 'Technical', 'Physical', 'Administrative', 'Technical', 'Technical', 'Technical', 'Administrative', 'Administrative'] as const)[i],
  identifiedDate: `2026-0${1 + (i % 3)}-${String(1 + i).padStart(2, '0')}`,
  status: (['Open', 'In Remediation', 'Open', 'Remediated', 'In Remediation', 'Remediated', 'Open', 'Remediated', 'In Remediation', 'Open', 'Open', 'In Remediation', 'Remediated', 'Remediated', 'Open', 'In Remediation', 'Open', 'In Remediation', 'Open', 'Open', 'In Remediation', 'Remediated', 'Open', 'In Remediation', 'Remediated'] as const)[i],
}));

const securityChecklist = [
  { requirement: 'Risk Analysis (§164.308(a)(1))', status: 'Pass' },
  { requirement: 'Risk Management (§164.308(a)(1))', status: 'Partial' },
  { requirement: 'Workforce Security (§164.308(a)(3))', status: 'Fail' },
  { requirement: 'Information Access Management (§164.308(a)(4))', status: 'Pass' },
  { requirement: 'Security Awareness Training (§164.308(a)(5))', status: 'Pass' },
  { requirement: 'Security Incident Procedures (§164.308(a)(6))', status: 'Partial' },
  { requirement: 'Contingency Plan (§164.308(a)(7))', status: 'Fail' },
  { requirement: 'Access Control (§164.312(a))', status: 'Pass' },
  { requirement: 'Audit Controls (§164.312(b))', status: 'Partial' },
  { requirement: 'Integrity (§164.312(c))', status: 'Pass' },
  { requirement: 'Transmission Security (§164.312(e))', status: 'Partial' },
  { requirement: 'Facility Access Controls (§164.310(a))', status: 'Pass' },
  { requirement: 'Workstation Use (§164.310(b))', status: 'Pass' },
  { requirement: 'Device & Media Controls (§164.310(d))', status: 'Fail' },
];

const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const trendData = months.map((m, i) => ({ month: m, score: 60 + Math.round(Math.sin(i / 2) * 8 + i * 1.2) }));

const sevColor: Record<string, string> = { Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Medium: 'bg-yellow-100 text-yellow-700', Low: 'bg-green-100 text-green-700' };
const statColor: Record<string, string> = { Open: 'bg-red-100 text-red-700', 'In Remediation': 'bg-yellow-100 text-yellow-700', Remediated: 'bg-green-100 text-green-700' };
const checkColor: Record<string, string> = { Pass: 'text-green-600', Partial: 'text-yellow-600', Fail: 'text-red-600' };

export default function RiskAssessmentPage() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? riskItems : riskItems.filter(r => r.status === filter);
  const openCount = riskItems.filter(r => r.status === 'Open').length;
  const remediating = riskItems.filter(r => r.status === 'In Remediation').length;
  const remediated = riskItems.filter(r => r.status === 'Remediated').length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">HIPAA Risk Assessment</h1>
          <p className="text-sm text-[#86868b] mt-1">Comprehensive security risk analysis and compliance tracking</p>
        </div>

        {/* Score + Categories */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
            <p className="text-xs text-[#86868b] mb-2">Overall Risk Score</p>
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke={overallScore >= 80 ? '#16a34a' : overallScore >= 60 ? '#f59e0b' : '#dc2626'} strokeWidth="3" strokeDasharray={`${overallScore} ${100 - overallScore}`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{overallScore}</span>
              </div>
              <span className={`text-xs font-medium ${overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {overallScore >= 80 ? 'Good' : overallScore >= 60 ? 'Fair' : 'Poor'}
              </span>
            </div>
          </div>
          {categories.map(c => (
            <div key={c.name} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
              <p className="text-xs text-[#86868b] mb-1">{c.name}</p>
              <p className={`text-2xl font-bold ${c.score >= 80 ? 'text-green-600' : c.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{c.score}<span className="text-sm font-normal text-[#86868b]">/100</span></p>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.score}%`, backgroundColor: c.score >= 80 ? '#16a34a' : c.score >= 60 ? '#f59e0b' : '#dc2626' }} />
              </div>
              <p className="text-[10px] text-[#86868b] mt-1">{c.items} risk items</p>
            </div>
          ))}
        </div>

        {/* Heatmap-style risk areas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Risk Heat Map</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { area: 'Access Control', level: 3 }, { area: 'Encryption', level: 4 }, { area: 'Audit Logging', level: 2 },
              { area: 'Physical Security', level: 3 }, { area: 'Incident Response', level: 4 }, { area: 'Training', level: 2 },
              { area: 'Data Backup', level: 3 }, { area: 'Network Security', level: 3 }, { area: 'Policy Mgmt', level: 1 },
            ].map(r => (
              <div key={r.area} className={`p-4 rounded-xl text-center ${r.level >= 4 ? 'bg-red-100' : r.level >= 3 ? 'bg-orange-100' : r.level >= 2 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <p className="text-sm font-medium">{r.area}</p>
                <p className={`text-xs mt-1 ${r.level >= 4 ? 'text-red-700' : r.level >= 3 ? 'text-orange-700' : r.level >= 2 ? 'text-yellow-700' : 'text-green-700'}`}>
                  {r.level >= 4 ? 'Critical' : r.level >= 3 ? 'High' : r.level >= 2 ? 'Medium' : 'Low'} Risk
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Vulnerabilities Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Open Vulnerabilities ({filtered.length})</h2>
            <div className="flex gap-2">
              {['All', 'Open', 'In Remediation', 'Remediated'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded-lg ${filter === f ? 'bg-[#065F46] text-white' : 'bg-gray-100 text-[#6e6e73] hover:bg-gray-200'}`}>{f}</button>
              ))}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
              <th className="pb-3 font-medium">#</th><th className="pb-3 font-medium">Description</th><th className="pb-3 font-medium">Severity</th><th className="pb-3 font-medium">Category</th><th className="pb-3 font-medium">Identified</th><th className="pb-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 text-[#86868b]">{r.id}</td>
                  <td className="py-3">{r.description}</td>
                  <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${sevColor[r.severity]}`}>{r.severity}</span></td>
                  <td className="py-3 text-[#6e6e73]">{r.category}</td>
                  <td className="py-3 text-[#86868b]">{r.identifiedDate}</td>
                  <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${statColor[r.status]}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">HIPAA Security Rule Compliance Checklist</h2>
          <div className="grid grid-cols-2 gap-2">
            {securityChecklist.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#f5f5f7] rounded-xl">
                <span className={`text-lg ${checkColor[c.status]}`}>{c.status === 'Pass' ? '✅' : c.status === 'Partial' ? '⚠️' : '❌'}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#1d1d1f]">{c.requirement}</p>
                </div>
                <span className={`text-xs font-medium ${checkColor[c.status]}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Risk Score Trend (12 Months)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[40, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#065F46" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
