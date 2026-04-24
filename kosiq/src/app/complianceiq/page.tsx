'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const complianceScore = 84;
const deadlines = [
  { item: 'Annual HIPAA Risk Assessment', due: '2026-03-31', status: 'In Progress', daysLeft: 20 },
  { item: 'Staff Security Training Q1', due: '2026-03-31', status: 'At Risk', daysLeft: 20 },
  { item: 'BAA Renewal — LabCorp', due: '2026-04-15', status: 'Pending', daysLeft: 35 },
  { item: 'Privacy Policy Review', due: '2026-04-30', status: 'Scheduled', daysLeft: 50 },
  { item: 'CMS Audit Preparation', due: '2026-05-15', status: 'Not Started', daysLeft: 65 },
];

const incidentsByType = [
  { name: 'Privacy', value: 12, color: '#DC2626' },
  { name: 'Security', value: 8, color: '#F97316' },
  { name: 'Clinical', value: 15, color: '#EAB308' },
  { name: 'Administrative', value: 6, color: '#3B82F6' },
];

const deadlineColor: Record<string, string> = { 'In Progress': 'bg-blue-100 text-blue-700', 'At Risk': 'bg-red-100 text-red-700', 'Pending': 'bg-yellow-100 text-yellow-700', 'Scheduled': 'bg-gray-100 text-gray-600', 'Not Started': 'bg-gray-100 text-gray-500' };

export default function ComplianceIQDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">ComplianceIQ Dashboard</h1>
        <p className="text-sm text-[#86868b] mb-8">Regulatory Compliance Management</p>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Compliance Score', value: `${complianceScore}/100`, color: complianceScore >= 80 ? '#22C55E' : '#F97316' },
            { label: 'Open Incidents', value: '41', color: '#DC2626' },
            { label: 'Training Completion', value: '78.4%', color: '#0891B2' },
            { label: 'Upcoming Deadlines', value: '5', color: '#F97316' },
            { label: 'Audit Readiness', value: '87%', color: '#065F46' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] text-[#86868b] mb-1">{m.label}</p>
              <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Compliance Score Gauge</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#f0f0f0" strokeWidth="12" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#065F46" strokeWidth="12" strokeDasharray={`${complianceScore * 4.4} 440`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#065F46]">{complianceScore}</p>
                    <p className="text-xs text-[#86868b]">out of 100</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Incidents by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={incidentsByType} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {incidentsByType.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Training Progress</h3>
            <div className="space-y-3">
              {[
                { name: 'HIPAA Privacy', pct: 92 },
                { name: 'HIPAA Security', pct: 85 },
                { name: 'Fraud & Abuse', pct: 71 },
                { name: 'OSHA Safety', pct: 88 },
                { name: 'Cultural Competency', pct: 64 },
              ].map((t, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#1d1d1f]">{t.name}</span>
                    <span className="text-[#86868b]">{t.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#f0f0f0] rounded-full">
                    <div className="h-2 rounded-full" style={{ width: `${t.pct}%`, backgroundColor: t.pct >= 80 ? '#065F46' : '#F97316' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Upcoming Deadlines</h3>
          <table className="w-full">
            <thead><tr className="text-left text-[10px] font-semibold text-[#86868b] uppercase">
              <th className="pb-2">Item</th><th className="pb-2">Due Date</th><th className="pb-2">Days Left</th><th className="pb-2">Status</th>
            </tr></thead>
            <tbody>
              {deadlines.map((d, i) => (
                <tr key={i} className="border-t border-gray-50 text-xs">
                  <td className="py-2 text-[#1d1d1f] font-medium">{d.item}</td>
                  <td className="py-2 text-[#86868b]">{d.due}</td>
                  <td className="py-2"><span className={`font-semibold ${d.daysLeft <= 21 ? 'text-[#DC2626]' : 'text-[#1d1d1f]'}`}>{d.daysLeft}</span></td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${deadlineColor[d.status] || ''}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
