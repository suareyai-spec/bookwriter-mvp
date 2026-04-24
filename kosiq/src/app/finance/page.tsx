'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

interface RevenueRecord {
  month: string;
  netRevenue: number;
  grossRevenue: number;
  grossMedicare: number;
  grossMedicaid: number;
  grossCommercial: number;
  mlr: number;
  mraScore: number;
  premiumPmpm: number;
  totalExpenses: number;
}

export default function FinancePage() {
  const [data, setData] = useState<RevenueRecord[]>([]);
  const [scale, setScale] = useState<'millions' | 'thousands' | 'normal'>('thousands');
  const [revenueTab, setRevenueTab] = useState<'month' | 'payor'>('month');

  useEffect(() => {
    fetch('/api/finance').then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const latest = data[data.length - 1];
  const totals = data.reduce((acc, r) => ({
    net: acc.net + r.netRevenue,
    gross: acc.gross + r.grossRevenue,
    medicare: acc.medicare + r.grossMedicare,
    medicaid: acc.medicaid + r.grossMedicaid,
    commercial: acc.commercial + r.grossCommercial,
  }), { net: 0, gross: 0, medicare: 0, medicaid: 0, commercial: 0 });

  const fmt = (v: number) => {
    if (scale === 'millions') return `$${(v / 1000000).toFixed(2)}M`;
    if (scale === 'thousands') return `$${(v / 1000).toFixed(1)}K`;
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const chartData = data.map(r => ({
    month: r.month.replace('2025-', '').replace('2026-', ''),
    revenue: scale === 'millions' ? r.grossRevenue / 1000000 : scale === 'thousands' ? r.grossRevenue / 1000 : r.grossRevenue,
  }));

  const payorData = [
    { payor: 'Medicare', amount: totals.medicare },
    { payor: 'Medicaid', amount: totals.medicaid },
    { payor: 'Commercial', amount: totals.commercial },
  ];

  const mlrData = data.map(r => ({ month: r.month.replace('2025-', '').replace('2026-', ''), mlr: r.mlr }));
  const mraData = data.map(r => ({ month: r.month.replace('2025-', '').replace('2026-', ''), mra: r.mraScore }));

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Finance</h1>

        {/* Revenue KPI Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Net Revenue', value: totals.net, color: '#34c759' },
            { label: 'Gross Revenue', value: totals.gross, color: '#34c759' },
            { label: 'Gross Revenue Medicare', value: totals.medicare, color: '#34c759' },
            { label: 'Gross Revenue Medicaid', value: totals.medicaid, color: '#34c759' },
            { label: 'Gross Revenue Commercial', value: totals.commercial, color: '#34c759' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] uppercase tracking-wider">{kpi.label}</p>
              <p className="text-xl font-semibold mt-2" style={{ color: kpi.color }}>
                ${(kpi.value / 1000000).toFixed(2)}M
              </p>
            </div>
          ))}
        </div>

        {/* MLR and MRA Charts */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Medical Loss Ratio</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mlrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#86868b' }} unit="%" domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} formatter={(v: any) => [`${v.toFixed(1)}%`, 'MLR']} />
                <Line type="monotone" dataKey="mlr" stroke="#0071e3" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Medical Risk Adjustment (MRA)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mraData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#86868b' }} domain={[0.8, 1.5]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} formatter={(v: any) => [v.toFixed(2), 'MRA']} />
                <Line type="monotone" dataKey="mra" stroke="#af52de" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Charts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 bg-[#f5f5f7] rounded-lg p-1">
              <button onClick={() => setRevenueTab('month')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${revenueTab === 'month' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b]'}`}>Revenue by Month</button>
              <button onClick={() => setRevenueTab('payor')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${revenueTab === 'payor' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b]'}`}>Revenue by Payor</button>
            </div>
            <div className="flex gap-1 bg-[#f5f5f7] rounded-lg p-1">
              {(['millions', 'thousands', 'normal'] as const).map(s => (
                <button key={s} onClick={() => setScale(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${scale === s ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b]'}`}>
                  {s === 'millions' ? '$ Millions' : s === 'thousands' ? '$ Thousands' : '$ Normal'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {revenueTab === 'month' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#86868b' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#0071e3" radius={[6, 6, 0, 0]} name="Gross Revenue" />
              </BarChart>
            ) : (
              <BarChart data={payorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#86868b' }} tickFormatter={(v: any) => fmt(v)} />
                <YAxis type="category" dataKey="payor" tick={{ fontSize: 11, fill: '#86868b' }} width={90} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} formatter={(v: any) => [fmt(v), 'Revenue']} />
                <Bar dataKey="amount" fill="#34c759" radius={[0, 6, 6, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
