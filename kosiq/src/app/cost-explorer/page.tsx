'use client';
import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useState } from 'react';

const costCategories = [
  { category: 'Inpatient', pct: 34.2, amount: '$12.4M', trend: '+2.1%' },
  { category: 'Outpatient', pct: 24.5, amount: '$8.9M', trend: '-1.3%' },
  { category: 'Pharmacy', pct: 18.5, amount: '$6.7M', trend: '+5.7%' },
  { category: 'Professional', pct: 12.4, amount: '$4.5M', trend: '+0.8%' },
  { category: 'Emergency', pct: 6.3, amount: '$2.3M', trend: '-3.2%' },
  { category: 'Other', pct: 4.1, amount: '$1.5M', trend: '+1.1%' },
];

export default function CostExplorerDashboard() {
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Cost Explorer Dashboard</h1>
        <p className="text-sm text-[#86868b] mb-8">Medicare claims data & population cost analysis</p>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Medical Spend', value: '$36.3M', sub: 'TTM' },
            { label: 'PMPM Cost', value: '$163', sub: '+2.4% vs prior' },
            { label: 'Preventable ER Visits', value: '1,234', sub: '$3.7M avoidable', clickCount: 1234 },
            { label: 'Cost per Member', value: '$1,970', sub: 'Annual average' },
          ].map((m: any, i: number) => (
            <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100${m.clickCount ? ' cursor-pointer' : ''}`} onClick={() => m.clickCount && setDrillDown({ label: m.label, count: m.clickCount })}>
              <p className="text-[#86868b] text-xs mb-1">{m.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{m.value}</p>
              <p className="text-[11px] text-[#EF4444] mt-1">{m.sub}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Cost by Category</h3>
          <div className="space-y-3">
            {costCategories.map(c => (
              <div key={c.category} className="flex items-center gap-3">
                <span className="text-xs text-[#1d1d1f] w-24">{c.category}</span>
                <div className="flex-1 bg-[#f5f5f7] rounded-full h-5 overflow-hidden relative">
                  <div className="h-full rounded-full bg-[#EF4444]" style={{ width: c.pct + '%', opacity: 0.6 + (c.pct / 100) * 0.4 }} />
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium">{c.pct}%</span>
                </div>
                <span className="text-xs text-[#1d1d1f] w-16 text-right font-medium">{c.amount}</span>
                <span className={'text-[10px] w-12 text-right ' + (c.trend.startsWith('+') ? 'text-red-500' : 'text-green-600')}>{c.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#EF4444" />
    </DashboardLayout>
  );
}
