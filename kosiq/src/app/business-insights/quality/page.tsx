'use client';

import DashboardLayout from '@/components/DashboardLayout';
import MetricCard from '@/components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const hedisMeasures = [
  { measure: 'Comprehensive Diabetes Care (HbA1c)', num: 312, den: 380, rate: 82.1, goal: 85, status: 'Near Goal' },
  { measure: 'Controlling High Blood Pressure', num: 285, den: 385, rate: 74.0, goal: 80, status: 'Below Goal' },
  { measure: 'Breast Cancer Screening', num: 98, den: 125, rate: 78.4, goal: 75, status: 'Met' },
  { measure: 'Colorectal Cancer Screening', num: 142, den: 210, rate: 67.6, goal: 72, status: 'Below Goal' },
  { measure: 'Medication Adherence (DM)', num: 245, den: 298, rate: 82.2, goal: 80, status: 'Met' },
  { measure: 'Medication Adherence (HTN)', num: 198, den: 260, rate: 76.2, goal: 80, status: 'Below Goal' },
  { measure: 'Fall Risk Management (65+)', num: 88, den: 147, rate: 59.9, goal: 65, status: 'Below Goal' },
  { measure: 'Follow-Up After ER Visit', num: 52, den: 67, rate: 77.6, goal: 75, status: 'Met' },
  { measure: 'Annual Wellness Visit', num: 342, den: 500, rate: 68.4, goal: 75, status: 'Below Goal' },
  { measure: 'Osteoporosis Screening (65+ F)', num: 45, den: 62, rate: 72.6, goal: 70, status: 'Met' },
];

const starsCategories = [
  { category: 'Staying Healthy', stars: 4, score: 81 },
  { category: 'Managing Chronic Conditions', stars: 4, score: 82 },
  { category: 'Member Experience', stars: 4, score: 80 },
  { category: 'Complaints & Access', stars: 3, score: 72 },
  { category: 'Drug Safety', stars: 4, score: 85 },
];

const careGapClosure = [
  { gap: 'HbA1c Testing', closed: 312, total: 380, rate: 82 },
  { gap: 'Eye Exam (DM)', closed: 198, total: 380, rate: 52 },
  { gap: 'Nephropathy Screening', closed: 285, total: 380, rate: 75 },
  { gap: 'Annual Wellness', closed: 342, total: 500, rate: 68 },
  { gap: 'Flu Vaccination', closed: 345, total: 500, rate: 69 },
  { gap: 'Depression Screening', closed: 380, total: 500, rate: 76 },
];

const preventiveScreening = [
  { screening: 'Mammography', eligible: 125, completed: 98, rate: 78.4 },
  { screening: 'Colonoscopy', eligible: 210, completed: 142, rate: 67.6 },
  { screening: 'Bone Density', eligible: 62, completed: 45, rate: 72.6 },
  { screening: 'Cervical Cancer', eligible: 95, completed: 78, rate: 82.1 },
  { screening: 'Lung Cancer (LDCT)', eligible: 38, completed: 22, rate: 57.9 },
];

const chronicDisease = [
  { condition: 'Diabetes (controlled)', patients: 380, controlled: 312, rate: 82.1 },
  { condition: 'Hypertension (controlled)', patients: 385, controlled: 285, rate: 74.0 },
  { condition: 'CHF (stable)', patients: 42, controlled: 35, rate: 83.3 },
  { condition: 'COPD (no exacerbation)', patients: 38, controlled: 28, rate: 73.7 },
  { condition: 'CKD (stable eGFR)', patients: 24, controlled: 18, rate: 75.0 },
];

const statusColors: Record<string, string> = { Met: 'bg-green-50 text-green-700', 'Near Goal': 'bg-orange-50 text-orange-700', 'Below Goal': 'bg-red-50 text-red-700' };

export default function QualityMetricsPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Quality Metrics</h1>
        <p className="text-sm text-[#86868b] mt-1">HEDIS measures, STARS ratings & care gap closure</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Overall STARS Rating" value="3.8" previousValue={3.5} format="number" color="blue" icon="⭐" />
        <MetricCard title="HEDIS Measures Met" value="4 of 10" format="number" color="green" icon="✅" />
        <MetricCard title="Avg Care Gap Closure" value="70.3%" previousValue={66.8} format="percent" color="blue" icon="🎯" />
        <MetricCard title="Preventive Screening Rate" value="71.7%" previousValue={68.2} format="percent" color="green" icon="🔬" />
      </div>

      <div className="glass-card p-6 mb-8">
        <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider mb-4">STARS Rating Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {starsCategories.map(s => (
            <div key={s.category} className="text-center p-4 bg-[#f5f5f7] rounded-xl">
              <p className="text-lg mb-1">{'⭐'.repeat(s.stars)}<span className="text-[#d4d4d4]">{'☆'.repeat(5 - s.stars)}</span></p>
              <p className="text-xl font-bold text-[#0071e3]">{s.score}%</p>
              <p className="text-xs text-[#86868b] mt-1">{s.category}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 mb-8">
        <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider mb-4">Care Gap Closure Rates</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={careGapClosure}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="gap" tick={{ fontSize: 10, fill: '#86868b' }} />
            <YAxis tick={{ fontSize: 12, fill: '#86868b' }} domain={[0, 100]} />
            <Tooltip formatter={(v: any) => `${v}%`} />
            <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
              {careGapClosure.map((d, i) => <Cell key={i} fill={d.rate >= 75 ? '#34c759' : d.rate >= 65 ? '#ff9f0a' : '#ff3b30'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">HEDIS Measures</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>Measure</th><th>Num</th><th>Den</th><th>Rate</th><th>Goal</th><th>Status</th></tr></thead>
          <tbody>
            {hedisMeasures.map(h => (
              <tr key={h.measure}>
                <td className="font-medium text-sm">{h.measure}</td>
                <td>{h.num}</td>
                <td>{h.den}</td>
                <td className="font-mono">{h.rate}%</td>
                <td className="font-mono text-[#86868b]">{h.goal}%</td>
                <td><span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[h.status]}`}>{h.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">Preventive Screening Rates</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Screening</th><th>Eligible</th><th>Completed</th><th>Rate</th></tr></thead>
            <tbody>
              {preventiveScreening.map(s => (
                <tr key={s.screening}>
                  <td className="font-medium">{s.screening}</td>
                  <td>{s.eligible}</td>
                  <td>{s.completed}</td>
                  <td className={`font-mono ${s.rate >= 75 ? 'text-green-600' : 'text-orange-600'}`}>{s.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">Chronic Disease Management</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Condition</th><th>Patients</th><th>Controlled</th><th>Rate</th></tr></thead>
            <tbody>
              {chronicDisease.map(c => (
                <tr key={c.condition}>
                  <td className="font-medium">{c.condition}</td>
                  <td>{c.patients}</td>
                  <td>{c.controlled}</td>
                  <td className={`font-mono ${c.rate >= 80 ? 'text-green-600' : 'text-orange-600'}`}>{c.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
