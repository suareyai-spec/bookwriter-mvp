'use client';

import DashboardLayout from '@/components/DashboardLayout';

const gapsByCategory = [
  { category: 'Diabetes-related HCCs', gaps: 456, patients: 389, estRevenue: '$892K', priority: 'critical' },
  { category: 'Cardiovascular HCCs', gaps: 389, patients: 312, estRevenue: '$756K', priority: 'critical' },
  { category: 'Renal HCCs', gaps: 234, patients: 198, estRevenue: '$534K', priority: 'high' },
  { category: 'Respiratory HCCs', gaps: 178, patients: 156, estRevenue: '$423K', priority: 'high' },
  { category: 'Neurological HCCs', gaps: 145, patients: 123, estRevenue: '$367K', priority: 'medium' },
  { category: 'Vascular HCCs', gaps: 312, patients: 267, estRevenue: '$612K', priority: 'high' },
  { category: 'Cancer HCCs', gaps: 89, patients: 76, estRevenue: '$289K', priority: 'critical' },
  { category: 'Mental Health HCCs', gaps: 267, patients: 234, estRevenue: '$345K', priority: 'medium' },
  { category: 'Metabolic HCCs', gaps: 156, patients: 134, estRevenue: '$278K', priority: 'medium' },
  { category: 'Other HCCs', gaps: 115, patients: 98, estRevenue: '$189K', priority: 'low' },
];

const todoItems = [
  { patient: 'Maria Garcia', task: 'Code HCC 18 at next visit', due: 'Mar 5, 2026', provider: 'Dr. Martinez', status: 'pending' },
  { patient: 'James Wilson', task: 'Confirm CHF diagnosis - Echo results needed', due: 'Mar 3, 2026', provider: 'Dr. Chen', status: 'overdue' },
  { patient: 'Linda Smith', task: 'Oncology follow-up for lung cancer staging', due: 'Mar 7, 2026', provider: 'Dr. Johnson', status: 'pending' },
  { patient: 'Robert Johnson', task: 'Pulmonary function test for COPD coding', due: 'Mar 4, 2026', provider: 'Dr. Patel', status: 'in-progress' },
  { patient: 'Patricia Brown', task: 'BMI documentation for morbid obesity HCC', due: 'Mar 6, 2026', provider: 'Dr. Martinez', status: 'pending' },
];

export default function CodingGapsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Coding Gap Alerts & To-Do</h1>
            <p className="text-sm text-[#86868b] mt-1">Prioritized coding opportunities and action items</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Gaps by Category */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Gaps by HCC Category</h3>
            <div className="space-y-2">
              {gapsByCategory.map(g => (
                <div key={g.category} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <span className={`w-2 h-2 rounded-full ${
                    g.priority === 'critical' ? 'bg-red-500' :
                    g.priority === 'high' ? 'bg-orange-500' :
                    g.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-xs text-[#1d1d1f] flex-1">{g.category}</span>
                  <span className="text-xs font-medium text-[#F59E0B]">{g.gaps} gaps</span>
                  <span className="text-xs text-green-600 font-medium w-16 text-right">{g.estRevenue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* To-Do List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Coding To-Do Items</h3>
              <span className="text-[10px] text-red-500 font-medium">1 overdue</span>
            </div>
            <div className="space-y-3">
              {todoItems.map((t, i) => (
                <div key={i} className={`p-3 rounded-xl border ${t.status === 'overdue' ? 'border-red-200 bg-red-50/50' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#1d1d1f]">{t.patient}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      t.status === 'overdue' ? 'bg-red-100 text-red-600' :
                      t.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>{t.status}</span>
                  </div>
                  <p className="text-xs text-[#6e6e73]">{t.task}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-[#86868b]">Due: {t.due}</span>
                    <span className="text-[10px] text-[#86868b]">{t.provider}</span>
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
