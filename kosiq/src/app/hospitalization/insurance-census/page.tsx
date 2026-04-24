'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const byPayer = [
  { payer: 'Simply Health', inpatient: 45, er: 32, observation: 12 },
  { payer: 'Sunshine Health', inpatient: 38, er: 28, observation: 9 },
  { payer: 'Humana', inpatient: 22, er: 15, observation: 6 },
  { payer: 'Florida Blue', inpatient: 18, er: 12, observation: 4 },
  { payer: 'WellCare', inpatient: 8, er: 6, observation: 2 },
];

export default function InsuranceCensusPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Insurance Census</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Utilization by Payer</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byPayer}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="payer" tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
              <Bar dataKey="inpatient" fill="#0071e3" stackId="a" name="Inpatient" />
              <Bar dataKey="er" fill="#ff3b30" stackId="a" name="ER" />
              <Bar dataKey="observation" fill="#ff9f0a" stackId="a" name="Observation" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
