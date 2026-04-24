'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  totalPatients: number;
  criticalAlerts: number;
  pendingOrders: number;
  departmentCensus: { name: string; count: number }[];
  criticalLabs: { id: string; patientName: string; patientId: string; testName: string; value: string; unit: string; normalRange: string; resultAt: string }[];
}

export default function ChartIQDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/chartiq/dashboard').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#1d1d1f]">ChartIQ Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: data.totalPatients, icon: '🏥', color: 'border-teal-500' },
          { label: 'Critical Alerts', value: data.criticalAlerts, icon: '🚨', color: 'border-red-500' },
          { label: 'Pending Orders', value: data.pendingOrders, icon: '📋', color: 'border-amber-500' },
          { label: 'Departments', value: data.departmentCensus.length, icon: '🏢', color: 'border-blue-500' },
        ].map((m) => (
          <div key={m.label} className={`bg-white rounded-xl p-5 border-l-4 ${m.color} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{m.label}</p>
                <p className="text-2xl font-bold text-[#1d1d1f] mt-1">{m.value}</p>
              </div>
              <span className="text-2xl">{m.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search patients by name or MRN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && search) router.push(`/chartiq/patients?search=${search}`); }}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Patient Census by Department</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.departmentCensus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#14B8A6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">🚨 Critical Lab Results</h2>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {data.criticalLabs.length === 0 ? (
              <p className="text-sm text-gray-400">No critical labs</p>
            ) : (
              data.criticalLabs.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => router.push(`/chartiq/patients/${l.patientId}`)}>
                  <div>
                    <p className="text-sm font-medium text-red-700">{l.patientName}</p>
                    <p className="text-xs text-red-500">{l.testName}: {l.value} {l.unit}</p>
                  </div>
                  <span className="text-xs text-red-400">{new Date(l.resultAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
