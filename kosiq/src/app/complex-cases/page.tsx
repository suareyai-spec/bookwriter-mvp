'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0071e3','#34c759','#ff9f0a','#af52de','#ff3b30','#5ac8fa','#ff6384','#36a2eb','#ffce56','#4bc0c0'];

const byMonth = [
  { month: 'Jul', cases: 1738 }, { month: 'Aug', cases: 1620 }, { month: 'Sep', cases: 1485 },
  { month: 'Oct', cases: 1320 }, { month: 'Nov', cases: 1150 }, { month: 'Dec', cases: 980 },
  { month: 'Jan', cases: 842 }, { month: 'Feb', cases: 759 },
];

const topDiagnoses = [
  { name: 'Essential HTN (I10)', value: 286 },
  { name: 'Type 2 DM (E11.9)', value: 215 },
  { name: 'CHF (I50.9)', value: 132 },
  { name: 'CKD Stage 3 (N18.3)', value: 128 },
  { name: 'COPD (J44.1)', value: 117 },
  { name: 'Obesity (E66.01)', value: 115 },
  { name: 'A-Fib (I48.91)', value: 112 },
  { name: 'Depression (F32.1)', value: 100 },
  { name: 'CAD (I25.10)', value: 87 },
  { name: 'Hyperlipidemia (E78.5)', value: 80 },
];

export default function ComplexCasesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Complex Cases</h1>
        {/* KPI Cards */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Patients', value: '2,000' },
            { label: 'Readmission Rate', value: '14.5%' },
            { label: 'Total Complex Cases', value: '759', sub: 'Seen 87 / Unseen 672' },
            { label: 'CCM Score', value: '5.07', sub: 'High 255 / Low 504' },
            { label: 'MLR', value: '82.4%' },
            { label: 'Avg Cost/Case', value: '$18,420' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] text-[#86868b] uppercase tracking-wider">{kpi.label}</p>
              <p className="text-xl font-semibold text-[#1d1d1f] mt-1">{kpi.value}</p>
              {kpi.sub && <p className="text-[10px] text-[#86868b] mt-0.5">{kpi.sub}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Complex Cases by Month</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#86868b' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Bar dataKey="cases" fill="#0071e3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Top 10 Diagnoses</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={topDiagnoses} cx="50%" cy="50%" outerRadius={100} innerRadius={45} dataKey="value" label={({ name, value }: any) => `${value}`}>
                  {topDiagnoses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnosis Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Complex Cases by Diagnosis</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['ICD-10','Description','Total Count','% of Total'].map(h=>(
                <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {topDiagnoses.map((d, i) => {
                const code = d.name.match(/\(([^)]+)\)/)?.[1] || '';
                const desc = d.name.replace(/\s*\([^)]+\)/, '');
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                    <td className="py-2.5 px-3 font-mono text-xs text-[#0071e3]">{code}</td>
                    <td className="py-2.5 px-3">{desc}</td>
                    <td className="py-2.5 px-3 font-medium">{d.value}</td>
                    <td className="py-2.5 px-3 text-[#86868b]">{((d.value / 1372) * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
