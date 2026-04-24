'use client';
import DashboardLayout from '@/components/DashboardLayout';

export default function Page() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Vitals Trending</h1>
        <p className="text-sm text-[#86868b] mb-8">7/14/30/90-day patient vitals</p>
        
        <div className="space-y-4">
          {[{n:"Maria Garcia",m:"Blood Glucose",v:"148 mg/dL",t:"improving"},{n:"James Wilson",m:"Blood Pressure",v:"149/88 mmHg",t:"stable"},{n:"Robert Johnson",m:"SpO2",v:"91%",t:"declining"},{n:"Patricia Brown",m:"Weight",v:"195 lbs",t:"improving"}].map(p=>(
            <div key={p.n} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
              <div className="flex-1"><h3 className="text-sm font-semibold text-[#1d1d1f]">{p.n}</h3><p className="text-[10px] text-[#86868b]">{p.m}</p></div>
              <p className="text-lg font-mono font-semibold text-[#1d1d1f]">{p.v}</p>
              <span className={"text-xs px-2 py-1 rounded-full " + (p.t==="improving"?"bg-green-50 text-green-600":p.t==="declining"?"bg-red-50 text-red-600":"bg-gray-50 text-[#86868b]")}>{p.t}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
