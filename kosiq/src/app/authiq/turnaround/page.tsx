'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend, Cell } from 'recharts';

const payerTurnaround = [
  { payer: 'Aetna', avgDays: 1.8, compliance: 92, totalAuths: 245, approvalRate: 78 },
  { payer: 'BCBS', avgDays: 2.3, compliance: 76, totalAuths: 312, approvalRate: 82 },
  { payer: 'Cigna', avgDays: 3.1, compliance: 58, totalAuths: 187, approvalRate: 71 },
  { payer: 'UHC', avgDays: 1.5, compliance: 95, totalAuths: 298, approvalRate: 85 },
  { payer: 'Humana', avgDays: 2.7, compliance: 68, totalAuths: 156, approvalRate: 74 },
  { payer: 'Medicare', avgDays: 1.2, compliance: 98, totalAuths: 420, approvalRate: 89 },
  { payer: 'Medicaid', avgDays: 2.0, compliance: 88, totalAuths: 198, approvalRate: 76 },
];

const distribution = [
  { range: '<24h', count: 312, pct: 19 },
  { range: '1-2 days', count: 687, pct: 42 },
  { range: '3-5 days', count: 445, pct: 27 },
  { range: '5+ days', count: 192, pct: 12 },
];

const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const trendData = months.map((m, i) => ({
  month: m,
  avgDays: 2.0 + Math.round(Math.sin(i / 2) * 8) / 10,
  complianceRate: 78 + Math.round(Math.cos(i / 3) * 10),
}));

const overdueAuths = [
  { authNumber: 'PA-2026-03012', patient: 'James Wilson', payer: 'Cigna', submitted: '2026-03-05', daysOverdue: 5, service: 'MRI Brain' },
  { authNumber: 'PA-2026-03008', patient: 'Lisa Chen', payer: 'Humana', submitted: '2026-03-03', daysOverdue: 7, service: 'Total Knee Replacement' },
  { authNumber: 'PA-2026-03015', patient: 'Robert Brown', payer: 'BCBS', submitted: '2026-03-06', daysOverdue: 4, service: 'Cardiac Catheterization' },
  { authNumber: 'PA-2026-03020', patient: 'Emily Davis', payer: 'Cigna', submitted: '2026-03-04', daysOverdue: 6, service: 'Spinal Fusion' },
  { authNumber: 'PA-2026-03022', patient: 'Sarah Johnson', payer: 'Humana', submitted: '2026-03-07', daysOverdue: 3, service: 'Upper GI Endoscopy' },
];

const overallCompliance = 82;

export default function TurnaroundPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Turnaround Time Analytics</h1>
          <p className="text-sm text-[#86868b] mt-1">Prior authorization processing speed and CMS compliance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
            <p className="text-xs text-[#86868b] mb-1">Avg Turnaround</p>
            <p className="text-3xl font-bold text-[#1d1d1f]">2.1 <span className="text-sm font-normal text-[#86868b]">days</span></p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
            <p className="text-xs text-[#86868b] mb-2">CMS 2-Day Compliance</p>
            <div className="flex items-end gap-3">
              <p className={`text-3xl font-bold ${overallCompliance >= 80 ? 'text-green-600' : 'text-red-600'}`}>{overallCompliance}%</p>
              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${overallCompliance}%`, backgroundColor: overallCompliance >= 80 ? '#16a34a' : '#dc2626' }} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
            <p className="text-xs text-[#86868b] mb-1">Total Auths (12mo)</p>
            <p className="text-3xl font-bold text-[#1d1d1f]">1,816</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
            <p className="text-xs text-[#86868b] mb-1">Overdue Auths</p>
            <p className="text-3xl font-bold text-red-600">{overdueAuths.length}</p>
            <p className="text-[10px] text-[#86868b]">Past CMS deadline</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Avg by Payer */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Average Turnaround by Payer</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payerTurnaround}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="payer" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" d" />
                  <Tooltip />
                  <Bar dataKey="avgDays" name="Avg Days" radius={[4, 4, 0, 0]}>
                    {payerTurnaround.map((entry, i) => (
                      <Cell key={i} fill={entry.avgDays <= 2 ? '#16a34a' : entry.avgDays <= 3 ? '#f59e0b' : '#dc2626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Turnaround Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number, name: string) => [name === 'count' ? v + ' auths' : v + '%', name === 'count' ? 'Count' : 'Percentage']} />
                  <Bar dataKey="count" name="Count" fill="#0891B2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Trend Over Time (12 Months)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} unit=" d" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avgDays" name="Avg Days" stroke="#0891B2" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="complianceRate" name="Compliance %" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payer Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Payer Comparison</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
              <th className="pb-3 font-medium">Payer</th><th className="pb-3 font-medium">Avg Days</th><th className="pb-3 font-medium">Compliance %</th><th className="pb-3 font-medium">Total Auths</th><th className="pb-3 font-medium">Approval Rate</th>
            </tr></thead>
            <tbody>
              {payerTurnaround.map(p => (
                <tr key={p.payer} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 font-medium">{p.payer}</td>
                  <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${p.avgDays <= 2 ? 'bg-green-100 text-green-700' : p.avgDays <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.avgDays}d</span></td>
                  <td className="py-3">{p.compliance}%</td>
                  <td className="py-3">{p.totalAuths}</td>
                  <td className="py-3">{p.approvalRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-200/60 p-6 border-l-4 border-l-red-500">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">⚠ Overdue Authorizations</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
              <th className="pb-3 font-medium">Auth #</th><th className="pb-3 font-medium">Patient</th><th className="pb-3 font-medium">Payer</th><th className="pb-3 font-medium">Service</th><th className="pb-3 font-medium">Submitted</th><th className="pb-3 font-medium">Days Overdue</th>
            </tr></thead>
            <tbody>
              {overdueAuths.map(a => (
                <tr key={a.authNumber} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-[#0891B2]">{a.authNumber}</td>
                  <td className="py-3">{a.patient}</td>
                  <td className="py-3 text-[#6e6e73]">{a.payer}</td>
                  <td className="py-3">{a.service}</td>
                  <td className="py-3 text-[#86868b]">{a.submitted}</td>
                  <td className="py-3"><span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">{a.daysOverdue}d overdue</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
