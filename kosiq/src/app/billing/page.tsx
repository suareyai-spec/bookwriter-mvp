'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BillingMRAPage() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<'dashboard' | 'hp' | 'brand'>('dashboard');

  useEffect(() => {
    fetch('/api/mra').then(r => r.json()).then(setData).catch(() => {});
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
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Billing & Coding -- MRA</h1>

        <div className="flex gap-1 mb-6 bg-[#f5f5f7] rounded-xl p-1 w-fit">
          {(['dashboard','hp','brand'] as const).map(t=>(
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b]'}`}>
              {t === 'dashboard' ? 'Dashboard' : t === 'hp' ? 'MRA by HP' : 'MRA by Brand'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 inline-block">
          <p className="text-xs text-[#86868b] uppercase tracking-wider">Total Members with Reports</p>
          <p className="text-3xl font-semibold text-[#1d1d1f] mt-2">{data.totalWithReports.toLocaleString()}</p>
        </div>

        {tab === 'dashboard' && (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Enterprise MRA Trend Line</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.mraTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#86868b' }} domain={[0.8, 1.5]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                  <Line type="monotone" dataKey="mra" stroke="#0071e3" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Patient-Level MRA</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  {['Patient','ID','DOB','Health Plan','MRA Score'].map(h=>(
                    <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody>{data.topPatients.map((p: any, i: number)=>(
                  <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                    <td className="py-2.5 px-3 font-medium">{p.name}</td>
                    <td className="py-2.5 px-3 text-xs text-[#86868b]">{p.id}</td>
                    <td className="py-2.5 px-3 text-xs">{p.dob}</td>
                    <td className="py-2.5 px-3 text-xs">{p.plan}</td>
                    <td className="py-2.5 px-3 font-medium text-[#0071e3]">{p.mra.toFixed(2)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'hp' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">MRA by Health Plan</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['Health Plan','Members','Average MRA'].map(h=>(
                  <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>{data.byHP.map((r: any, i: number)=>(
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2.5 px-3 font-medium">{r.plan}</td>
                  <td className="py-2.5 px-3">{r.members}</td>
                  <td className="py-2.5 px-3 font-medium text-[#0071e3]">{r.avgMRA.toFixed(2)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {tab === 'brand' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">MRA by Brand/Center</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['Center','Members','Average MRA'].map(h=>(
                  <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>{data.byBrand.map((r: any, i: number)=>(
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2.5 px-3 font-medium">{r.brand}</td>
                  <td className="py-2.5 px-3">{r.members}</td>
                  <td className="py-2.5 px-3 font-medium text-[#0071e3]">{r.avgMRA.toFixed(2)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
