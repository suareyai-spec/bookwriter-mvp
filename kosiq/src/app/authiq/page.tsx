'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const statusCounts = [
  { name: 'Pending', value: 42, color: '#F97316' },
  { name: 'Approved', value: 186, color: '#22C55E' },
  { name: 'Denied', value: 28, color: '#DC2626' },
  { name: 'Expired', value: 12, color: '#9CA3AF' },
  { name: 'In Review', value: 34, color: '#0891B2' },
];

const payerResponseTimes = [
  { payer: 'Simply Health', avgDays: 3.2 }, { payer: 'Sunshine Health', avgDays: 4.8 },
  { payer: 'Humana', avgDays: 5.1 }, { payer: 'Florida Blue', avgDays: 6.3 },
  { payer: 'WellCare', avgDays: 4.5 },
];

const expiringSoon = [
  { patient: 'Maria Santos', procedure: 'Knee Replacement', payer: 'Simply Health', authNum: 'PA-2026-1234', expires: '2026-03-15' },
  { patient: 'Robert Chen', procedure: 'MRI Brain w/wo Contrast', payer: 'Humana', authNum: 'PA-2026-1189', expires: '2026-03-17' },
  { patient: 'James Williams', procedure: 'Cardiac Catheterization', payer: 'Sunshine Health', authNum: 'PA-2026-1201', expires: '2026-03-18' },
  { patient: 'Patricia Brown', procedure: 'Spinal Fusion', payer: 'Florida Blue', authNum: 'PA-2026-1156', expires: '2026-03-20' },
  { patient: 'John Garcia', procedure: 'CT Abdomen/Pelvis', payer: 'WellCare', authNum: 'PA-2026-1267', expires: '2026-03-22' },
];

export default function AuthIQDashboard() {
  const [period, setPeriod] = useState('mtd');
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-semibold text-[#1d1d1f]">AuthIQ Dashboard</h1><p className="text-sm text-[#86868b]">Prior Authorization Management</p></div>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="mtd">Month to Date</option><option value="ytd">Year to Date</option>
          </select>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Pending Auths', value: '42', color: '#F97316' },
            { label: 'Approved', value: '186', color: '#22C55E' },
            { label: 'Denied', value: '28', color: '#DC2626' },
            { label: 'Avg Turnaround', value: '4.2 days', color: '#0891B2' },
            { label: 'Expiring (7d)', value: '5', color: '#EAB308' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] text-[#86868b] mb-1">{m.label}</p>
              <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Auth Status Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusCounts.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 col-span-2">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Payer Avg Response Time (Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={payerResponseTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="payer" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avgDays" fill="#0891B2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">⚠️ Expiring Soon (Next 14 Days)</h3>
          <table className="w-full">
            <thead><tr className="text-left text-[10px] font-semibold text-[#86868b] uppercase">
              <th className="pb-2">Patient</th><th className="pb-2">Procedure</th><th className="pb-2">Payer</th><th className="pb-2">Auth #</th><th className="pb-2">Expires</th>
            </tr></thead>
            <tbody>
              {expiringSoon.map((e, i) => (
                <tr key={i} className="border-t border-gray-50 text-xs">
                  <td className="py-2 text-[#1d1d1f] font-medium">{e.patient}</td>
                  <td className="py-2 text-[#6e6e73]">{e.procedure}</td>
                  <td className="py-2 text-[#6e6e73]">{e.payer}</td>
                  <td className="py-2 font-mono text-[#0891B2]">{e.authNum}</td>
                  <td className="py-2 text-[#DC2626] font-semibold">{e.expires}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
