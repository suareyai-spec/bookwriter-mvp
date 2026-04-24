'use client';
import DashboardLayout from '@/components/DashboardLayout';

const gaps = [
  { gap: 'Diabetic patients without eye exam', patients: 445, cost: '$890K', intervention: 'Ophthalmology referral', roi: '3.2x' },
  { gap: 'CHF without cardiology follow-up', patients: 234, cost: '$1.9M', intervention: 'Care coordination', roi: '4.5x' },
  { gap: 'COPD without pulmonary rehab', patients: 178, cost: '$534K', intervention: 'Pulm rehab referral', roi: '2.8x' },
  { gap: 'Uncontrolled HTN without med adjustment', patients: 567, cost: '$1.1M', intervention: 'Medication review', roi: '5.1x' },
  { gap: 'Post-discharge without 7-day F/U', patients: 156, cost: '$2.3M', intervention: 'TCM program', roi: '6.2x' },
];

export default function CareGapsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Care Gap Identification</h1>
        <p className="text-sm text-[#86868b] mb-8">Claims-based care gaps & ROI projections</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Care Gap</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Patients</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Cost Impact</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Intervention</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">ROI</th>
            </tr></thead>
            <tbody>
              {gaps.map(g => (
                <tr key={g.gap} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm text-[#1d1d1f]">{g.gap}</td>
                  <td className="px-5 py-3 text-sm text-right text-[#EF4444] font-medium">{g.patients}</td>
                  <td className="px-5 py-3 text-sm text-right font-medium text-[#1d1d1f]">{g.cost}</td>
                  <td className="px-5 py-3 text-xs text-[#6e6e73]">{g.intervention}</td>
                  <td className="px-5 py-3 text-sm text-right text-green-600 font-medium">{g.roi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
