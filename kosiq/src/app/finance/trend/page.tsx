'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function FinancialTrendPage() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => { fetch('/api/finance').then(r => r.json()).then(setData).catch(() => {}); }, []);
  const chartData = data.map(r => ({
    month: r.month,
    'Net Revenue': Math.round(r.netRevenue / 1000),
    'Gross Revenue': Math.round(r.grossRevenue / 1000),
    'Total Expenses': Math.round(r.totalExpenses / 1000),
  }));
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Financial Trend</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} tickFormatter={(v: any) => `$${v}K`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
              <Legend />
              <Line type="monotone" dataKey="Net Revenue" stroke="#34c759" strokeWidth={2} />
              <Line type="monotone" dataKey="Gross Revenue" stroke="#0071e3" strokeWidth={2} />
              <Line type="monotone" dataKey="Total Expenses" stroke="#ff3b30" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
