'use client';

import DashboardLayout from '@/components/DashboardLayout';

const pcmhStandards = [
  { id: 'PCMH 1', name: 'Patient-Centered Access', credits: 4, earned: 4, reports: 5, status: 'met' },
  { id: 'PCMH 2', name: 'Team-Based Care', credits: 3, earned: 3, reports: 4, status: 'met' },
  { id: 'PCMH 3', name: 'Population Health Management', credits: 4, earned: 3, reports: 6, status: 'partial' },
  { id: 'PCMH 4', name: 'Care Management & Support', credits: 3, earned: 3, reports: 4, status: 'met' },
  { id: 'PCMH 5', name: 'Care Coordination & Transitions', credits: 4, earned: 4, reports: 5, status: 'met' },
  { id: 'PCMH 6', name: 'Performance Measurement', credits: 4, earned: 4, reports: 6, status: 'met' },
  { id: 'PCMH TC', name: 'Technology & Connectivity', credits: 3, earned: 3, reports: 3, status: 'met' },
  { id: 'PCMH QL', name: 'Quality Improvement', credits: 4, earned: 4, reports: 4, status: 'met' },
  { id: 'PCMH EL', name: 'Elective Standards', credits: 8, earned: 6, reports: 0, status: 'partial' },
];

const reports = [
  { name: 'Same-Day Access Report', standard: 'PCMH 1', generated: 'Mar 1, 2026', status: 'auto', score: 94 },
  { name: 'After-Hours Access', standard: 'PCMH 1', generated: 'Mar 1, 2026', status: 'auto', score: 88 },
  { name: 'Care Team Roles', standard: 'PCMH 2', generated: 'Feb 28, 2026', status: 'auto', score: 92 },
  { name: 'Population Registry', standard: 'PCMH 3', generated: 'Feb 28, 2026', status: 'auto', score: 76 },
  { name: 'Care Plan Documentation', standard: 'PCMH 4', generated: 'Feb 27, 2026', status: 'auto', score: 89 },
  { name: 'Transition of Care Records', standard: 'PCMH 5', generated: 'Feb 27, 2026', status: 'auto', score: 91 },
  { name: 'Clinical Quality Measures', standard: 'PCMH 6', generated: 'Feb 26, 2026', status: 'auto', score: 87 },
];

export default function PCMHPage() {
  const totalCredits = pcmhStandards.reduce((s, p) => s + p.credits, 0);
  const earnedCredits = pcmhStandards.reduce((s, p) => s + p.earned, 0);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">PCMH Recognition</h1>
            <p className="text-sm text-[#86868b] mt-1">37 standard reports · Auto-credit monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#10B981]">{earnedCredits}/{totalCredits}</p>
              <p className="text-[10px] text-[#86868b]">Credits Earned</p>
            </div>
            <div className="w-20 h-20 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f5f5f7" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={`${(earnedCredits / totalCredits) * 100}, 100`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[#1d1d1f]">{Math.round((earnedCredits / totalCredits) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Standards */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">PCMH Standards</h3>
            <div className="space-y-2">
              {pcmhStandards.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${s.status === 'met' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}>
                    {s.status === 'met' ? '✓' : '!'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1d1d1f]">{s.id}: {s.name}</p>
                    <p className="text-[10px] text-[#86868b]">{s.reports} reports</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-[#f5f5f7] rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(s.earned / s.credits) * 100}%`, backgroundColor: s.status === 'met' ? '#10B981' : '#F59E0B' }} />
                    </div>
                    <span className="text-xs text-[#6e6e73]">{s.earned}/{s.credits}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Recent Auto-Reports</h3>
            <div className="space-y-3">
              {reports.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#f5f5f7] hover:bg-gray-100 cursor-pointer">
                  <p className="text-xs font-medium text-[#1d1d1f]">{r.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[#86868b]">{r.standard} · {r.generated}</span>
                    <span className={`text-xs font-medium ${r.score >= 85 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>{r.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
