'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

const approvalByPayer = [
  { payer: 'Simply Health', rate: 87.2, avgDays: 3.2, total: 156 },
  { payer: 'Sunshine Health', rate: 78.5, avgDays: 4.8, total: 124 },
  { payer: 'Humana', rate: 82.1, avgDays: 5.1, total: 89 },
  { payer: 'Florida Blue', rate: 71.3, avgDays: 6.3, total: 67 },
  { payer: 'WellCare', rate: 80.4, avgDays: 4.5, total: 52 },
];

const mostDenied = [
  { procedure: 'PET Scan (78815)', denialRate: 34.2, count: 23 },
  { procedure: 'Spinal Fusion (22633)', denialRate: 28.7, count: 18 },
  { procedure: 'MRI Brain (70553)', denialRate: 22.1, count: 31 },
  { procedure: 'CT Abd/Pelvis (74177)', denialRate: 18.5, count: 42 },
  { procedure: 'Cardiac Cath (93458)', denialRate: 15.3, count: 26 },
  { procedure: 'Hip Replace (27130)', denialRate: 12.8, count: 15 },
];

const monthlyTrend = [
  { month: 'Jul', approved: 78, denied: 12 }, { month: 'Aug', approved: 85, denied: 14 },
  { month: 'Sep', approved: 72, denied: 11 }, { month: 'Oct', approved: 91, denied: 16 },
  { month: 'Nov', approved: 88, denied: 13 }, { month: 'Dec', approved: 76, denied: 10 },
  { month: 'Jan', approved: 94, denied: 15 }, { month: 'Feb', approved: 82, denied: 12 },
  { month: 'Mar', approved: 79, denied: 11 },
];

const appealSuccessRates = [
  { reason: 'Medical Necessity', rate: 68, total: 34 },
  { reason: 'Missing Clinical Data', rate: 82, total: 22 },
  { reason: 'Not Covered', rate: 24, total: 17 },
  { reason: 'Out of Network', rate: 45, total: 11 },
  { reason: 'Experimental', rate: 31, total: 8 },
];

export default function AuthAnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Authorization Analytics</h1>
        <p className="text-sm text-[#86868b] mb-6">Approval rates, turnaround times & denial analysis</p>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Overall Approval Rate', value: '81.2%', color: '#22C55E' },
            { label: 'Avg Days to Decision', value: '4.6', color: '#0891B2' },
            { label: 'Appeal Success Rate', value: '54.3%', color: '#7C3AED' },
            { label: 'Auto-Approval Rate', value: '23.8%', color: '#059669' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Approval Rate by Payer</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={approvalByPayer}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="payer" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="rate" fill="#0891B2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Monthly Approval/Denial Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="approved" stroke="#22C55E" strokeWidth={2} name="Approved" />
                <Line type="monotone" dataKey="denied" stroke="#DC2626" strokeWidth={2} name="Denied" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Most Denied Procedures</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mostDenied} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <YAxis dataKey="procedure" type="category" tick={{ fontSize: 9 }} width={140} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="denialRate" fill="#DC2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Appeal Success by Denial Reason</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={appealSuccessRates} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <YAxis dataKey="reason" type="category" tick={{ fontSize: 9 }} width={130} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="rate" fill="#7C3AED" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
