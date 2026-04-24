'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useState } from 'react';

const programs = [
  { name: 'CCM', fullName: 'Chronic Care Management', enrolled: 1234, eligible: 3456, compliance: 87, revenue: '$456K', color: '#EC4899' },
  { name: 'PCM', fullName: 'Principal Care Management', enrolled: 567, eligible: 1234, compliance: 82, revenue: '$189K', color: '#F472B6' },
  { name: 'APCM', fullName: 'Advanced Primary Care Mgmt', enrolled: 345, eligible: 890, compliance: 79, revenue: '$234K', color: '#DB2777' },
  { name: 'TCM', fullName: 'Transitional Care Management', enrolled: 189, eligible: 345, compliance: 91, revenue: '$123K', color: '#BE185D' },
];

const upcomingTasks = [
  { patient: 'Maria Garcia', task: 'Monthly CCM outreach call', program: 'CCM', due: 'Today', status: 'pending', minutes: '15/20' },
  { patient: 'James Wilson', task: '30-day post-discharge follow-up', program: 'TCM', due: 'Today', status: 'overdue', minutes: 'N/A' },
  { patient: 'Patricia Brown', task: 'Care plan review', program: 'CCM', due: 'Tomorrow', status: 'pending', minutes: '18/20' },
  { patient: 'Robert Johnson', task: 'COPD management check-in', program: 'PCM', due: 'Tomorrow', status: 'pending', minutes: '12/20' },
  { patient: 'Linda Smith', task: 'APCM eligibility verification', program: 'APCM', due: 'Mar 4', status: 'pending', minutes: '0/20' },
  { patient: 'David Martinez', task: 'Diabetes care plan update', program: 'CCM', due: 'Mar 5', status: 'pending', minutes: '8/20' },
  { patient: 'Susan Anderson', task: 'Consent renewal', program: 'APCM', due: 'Mar 6', status: 'pending', minutes: 'N/A' },
  { patient: 'Michael Davis', task: 'Monthly PCM outreach', program: 'PCM', due: 'Mar 7', status: 'pending', minutes: '5/20' },
];

const monthlyStats = [
  { month: 'Oct', enrolled: 1890, claims: 1567, revenue: 189 },
  { month: 'Nov', enrolled: 1945, claims: 1623, revenue: 198 },
  { month: 'Dec', enrolled: 2012, claims: 1689, revenue: 210 },
  { month: 'Jan', enrolled: 2134, claims: 1756, revenue: 224 },
  { month: 'Feb', enrolled: 2256, claims: 1834, revenue: 238 },
  { month: 'Mar', enrolled: 2335, claims: 1901, revenue: 251 },
];

export default function CareManagementDashboard() {
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Care Management Dashboard</h1>
            <p className="text-sm text-[#86868b] mt-1">Enrollment stats, compliance & upcoming tasks</p>
          </div>
        </div>

        {/* Program Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {programs.map(p => (
            <div key={p.name} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold" style={{ color: p.color }}>{p.name}</span>
                <span className="text-[10px] text-[#86868b]">{p.fullName}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="cursor-pointer" onClick={() => setDrillDown({ label: `${p.name} Enrolled`, count: p.enrolled })}>
                  <p className="text-[10px] text-[#86868b]">Enrolled</p>
                  <p className="text-lg font-semibold text-[#1d1d1f] hover:underline">{p.enrolled.toLocaleString()}</p>
                </div>
                <div className="cursor-pointer" onClick={() => setDrillDown({ label: `${p.name} Eligible`, count: p.eligible })}>
                  <p className="text-[10px] text-[#86868b]">Eligible</p>
                  <p className="text-lg font-semibold text-[#6e6e73] hover:underline">{p.eligible.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-[#86868b]">Compliance</span>
                  <span className="text-[10px] font-medium" style={{ color: p.color }}>{p.compliance}%</span>
                </div>
                <div className="bg-[#f5f5f7] rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.compliance}%`, backgroundColor: p.color }} />
                </div>
              </div>
              <p className="text-sm font-medium text-[#1d1d1f] mt-3">{p.revenue} <span className="text-[10px] text-[#86868b]">YTD revenue</span></p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Tasks */}
          <div className="col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Upcoming Tasks</h3>
              <span className="text-[10px] text-red-500 font-medium">1 overdue</span>
            </div>
            <div className="space-y-2">
              {upcomingTasks.map((t, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${t.status === 'overdue' ? 'bg-red-50/50 border border-red-100' : 'hover:bg-gray-50'}`}>
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1d1d1f]"><span className="font-medium">{t.patient}</span> — {t.task}</p>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#EC4899' + '15', color: '#EC4899' }}>{t.program}</span>
                      <span className="text-[10px] text-[#86868b]">Time: {t.minutes} min</span>
                    </div>
                  </div>
                  <span className={`text-xs ${t.status === 'overdue' ? 'text-red-500 font-medium' : 'text-[#86868b]'}`}>{t.due}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Enrollment Trend */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Monthly Enrollment Trend</h3>
            <div className="space-y-3">
              {monthlyStats.map(m => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-[#86868b] w-8">{m.month}</span>
                  <div className="flex-1 bg-[#f5f5f7] rounded-full h-5 overflow-hidden relative">
                    <div className="h-full rounded-full bg-[#EC4899]" style={{ width: `${(m.enrolled / 2500) * 100}%` }} />
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-[#1d1d1f]">{m.enrolled.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium w-12 text-right">${m.revenue}K</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-[#EC4899]/5 rounded-xl">
              <p className="text-sm font-medium text-[#1d1d1f]">Total YTD Revenue</p>
              <p className="text-2xl font-semibold text-[#EC4899]">$1.002M</p>
              <p className="text-[10px] text-[#86868b] mt-1">Across all care management programs</p>
            </div>
          </div>
        </div>
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#EC4899" />
    </DashboardLayout>
  );
}
