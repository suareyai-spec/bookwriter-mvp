'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Volatility and growth are time-series, keep as enrichment data
const volatility = [
  { month: 'Feb 25', new: 85, disenrolled: -42 }, { month: 'Mar 25', new: 92, disenrolled: -38 },
  { month: 'Apr 25', new: 78, disenrolled: -45 }, { month: 'May 25', new: 105, disenrolled: -35 },
  { month: 'Jun 25', new: 88, disenrolled: -50 }, { month: 'Jul 25', new: 95, disenrolled: -40 },
  { month: 'Aug 25', new: 110, disenrolled: -32 }, { month: 'Sep 25', new: 98, disenrolled: -48 },
  { month: 'Oct 25', new: 82, disenrolled: -55 }, { month: 'Nov 25', new: 105, disenrolled: -38 },
  { month: 'Dec 25', new: 75, disenrolled: -60 }, { month: 'Jan 26', new: 120, disenrolled: -45 },
  { month: 'Feb 26', new: 90, disenrolled: -35 },
];

const growth = [
  { month: 'Feb 25', total: 1850 }, { month: 'Mar 25', total: 1892 }, { month: 'Apr 25', total: 1908 },
  { month: 'May 25', total: 1935 }, { month: 'Jun 25', total: 1948 }, { month: 'Jul 25', total: 1960 },
  { month: 'Aug 25', total: 1978 }, { month: 'Sep 25', total: 1985 }, { month: 'Oct 25', total: 1990 },
  { month: 'Nov 25', total: 1998 }, { month: 'Dec 25', total: 2000 }, { month: 'Jan 26', total: 2020 },
  { month: 'Feb 26', total: 2050 },
];

export default function MembershipPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/membership').then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const { summary, byHP, byCenter, dataQuality } = data;

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Membership</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Membership', value: summary.total.toLocaleString(), color: '#1d1d1f' },
            { label: 'Medicare', value: summary.medicare.toLocaleString(), color: '#0071e3' },
            { label: 'Medicaid', value: summary.medicaid.toLocaleString(), color: '#34c759' },
            { label: 'Commercial', value: summary.commercial.toLocaleString(), color: '#ff9f0a' },
            { label: 'FFS', value: summary.ffs.toLocaleString(), color: '#af52de' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-semibold mt-2" style={{ color: kpi.color }}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Data Quality Cards */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Missing Address', value: dataQuality.missingAddress },
            { label: 'Missing Phone', value: dataQuality.missingPhone },
            { label: 'Unassigned PCP', value: dataQuality.unassignedPCP },
            { label: 'Invalid PCP', value: dataQuality.invalidPCP },
            { label: 'Out of Service Area', value: dataQuality.outOfArea },
            { label: 'Duplicates', value: dataQuality.duplicates },
          ].map((q, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] text-[#86868b] uppercase tracking-wider">{q.label}</p>
              <p className="text-xl font-semibold text-[#1d1d1f] mt-1">{q.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">By Health Plan</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byHP} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#86868b' }} />
                <YAxis type="category" dataKey="plan" tick={{ fontSize: 11, fill: '#86868b' }} width={120} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Bar dataKey="members" fill="#0071e3" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">By Medical Center (Top 10)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byCenter} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#86868b' }} />
                <YAxis type="category" dataKey="center" tick={{ fontSize: 9, fill: '#86868b' }} width={170} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Bar dataKey="members" fill="#34c759" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Membership Volatility</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={volatility}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#86868b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#86868b' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Legend />
                <Bar dataKey="new" fill="#34c759" name="New" radius={[4, 4, 0, 0]} />
                <Bar dataKey="disenrolled" fill="#ff3b30" name="Disenrolled" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Total Membership Growth (13 Months)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#86868b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#86868b' }} domain={[1800, 2100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Bar dataKey="total" fill="#0071e3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
