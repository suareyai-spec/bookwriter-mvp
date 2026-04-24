'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const erTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  visits: Math.round(220 + Math.random() * 100),
}));

const erPatients = [
  { name: 'Robert Smith', id: 'KSQ-00118', visits: 8, lastVisit: '2026-02-11', diagnosis: 'Chest Pain', payer: 'Sunshine Health' },
  { name: 'Patricia Williams', id: 'KSQ-00087', visits: 7, lastVisit: '2026-02-09', diagnosis: 'Shortness of Breath', payer: 'Simply Health' },
  { name: 'William Brown', id: 'KSQ-00098', visits: 6, lastVisit: '2026-02-12', diagnosis: 'Syncope', payer: 'Simply Health' },
  { name: 'Linda Garcia', id: 'KSQ-00271', visits: 5, lastVisit: '2026-02-10', diagnosis: 'Acute Abdominal Pain', payer: 'Sunshine Health' },
  { name: 'Maria Gonzalez', id: 'KSQ-00042', visits: 5, lastVisit: '2026-02-08', diagnosis: 'CHF Exacerbation', payer: 'Simply Health' },
  { name: 'Kenneth Moore', id: 'KSQ-00189', visits: 4, lastVisit: '2026-02-13', diagnosis: 'COPD Exacerbation', payer: 'Sunshine Health' },
  { name: 'Carol Davis', id: 'KSQ-00412', visits: 4, lastVisit: '2026-02-07', diagnosis: 'Diabetic Ketoacidosis', payer: 'Humana' },
  { name: 'Elizabeth Martinez', id: 'KSQ-00334', visits: 3, lastVisit: '2026-02-11', diagnosis: 'A-Fib with RVR', payer: 'Florida Blue' },
];

export default function ERPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Emergency Room</h1>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'ER Visits (YTD)', value: '1,842' },
            { label: 'ER Rate/1K', value: '284' },
            { label: 'Avg Cost/Visit', value: '$2,340' },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] uppercase tracking-wider">{k.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f] mt-2">{k.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">ER Visits by Month</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={erTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
              <Line type="monotone" dataKey="visits" stroke="#ff3b30" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Top ER Utilizers</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Patient','ID','ER Visits (YTD)','Last Visit','Last Diagnosis','Payer'].map(h=>(
                <th key={h} className="text-left py-3 px-2 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{erPatients.map((p, i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-2 font-medium">{p.name}</td>
                <td className="py-2.5 px-2 text-xs text-[#86868b]">{p.id}</td>
                <td className="py-2.5 px-2 text-center font-medium text-[#ff3b30]">{p.visits}</td>
                <td className="py-2.5 px-2 text-xs">{p.lastVisit}</td>
                <td className="py-2.5 px-2 text-xs">{p.diagnosis}</td>
                <td className="py-2.5 px-2 text-xs">{p.payer}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
