'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function HospitalizationPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/hospitalization').then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const { kpis, ytdTrend, topUtilizers } = data;

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Hospitalization Statistics</h1>
        {/* 7 KPI Cards */}
        <div className="grid grid-cols-7 gap-3 mb-6">
          {[
            { label: 'Utilization/1K', value: kpis.utilPer1K },
            { label: 'Rolling Util/1K', value: kpis.rollingUtilPer1K },
            { label: 'Total Utilization', value: kpis.totalUtil },
            { label: 'Total Readmissions', value: kpis.totalReadmissions },
            { label: 'Readmissions %', value: `${kpis.readmissionPct}%` },
            { label: 'Average LOS', value: kpis.avgLOS },
            { label: 'Bed Days/1K', value: kpis.bedDaysPer1K },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] text-[#86868b] uppercase tracking-wider">{kpi.label}</p>
              <p className="text-xl font-semibold text-[#1d1d1f] mt-1">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* YTD Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">YTD Trend -- Year-over-Year Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ytdTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
              <Legend />
              <Bar dataKey="y2024" fill="#86868b" radius={[4, 4, 0, 0]} name="2024" />
              <Bar dataKey="y2025" fill="#0071e3" radius={[4, 4, 0, 0]} name="2025" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Patient Utilization</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['Avoidable','Patient','ID','Admissions','ER Visits','Total LOS','Payer','Facility'].map(h=>(
                  <th key={h} className="text-left py-3 px-2 text-xs font-medium text-[#86868b] uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {topUtilizers.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                    <td className="py-2.5 px-2"><span className={`inline-block w-3 h-3 rounded-full ${p.avoidable ? 'bg-red-400' : 'bg-green-400'}`} /></td>
                    <td className="py-2.5 px-2 font-medium">{p.name}</td>
                    <td className="py-2.5 px-2 text-xs text-[#86868b]">{p.id}</td>
                    <td className="py-2.5 px-2 text-center">{p.admissions}</td>
                    <td className="py-2.5 px-2 text-center">{p.erVisits}</td>
                    <td className="py-2.5 px-2 text-center">{p.los} days</td>
                    <td className="py-2.5 px-2 text-xs">{p.payer}</td>
                    <td className="py-2.5 px-2 text-xs text-[#86868b]">{p.facility}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
