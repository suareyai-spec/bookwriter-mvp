'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const referralsBySpecialty = [
  { specialty: 'Cardiology', count: 342 },
  { specialty: 'Endocrinology', count: 278 },
  { specialty: 'Orthopedics', count: 245 },
  { specialty: 'Neurology', count: 198 },
  { specialty: 'Pulmonology', count: 176 },
  { specialty: 'Nephrology', count: 164 },
  { specialty: 'Gastroenterology', count: 152 },
  { specialty: 'Ophthalmology', count: 138 },
  { specialty: 'Dermatology', count: 112 },
  { specialty: 'Oncology', count: 98 },
  { specialty: 'Rheumatology', count: 87 },
  { specialty: 'Psychiatry', count: 76 },
];

const leakageTable = [
  { patient: 'James Williams', mrn: 'MRN-00089', specialty: 'Cardiology', facility: 'Cleveland Clinic FL', payer: 'Sunshine Health', cost: 12400 },
  { patient: 'Patricia Brown', mrn: 'MRN-00312', specialty: 'Oncology', facility: 'Moffitt Cancer Center', payer: 'Simply Health', cost: 28600 },
  { patient: 'Carmen Rodriguez', mrn: 'MRN-00201', specialty: 'Neurology', facility: 'Mayo Clinic Jacksonville', payer: 'Aetna', cost: 8900 },
  { patient: 'Thomas Johnson', mrn: 'MRN-00045', specialty: 'Orthopedics', facility: 'HSS Florida', payer: 'Simply Health', cost: 18200 },
  { patient: 'Dorothy Wilson', mrn: 'MRN-00412', specialty: 'Nephrology', facility: 'Emory Transplant Ctr', payer: 'Humana', cost: 15800 },
  { patient: 'Michael Lee', mrn: 'MRN-00167', specialty: 'Oncology', facility: 'MD Anderson (Houston)', payer: 'WellCare', cost: 42300 },
  { patient: 'William Davis', mrn: 'MRN-00156', specialty: 'Pulmonology', facility: 'National Jewish Health', payer: 'Humana', cost: 11200 },
  { patient: 'Linda Garcia', mrn: 'MRN-00334', specialty: 'Endocrinology', facility: 'Joslin Diabetes Ctr', payer: 'Sunshine Health', cost: 7600 },
  { patient: 'Betty Anderson', mrn: 'MRN-00223', specialty: 'Rheumatology', facility: 'Johns Hopkins FL', payer: 'Aetna', cost: 9400 },
  { patient: 'Frank Harris', mrn: 'MRN-00268', specialty: 'Cardiology', facility: 'Mount Sinai Heart NY', payer: 'Simply Health', cost: 35100 },
  { patient: 'Carlos Perez', mrn: 'MRN-00095', specialty: 'Gastroenterology', facility: 'Tampa General OON', payer: 'Molina', cost: 6800 },
  { patient: 'Nancy Thompson', mrn: 'MRN-00301', specialty: 'Orthopedics', facility: 'Rothman Institute', payer: 'Humana', cost: 22400 },
];

const funnelData = [
  { stage: 'Referred', value: 2066, color: '#F97316' },
  { stage: 'Scheduled', value: 1748, color: '#FB923C' },
  { stage: 'Completed', value: 1542, color: '#FDBA74' },
  { stage: 'Follow-up Done', value: 1186, color: '#FED7AA' },
];

const turnaroundBySpecialty = [
  { specialty: 'Cardiology', avgDays: 8.2, target: 7 },
  { specialty: 'Endocrinology', avgDays: 14.5, target: 10 },
  { specialty: 'Orthopedics', avgDays: 11.3, target: 10 },
  { specialty: 'Neurology', avgDays: 18.7, target: 14 },
  { specialty: 'Pulmonology', avgDays: 9.8, target: 10 },
  { specialty: 'Nephrology', avgDays: 12.1, target: 10 },
  { specialty: 'Gastroenterology', avgDays: 10.4, target: 10 },
  { specialty: 'Ophthalmology', avgDays: 6.3, target: 7 },
  { specialty: 'Dermatology', avgDays: 22.1, target: 14 },
  { specialty: 'Oncology', avgDays: 5.4, target: 7 },
];

const totalReferrals = referralsBySpecialty.reduce((s, r) => s + r.count, 0);
const totalLeakageCost = leakageTable.reduce((s, l) => s + l.cost, 0);

export default function ReferralsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Referral Analytics</h1>
        <p className="text-sm text-[#86868b] mb-8">Referral patterns, network leakage, completion rates, and turnaround analysis</p>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Referrals YTD', value: totalReferrals.toLocaleString(), sub: 'Apr 2025 - Mar 2026' },
            { label: 'Avg Days to Complete', value: '11.4', sub: 'Target: 10 days' },
            { label: 'Leakage Rate', value: '8.3%', sub: `$${(totalLeakageCost / 1000).toFixed(0)}K out-of-network` },
            { label: 'In-Network %', value: '91.7%', sub: '1,894 of 2,066 referrals' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{k.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{k.value}</p>
              <p className="text-[10px] text-[#86868b] mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Referrals by Specialty */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Referrals by Specialty</h2>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={referralsBySpecialty} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis dataKey="specialty" type="category" tick={{ fontSize: 11, fill: '#86868b' }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#F97316" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leakage Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-1">Referral Leakage - Out-of-Network</h2>
          <p className="text-xs text-[#86868b] mb-4">{leakageTable.length} out-of-network referrals totaling ${(totalLeakageCost / 1000).toFixed(0)}K in additional cost</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Patient</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">MRN</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Specialty</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">OON Facility</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Payer</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Cost Impact</th>
                </tr>
              </thead>
              <tbody>
                {leakageTable.map((l, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7] transition-colors">
                    <td className="py-2 text-sm text-[#1d1d1f] font-medium">{l.patient}</td>
                    <td className="py-2 text-xs text-[#86868b]">{l.mrn}</td>
                    <td className="py-2 text-xs text-[#6e6e73]">{l.specialty}</td>
                    <td className="py-2 text-xs text-[#6e6e73]">{l.facility}</td>
                    <td className="py-2 text-xs text-[#6e6e73]">{l.payer}</td>
                    <td className="py-2 text-sm text-right font-semibold text-[#F97316]">${l.cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Funnel + Turnaround */}
        <div className="grid grid-cols-2 gap-8">
          {/* Completion Funnel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Referral Completion Funnel</h2>
            <div className="space-y-3 mt-2">
              {funnelData.map((stage, i) => (
                <div key={stage.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#1d1d1f] font-medium">{stage.stage}</span>
                    <span className="text-[#6e6e73]">{stage.value.toLocaleString()} ({((stage.value / funnelData[0].value) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-[#f5f5f7] rounded-full h-6">
                    <div
                      className="h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(stage.value / funnelData[0].value) * 100}%`, backgroundColor: stage.color }}
                    >
                      {i < funnelData.length - 1 && (
                        <span className="text-[10px] text-white font-medium">
                          {((1 - funnelData[i + 1].value / stage.value) * 100).toFixed(0)}% drop
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-[#f5f5f7] rounded-xl">
              <p className="text-xs text-[#86868b]">Overall completion rate: <span className="text-[#1d1d1f] font-semibold">74.6%</span> | Follow-up rate: <span className="text-[#1d1d1f] font-semibold">57.4%</span></p>
            </div>
          </div>

          {/* Turnaround Time */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Turnaround Time by Specialty</h2>
            <div className="space-y-3">
              {turnaroundBySpecialty.map(t => {
                const overTarget = t.avgDays > t.target;
                return (
                  <div key={t.specialty}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#1d1d1f]">{t.specialty}</span>
                      <span className={overTarget ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {t.avgDays} days {overTarget ? `(+${(t.avgDays - t.target).toFixed(1)} over)` : '(on target)'}
                      </span>
                    </div>
                    <div className="w-full bg-[#f5f5f7] rounded-full h-2 relative">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min((t.avgDays / 25) * 100, 100)}%`,
                          backgroundColor: overTarget ? '#DC2626' : '#059669',
                        }}
                      />
                      <div
                        className="absolute h-3 w-0.5 bg-[#86868b] top-[-2px]"
                        style={{ left: `${(t.target / 25) * 100}%` }}
                        title={`Target: ${t.target} days`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-[10px] text-[#86868b]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#059669]" /> On Target</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Over Target</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#86868b]" /> Target Line</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
