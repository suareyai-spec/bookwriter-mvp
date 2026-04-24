'use client';
import DashboardLayout from '@/components/DashboardLayout';

export default function BHISPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">BHIS — Inpatient/24-Hour</h1>
        <p className="text-sm text-[#86868b] mb-8">Crisis management, addiction treatment & day services</p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{u:'Crisis Stabilization',o:8,b:12,los:4.2},{u:'Addiction Treatment',o:15,b:20,los:14.5},{u:'Day Services',o:6,b:15,los:1.0}].map(u=>(
            <div key={u.u} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold text-[#1d1d1f] mb-3">{u.u}</h4>
              <div className="flex gap-6 mb-3">
                <div><p className="text-lg font-semibold text-[#A855F7]">{u.o}/{u.b}</p><p className="text-[10px] text-[#86868b]">Beds</p></div>
                <div><p className="text-lg font-semibold text-[#1d1d1f]">{u.los}d</p><p className="text-[10px] text-[#86868b]">Avg LOS</p></div>
              </div>
              <div className="bg-[#f5f5f7] rounded-full h-3 overflow-hidden">
                <div className="h-full rounded-full bg-[#A855F7]" style={{width:(u.o/u.b*100)+'%'}} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Patient</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Unit</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Diagnosis</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">LOS</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Status</th>
            </tr></thead>
            <tbody>
              {[{n:'Mark Thompson',u:'Crisis',dx:'Acute Psychosis',l:3,s:'active'},{n:'Emily Watson',u:'Addiction',dx:'Opioid Use Disorder',l:6,s:'active'},{n:'Chris Nelson',u:'Day Services',dx:'Bipolar I',l:1,s:'active'},{n:'Rachel Kim',u:'Crisis',dx:'Suicidal Ideation',l:0,s:'new'},{n:'Jason Moore',u:'Addiction',dx:'Alcohol Use Disorder',l:11,s:'discharge'}].map((p,i)=>(
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm font-medium text-[#1d1d1f]">{p.n}</td>
                  <td className="px-5 py-3 text-xs text-[#6e6e73]">{p.u}</td>
                  <td className="px-5 py-3 text-xs text-[#6e6e73]">{p.dx}</td>
                  <td className="px-5 py-3 text-sm text-center">{p.l}d</td>
                  <td className="px-5 py-3 text-center"><span className={'text-[10px] px-2 py-0.5 rounded-full '+(p.s==='new'?'bg-blue-50 text-blue-600':p.s==='discharge'?'bg-yellow-50 text-yellow-600':'bg-green-50 text-green-600')}>{p.s}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
