'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const satisfaction = [
  { question: 'Overall Satisfaction', excellent: 42, good: 35, fair: 15, poor: 8 },
  { question: 'Wait Time', excellent: 28, good: 38, fair: 22, poor: 12 },
  { question: 'Provider Communication', excellent: 52, good: 30, fair: 12, poor: 6 },
  { question: 'Care Coordination', excellent: 38, good: 34, fair: 18, poor: 10 },
  { question: 'Office Staff', excellent: 45, good: 32, fair: 15, poor: 8 },
  { question: 'Appointment Access', excellent: 32, good: 35, fair: 20, poor: 13 },
];

const demographics = [
  { label: '18-34', value: 8 }, { label: '35-49', value: 15 }, { label: '50-64', value: 28 },
  { label: '65-74', value: 32 }, { label: '75+', value: 17 },
];

export default function SurveyResultsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Survey Results</h1>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Responses', value: '842' },
            { label: 'Response Rate', value: '42.1%' },
            { label: 'Net Promoter Score', value: '68' },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] uppercase tracking-wider">{k.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f] mt-2">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Patient Satisfaction Scores (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={satisfaction} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#86868b' }} />
                <YAxis type="category" dataKey="question" tick={{ fontSize: 10, fill: '#86868b' }} width={140} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Bar dataKey="excellent" fill="#34c759" stackId="a" name="Excellent" />
                <Bar dataKey="good" fill="#0071e3" stackId="a" name="Good" />
                <Bar dataKey="fair" fill="#ff9f0a" stackId="a" name="Fair" />
                <Bar dataKey="poor" fill="#ff3b30" stackId="a" name="Poor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Respondent Age Distribution (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demographics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#86868b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#86868b' }} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Bar dataKey="value" fill="#0071e3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
