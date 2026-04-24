'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0071e3', '#5856d6', '#af52de', '#64d2ff', '#34c759', '#ff9f0a', '#ff6482', '#e879f9'];
const CAT_COLORS: Record<string, string> = {
  Pharmacy: '#5856d6', Inpatient: '#ff6482', ER: '#ff9f0a', Specialist: '#ff9f0a',
  'PCP Visit': '#34c759', Lab: '#64d2ff', Imaging: '#0071e3', DME: '#af52de',
};

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

const tooltipStyle = { background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setData);
  }, []);

  if (!data) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-12 h-12 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const categories = Object.keys(data.costByCategory[0] || {}).filter(k => k !== 'month');

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Cost Analytics</h1>
        <p className="text-base text-[#86868b] mt-1">Population-level cost driver analysis</p>
      </div>

      <div className="glass-card p-6 mb-6">
        <h3 className="text-sm font-semibold mb-5 text-[#6e6e73] uppercase tracking-wider">Cost by Category Over Time</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data.costByCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fill: '#86868b', fontSize: 11 }} tickFormatter={v => v.split('-')[1]} />
            <YAxis tick={{ fill: '#86868b', fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any, name: any) => [formatCurrency(v), name]} />
            {categories.map((cat, i) => (
              <Area key={cat} type="monotone" dataKey={cat} stackId="1"
                stroke={CAT_COLORS[cat] || COLORS[i % COLORS.length]}
                fill={CAT_COLORS[cat] || COLORS[i % COLORS.length]} fillOpacity={0.5} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 mt-3 justify-center">
          {categories.map((cat, i) => (
            <div key={cat} className="flex items-center gap-1.5 text-xs text-[#6e6e73]">
              <div className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[cat] || COLORS[i % COLORS.length] }} />
              {cat}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-5 text-[#6e6e73] uppercase tracking-wider">Top 10 Diagnosis Codes by Cost</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topDiagnoses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fill: '#86868b', fontSize: 10 }} tickFormatter={v => formatCurrency(v)} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#86868b', fontSize: 10 }} width={140} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(v), 'Cost']} />
              <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                {data.topDiagnoses.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-5 text-[#6e6e73] uppercase tracking-wider">Top 10 Procedures by Cost</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topProcedures} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fill: '#86868b', fontSize: 10 }} tickFormatter={v => formatCurrency(v)} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#86868b', fontSize: 10 }} width={140} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(v), 'Cost']} />
              <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                {data.topProcedures.map((_: any, i: number) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-5 text-[#6e6e73] uppercase tracking-wider">Payer Comparison — Avg Cost/Patient</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.payerComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#86868b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#86868b', fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any, name: any) => [formatCurrency(v), name === 'avgCost' ? 'Avg/Patient' : name]} />
              <Bar dataKey="avgCost" fill="#0071e3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-5 text-[#6e6e73] uppercase tracking-wider">Cost Per Patient Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fill: '#86868b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#86868b', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#5856d6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
