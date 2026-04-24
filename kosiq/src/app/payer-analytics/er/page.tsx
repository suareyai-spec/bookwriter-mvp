'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const monthlyER = [
  { month: 'Apr 25', visits: 312 },
  { month: 'May 25', visits: 298 },
  { month: 'Jun 25', visits: 345 },
  { month: 'Jul 25', visits: 378 },
  { month: 'Aug 25', visits: 356 },
  { month: 'Sep 25', visits: 330 },
  { month: 'Oct 25', visits: 315 },
  { month: 'Nov 25', visits: 342 },
  { month: 'Dec 25', visits: 398 },
  { month: 'Jan 26', visits: 385 },
  { month: 'Feb 26', visits: 352 },
  { month: 'Mar 26', visits: 368 },
];

const erByDay = [
  { day: 'Monday', visits: 620 },
  { day: 'Tuesday', visits: 558 },
  { day: 'Wednesday', visits: 542 },
  { day: 'Thursday', visits: 530 },
  { day: 'Friday', visits: 605 },
  { day: 'Saturday', visits: 695 },
  { day: 'Sunday', visits: 729 },
];

const frequentVisitors = [
  { name: 'Maria Santos', mrn: 'MRN-00147', visits: 11, cost: 48620, conditions: 'CHF, COPD, Anxiety', lastVisit: '2026-03-18' },
  { name: 'Carlos Perez', mrn: 'MRN-00095', visits: 9, cost: 38450, conditions: 'Sickle Cell, Chronic Pain', lastVisit: '2026-03-21' },
  { name: 'Dorothy Wilson', mrn: 'MRN-00412', visits: 8, cost: 34200, conditions: 'CHF, CKD, Diabetes', lastVisit: '2026-03-15' },
  { name: 'Rosa Martinez', mrn: 'MRN-00278', visits: 7, cost: 31890, conditions: 'Asthma, GERD, Depression', lastVisit: '2026-03-19' },
  { name: 'Frank Harris', mrn: 'MRN-00268', visits: 7, cost: 29540, conditions: 'COPD, Heart Failure', lastVisit: '2026-03-12' },
  { name: 'Ana Diaz', mrn: 'MRN-00142', visits: 6, cost: 26780, conditions: 'Diabetes, Neuropathy', lastVisit: '2026-03-20' },
  { name: 'Harold Clark', mrn: 'MRN-00078', visits: 6, cost: 25320, conditions: 'Chronic Pain, Hypertension', lastVisit: '2026-03-17' },
  { name: 'Gloria Morales', mrn: 'MRN-00398', visits: 5, cost: 22150, conditions: 'Asthma, Anxiety, Migraine', lastVisit: '2026-03-14' },
  { name: 'William Davis', mrn: 'MRN-00156', visits: 5, cost: 21480, conditions: 'COPD, Pneumonia', lastVisit: '2026-03-10' },
  { name: 'Thomas Johnson', mrn: 'MRN-00045', visits: 5, cost: 19870, conditions: 'CHF, Atrial Fibrillation', lastVisit: '2026-03-08' },
  { name: 'Linda Garcia', mrn: 'MRN-00334', visits: 4, cost: 17640, conditions: 'Diabetes, UTI Recurrent', lastVisit: '2026-03-22' },
  { name: 'James Williams', mrn: 'MRN-00089', visits: 4, cost: 16890, conditions: 'Angina, Hypertension', lastVisit: '2026-03-11' },
  { name: 'Betty Anderson', mrn: 'MRN-00223', visits: 4, cost: 15230, conditions: 'CKD, Anemia', lastVisit: '2026-03-06' },
  { name: 'Richard White', mrn: 'MRN-00056', visits: 3, cost: 13450, conditions: 'Chest Pain, GERD', lastVisit: '2026-03-16' },
  { name: 'Nancy Thompson', mrn: 'MRN-00301', visits: 3, cost: 12890, conditions: 'Fall Risk, Osteoporosis', lastVisit: '2026-03-09' },
];

const avoidableDiagnoses = [
  { diagnosis: 'Non-specific Chest Pain (R07.9)', count: 284, pctAvoidable: 72 },
  { diagnosis: 'Acute Upper Respiratory Infection (J06.9)', count: 198, pctAvoidable: 89 },
  { diagnosis: 'Urinary Tract Infection (N39.0)', count: 167, pctAvoidable: 65 },
  { diagnosis: 'Low Back Pain (M54.5)', count: 142, pctAvoidable: 78 },
  { diagnosis: 'Headache / Migraine (R51.9)', count: 128, pctAvoidable: 82 },
  { diagnosis: 'Abdominal Pain (R10.9)', count: 115, pctAvoidable: 58 },
  { diagnosis: 'Anxiety / Panic Attack (F41.0)', count: 98, pctAvoidable: 91 },
  { diagnosis: 'Hypertension Crisis (I16.0)', count: 87, pctAvoidable: 64 },
  { diagnosis: 'Dental Pain (K08.89)', count: 76, pctAvoidable: 95 },
  { diagnosis: 'Skin Infection / Cellulitis (L03.90)', count: 68, pctAvoidable: 70 },
];

export default function ERPage() {
  const totalVisits = monthlyER.reduce((s, m) => s + m.visits, 0);
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">ER Utilization</h1>
        <p className="text-sm text-[#86868b] mb-8">Emergency department visit patterns, frequent utilizers, and avoidable visit analysis</p>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total ER Visits YTD', value: totalVisits.toLocaleString(), sub: 'Apr 2025 - Mar 2026' },
            { label: 'ER Rate per 1,000', value: '231', sub: 'vs 195 benchmark' },
            { label: 'Avoidable ER %', value: '34.2%', sub: '1,446 potentially avoidable' },
            { label: 'Avg ER Cost', value: '$2,840', sub: 'Per visit' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{k.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{k.value}</p>
              <p className="text-[10px] text-[#86868b] mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Monthly ER Visits */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Monthly ER Visits</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyER}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} />
              <Tooltip />
              <Bar dataKey="visits" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Frequent ER Visitors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-1">Frequent ER Visitors</h2>
          <p className="text-xs text-[#86868b] mb-4">Patients with 3 or more ER visits in the past 12 months</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Patient</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">MRN</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Visits</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Total ER Cost</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Conditions</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {frequentVisitors.map(p => (
                  <tr key={p.mrn} className="border-b border-gray-50 hover:bg-[#f5f5f7] transition-colors">
                    <td className="py-2 text-sm text-[#1d1d1f] font-medium">{p.name}</td>
                    <td className="py-2 text-xs text-[#86868b]">{p.mrn}</td>
                    <td className="py-2 text-right">
                      <span className={`text-sm font-semibold ${p.visits >= 7 ? 'text-red-600' : p.visits >= 5 ? 'text-[#F97316]' : 'text-[#1d1d1f]'}`}>{p.visits}</span>
                    </td>
                    <td className="py-2 text-sm text-right font-medium text-[#F97316]">${p.cost.toLocaleString()}</td>
                    <td className="py-2 text-xs text-[#6e6e73]">{p.conditions}</td>
                    <td className="py-2 text-xs text-right text-[#6e6e73]">{p.lastVisit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ER by Day + Avoidable Diagnoses */}
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">ER Visits by Day of Week</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={erByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#86868b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#86868b' }} />
                <Tooltip />
                <Bar dataKey="visits" fill="#FB923C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Top Avoidable ER Diagnoses</h2>
            <div className="space-y-3">
              {avoidableDiagnoses.map(d => (
                <div key={d.diagnosis}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#1d1d1f] truncate mr-2">{d.diagnosis}</span>
                    <span className="text-[#86868b] whitespace-nowrap">{d.count} visits</span>
                  </div>
                  <div className="w-full bg-[#f5f5f7] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-[#F97316]" style={{ width: `${(d.count / 284) * 100}%`, opacity: 0.5 + (d.pctAvoidable / 200) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
