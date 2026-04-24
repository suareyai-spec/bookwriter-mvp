'use client';
import DashboardLayout from '@/components/DashboardLayout';

export default function BHMPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Behavioral Health Management</h1>
        <p className="text-sm text-[#86868b] mb-8">DAP/BIRP notes, treatment plans, group visits</p>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Active Treatment Plans</h3>
            {[{n:'Sarah Mitchell',note:'DAP',phase:'Active Treatment',plan:'CBT + SSRI',prog:'improving'},{n:'Mark Thompson',note:'BIRP',phase:'Crisis Stabilization',plan:'DBT Intensive',prog:'stabilizing'},{n:'Lisa Chen',note:'DAP',phase:'Maintenance',plan:'SSRI only',prog:'stable'},{n:'Tom Baker',note:'DAP',phase:'Active Treatment',plan:'CBT + Buspirone',prog:'improving'},{n:'David Clark',note:'DAP',phase:'Active Treatment',plan:'SNRI + Therapy',prog:'plateau'}].map((p,i)=>(
              <div key={i} className="p-3 rounded-xl hover:bg-gray-50 border border-gray-50 mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#1d1d1f]">{p.n}</span>
                  <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 bg-[#A855F7]/10 text-[#A855F7] text-[10px] rounded">{p.note}</span>
                    <span className={'px-1.5 py-0.5 text-[10px] rounded '+(p.prog==='improving'?'bg-green-50 text-green-600':p.prog==='stable'||p.prog==='stabilizing'?'bg-blue-50 text-blue-600':'bg-yellow-50 text-yellow-600')}>{p.prog}</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#86868b]">{p.phase} · {p.plan}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Group Visits</h3>
            {[{n:'Anxiety Management Group',f:'Dr. Adams',m:8,next:'Mar 4, 2:00 PM'},{n:'Depression Support Circle',f:'Dr. Rivera',m:6,next:'Mar 5, 10:00 AM'},{n:'Substance Use Recovery',f:'Dr. Park',m:10,next:'Mar 3, 4:00 PM'}].map((g,i)=>(
              <div key={i} className="p-4 rounded-xl bg-[#f5f5f7] mb-3">
                <p className="text-sm font-medium text-[#1d1d1f]">{g.n}</p>
                <p className="text-[10px] text-[#86868b]">{g.f} · {g.m} members</p>
                <p className="text-[10px] text-[#A855F7] mt-1">Next: {g.next}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
