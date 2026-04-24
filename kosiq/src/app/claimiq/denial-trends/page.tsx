'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';

const denialReasons = [
  { reason: 'Missing modifier', count: 342, amount: 89000 },
  { reason: 'Medical necessity', count: 287, amount: 156000 },
  { reason: 'Timely filing', count: 198, amount: 67000 },
  { reason: 'Duplicate claim', count: 176, amount: 54000 },
  { reason: 'Invalid diagnosis', count: 154, amount: 48000 },
  { reason: 'Auth required', count: 143, amount: 92000 },
  { reason: 'Bundled procedure', count: 121, amount: 38000 },
  { reason: 'Coordination of benefits', count: 98, amount: 31000 },
  { reason: 'Non-covered service', count: 87, amount: 44000 },
  { reason: 'Patient eligibility', count: 76, amount: 29000 },
];

const payerDenials = [
  { payer: 'Aetna', rate: 12.3, count: 145 },
  { payer: 'BCBS', rate: 8.7, count: 98 },
  { payer: 'Cigna', rate: 15.1, count: 187 },
  { payer: 'UHC', rate: 11.4, count: 156 },
  { payer: 'Humana', rate: 9.2, count: 78 },
  { payer: 'Medicare', rate: 6.8, count: 112 },
  { payer: 'Medicaid', rate: 10.5, count: 89 },
];

const providerDenials = [
  { provider: 'Dr. Smith A', totalClaims: 450, denied: 54, rate: 12.0, topReason: 'Missing modifier' },
  { provider: 'Dr. Johnson B', totalClaims: 380, denied: 38, rate: 10.0, topReason: 'Medical necessity' },
  { provider: 'Dr. Williams C', totalClaims: 520, denied: 73, rate: 14.0, topReason: 'Auth required' },
  { provider: 'Dr. Brown D', totalClaims: 290, denied: 20, rate: 6.9, topReason: 'Timely filing' },
  { provider: 'Dr. Jones E', totalClaims: 410, denied: 49, rate: 12.0, topReason: 'Missing modifier' },
  { provider: 'Dr. Garcia F', totalClaims: 340, denied: 24, rate: 7.1, topReason: 'Duplicate claim' },
  { provider: 'Dr. Miller G', totalClaims: 480, denied: 82, rate: 17.1, topReason: 'Invalid diagnosis' },
  { provider: 'Dr. Davis H', totalClaims: 360, denied: 29, rate: 8.1, topReason: 'Bundled procedure' },
];

const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const trendData = months.map((m, i) => ({
  month: m,
  rate: 9 + Math.round(Math.sin(i / 2) * 3 * 10) / 10 + Math.random() * 2,
  amount: 40000 + Math.round(Math.random() * 30000),
}));

const categoryData = [
  { name: 'Clinical', value: 35, color: '#7C3AED' },
  { name: 'Administrative', value: 28, color: '#a78bfa' },
  { name: 'Coding', value: 22, color: '#c4b5fd' },
  { name: 'Eligibility', value: 15, color: '#ddd6fe' },
];

const insights = [
  { title: 'Cigna denials up 23% this month', desc: 'Primary reason: missing modifier on E/M codes. Consider pre-submission scrubbing for Cigna claims.', severity: 'high' },
  { title: 'Dr. Miller has highest denial rate (17.1%)', desc: 'Primarily invalid diagnosis codes. Recommend coding education session.', severity: 'high' },
  { title: 'Timely filing denials trending down', desc: 'Down 15% from last quarter after implementing automated submission reminders.', severity: 'positive' },
  { title: 'Appeal success rate improved to 42%', desc: 'Up from 35% last quarter. Medical necessity appeals showing strongest improvement.', severity: 'positive' },
];

export default function DenialTrendsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Denial Analytics</h1>
          <p className="text-sm text-[#86868b] mt-1">Comprehensive denial trend analysis and actionable insights</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Denied Amount', value: '$648K', sub: 'Last 12 months', color: 'text-red-600' },
            { label: 'Overall Denial Rate', value: '10.8%', sub: '↑ 1.2% from last quarter', color: 'text-orange-600' },
            { label: 'Appeal Success Rate', value: '42%', sub: '↑ 7% improvement', color: 'text-green-600' },
            { label: 'Recovered Amount', value: '$272K', sub: '42% of denied amount', color: 'text-[#7C3AED]' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-[#86868b] mt-1">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Actionable Insights */}
        <div className="grid grid-cols-2 gap-4">
          {insights.map((ins, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${ins.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-start gap-2">
                <span className="text-lg">{ins.severity === 'high' ? '⚠️' : '✅'}</span>
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">{ins.title}</p>
                  <p className="text-xs text-[#6e6e73] mt-1">{ins.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Top 10 Denial Reasons */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Top 10 Denial Reasons</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={denialReasons} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="reason" tick={{ fontSize: 10 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Denial by Payer */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Denial Rate by Payer</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payerDenials}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="payer" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Trend */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Denial Rate Trend (12 Months)</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Denial Category Breakdown</h2>
            <div className="h-56 flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                    {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {categoryData.map(c => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-xs text-[#6e6e73]">{c.name} ({c.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Provider Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Denial Rate by Provider</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
              <th className="pb-3 font-medium">Provider</th><th className="pb-3 font-medium">Total Claims</th><th className="pb-3 font-medium">Denied</th><th className="pb-3 font-medium">Rate</th><th className="pb-3 font-medium">Top Reason</th>
            </tr></thead>
            <tbody>
              {providerDenials.map(p => (
                <tr key={p.provider} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 font-medium">{p.provider}</td>
                  <td className="py-3">{p.totalClaims}</td>
                  <td className="py-3 text-red-600">{p.denied}</td>
                  <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${p.rate > 12 ? 'bg-red-100 text-red-700' : p.rate > 9 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{p.rate}%</span></td>
                  <td className="py-3 text-[#6e6e73]">{p.topReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
