'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useState } from 'react';

const acgTiers = [
  { tier: 'Healthy', range: '0.0 - 0.5', count: 4542, pct: 24.7, avgCost: '$1,240', morbidity: 0.3, adherence: 89, color: '#06B6D4' },
  { tier: 'Low Risk', range: '0.5 - 1.0', count: 7123, pct: 38.7, avgCost: '$3,890', morbidity: 1.2, adherence: 82, color: '#10B981' },
  { tier: 'Moderate', range: '1.0 - 2.0', count: 4521, pct: 24.5, avgCost: '$8,450', morbidity: 2.8, adherence: 74, color: '#F59E0B' },
  { tier: 'High Risk', range: '2.0 - 3.5', count: 1834, pct: 9.9, avgCost: '$18,900', morbidity: 4.6, adherence: 67, color: '#F97316' },
  { tier: 'Very High', range: '3.5+', count: 412, pct: 2.2, avgCost: '$52,300', morbidity: 7.1, adherence: 58, color: '#EF4444' },
];

const conditions = [
  { name: 'Diabetes Mellitus', adherence: 72, controlled: 68, patients: 3240, trend: 'improving' },
  { name: 'Hypertension', adherence: 78, controlled: 71, patients: 5412, trend: 'stable' },
  { name: 'Hyperlipidemia', adherence: 81, controlled: 74, patients: 4890, trend: 'improving' },
  { name: 'COPD', adherence: 64, controlled: 56, patients: 892, trend: 'declining' },
  { name: 'Heart Failure', adherence: 69, controlled: 52, patients: 1856, trend: 'stable' },
  { name: 'CKD', adherence: 71, controlled: 48, patients: 1234, trend: 'declining' },
  { name: 'Depression', adherence: 58, controlled: 42, patients: 2187, trend: 'stable' },
  { name: 'Asthma', adherence: 76, controlled: 69, patients: 1567, trend: 'improving' },
  { name: 'CAD', adherence: 73, controlled: 61, patients: 1345, trend: 'stable' },
  { name: 'Atrial Fibrillation', adherence: 77, controlled: 65, patients: 987, trend: 'improving' },
  { name: 'Obesity', adherence: 45, controlled: 22, patients: 4321, trend: 'declining' },
  { name: 'Anxiety', adherence: 62, controlled: 48, patients: 1876, trend: 'stable' },
  { name: 'Osteoarthritis', adherence: 68, controlled: 54, patients: 2345, trend: 'stable' },
  { name: 'Thyroid Disorders', adherence: 84, controlled: 78, patients: 1654, trend: 'improving' },
  { name: 'GERD', adherence: 79, controlled: 72, patients: 2109, trend: 'stable' },
  { name: 'Sleep Apnea', adherence: 56, controlled: 41, patients: 1432, trend: 'declining' },
  { name: 'Osteoporosis', adherence: 71, controlled: 59, patients: 876, trend: 'stable' },
];

export default function ARCPage() {
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">ARC — Adaptive Risk Classification</h1>
            <p className="text-sm text-[#86868b] mt-1">KOSIQ proprietary risk classification — morbidity markers & medication adherence</p>
          </div>
        </div>

        {/* ARC Tiers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Risk Tier Distribution</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Tier</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Score Range</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Patients</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">% Pop</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Avg Cost</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Morbidity</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Adherence %</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3 w-40">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {acgTiers.map(t => (
                  <tr key={t.tier} className="border-b border-gray-50">
                    <td className="py-3 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="text-sm font-medium text-[#1d1d1f]">{t.tier}</span>
                    </td>
                    <td className="py-3 text-xs text-[#6e6e73]">{t.range}</td>
                    <td className="py-3 text-sm text-right text-[#1d1d1f] cursor-pointer hover:underline hover:text-[#F59E0B]" onClick={() => setDrillDown({ label: `ARC ${t.tier}`, count: t.count })}>{t.count.toLocaleString()}</td>
                    <td className="py-3 text-sm text-right text-[#6e6e73]">{t.pct}%</td>
                    <td className="py-3 text-sm text-right font-medium text-[#1d1d1f]">{t.avgCost}</td>
                    <td className="py-3 text-sm text-right text-[#6e6e73]">{t.morbidity}</td>
                    <td className="py-3 text-sm text-right">{t.adherence}%</td>
                    <td className="py-3 w-40">
                      <div className="bg-[#f5f5f7] rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.pct}%`, backgroundColor: t.color }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Medication Adherence by Condition */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Medication Adherence Across 17 Conditions</h3>
          <div className="grid grid-cols-1 gap-2">
            {conditions.map(c => (
              <div key={c.name} className="flex items-center gap-3 py-1.5">
                <span className="text-xs text-[#1d1d1f] w-36 truncate">{c.name}</span>
                <div className="flex-1 bg-[#f5f5f7] rounded-full h-5 overflow-hidden relative">
                  <div className="h-full rounded-full" style={{ width: `${c.adherence}%`, backgroundColor: c.adherence >= 75 ? '#10B981' : c.adherence >= 60 ? '#F59E0B' : '#EF4444' }} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-[#1d1d1f]">{c.adherence}%</span>
                </div>
                <span className="text-[10px] text-[#86868b] w-16 text-right cursor-pointer hover:underline hover:text-[#F59E0B]" onClick={() => setDrillDown({ label: c.name, count: c.patients })}>{c.patients.toLocaleString()} pts</span>
                <span className={`text-[10px] w-16 text-right ${c.trend === 'improving' ? 'text-green-600' : c.trend === 'declining' ? 'text-red-500' : 'text-[#86868b]'}`}>
                  {c.trend === 'improving' ? '↑' : c.trend === 'declining' ? '↓' : '→'} {c.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#F59E0B" />
    </DashboardLayout>
  );
}
