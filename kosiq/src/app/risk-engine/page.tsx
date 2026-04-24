'use client';

import DashboardLayout from '@/components/DashboardLayout';

const riskDistribution = [
  { level: 'Very High Risk', count: 412, pct: 2.2, color: '#EF4444', avgRAF: 3.42 },
  { level: 'High Risk', count: 1834, pct: 9.9, color: '#F97316', avgRAF: 2.18 },
  { level: 'Moderate Risk', count: 4521, pct: 24.5, color: '#F59E0B', avgRAF: 1.34 },
  { level: 'Low Risk', count: 7123, pct: 38.7, color: '#10B981', avgRAF: 0.89 },
  { level: 'Healthy', count: 4542, pct: 24.7, color: '#06B6D4', avgRAF: 0.45 },
];

const recalcHistory = [
  { date: 'Mar 2, 2026', avgRAF: 1.087, codingGaps: 2341, newCodes: 156, revenue: '+$284K' },
  { date: 'Mar 1, 2026', avgRAF: 1.082, codingGaps: 2398, newCodes: 143, revenue: '+$267K' },
  { date: 'Feb 28, 2026', avgRAF: 1.079, codingGaps: 2456, newCodes: 128, revenue: '+$251K' },
  { date: 'Feb 27, 2026', avgRAF: 1.075, codingGaps: 2501, newCodes: 112, revenue: '+$238K' },
  { date: 'Feb 26, 2026', avgRAF: 1.071, codingGaps: 2567, newCodes: 98, revenue: '+$219K' },
];

export default function RiskEngineDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Risk Engine Dashboard</h1>
            <p className="text-sm text-[#86868b] mt-1">Daily risk recalculation & coding gap analysis</p>
          </div>
          <span className="px-3 py-1.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium rounded-full">Last recalc: 2 hours ago</span>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Average RAF Score', value: '1.087', change: '+0.005 today' },
            { label: 'Open Coding Gaps', value: '2,341', change: '-57 this week' },
            { label: 'Potential Revenue', value: '$4.2M', change: 'If gaps closed' },
            { label: 'V28 Impacted', value: '1,456', change: 'Need review' },
            { label: 'ARC Risk Levels', value: '5 tiers', change: '18,432 scored' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-[#86868b] text-xs mb-1">{m.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{m.value}</p>
              <p className="text-[11px] text-[#F59E0B] mt-1">{m.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Risk Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Population Risk Distribution</h3>
            <div className="space-y-3">
              {riskDistribution.map(r => (
                <div key={r.level} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  <span className="text-sm text-[#1d1d1f] w-28">{r.level}</span>
                  <div className="flex-1 bg-[#f5f5f7] rounded-full h-6 overflow-hidden">
                    <div className="h-full rounded-full flex items-center px-2" style={{ width: `${r.pct}%`, backgroundColor: r.color }}>
                      <span className="text-[10px] font-semibold text-white">{r.pct}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-[#6e6e73] w-20 text-right">{r.count.toLocaleString()} pts</span>
                  <span className="text-xs font-medium text-[#1d1d1f] w-16 text-right">RAF {r.avgRAF}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Recalculation */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Daily Score Recalculation</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-2">Date</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-2">Avg RAF</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-2">Gaps</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-2">New Codes</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {recalcHistory.map(r => (
                  <tr key={r.date} className="border-b border-gray-50">
                    <td className="py-2.5 text-xs text-[#1d1d1f]">{r.date}</td>
                    <td className="py-2.5 text-xs text-right font-medium text-[#1d1d1f]">{r.avgRAF}</td>
                    <td className="py-2.5 text-xs text-right text-[#6e6e73]">{r.codingGaps.toLocaleString()}</td>
                    <td className="py-2.5 text-xs text-right text-[#F59E0B]">+{r.newCodes}</td>
                    <td className="py-2.5 text-xs text-right text-green-600 font-medium">{r.revenue}</td>
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
