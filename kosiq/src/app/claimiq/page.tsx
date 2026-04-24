'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const trendData = [
  { month: 'Jul', submitted: 2840, paid: 2450, denied: 312 },
  { month: 'Aug', submitted: 3120, paid: 2780, denied: 285 },
  { month: 'Sep', submitted: 2960, paid: 2640, denied: 298 },
  { month: 'Oct', submitted: 3340, paid: 2980, denied: 310 },
  { month: 'Nov', submitted: 3180, paid: 2870, denied: 267 },
  { month: 'Dec', submitted: 2780, paid: 2510, denied: 234 },
  { month: 'Jan', submitted: 3450, paid: 3120, denied: 289 },
  { month: 'Feb', submitted: 3280, paid: 2960, denied: 276 },
  { month: 'Mar', submitted: 3100, paid: 2820, denied: 245 },
];

const statusDistribution = [
  { name: 'Paid', value: 2820, color: '#22C55E' },
  { name: 'Submitted', value: 480, color: '#3B82F6' },
  { name: 'Denied', value: 245, color: '#DC2626' },
  { name: 'Draft', value: 120, color: '#9CA3AF' },
  { name: 'Appealed', value: 85, color: '#F97316' },
];

const arBuckets = [
  { range: '0-30 days', amount: 1240000 },
  { range: '31-60 days', amount: 890000 },
  { range: '61-90 days', amount: 456000 },
  { range: '91-120 days', amount: 234000 },
  { range: '120+ days', amount: 178000 },
];

export default function ClaimIQDashboard() {
  const [period, setPeriod] = useState('ytd');
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">ClaimIQ Dashboard</h1>
            <p className="text-sm text-[#86868b]">Claims Processing Engine</p>
          </div>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="ytd">Year to Date</option><option value="mtd">Month to Date</option><option value="q1">Q1 2026</option>
          </select>
        </div>

        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Claims', value: '3,750', color: '#7C3AED' },
            { label: 'Clean Claim Rate', value: '94.2%', color: '#22C55E' },
            { label: 'Denial Rate', value: '7.1%', color: '#DC2626' },
            { label: 'Days in AR', value: '32.4', color: '#F97316' },
            { label: 'Total Charges', value: '$8.7M', color: '#7C3AED' },
            { label: 'Total Payments', value: '$7.2M', color: '#059669' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] text-[#86868b] mb-1">{m.label}</p>
              <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 col-span-2">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Claims Volume Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="submitted" stroke="#7C3AED" strokeWidth={2} name="Submitted" />
                <Line type="monotone" dataKey="paid" stroke="#22C55E" strokeWidth={2} name="Paid" />
                <Line type="monotone" dataKey="denied" stroke="#DC2626" strokeWidth={2} name="Denied" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Accounts Receivable Aging</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={arBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v / 1000}K`} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
