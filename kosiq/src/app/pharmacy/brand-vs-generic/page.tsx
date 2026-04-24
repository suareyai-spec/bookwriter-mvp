'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const trend = [
  { month: 'Jan', generic: 84.2, brand: 15.8 }, { month: 'Feb', generic: 84.5, brand: 15.5 },
  { month: 'Mar', generic: 84.8, brand: 15.2 }, { month: 'Apr', generic: 85.0, brand: 15.0 },
  { month: 'May', generic: 84.7, brand: 15.3 }, { month: 'Jun', generic: 85.2, brand: 14.8 },
  { month: 'Jul', generic: 85.1, brand: 14.9 }, { month: 'Aug', generic: 85.4, brand: 14.6 },
  { month: 'Sep', generic: 85.3, brand: 14.7 }, { month: 'Oct', generic: 85.6, brand: 14.4 },
  { month: 'Nov', generic: 85.2, brand: 14.8 }, { month: 'Dec', generic: 85.5, brand: 14.5 },
];

const byProvider = [
  { provider: 'Dr. Maria Santos', brand: 12.8, generic: 87.2 },
  { provider: 'Dr. James Chen', brand: 17.5, generic: 82.5 },
  { provider: 'Dr. Patricia Williams', brand: 10.9, generic: 89.1 },
  { provider: 'Dr. Robert Kumar', brand: 21.6, generic: 78.4 },
  { provider: 'Dr. Angela Martinez', brand: 13.2, generic: 86.8 },
  { provider: 'Dr. David Thompson', brand: 19.8, generic: 80.2 },
  { provider: 'Dr. Lisa Park', brand: 11.5, generic: 88.5 },
  { provider: 'Dr. Michael Brown', brand: 18.7, generic: 81.3 },
];

export default function BrandVsGenericPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Brand vs Generic</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Generic Dispensing Rate Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
              <Legend />
              <Line type="monotone" dataKey="generic" stroke="#34c759" strokeWidth={2} name="Generic %" />
              <Line type="monotone" dataKey="brand" stroke="#0071e3" strokeWidth={2} name="Brand %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">By Provider</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Provider','Brand %','Generic %','GDR Status'].map(h=>(
                <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{byProvider.map((r, i)=>(
              <tr key={i} className="border-b border-gray-50">
                <td className="py-2.5 px-3 font-medium">{r.provider}</td>
                <td className="py-2.5 px-3">{r.brand}%</td>
                <td className="py-2.5 px-3 font-medium text-[#34c759]">{r.generic}%</td>
                <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${r.generic >= 85 ? 'bg-green-50 text-green-700' : r.generic >= 80 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{r.generic >= 85 ? 'On Target' : r.generic >= 80 ? 'Below Target' : 'Needs Improvement'}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
