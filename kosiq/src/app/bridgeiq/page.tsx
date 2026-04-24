'use client';
import DashboardLayout from '@/components/DashboardLayout';

export default function BridgeIQDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">BridgeIQ — Interoperability Hub</h1>
        <p className="text-sm text-[#86868b] mb-8">Unified health data across all sources</p>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{l:'Connected Sources',v:'8'},{l:'Total Records',v:'366K'},{l:'FHIR Exchanges (24h)',v:'12,456'},{l:'Patients Linked',v:'17,892'}].map((m,i)=>(
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-[#86868b] text-xs mb-1">{m.l}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{m.v}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Connected Sources</h3>
            {[{n:'Baptist Health',t:'Hospital',r:'45,600'},{n:'Memorial Regional',t:'Hospital',r:'38,900'},{n:'Quest Diagnostics',t:'Lab',r:'89,200'},{n:'CVS/Caremark',t:'Pharmacy',r:'67,800'},{n:'Apple Health',t:'Wearable',r:'12,300'},{n:'Simply Health',t:'Payer',r:'54,300'},{n:'Humana',t:'Payer',r:'34,500'}].map(s=>(
              <div key={s.n} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1"><p className="text-sm font-medium text-[#1d1d1f]">{s.n}</p><p className="text-[10px] text-[#86868b]">{s.t} · {s.r} records</p></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Recent Activity</h3>
            {[{a:'Lab imported',p:'Maria Garcia',s:'Quest',t:'2 min ago'},{a:'Discharge summary',p:'James Wilson',s:'Memorial',t:'5 min ago'},{a:'FHIR exchange',p:'Robert Johnson',s:'Quest',t:'8 min ago'},{a:'Wearable sync',p:'Patricia Brown',s:'Apple Health',t:'10 min ago'},{a:'Claims batch',p:'234 claims',s:'Simply Health',t:'30 min ago'}].map((a,i)=>(
              <div key={i} className="flex items-start gap-3 p-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[10px] text-[#3B82F6]">↓</span>
                <div className="flex-1"><p className="text-xs text-[#1d1d1f]"><span className="font-medium">{a.a}</span> — {a.p}</p><p className="text-[10px] text-[#86868b]">{a.s}</p></div>
                <span className="text-[10px] text-[#86868b]">{a.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
