'use client';
import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useState } from 'react';

export default function BHDashboard() {
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Behavioral Health Dashboard</h1>
        <p className="text-sm text-[#86868b] mb-8">Mental & behavioral health overview</p>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[{l:'Active BH Patients',v:'2,187',c:2187},{l:'PHQ-9 Screenings MTD',v:'456',c:456},{l:'GAD-7 Screenings MTD',v:'389',c:389},{l:'Active Tx Plans',v:'1,456',c:1456},{l:'Avg Caseload',v:'142',c:0}].map((s,i)=>(
            <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100${s.c ? ' cursor-pointer' : ''}`} onClick={() => s.c && setDrillDown({ label: s.l, count: s.c })}>
              <p className="text-[#86868b] text-xs mb-1">{s.l}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Severity Distribution</h3>
            {[{l:'Minimal (0-4)',n:892,c:'#06B6D4'},{l:'Mild (5-9)',n:567,c:'#10B981'},{l:'Moderate (10-14)',n:389,c:'#F59E0B'},{l:'Mod. Severe (15-19)',n:234,c:'#F97316'},{l:'Severe (20-27)',n:105,c:'#EF4444'}].map(s=>(
              <div key={s.l} className="flex items-center gap-3 py-1.5">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor:s.c}} />
                <span className="text-xs text-[#1d1d1f] w-36">{s.l}</span>
                <div className="flex-1 bg-[#f5f5f7] rounded-full h-4 overflow-hidden">
                  <div className="h-full rounded-full" style={{width:(s.n/900*100)+'%',backgroundColor:s.c}} />
                </div>
                <span className="text-xs text-[#6e6e73] w-12 text-right cursor-pointer hover:underline hover:text-[#A855F7]" onClick={() => setDrillDown({ label: `PHQ-9 ${s.l}`, count: s.n })}>{s.n}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Recent Screenings</h3>
            {[{p:'Sarah Mitchell',t:'PHQ-9',s:18,sv:'Mod. Severe'},{p:'Mark Thompson',t:'GAD-7',s:21,sv:'Severe'},{p:'Lisa Chen',t:'PHQ-9',s:8,sv:'Mild'},{p:'Tom Baker',t:'PHQ-9',s:14,sv:'Moderate'},{p:'Amy Rodriguez',t:'GAD-7',s:11,sv:'Moderate'}].map((r,i)=>(
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className={'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white '+(r.s>=20?'bg-red-500':r.s>=15?'bg-orange-500':r.s>=10?'bg-yellow-500':'bg-green-500')}>{r.s}</span>
                <div className="flex-1"><p className="text-xs font-medium text-[#1d1d1f]">{r.p} · {r.t}</p><p className="text-[10px] text-[#86868b]">{r.sv}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#A855F7" />
    </DashboardLayout>
  );
}
