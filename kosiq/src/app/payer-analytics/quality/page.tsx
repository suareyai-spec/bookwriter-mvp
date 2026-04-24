'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const hedisMeasures = [
  { measure: 'Diabetes HbA1c Control (<8%)', desc: 'Comprehensive diabetes care', compliant: 312, total: 410, target: 80 },
  { measure: 'Breast Cancer Screening', desc: 'Mammogram within 2 years (women 50-74)', compliant: 189, total: 234, target: 78 },
  { measure: 'Colorectal Cancer Screening', desc: 'Screening per guidelines (50-75)', compliant: 268, total: 365, target: 75 },
  { measure: 'Controlling Blood Pressure (<140/90)', desc: 'BP control for hypertensive patients', compliant: 348, total: 432, target: 82 },
  { measure: 'Statin Therapy for CVD', desc: 'Statin prescribed for cardiovascular patients', compliant: 195, total: 248, target: 85 },
  { measure: 'Medication Adherence - Diabetes', desc: 'PDC >= 80% for diabetes medications', compliant: 287, total: 378, target: 83 },
  { measure: 'Medication Adherence - Hypertension', desc: 'PDC >= 80% for RAS antagonists', compliant: 302, total: 398, target: 83 },
  { measure: 'Medication Adherence - Statins', desc: 'PDC >= 80% for statin medications', compliant: 265, total: 342, target: 83 },
  { measure: 'Fall Risk Management', desc: 'Fall risk screening and plan (65+)', compliant: 312, total: 425, target: 76 },
  { measure: 'Care for Older Adults - Pain', desc: 'Pain assessment for adults 66+', compliant: 356, total: 425, target: 74 },
  { measure: 'Osteoporosis Management', desc: 'BMD test or Rx within 6mo of fracture', compliant: 42, total: 58, target: 72 },
  { measure: 'Annual Flu Vaccine', desc: 'Influenza vaccine administered', compliant: 378, total: 500, target: 78 },
];

const starComponents = [
  { category: 'Staying Healthy', score: 4.2 },
  { category: 'Managing Chronic', score: 3.8 },
  { category: 'Member Experience', score: 4.0 },
  { category: 'Member Complaints', score: 4.5 },
  { category: 'Health Plan Service', score: 3.6 },
  { category: 'Drug Plan Service', score: 4.1 },
  { category: 'Drug Safety', score: 3.9 },
];

const outreachPriority = [
  { name: 'Maria Santos', mrn: 'MRN-00147', gaps: 4, measures: 'HbA1c, Statin, Med Adherence (DM), Fall Risk', priority: 'Critical', lastContact: '2026-02-12' },
  { name: 'Carlos Perez', mrn: 'MRN-00095', gaps: 3, measures: 'Colorectal Screen, BP Control, Med Adherence (HTN)', priority: 'Critical', lastContact: '2026-01-28' },
  { name: 'Dorothy Wilson', mrn: 'MRN-00412', gaps: 3, measures: 'HbA1c, Breast Cancer Screen, Fall Risk', priority: 'Critical', lastContact: '2026-02-18' },
  { name: 'Rosa Martinez', mrn: 'MRN-00278', gaps: 3, measures: 'BP Control, Statin, Flu Vaccine', priority: 'High', lastContact: '2026-03-02' },
  { name: 'Harold Clark', mrn: 'MRN-00078', gaps: 2, measures: 'Colorectal Screen, Med Adherence (Statin)', priority: 'High', lastContact: '2026-02-25' },
  { name: 'Frank Harris', mrn: 'MRN-00268', gaps: 2, measures: 'HbA1c, Osteoporosis Mgmt', priority: 'High', lastContact: '2026-01-15' },
  { name: 'Betty Anderson', mrn: 'MRN-00223', gaps: 2, measures: 'Breast Cancer Screen, Fall Risk', priority: 'Medium', lastContact: '2026-03-10' },
  { name: 'Linda Garcia', mrn: 'MRN-00334', gaps: 2, measures: 'Statin Therapy, Flu Vaccine', priority: 'Medium', lastContact: '2026-02-20' },
  { name: 'Nancy Thompson', mrn: 'MRN-00301', gaps: 2, measures: 'BP Control, Pain Assessment', priority: 'Medium', lastContact: '2026-03-05' },
  { name: 'Ana Diaz', mrn: 'MRN-00142', gaps: 1, measures: 'Med Adherence (Diabetes)', priority: 'Low', lastContact: '2026-03-14' },
];

export default function QualityPage() {
  const totalCompliant = hedisMeasures.reduce((s, m) => s + m.compliant, 0);
  const totalDenom = hedisMeasures.reduce((s, m) => s + m.total, 0);
  const overallCompliance = ((totalCompliant / totalDenom) * 100).toFixed(1);
  const gapsInCare = totalDenom - totalCompliant;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Quality Measures (HEDIS/Stars)</h1>
        <p className="text-sm text-[#86868b] mb-8">HEDIS compliance tracking, Star rating components, and quality gap closure</p>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Overall Star Rating', value: '4.0', sub: 'CMS 2026 projection' },
            { label: 'HEDIS Compliance', value: `${overallCompliance}%`, sub: `${totalCompliant.toLocaleString()} / ${totalDenom.toLocaleString()} measures` },
            { label: 'Gaps in Care', value: gapsInCare.toLocaleString(), sub: 'Open quality gaps' },
            { label: 'Quality Bonus', value: '$2.4M', sub: 'Projected if 4+ stars maintained' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{k.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{k.value}</p>
              <p className="text-[10px] text-[#86868b] mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* HEDIS Measures Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">HEDIS Measure Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Measure</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Description</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Compliant</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Rate</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Target</th>
                  <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {hedisMeasures.map(m => {
                  const rate = ((m.compliant / m.total) * 100).toFixed(1);
                  const met = parseFloat(rate) >= m.target;
                  return (
                    <tr key={m.measure} className="border-b border-gray-50 hover:bg-[#f5f5f7] transition-colors">
                      <td className="py-2.5 text-sm text-[#1d1d1f] font-medium">{m.measure}</td>
                      <td className="py-2.5 text-xs text-[#86868b]">{m.desc}</td>
                      <td className="py-2.5 text-xs text-right text-[#6e6e73]">{m.compliant}/{m.total}</td>
                      <td className="py-2.5 text-sm text-right font-semibold" style={{ color: met ? '#059669' : '#F97316' }}>{rate}%</td>
                      <td className="py-2.5 text-xs text-right text-[#86868b]">{m.target}%</td>
                      <td className="py-2.5 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${met ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                          {met ? 'Met' : 'Not Met'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Star Rating Components */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Star Rating Components</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={starComponents} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: '#86868b' }} ticks={[0, 1, 2, 3, 4, 5]} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#86868b' }} width={130} />
              <Tooltip formatter={(v: number) => [`${v} / 5.0`, 'Score']} />
              <Bar dataKey="score" fill="#F97316" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-2 mt-3">
            <div className="h-2 w-full bg-[#f5f5f7] rounded-full relative">
              <div className="absolute left-0 top-0 h-2 bg-[#F97316] rounded-full" style={{ width: '80%' }} />
              <div className="absolute h-4 w-0.5 bg-[#1d1d1f] top-[-4px]" style={{ left: '80%' }} />
            </div>
            <span className="text-xs text-[#86868b] whitespace-nowrap">4.0 / 5.0 Overall</span>
          </div>
        </div>

        {/* Outreach Priority */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-1">Patient Outreach Priority List</h2>
          <p className="text-xs text-[#86868b] mb-4">Members with open quality gaps ordered by closure impact</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Patient</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">MRN</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Open Gaps</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Measures Needed</th>
                  <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase pb-3">Priority</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {outreachPriority.map(p => (
                  <tr key={p.mrn} className="border-b border-gray-50 hover:bg-[#f5f5f7] transition-colors">
                    <td className="py-2 text-sm text-[#1d1d1f] font-medium">{p.name}</td>
                    <td className="py-2 text-xs text-[#86868b]">{p.mrn}</td>
                    <td className="py-2 text-sm text-right font-semibold text-[#F97316]">{p.gaps}</td>
                    <td className="py-2 text-xs text-[#6e6e73]">{p.measures}</td>
                    <td className="py-2 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.priority === 'Critical' ? 'bg-red-50 text-red-700' :
                        p.priority === 'High' ? 'bg-orange-50 text-orange-700' :
                        p.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>{p.priority}</span>
                    </td>
                    <td className="py-2 text-xs text-right text-[#6e6e73]">{p.lastContact}</td>
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
