'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis, LineChart, Line, Legend, Cell } from 'recharts';

const specialties = ['Internal Medicine', 'Cardiology', 'Orthopedics', 'Dermatology', 'Neurology', 'Gastroenterology', 'Pulmonology', 'Oncology'];

const providers = Array.from({ length: 50 }, (_, i) => {
  const specialty = specialties[i % 8];
  const specAvg = [950, 1400, 1800, 700, 1600, 1100, 1200, 2100][i % 8];
  const stdDev = specAvg * 0.25;
  const billingPerPatient = Math.round(specAvg + (Math.random() - 0.4) * stdDev * 3);
  const isOutlier = billingPerPatient > specAvg + 2 * stdDev;
  return {
    id: i + 1,
    name: ['Dr. ' + ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][i % 10] + ' ' + ['A', 'B', 'C', 'D', 'E'][Math.floor(i / 10)]],
    npi: `1234567${String(800 + i)}`,
    specialty,
    totalBilled: Math.round(billingPerPatient * (80 + i * 5)),
    patientCount: 80 + i * 5,
    billingPerPatient,
    specAvg,
    stdDev,
    isOutlier,
  };
});

const top10 = [...providers].sort((a, b) => b.totalBilled - a.totalBilled).slice(0, 10);

const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const trendData = months.map((m, i) => ({
  month: m,
  avgBilling: 1100 + Math.round(Math.sin(i / 3) * 200 + Math.random() * 100),
  outlierCount: 2 + Math.round(Math.random() * 5),
}));

const procedureCodes = ['99214', '99215', '99213', '99232', '99223', '99291', '99204', '99205', '27447', '93000'];
const procedureData = procedureCodes.map(code => ({
  code,
  count: 50 + Math.round(Math.random() * 400),
  avgCharge: 100 + Math.round(Math.random() * 800),
}));

const scatterData = providers.map(p => ({
  x: p.patientCount,
  y: p.billingPerPatient,
  name: p.name,
  isOutlier: p.isOutlier,
  specialty: p.specialty,
}));

export default function ProviderComparisonPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const filtered = selectedSpecialty === 'All' ? providers : providers.filter(p => p.specialty === selectedSpecialty);
  const outliers = filtered.filter(p => p.isOutlier);

  const peerData = specialties.map(s => {
    const specProviders = providers.filter(p => p.specialty === s);
    const avg = Math.round(specProviders.reduce((sum, p) => sum + p.billingPerPatient, 0) / specProviders.length);
    const specAvg = specProviders[0]?.specAvg || 0;
    return { specialty: s.substring(0, 8), avg, benchmark: specAvg };
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">Provider Analytics</h1>
            <p className="text-sm text-[#86868b] mt-1">Peer comparison and outlier detection</p>
          </div>
          <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            <option value="All">All Specialties</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Providers', value: filtered.length, color: 'text-[#1d1d1f]' },
            { label: 'Outliers (>2σ)', value: outliers.length, color: 'text-red-600' },
            { label: 'Avg Billing/Patient', value: '$' + Math.round(filtered.reduce((s, p) => s + p.billingPerPatient, 0) / filtered.length).toLocaleString(), color: 'text-[#1d1d1f]' },
            { label: 'Total Billed', value: '$' + Math.round(filtered.reduce((s, p) => s + p.totalBilled, 0) / 1000000).toLocaleString() + 'M', color: 'text-[#1d1d1f]' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Peer Comparison */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Billing Per Patient vs Specialty Average</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="specialty" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avg" name="Avg Billing" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="benchmark" name="Benchmark" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scatter Plot */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Outlier Detection</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" dataKey="x" name="Patients" tick={{ fontSize: 11 }} />
                  <YAxis type="number" dataKey="y" name="$/Patient" tick={{ fontSize: 11 }} />
                  <ZAxis range={[40, 40]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return <div className="bg-white p-2 rounded shadow text-xs border"><p className="font-medium">{d.name}</p><p>{d.specialty}</p><p>${d.y}/patient • {d.x} patients</p>{d.isOutlier && <p className="text-red-600 font-medium">⚠ Outlier</p>}</div>;
                  }} />
                  <Scatter data={scatterData.filter(d => !d.isOutlier)} fill="#94a3b8" />
                  <Scatter data={scatterData.filter(d => d.isOutlier)} fill="#DC2626" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top 10 Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Top 10 Highest-Billing Providers</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
              <th className="pb-3 font-medium">#</th><th className="pb-3 font-medium">Provider</th><th className="pb-3 font-medium">Specialty</th><th className="pb-3 font-medium">Patients</th><th className="pb-3 font-medium">$/Patient</th><th className="pb-3 font-medium">Total Billed</th><th className="pb-3 font-medium">Flag</th>
            </tr></thead>
            <tbody>
              {top10.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 text-[#86868b]">{i + 1}</td>
                  <td className="py-3 font-medium">{p.name}</td>
                  <td className="py-3 text-[#6e6e73]">{p.specialty}</td>
                  <td className="py-3">{p.patientCount}</td>
                  <td className="py-3">${p.billingPerPatient.toLocaleString()}</td>
                  <td className="py-3 font-medium">${p.totalBilled.toLocaleString()}</td>
                  <td className="py-3">{p.isOutlier && <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">⚠ &gt;2σ</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Billing Trends */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Billing Pattern Trends (12 Months)</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgBilling" name="Avg Billing" stroke="#DC2626" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="outlierCount" name="Outlier Count" stroke="#f97316" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Procedure Frequency */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Procedure Frequency Analysis</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={procedureData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="code" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="count" name="Frequency" fill="#DC2626" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
