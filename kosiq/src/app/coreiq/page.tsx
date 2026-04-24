'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ACCENT = '#059669';
const COLORS = ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

interface DashboardData {
  todayAppointments: any[];
  patientsSeenToday: number;
  totalPatients: number;
  pendingOrders: number;
  unreadMessages: number;
  upcomingCount: number;
  recentEncounters: any[];
  upcomingAppointments: any[];
  claimStats: any[];
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#86868b] font-medium uppercase tracking-wider">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Scheduled: 'bg-blue-50 text-blue-700', 'Checked-in': 'bg-yellow-50 text-yellow-700',
    'In Progress': 'bg-purple-50 text-purple-700', Completed: 'bg-emerald-50 text-emerald-700',
    'No-show': 'bg-red-50 text-red-700', Cancelled: 'bg-gray-100 text-gray-500',
    Signed: 'bg-emerald-50 text-emerald-700', Addendum: 'bg-orange-50 text-orange-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

export default function CoreIQDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/coreiq/dashboard').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div></DashboardLayout>;

  const statusCounts: Record<string, number> = {};
  data.todayAppointments.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const claimChartData = data.claimStats.map((c: any) => ({
    name: c.status,
    count: c._count,
    total: c._sum?.totalCharge || 0,
    paid: c._sum?.paidAmount || 0,
  }));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1d1d1f]">CoreIQ Dashboard</h1>
          <span className="text-sm text-[#86868b]">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Patients Seen Today" value={data.patientsSeenToday} icon="👥" color={ACCENT} />
          <StatCard label="Pending Lab Orders" value={data.pendingOrders} icon="🧪" color="#F59E0B" />
          <StatCard label="Unread Messages" value={data.unreadMessages} icon="✉️" color="#3B82F6" />
          <StatCard label="Upcoming Appointments" value={data.upcomingCount} icon="📅" color="#8B5CF6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1d1d1f]">Today&apos;s Schedule</h2>
              <button onClick={() => router.push('/coreiq/scheduling')} className="text-sm font-medium" style={{ color: ACCENT }}>View All →</button>
            </div>
            {data.todayAppointments.length === 0 ? (
              <p className="text-sm text-[#86868b] py-8 text-center">No appointments today</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {data.todayAppointments.slice(0, 10).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7] hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-[#86868b] w-14">{a.time}</span>
                      <div>
                        <p className="text-sm font-medium text-[#1d1d1f]">{a.patient.lastName}, {a.patient.firstName}</p>
                        <p className="text-xs text-[#86868b]">{a.type} · {a.providerName}</p>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointment Status Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Today&apos;s Appointment Status</h2>
            {pieData.length === 0 ? (
              <p className="text-sm text-[#86868b] py-8 text-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Encounters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1d1d1f]">Recent Encounters</h2>
              <button onClick={() => router.push('/coreiq/encounters')} className="text-sm font-medium" style={{ color: ACCENT }}>View All →</button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {data.recentEncounters.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]">
                  <div>
                    <p className="text-sm font-medium text-[#1d1d1f]">{e.patient.lastName}, {e.patient.firstName}</p>
                    <p className="text-xs text-[#86868b]">{e.chiefComplaint} · {new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Claims Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1d1d1f]">Claims Overview</h2>
              <button onClick={() => router.push('/coreiq/billing')} className="text-sm font-medium" style={{ color: ACCENT }}>View All →</button>
            </div>
            {claimChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={claimChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="total" fill={ACCENT} radius={[4, 4, 0, 0]} name="Total Charges" />
                  <Bar dataKey="paid" fill="#34D399" radius={[4, 4, 0, 0]} name="Paid" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#86868b] py-8 text-center">No claims data</p>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Upcoming Appointments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-[#86868b] font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-[#86868b] font-medium">Time</th>
                  <th className="text-left py-2 px-3 text-[#86868b] font-medium">Patient</th>
                  <th className="text-left py-2 px-3 text-[#86868b] font-medium">Type</th>
                  <th className="text-left py-2 px-3 text-[#86868b] font-medium">Provider</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingAppointments.map((a: any) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-[#f5f5f7]">
                    <td className="py-2 px-3">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="py-2 px-3 font-mono">{a.time}</td>
                    <td className="py-2 px-3 font-medium">{a.patient.lastName}, {a.patient.firstName}</td>
                    <td className="py-2 px-3">{a.type}</td>
                    <td className="py-2 px-3">{a.providerName}</td>
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
