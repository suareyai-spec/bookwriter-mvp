'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

const COLORS = ['#0071e3', '#34c759'];

export default function PharmacyPage() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<'dashboard' | 'topRx' | 'utilizers'>('dashboard');

  useEffect(() => {
    fetch('/api/pharmacy').then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const { brandVsGeneric, rxCostByMonth, rxCountByMonth, topRx, topUtilizers } = data;

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">Pharmacy</h1>
          <div className="flex gap-1 bg-[#f5f5f7] rounded-xl p-1">
            {(['dashboard', 'topRx', 'utilizers'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>
                {t === 'dashboard' ? 'Dashboards' : t === 'topRx' ? 'Top Rx' : 'Top Utilizers'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'dashboard' && (
          <>
            {/* Donuts */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Generics vs Brand -- By Count</h3>
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={brandVsGeneric.count} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value">
                        {brandVsGeneric.count.map((_: any, i: number) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {brandVsGeneric.count.map((d: any, i: number) => {
                      const total = brandVsGeneric.count.reduce((s: number, x: any) => s + x.value, 0);
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="text-sm">{d.name}: {d.value.toLocaleString()} ({((d.value / total) * 100).toFixed(1)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Generics vs Brand -- By Cost</h3>
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={brandVsGeneric.cost} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value">
                        {brandVsGeneric.cost.map((_: any, i: number) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`$${(v/1000).toFixed(0)}K`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {brandVsGeneric.cost.map((d: any, i: number) => {
                      const total = brandVsGeneric.cost.reduce((s: number, x: any) => s + x.value, 0);
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="text-sm">{d.name}: ${(d.value/1000).toFixed(0)}K ({((d.value / total) * 100).toFixed(1)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Rx Cost by Month ($K)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={rxCostByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#86868b' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                    <Bar dataKey="brand" fill="#0071e3" stackId="a" name="Brand" />
                    <Bar dataKey="generic" fill="#34c759" stackId="a" name="Generic" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Rx Count by Month</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={rxCountByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#86868b' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                    <Line type="monotone" dataKey="count" stroke="#af52de" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {tab === 'topRx' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Top Medications by Cost</h3>
            <p className="text-xs text-[#86868b] mb-4">Total Items: {topRx.length}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  {['Drug Name','Type','Total Drug Cost','Rx Count'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {topRx.map((rx: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                      <td className="py-2.5 px-3 font-medium text-[#1d1d1f]">{rx.drugName}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rx.drugType === 'Brand' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                          {rx.drugType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium">${rx.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-3">{rx.rxCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'utilizers' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Top Pharmacy Utilizers by Cost</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  {['Patient','ID','PCP','Total Cost','Rx Count','Brand','Generic'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {topUtilizers.map((u: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                      <td className="py-2.5 px-3 font-medium text-[#1d1d1f]">{u.name}</td>
                      <td className="py-2.5 px-3 text-xs text-[#86868b]">{u.id}</td>
                      <td className="py-2.5 px-3 text-xs">{u.pcp}</td>
                      <td className="py-2.5 px-3 font-medium">${u.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="py-2.5 px-3">{u.rxCount}</td>
                      <td className="py-2.5 px-3">{u.brandCount}</td>
                      <td className="py-2.5 px-3">{u.genericCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
