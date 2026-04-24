'use client';

import DashboardLayout from '@/components/DashboardLayout';
import MetricCard from '@/components/MetricCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const kpiTrend = [
  { month: 'Sep', members: 462, pmpm: 1810, mlr: 87.2, admin: 12.8 },
  { month: 'Oct', members: 470, pmpm: 1940, mlr: 86.8, admin: 13.2 },
  { month: 'Nov', members: 478, pmpm: 1980, mlr: 86.5, admin: 13.5 },
  { month: 'Dec', members: 485, pmpm: 1908, mlr: 85.8, admin: 14.2 },
  { month: 'Jan', members: 492, pmpm: 1850, mlr: 85.1, admin: 14.9 },
  { month: 'Feb', members: 500, pmpm: 1694, mlr: 84.2, admin: 15.8 },
];

const payerComparison = [
  { payer: 'Simply Health', members: 145, pmpm: 1720, mlr: 83.5, quality: 4.2 },
  { payer: 'Sunshine Health', members: 120, pmpm: 1680, mlr: 85.1, quality: 3.8 },
  { payer: 'Humana', members: 98, pmpm: 1750, mlr: 84.8, quality: 4.0 },
  { payer: 'Aetna Better Health', members: 72, pmpm: 1640, mlr: 82.9, quality: 4.1 },
  { payer: 'Molina', members: 40, pmpm: 1810, mlr: 86.2, quality: 3.6 },
  { payer: 'WellCare', members: 25, pmpm: 1690, mlr: 84.5, quality: 3.9 },
];

const providerNetwork = [
  { type: 'Primary Care', count: 12, patients: 500, avgPanel: 42 },
  { type: 'Cardiology', count: 4, patients: 125, avgPanel: 31 },
  { type: 'Endocrinology', count: 3, patients: 98, avgPanel: 33 },
  { type: 'Nephrology', count: 2, patients: 47, avgPanel: 24 },
  { type: 'Pulmonology', count: 2, patients: 60, avgPanel: 30 },
  { type: 'Psychiatry', count: 2, patients: 45, avgPanel: 23 },
];

const qualityScores = [
  { measure: 'Diabetes Care (HbA1c)', stars: 4, score: 82 },
  { measure: 'Blood Pressure Control', stars: 3, score: 74 },
  { measure: 'Medication Adherence', stars: 4, score: 78 },
  { measure: 'Preventive Screening', stars: 3, score: 71 },
  { measure: 'Care Coordination', stars: 4, score: 85 },
  { measure: 'Member Experience', stars: 4, score: 80 },
];

export default function ExecutiveSummaryPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Executive Summary</h1>
        <p className="text-sm text-[#86868b] mt-1">High-level KPIs & organizational performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Members" value={500} previousValue={478} format="number" color="blue" icon="👥" />
        <MetricCard title="PMPM" value="$1,694" previousValue={1908} format="currency" color="green" icon="💵" />
        <MetricCard title="Medical Loss Ratio" value="84.2%" previousValue={86.5} format="percent" color="green" icon="📉" />
        <MetricCard title="Admin Cost Ratio" value="15.8%" previousValue={14.9} format="percent" color="orange" icon="🏢" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider mb-4">PMPM & MLR Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={kpiTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#86868b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#86868b' }} tickFormatter={v => `$${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#86868b' }} domain={[80, 90]} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="pmpm" stroke="#0071e3" strokeWidth={2} name="PMPM ($)" />
              <Line yAxisId="right" type="monotone" dataKey="mlr" stroke="#ff9f0a" strokeWidth={2} name="MLR (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider mb-4">Membership Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={kpiTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#86868b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#86868b' }} domain={[440, 520]} />
              <Tooltip />
              <Line type="monotone" dataKey="members" stroke="#34c759" strokeWidth={2} dot={{ r: 4, fill: '#34c759' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">Payer Comparison</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Payer</th><th>Members</th><th>PMPM</th><th>MLR</th><th>Quality</th></tr></thead>
            <tbody>
              {payerComparison.map(p => (
                <tr key={p.payer}>
                  <td className="font-medium">{p.payer}</td>
                  <td>{p.members}</td>
                  <td className="font-mono">${p.pmpm.toLocaleString()}</td>
                  <td>{p.mlr}%</td>
                  <td>{'⭐'.repeat(Math.round(p.quality))} <span className="text-xs text-[#86868b]">{p.quality}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">Quality Score Summary (HEDIS/STARS)</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Measure</th><th>Score</th><th>Stars</th></tr></thead>
            <tbody>
              {qualityScores.map(q => (
                <tr key={q.measure}>
                  <td className="font-medium">{q.measure}</td>
                  <td className="font-mono">{q.score}%</td>
                  <td>{'⭐'.repeat(q.stars)}<span className="text-[#d4d4d4]">{'☆'.repeat(5 - q.stars)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">Provider Network Summary</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>Specialty</th><th>Providers</th><th>Patients Served</th><th>Avg Panel Size</th></tr></thead>
          <tbody>
            {providerNetwork.map(p => (
              <tr key={p.type}>
                <td className="font-medium">{p.type}</td>
                <td>{p.count}</td>
                <td>{p.patients}</td>
                <td>{p.avgPanel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
