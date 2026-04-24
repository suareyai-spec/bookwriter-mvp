'use client';

import DashboardLayout from '@/components/DashboardLayout';

const conditions = [
  { name: 'Diabetes Type 2', patients: 123, templates: 4, avgMinutes: 18, compliance: 84 },
  { name: 'COPD', patients: 89, templates: 3, avgMinutes: 16, compliance: 79 },
  { name: 'Heart Failure', patients: 76, templates: 3, avgMinutes: 19, compliance: 81 },
  { name: 'Chronic Kidney Disease', patients: 67, templates: 2, avgMinutes: 15, compliance: 77 },
  { name: 'Major Depression', patients: 54, templates: 3, avgMinutes: 17, compliance: 72 },
  { name: 'Atrial Fibrillation', patients: 43, templates: 2, avgMinutes: 14, compliance: 86 },
  { name: 'Rheumatoid Arthritis', patients: 32, templates: 2, avgMinutes: 13, compliance: 88 },
  { name: 'Multiple Sclerosis', patients: 21, templates: 2, avgMinutes: 16, compliance: 82 },
  { name: 'Parkinson Disease', patients: 18, templates: 1, avgMinutes: 15, compliance: 76 },
  { name: 'Lupus (SLE)', patients: 14, templates: 1, avgMinutes: 14, compliance: 80 },
];

export default function PCMPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Principal Care Management (PCM)</h1>
            <p className="text-sm text-[#86868b] mt-1">Single-condition focus with 27 condition templates</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'PCM Enrolled', value: '567', sub: 'of 1,234 eligible' },
            { label: 'Condition Templates', value: '27', sub: 'Active templates' },
            { label: 'Avg Minutes/Patient', value: '16.1', sub: 'Target: 20 min' },
            { label: 'Monthly Revenue', value: '$35.2K', sub: 'CPT 99424, 99425' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-[#86868b] text-xs mb-1">{m.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{m.value}</p>
              <p className="text-[11px] text-[#EC4899] mt-1">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Condition-Based Enrollment</h3>
          <div className="space-y-2">
            {conditions.map(c => (
              <div key={c.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <span className="text-sm text-[#1d1d1f] w-48 font-medium">{c.name}</span>
                <div className="flex-1 bg-[#f5f5f7] rounded-full h-4 overflow-hidden relative">
                  <div className="h-full rounded-full bg-[#EC4899]" style={{ width: `${(c.patients / 130) * 100}%` }} />
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-[#1d1d1f]">{c.patients} patients</span>
                </div>
                <span className="text-xs text-[#86868b] w-20">{c.templates} templates</span>
                <span className="text-xs text-[#6e6e73] w-16">{c.avgMinutes} min avg</span>
                <span className={`text-xs font-medium w-12 text-right ${c.compliance >= 80 ? 'text-green-600' : 'text-[#F59E0B]'}`}>{c.compliance}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
