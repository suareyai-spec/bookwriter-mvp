'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0071e3','#ff3b30','#34c759','#ff9f0a','#af52de'];

export default function ClaimsPage() {
  const [data, setData] = useState<any>(null);
  const [scale, setScale] = useState<'millions' | 'thousands' | 'normal'>('thousands');
  const [tab, setTab] = useState<'month' | 'pmpm'>('month');

  useEffect(() => {
    fetch('/api/claims').then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const fmt = (v: number) => {
    if (scale === 'millions') return `$${(v/1000).toFixed(1)}M`;
    if (scale === 'thousands') return `$${v}K`;
    return `$${(v * 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Claims</h1>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-[#86868b] uppercase tracking-wider">Number of Claims</p>
            <p className="text-3xl font-semibold text-[#1d1d1f] mt-2">{data.totalCount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-[#86868b] uppercase tracking-wider">Amount Paid</p>
            <p className="text-3xl font-semibold text-[#1d1d1f] mt-2">${data.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Claims by Month */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 bg-[#f5f5f7] rounded-lg p-1">
              <button onClick={() => setTab('month')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${tab === 'month' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b]'}`}>Claims Amount By Month</button>
              <button onClick={() => setTab('pmpm')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${tab === 'pmpm' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b]'}`}>Claims Amount PMPM</button>
            </div>
            <div className="flex gap-1 bg-[#f5f5f7] rounded-lg p-1">
              {(['millions','thousands','normal'] as const).map(s=>(
                <button key={s} onClick={() => setScale(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${scale === s ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b]'}`}>
                  {s === 'millions' ? '$ Millions' : s === 'thousands' ? '$ Thousands' : '$ Normal'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byMonth.map((c: any) => ({ ...c, value: tab === 'pmpm' ? Math.round(c.amount / 2) : c.amount }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} tickFormatter={(v: any) => fmt(v)} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
              <Bar dataKey={tab === 'pmpm' ? 'value' : 'amount'} fill="#0071e3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Claims by Expense Type (Count)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.byExpenseCount} cx="50%" cy="50%" outerRadius={90} innerRadius={45} dataKey="value" label={({ name, value }: any) => `${name}: ${value.toLocaleString()}`}>
                  {data.byExpenseCount.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Claims by Expense Type (Cost)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.byExpenseCost} cx="50%" cy="50%" outerRadius={90} innerRadius={45} dataKey="value" label={({ name, value }: any) => `${name}: $${(value/1000000).toFixed(1)}M`}>
                  {data.byExpenseCost.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Payor */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Claims Amount by Payor</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.byPayor}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="payor" tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} tickFormatter={(v: any) => `$${v}K`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
              <Bar dataKey="amount" fill="#34c759" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
