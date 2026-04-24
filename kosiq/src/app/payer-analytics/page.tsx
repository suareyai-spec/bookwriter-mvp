'use client';
import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useState } from 'react';

export default function PayerDashboard() {
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Payer Analytics Dashboard</h1>
        <p className="text-sm text-[#86868b] mb-8">Multi-payer intelligence & KPI tracking</p>
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[{l:'Total Members',v:'18,432',c:18432},{l:'Avg PMPM',v:'$175',c:0},{l:'Quality Score',v:'82.6%',c:0},{l:'Avg RAF',v:'1.087',c:0},{l:'ER Rate/1K',v:'298',c:0},{l:'Claims YTD',v:'$44.3M',c:0}].map((k,i)=>(
            <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100${k.c ? ' cursor-pointer' : ''}`} onClick={() => k.c && setDrillDown({ label: k.l, count: k.c })}>
              <p className="text-[10px] text-[#86868b] mb-1">{k.l}</p>
              <p className="text-lg font-semibold text-[#1d1d1f]">{k.v}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Payer</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Members</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">PMPM</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Quality</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">HCC Gaps</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Claims YTD</th>
            </tr></thead>
            <tbody>
              {[{n:'Simply Health',m:5432,p:178,q:87,g:456,c:'$12.3M'},{n:'Sunshine Health',m:4123,p:165,q:82,g:389,c:'$8.9M'},{n:'Humana',m:3567,p:192,q:84,g:312,c:'$9.7M'},{n:'Aetna',m:2890,p:156,q:79,g:278,c:'$6.4M'},{n:'Molina',m:1456,p:189,q:76,g:198,c:'$4.2M'},{n:'WellCare',m:964,p:171,q:81,g:134,c:'$2.8M'}].map(p=>(
                <tr key={p.n} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-[#1d1d1f]">{p.n}</td>
                  <td className="px-4 py-3 text-sm text-right text-[#6e6e73] cursor-pointer hover:underline hover:text-[#F97316]" onClick={() => setDrillDown({ label: `${p.n} Members`, count: p.m })}>{p.m.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-[#1d1d1f]">${p.p}</td>
                  <td className="px-4 py-3 text-sm text-right"><span className={p.q>=85?'text-green-600':p.q>=80?'text-[#F59E0B]':'text-red-500'}>{p.q}%</span></td>
                  <td className="px-4 py-3 text-sm text-right text-[#F97316]">{p.g}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-[#1d1d1f]">{p.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#F97316" />
    </DashboardLayout>
  );
}
