'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const apiTraffic = [
  { hour: '00', requests: 1240 }, { hour: '02', requests: 890 }, { hour: '04', requests: 2100 },
  { hour: '06', requests: 5430 }, { hour: '08', requests: 8920 }, { hour: '10', requests: 7650 },
  { hour: '12', requests: 6340 }, { hour: '14', requests: 7890 }, { hour: '16', requests: 6120 },
  { hour: '18', requests: 4560 }, { hour: '20', requests: 3210 }, { hour: '22', requests: 1870 },
];

const resourceTypes = [
  { name: 'Patient', count: 18432, pct: 24 },
  { name: 'Observation', count: 32100, pct: 42 },
  { name: 'Condition', count: 8920, pct: 12 },
  { name: 'MedicationRequest', count: 6780, pct: 9 },
  { name: 'Encounter', count: 4560, pct: 6 },
  { name: 'DiagnosticReport', count: 3240, pct: 4 },
  { name: 'AllergyIntolerance', count: 2100, pct: 3 },
];

const pieData = [
  { name: 'Read', value: 68 }, { name: 'Create', value: 18 },
  { name: 'Update', value: 11 }, { name: 'Search', value: 3 },
];
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

const endpoints = [
  { path: '/Patient', method: 'GET', calls24h: 12400, avgMs: 45, p99Ms: 180, errors: 2, status: 'Healthy' },
  { path: '/Observation', method: 'GET', calls24h: 28900, avgMs: 62, p99Ms: 240, errors: 8, status: 'Healthy' },
  { path: '/Condition', method: 'GET', calls24h: 6800, avgMs: 38, p99Ms: 120, errors: 0, status: 'Healthy' },
  { path: '/Patient', method: 'POST', calls24h: 3200, avgMs: 95, p99Ms: 350, errors: 12, status: 'Healthy' },
  { path: '/Bundle', method: 'POST', calls24h: 1450, avgMs: 420, p99Ms: 1200, errors: 3, status: 'Warning' },
  { path: '/Observation', method: 'POST', calls24h: 8900, avgMs: 78, p99Ms: 280, errors: 5, status: 'Healthy' },
];

export default function FHIRPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">FHIR Exchange</h1>
        <p className="text-sm text-[#86868b] mb-8">FHIR R4 API monitoring, resource statistics, and endpoint health</p>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { l: 'API Calls (24h)', v: '76,220', c: 'text-[#3B82F6]' },
            { l: 'Avg Latency', v: '62ms', c: 'text-green-600' },
            { l: 'Error Rate', v: '0.04%', c: 'text-green-600' },
            { l: 'FHIR Resources', v: '76,132', c: 'text-[#1d1d1f]' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-[#86868b] text-xs mb-1">{m.l}</p>
              <p className={`text-2xl font-semibold ${m.c}`}>{m.v}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* API Traffic */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">API Traffic (Today by Hour)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={apiTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#86868b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#86868b' }} />
                <Tooltip />
                <Bar dataKey="requests" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Operation Types */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Operation Types</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Types */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Resource Distribution</h3>
          <div className="space-y-3">
            {resourceTypes.map(r => (
              <div key={r.name} className="flex items-center gap-4">
                <span className="text-sm text-[#1d1d1f] w-40 font-mono">{r.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div className="h-full bg-[#3B82F6] rounded-full flex items-center justify-end pr-2" style={{ width: `${r.pct}%` }}>
                    <span className="text-[10px] text-white font-medium">{r.pct}%</span>
                  </div>
                </div>
                <span className="text-xs text-[#86868b] w-20 text-right">{r.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Endpoint Health</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-[#86868b] text-xs border-b border-gray-100">
              <th className="text-left pb-3 font-medium">Endpoint</th>
              <th className="text-left pb-3 font-medium">Method</th>
              <th className="text-right pb-3 font-medium">Calls (24h)</th>
              <th className="text-right pb-3 font-medium">Avg (ms)</th>
              <th className="text-right pb-3 font-medium">P99 (ms)</th>
              <th className="text-right pb-3 font-medium">Errors</th>
              <th className="text-left pb-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {endpoints.map((e, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 font-mono text-xs text-[#3B82F6]">{e.path}</td>
                  <td className="py-3"><span className={`text-[10px] px-2 py-0.5 rounded font-mono ${e.method === 'GET' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{e.method}</span></td>
                  <td className="py-3 text-right text-[#1d1d1f]">{e.calls24h.toLocaleString()}</td>
                  <td className="py-3 text-right text-[#1d1d1f]">{e.avgMs}</td>
                  <td className="py-3 text-right text-[#86868b]">{e.p99Ms}</td>
                  <td className={`py-3 text-right ${e.errors > 10 ? 'text-red-600' : 'text-[#1d1d1f]'}`}>{e.errors}</td>
                  <td className="py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${e.status === 'Healthy' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
