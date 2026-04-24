'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const hccGaps = [
  { condition: 'Diabetes with Chronic Complications', icd: 'E11.65', patients: 87, revenue: 342000, status: 'Open' },
  { condition: 'Major Depressive Disorder, Recurrent', icd: 'F33.1', patients: 72, revenue: 285000, status: 'Open' },
  { condition: 'CHF (Systolic)', icd: 'I50.20', patients: 64, revenue: 268000, status: 'Suspected' },
  { condition: 'Chronic Kidney Disease Stage IV', icd: 'N18.4', patients: 58, revenue: 248000, status: 'Open' },
  { condition: 'Vascular Disease', icd: 'I73.9', patients: 53, revenue: 215000, status: 'Suspected' },
  { condition: 'COPD with Acute Exacerbation', icd: 'J44.1', patients: 49, revenue: 198000, status: 'Open' },
  { condition: 'Morbid Obesity', icd: 'E66.01', patients: 45, revenue: 182000, status: 'Suspected' },
  { condition: 'Rheumatoid Arthritis', icd: 'M06.9', patients: 41, revenue: 165000, status: 'Open' },
  { condition: 'Protein-Calorie Malnutrition', icd: 'E44.0', patients: 38, revenue: 156000, status: 'Suspected' },
  { condition: 'Drug/Alcohol Dependence', icd: 'F10.20', patients: 35, revenue: 142000, status: 'Open' },
  { condition: 'Specified Heart Arrhythmias', icd: 'I48.91', patients: 32, revenue: 128000, status: 'Open' },
  { condition: 'Polyneuropathy', icd: 'G62.9', patients: 28, revenue: 112000, status: 'Suspected' },
];

const rafDistribution = [
  { range: '0.0-0.5', count: 42 },
  { range: '0.5-1.0', count: 98 },
  { range: '1.0-1.5', count: 124 },
  { range: '1.5-2.0', count: 86 },
  { range: '2.0-2.5', count: 64 },
  { range: '2.5-3.0', count: 42 },
  { range: '3.0-3.5', count: 24 },
  { range: '3.5-4.0', count: 14 },
  { range: '4.0+', count: 6 },
];

const recapturePatients = [
  { name: 'Maria Santos', mrn: 'MRN-00147', raf: 3.84, suspected: 'CKD IV, Malnutrition, Depression', revenue: 18400 },
  { name: 'Robert Chen', mrn: 'MRN-00023', raf: 4.12, suspected: 'Vascular Disease, Neuropathy', revenue: 16800 },
  { name: 'Carmen Rodriguez', mrn: 'MRN-00201', raf: 4.28, suspected: 'Morbid Obesity, Alcohol Dep.', revenue: 15200 },
  { name: 'Patricia Brown', mrn: 'MRN-00312', raf: 3.95, suspected: 'COPD Exacerbation, Arrhythmia', revenue: 14600 },
  { name: 'William Davis', mrn: 'MRN-00156', raf: 3.52, suspected: 'CHF Systolic, CKD IV', revenue: 13800 },
  { name: 'Rosa Martinez', mrn: 'MRN-00278', raf: 3.41, suspected: 'Diabetes Complications, Depression', revenue: 12400 },
  { name: 'Dorothy Wilson', mrn: 'MRN-00412', raf: 3.22, suspected: 'Malnutrition, Vascular Disease', revenue: 11200 },
  { name: 'Michael Lee', mrn: 'MRN-00167', raf: 3.78, suspected: 'COPD, Rheumatoid Arthritis', revenue: 10800 },
  { name: 'Betty Anderson', mrn: 'MRN-00223', raf: 3.56, suspected: 'Neuropathy, Depression', revenue: 9600 },
  { name: 'Frank Harris', mrn: 'MRN-00268', raf: 3.65, suspected: 'CKD IV, Arrhythmia', revenue: 9200 },
  { name: 'Ana Diaz', mrn: 'MRN-00142', raf: 3.33, suspected: 'Morbid Obesity, Malnutrition', revenue: 8400 },
  { name: 'Carlos Perez', mrn: 'MRN-00095', raf: 2.98, suspected: 'Vascular Disease, CHF', revenue: 7800 },
  { name: 'Linda Garcia', mrn: 'MRN-00334', raf: 3.15, suspected: 'Diabetes Comp., Neuropathy', revenue: 7200 },
  { name: 'Harold Clark', mrn: 'MRN-00078', raf: 2.62, suspected: 'Depression, COPD', revenue: 6800 },
  { name: 'Gloria Morales', mrn: 'MRN-00398', raf: 3.08, suspected: 'CKD IV, Arrhythmia', revenue: 6400 },
];

const totalRevAtRisk = hccGaps.reduce((s, g) => s + g.revenue, 0);

export default function HCCPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">HCC Coding & RAF Optimization</h1>
        <p className="text-sm text-[#86868b] mb-8">Hierarchical Condition Category gap analysis and risk adjustment factor recapture</p>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Avg RAF Score', value: '1.68', sub: 'Population average' },
            { label: 'Total HCC Gaps', value: '602', sub: 'Across all members' },
            { label: 'Suspected Gaps', value: '234', sub: 'Requiring chart review' },
            { label: 'Revenue at Risk', value: `$${(totalRevAtRisk / 1000000).toFixed(1)}M`, sub: 'Annual if uncaptured' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{k.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{k.value}</p>
              <p className="text-[10px] text-[#86868b] mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* HCC Coding Gaps */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Top HCC Coding Gaps by Condition</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Condition</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">ICD-10</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Patients</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Est. Revenue Impact</th>
                  <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {hccGaps.map(g => (
                  <tr key={g.icd} className="border-b border-gray-50 hover:bg-[#f5f5f7] transition-colors">
                    <td className="py-2.5 text-sm text-[#1d1d1f] font-medium">{g.condition}</td>
                    <td className="py-2.5 text-xs text-[#86868b] font-mono">{g.icd}</td>
                    <td className="py-2.5 text-sm text-right text-[#6e6e73]">{g.patients}</td>
                    <td className="py-2.5 text-sm text-right font-semibold text-[#F97316]">${(g.revenue / 1000).toFixed(0)}K</td>
                    <td className="py-2.5 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${g.status === 'Open' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RAF Score Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">RAF Score Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rafDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#86868b' }} label={{ value: 'RAF Score Range', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#86868b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} label={{ value: 'Patients', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#86868b' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-4 text-xs text-[#86868b]">
            <span>Mean: 1.68</span>
            <span>Median: 1.42</span>
            <span>Std Dev: 0.89</span>
            <span>Population: 500 members</span>
          </div>
        </div>

        {/* Recapture Opportunities */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-1">Highest RAF Recapture Opportunities</h2>
          <p className="text-xs text-[#86868b] mb-4">Patients with the greatest potential revenue from suspected condition documentation</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Patient</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">MRN</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Current RAF</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Suspected Conditions</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Potential Revenue</th>
                </tr>
              </thead>
              <tbody>
                {recapturePatients.map(p => (
                  <tr key={p.mrn} className="border-b border-gray-50 hover:bg-[#f5f5f7] transition-colors">
                    <td className="py-2 text-sm text-[#1d1d1f] font-medium">{p.name}</td>
                    <td className="py-2 text-xs text-[#86868b]">{p.mrn}</td>
                    <td className="py-2 text-sm text-right font-semibold text-[#1d1d1f]">{p.raf.toFixed(2)}</td>
                    <td className="py-2 text-xs text-[#6e6e73]">{p.suspected}</td>
                    <td className="py-2 text-sm text-right font-semibold text-[#F97316]">${p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-[#f5f5f7] rounded-xl">
            <p className="text-sm text-[#1d1d1f] font-medium">
              Total Recapture Opportunity: <span className="text-[#F97316] font-semibold">${(recapturePatients.reduce((s, p) => s + p.revenue, 0) / 1000).toFixed(0)}K</span>
            </p>
            <p className="text-xs text-[#86868b] mt-1">Across {recapturePatients.length} high-priority patients requiring chart review and provider attestation</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
