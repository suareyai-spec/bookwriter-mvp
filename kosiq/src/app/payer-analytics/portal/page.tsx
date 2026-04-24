'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const riskDistribution = [
  { range: '0.0-0.5', count: 2340, color: '#22C55E' },
  { range: '0.5-1.0', count: 5670, color: '#3B82F6' },
  { range: '1.0-1.5', count: 4520, color: '#F97316' },
  { range: '1.5-2.0', count: 2890, color: '#DC2626' },
  { range: '2.0+', count: 1012, color: '#7C3AED' },
];

const costTrends = [
  { month: 'Jul', pmpm: 412, target: 400 }, { month: 'Aug', pmpm: 398, target: 400 },
  { month: 'Sep', pmpm: 425, target: 400 }, { month: 'Oct', pmpm: 389, target: 400 },
  { month: 'Nov', pmpm: 415, target: 400 }, { month: 'Dec', pmpm: 445, target: 400 },
  { month: 'Jan', pmpm: 432, target: 400 }, { month: 'Feb', pmpm: 408, target: 400 },
  { month: 'Mar', pmpm: 395, target: 400 },
];

const qualityMeasures = [
  { measure: 'Diabetes HbA1c Control', rate: 72.4, target: 75, star: 3 },
  { measure: 'Controlling Blood Pressure', rate: 68.1, target: 70, star: 3 },
  { measure: 'Breast Cancer Screening', rate: 81.2, target: 78, star: 4 },
  { measure: 'Colorectal Screening', rate: 65.8, target: 72, star: 2 },
  { measure: 'Medication Adherence (DM)', rate: 84.5, target: 80, star: 4 },
  { measure: 'Fall Risk Management', rate: 78.9, target: 75, star: 4 },
  { measure: 'Depression Remission', rate: 42.3, target: 50, star: 2 },
  { measure: 'Statin Therapy', rate: 76.1, target: 75, star: 3 },
];

const careGaps = [
  { gap: 'Annual Wellness Visit', open: 4320, total: 16432, pct: 26.3 },
  { gap: 'HbA1c Testing', open: 1890, total: 5670, pct: 33.3 },
  { gap: 'Eye Exam (Diabetics)', open: 2340, total: 5670, pct: 41.3 },
  { gap: 'Mammography', open: 1560, total: 6780, pct: 23.0 },
  { gap: 'Colorectal Screening', open: 3210, total: 8900, pct: 36.1 },
  { gap: 'Flu Vaccination', open: 5670, total: 16432, pct: 34.5 },
];

const planTypes = ['All Plans', 'HMO', 'PPO', 'Medicare Advantage', 'Medicaid'];

export default function PayerPortalPage() {
  const [dateRange, setDateRange] = useState('ytd');
  const [planType, setPlanType] = useState('All Plans');

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Payer Portal</h1>
            <p className="text-sm text-[#86868b]">Simulated payer view — population overview & performance metrics</p>
          </div>
          <div className="flex gap-2">
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <option value="ytd">Year to Date</option><option value="q1">Q1 2026</option><option value="2025">Full Year 2025</option>
            </select>
            <select value={planType} onChange={e => setPlanType(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              {planTypes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Members', value: '16,432', color: '#F97316' },
            { label: 'Avg Risk Score', value: '1.087', color: '#7C3AED' },
            { label: 'PMPM Cost', value: '$412', color: '#DC2626' },
            { label: 'ER Rate / 1K', value: '298', color: '#F97316' },
            { label: 'Admission Rate / 1K', value: '142', color: '#3B82F6' },
            { label: 'Readmission Rate', value: '11.2%', color: '#DC2626' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] text-[#86868b] mb-1">{m.label}</p>
              <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Member Risk Score Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">PMPM Cost Trend vs Target</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={costTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: number) => `$${v}`} />
                <Line type="monotone" dataKey="pmpm" stroke="#F97316" strokeWidth={2} name="Actual PMPM" />
                <Line type="monotone" dataKey="target" stroke="#86868b" strokeWidth={1} strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Quality Measure Performance</h3>
            <table className="w-full">
              <thead><tr className="text-left text-[10px] font-semibold text-[#86868b] uppercase">
                <th className="pb-2">Measure</th><th className="pb-2 text-right">Rate</th><th className="pb-2 text-right">Target</th><th className="pb-2 text-center">Stars</th>
              </tr></thead>
              <tbody>
                {qualityMeasures.map((m, i) => (
                  <tr key={i} className="border-t border-gray-50 text-xs">
                    <td className="py-2 text-[#1d1d1f]">{m.measure}</td>
                    <td className="py-2 text-right font-semibold" style={{ color: m.rate >= m.target ? '#22C55E' : '#DC2626' }}>{m.rate}%</td>
                    <td className="py-2 text-right text-[#86868b]">{m.target}%</td>
                    <td className="py-2 text-center">{'★'.repeat(m.star)}{'☆'.repeat(5 - m.star)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Open Care Gaps</h3>
            <table className="w-full">
              <thead><tr className="text-left text-[10px] font-semibold text-[#86868b] uppercase">
                <th className="pb-2">Care Gap</th><th className="pb-2 text-right">Open</th><th className="pb-2 text-right">Eligible</th><th className="pb-2 text-right">Gap Rate</th>
              </tr></thead>
              <tbody>
                {careGaps.map((g, i) => (
                  <tr key={i} className="border-t border-gray-50 text-xs">
                    <td className="py-2 text-[#1d1d1f]">{g.gap}</td>
                    <td className="py-2 text-right font-semibold text-[#DC2626]">{g.open.toLocaleString()}</td>
                    <td className="py-2 text-right text-[#86868b]">{g.total.toLocaleString()}</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-[#f0f0f0] rounded-full"><div className="h-1.5 rounded-full bg-[#DC2626]" style={{ width: `${g.pct}%` }} /></div>
                        <span className="text-[#6e6e73]">{g.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Utilization Metrics Summary</h3>
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: 'ER Visits / 1K Members', value: '298', trend: '+3.2%', trendUp: true },
              { label: 'Inpatient Admissions / 1K', value: '142', trend: '-1.8%', trendUp: false },
              { label: '30-Day Readmission Rate', value: '11.2%', trend: '+0.5%', trendUp: true },
              { label: 'Avg Length of Stay', value: '4.3 days', trend: '-0.2 days', trendUp: false },
            ].map((u, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-[#1d1d1f]">{u.value}</p>
                <p className="text-xs text-[#86868b] mt-1">{u.label}</p>
                <p className={`text-xs mt-1 font-medium ${u.trendUp ? 'text-[#DC2626]' : 'text-[#22C55E]'}`}>{u.trend}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
