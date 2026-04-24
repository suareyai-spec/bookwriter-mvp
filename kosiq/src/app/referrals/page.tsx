'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0071e3','#34c759','#ff9f0a','#af52de','#ff3b30','#5ac8fa','#ff6384','#36a2eb','#ffce56','#4bc0c0'];

export default function ReferralsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/referrals-data').then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">Referrals</h1>
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
            <span className="text-xs text-[#86868b] uppercase tracking-wider">Total Referrals</span>
            <span className="text-xl font-semibold text-[#1d1d1f] ml-3">{data.total}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Top 10 Referrals by Center</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.byCenter} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#86868b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#86868b' }} width={160} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Bar dataKey="count" fill="#0071e3" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Daily Referrals Count</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyCount}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#86868b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#86868b' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#0071e3" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Top 10 Referrals by PCP</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.byPCP} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#86868b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#86868b' }} width={160} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Bar dataKey="count" fill="#34c759" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Top 10 Referrals by Specialty</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.bySpecialty} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
                  {data.bySpecialty.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
