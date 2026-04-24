'use client';
import DashboardLayout from '@/components/DashboardLayout';

export default function ReferralAnalysisPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Referral Analysis</h1>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Referrals', value: '800', change: '+12% vs prior month' },
            { label: 'Avg Wait Days', value: '11.3', change: '-2.1 days improvement' },
            { label: 'Completion Rate', value: '68.4%', change: '+5.2% vs prior month' },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] uppercase tracking-wider">{k.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f] mt-2">{k.value}</p>
              <p className="text-xs text-[#34c759] mt-1">{k.change}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Referral Patterns by Specialty</h3>
          <div className="space-y-3">
            {[
              { specialty: 'Gastroenterology', count: 73, avgWait: 8, completion: 72 },
              { specialty: 'Dermatology', count: 38, avgWait: 14, completion: 65 },
              { specialty: 'Orthopedic Surgery', count: 37, avgWait: 12, completion: 70 },
              { specialty: 'Psychology', count: 33, avgWait: 18, completion: 55 },
              { specialty: 'Nephrology', count: 31, avgWait: 7, completion: 78 },
              { specialty: 'ENT', count: 28, avgWait: 11, completion: 68 },
              { specialty: 'Ophthalmology', count: 26, avgWait: 15, completion: 62 },
              { specialty: 'Cardiology', count: 24, avgWait: 6, completion: 82 },
              { specialty: 'Pulmonology', count: 22, avgWait: 9, completion: 75 },
              { specialty: 'Endocrinology', count: 20, avgWait: 10, completion: 71 },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50">
                <span className="w-40 text-sm font-medium text-[#1d1d1f]">{s.specialty}</span>
                <div className="flex-1">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#0071e3] h-2 rounded-full" style={{ width: `${(s.count / 73) * 100}%` }} />
                  </div>
                </div>
                <span className="w-16 text-xs text-right text-[#86868b]">{s.count} refs</span>
                <span className="w-20 text-xs text-right text-[#86868b]">{s.avgWait}d wait</span>
                <span className="w-16 text-xs text-right text-[#86868b]">{s.completion}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
