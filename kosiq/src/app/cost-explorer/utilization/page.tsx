'use client';
import DashboardLayout from '@/components/DashboardLayout';

const data = [
  { cat: 'Inpatient Admissions', current: '47.2 per 1K', benchmark: '42.0', status: 'above' },
  { cat: 'Avg Length of Stay', current: '4.8 days', benchmark: '4.2', status: 'above' },
  { cat: 'ED Visits', current: '312 per 1K', benchmark: '280', status: 'above' },
  { cat: 'Readmission Rate', current: '11.4%', benchmark: '9.5%', status: 'above' },
  { cat: 'Outpatient Visits', current: '8.2 per member', benchmark: '7.5', status: 'above' },
  { cat: 'Specialist Referrals', current: '2.3 per member', benchmark: '2.8', status: 'below' },
];

export default function UtilizationPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Utilization Patterns</h1>
        <p className="text-sm text-[#86868b] mb-8">Usage vs benchmarks</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Category</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Current</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Benchmark</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Status</th>
            </tr></thead>
            <tbody>
              {data.map(d => (
                <tr key={d.cat} className="border-b border-gray-50">
                  <td className="px-5 py-3 text-sm text-[#1d1d1f]">{d.cat}</td>
                  <td className="px-5 py-3 text-sm text-right font-medium text-[#1d1d1f]">{d.current}</td>
                  <td className="px-5 py-3 text-sm text-right text-[#86868b]">{d.benchmark}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2 py-0.5 text-[10px] rounded-full ${d.status === 'above' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{d.status === 'above' ? '↑ Above' : '↓ Below'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
