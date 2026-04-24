'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useState } from 'react';

const qualityMetrics = [
  { label: 'Overall Quality Score', value: '87.3%', change: '+2.1%', target: '90%' },
  { label: 'HEDIS Compliance', value: '82.6%', change: '+3.4%', target: '85%' },
  { label: 'Open Care Gaps', value: '3,412', change: '-245', target: '<2,000' },
  { label: 'PCMH Credits', value: '34/37', change: '+2', target: '37/37' },
  { label: 'Stars Rating', value: '4.2★', change: '+0.3', target: '4.5★' },
];

const topMeasures = [
  { measure: 'Breast Cancer Screening (BCS)', rate: 78.2, target: 82, gap: 234, trend: 'up' },
  { measure: 'Colorectal Cancer Screening (COL)', rate: 72.1, target: 75, gap: 312, trend: 'up' },
  { measure: 'Controlling High Blood Pressure (CBP)', rate: 68.4, target: 72, gap: 567, trend: 'down' },
  { measure: 'Comprehensive Diabetes Care - HbA1c (CDC)', rate: 82.7, target: 85, gap: 189, trend: 'up' },
  { measure: 'Eye Exam for Diabetes (EED)', rate: 61.3, target: 70, gap: 445, trend: 'down' },
  { measure: 'Statin Therapy - Adherence (SPC)', rate: 74.8, target: 80, gap: 278, trend: 'up' },
  { measure: 'Cervical Cancer Screening (CCS)', rate: 81.2, target: 85, gap: 156, trend: 'stable' },
  { measure: 'Follow-Up After ED Visit (FUA)', rate: 56.7, target: 65, gap: 389, trend: 'up' },
];

const providerScores = [
  { name: 'Dr. Martinez', score: 91.2, measures: 24, gaps: 45, rank: 1 },
  { name: 'Dr. Lee', score: 89.8, measures: 24, gaps: 52, rank: 2 },
  { name: 'Dr. Chen', score: 87.4, measures: 22, gaps: 67, rank: 3 },
  { name: 'Dr. Kim', score: 85.1, measures: 24, gaps: 78, rank: 4 },
  { name: 'Dr. Patel', score: 82.9, measures: 23, gaps: 89, rank: 5 },
];

export default function QualityDashboard() {
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Quality Dashboard</h1>
            <p className="text-sm text-[#86868b] mt-1">Practice, provider & patient level quality metrics</p>
          </div>
          <div className="flex gap-3">
            <select className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
              <option>All Payers</option>
              <option>Simply Health</option>
              <option>Humana</option>
              <option>Aetna</option>
            </select>
          </div>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {qualityMetrics.map((m, i) => (
            <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100${m.label === 'Open Care Gaps' ? ' cursor-pointer' : ''}`} onClick={() => m.label === 'Open Care Gaps' && setDrillDown({ label: 'Open Care Gaps', count: 3412 })}>
              <p className="text-[#86868b] text-xs mb-1">{m.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{m.value}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-[#10B981]">{m.change}</span>
                <span className="text-[10px] text-[#86868b]">Target: {m.target}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Top Measures */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Key HEDIS Measures</h3>
            <div className="space-y-3">
              {topMeasures.map(m => (
                <div key={m.measure} className="flex items-center gap-3">
                  <span className="text-xs text-[#1d1d1f] w-64 truncate">{m.measure}</span>
                  <div className="flex-1 bg-[#f5f5f7] rounded-full h-5 overflow-hidden relative">
                    <div className="h-full rounded-full" style={{ width: `${m.rate}%`, backgroundColor: m.rate >= m.target ? '#10B981' : m.rate >= m.target - 5 ? '#F59E0B' : '#EF4444' }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">{m.rate}%</span>
                  </div>
                  <div className="w-12 h-5 flex items-center justify-center">
                    <div className="w-px h-full bg-gray-300 relative" style={{ marginLeft: `${(m.target / 100) * 48}px` }}>
                      <span className="absolute -top-0.5 left-1 text-[8px] text-[#86868b]">{m.target}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-red-500 w-16 text-right cursor-pointer hover:underline" onClick={() => setDrillDown({ label: m.measure, count: m.gap })}>{m.gap} gaps</span>
                  <span className={`text-[10px] w-8 ${m.trend === 'up' ? 'text-green-600' : m.trend === 'down' ? 'text-red-500' : 'text-[#86868b]'}`}>
                    {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Provider Leaderboard */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Provider Quality Rankings</h3>
            <div className="space-y-3">
              {providerScores.map(p => (
                <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                    p.rank <= 3 ? 'bg-[#10B981]' : 'bg-gray-300'
                  }`}>{p.rank}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1d1d1f]">{p.name}</p>
                    <p className="text-[10px] text-[#86868b]">{p.measures} measures · <span className="cursor-pointer hover:underline" onClick={() => setDrillDown({ label: `${p.name} — Gaps`, count: p.gaps })}>{p.gaps} gaps</span></p>
                  </div>
                  <span className="text-sm font-semibold text-[#10B981]">{p.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#10B981" />
    </DashboardLayout>
  );
}
