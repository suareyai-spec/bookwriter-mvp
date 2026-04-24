'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

const monthlyTrend = [
  { month: 'Apr 25', simplyHealth: 820, sunshineHealth: 610, humana: 540, aetna: 390, molina: 210, wellcare: 145 },
  { month: 'May 25', simplyHealth: 795, sunshineHealth: 635, humana: 560, aetna: 405, molina: 225, wellcare: 152 },
  { month: 'Jun 25', simplyHealth: 860, sunshineHealth: 640, humana: 575, aetna: 410, molina: 218, wellcare: 148 },
  { month: 'Jul 25', simplyHealth: 910, sunshineHealth: 668, humana: 590, aetna: 425, molina: 230, wellcare: 160 },
  { month: 'Aug 25', simplyHealth: 875, sunshineHealth: 650, humana: 610, aetna: 418, molina: 222, wellcare: 155 },
  { month: 'Sep 25', simplyHealth: 940, sunshineHealth: 685, humana: 625, aetna: 440, molina: 238, wellcare: 162 },
  { month: 'Oct 25', simplyHealth: 920, sunshineHealth: 695, humana: 605, aetna: 435, molina: 242, wellcare: 158 },
  { month: 'Nov 25', simplyHealth: 960, sunshineHealth: 710, humana: 640, aetna: 450, molina: 248, wellcare: 165 },
  { month: 'Dec 25', simplyHealth: 1010, sunshineHealth: 725, humana: 660, aetna: 460, molina: 255, wellcare: 170 },
  { month: 'Jan 26', simplyHealth: 985, sunshineHealth: 740, humana: 670, aetna: 465, molina: 260, wellcare: 172 },
  { month: 'Feb 26', simplyHealth: 1020, sunshineHealth: 755, humana: 685, aetna: 475, molina: 265, wellcare: 178 },
  { month: 'Mar 26', simplyHealth: 1050, sunshineHealth: 770, humana: 695, aetna: 482, molina: 270, wellcare: 180 },
];

const topPatients = [
  { name: 'Maria Santos', mrn: 'MRN-00147', payer: 'Simply Health', cost: 187420, condition: 'CHF + CKD Stage IV', risk: 3.84 },
  { name: 'Robert Chen', mrn: 'MRN-00023', payer: 'Humana', cost: 162350, condition: 'ESRD on Dialysis', risk: 4.12 },
  { name: 'Patricia Brown', mrn: 'MRN-00312', payer: 'Simply Health', cost: 148900, condition: 'Metastatic Lung Cancer', risk: 3.95 },
  { name: 'James Williams', mrn: 'MRN-00089', payer: 'Sunshine Health', cost: 134670, condition: 'Acute MI + CABG', risk: 3.67 },
  { name: 'Carmen Rodriguez', mrn: 'MRN-00201', payer: 'Aetna', cost: 128450, condition: 'Liver Transplant', risk: 4.28 },
  { name: 'William Davis', mrn: 'MRN-00156', payer: 'Humana', cost: 119800, condition: 'Sepsis + Ventilator', risk: 3.52 },
  { name: 'Rosa Martinez', mrn: 'MRN-00278', payer: 'Molina', cost: 112340, condition: 'CHF + Diabetes + COPD', risk: 3.41 },
  { name: 'Thomas Johnson', mrn: 'MRN-00045', payer: 'Simply Health', cost: 108920, condition: 'Hip Replacement Bilateral', risk: 2.89 },
  { name: 'Linda Garcia', mrn: 'MRN-00334', payer: 'Sunshine Health', cost: 104560, condition: 'Stroke + Rehab', risk: 3.15 },
  { name: 'Michael Lee', mrn: 'MRN-00167', payer: 'WellCare', cost: 98740, condition: 'Pancreatic Cancer', risk: 3.78 },
  { name: 'Dorothy Wilson', mrn: 'MRN-00412', payer: 'Humana', cost: 94320, condition: 'CHF Exacerbation', risk: 3.22 },
  { name: 'Carlos Perez', mrn: 'MRN-00095', payer: 'Simply Health', cost: 91650, condition: 'COPD + Pneumonia', risk: 2.98 },
  { name: 'Betty Anderson', mrn: 'MRN-00223', payer: 'Aetna', cost: 88430, condition: 'Dialysis + Diabetes', risk: 3.56 },
  { name: 'Jorge Fernandez', mrn: 'MRN-00187', payer: 'Sunshine Health', cost: 85210, condition: 'Spinal Fusion', risk: 2.74 },
  { name: 'Nancy Thompson', mrn: 'MRN-00301', payer: 'Molina', cost: 82900, condition: 'Breast Cancer + Chemo', risk: 3.11 },
  { name: 'Richard White', mrn: 'MRN-00056', payer: 'Humana', cost: 79450, condition: 'Cardiac Stent x3', risk: 2.85 },
  { name: 'Ana Diaz', mrn: 'MRN-00142', payer: 'WellCare', cost: 76230, condition: 'CKD Stage V', risk: 3.33 },
  { name: 'Frank Harris', mrn: 'MRN-00268', payer: 'Simply Health', cost: 73890, condition: 'ALS + Home Vent', risk: 3.65 },
  { name: 'Gloria Morales', mrn: 'MRN-00398', payer: 'Sunshine Health', cost: 71540, condition: 'Liver Cirrhosis', risk: 3.08 },
  { name: 'Harold Clark', mrn: 'MRN-00078', payer: 'Aetna', cost: 68920, condition: 'Knee Replacement + Infection', risk: 2.62 },
];

const costByCategory = [
  { name: 'Inpatient', value: 18240, color: '#F97316' },
  { name: 'Outpatient', value: 9870, color: '#FB923C' },
  { name: 'Emergency', value: 5640, color: '#FDBA74' },
  { name: 'Pharmacy', value: 7320, color: '#FED7AA' },
  { name: 'Specialist', value: 3230, color: '#FFF7ED' },
];

const interventionSavings = [
  { intervention: 'Care Management for CHF patients', targetPop: 82, projectedSaving: 1240000, confidence: 'High' },
  { intervention: 'ER Diversion Program', targetPop: 145, projectedSaving: 890000, confidence: 'High' },
  { intervention: 'Generic Drug Substitution', targetPop: 312, projectedSaving: 670000, confidence: 'Medium' },
  { intervention: 'Telehealth for Chronic Disease', targetPop: 198, projectedSaving: 520000, confidence: 'Medium' },
  { intervention: 'Readmission Prevention Bundle', targetPop: 67, projectedSaving: 430000, confidence: 'High' },
];

const fmt = (n: number) => `$${(n / 1000).toFixed(0)}K`;
const fmtM = (n: number) => `$${(n / 1000000).toFixed(1)}M`;

export default function CostsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Predictive Cost Analytics</h1>
        <p className="text-sm text-[#86868b] mb-8">Cost forecasting and high-utilizer identification across all payers</p>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Cost YTD', value: '$44.3M', sub: 'Jan-Mar 2026' },
            { label: 'Avg PMPM', value: '$802', sub: 'Per member per month' },
            { label: 'Projected Annual', value: '$178.6M', sub: '+4.2% vs prior year' },
            { label: 'Cost Trend', value: '+3.8%', sub: 'Rolling 12-month' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{k.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{k.value}</p>
              <p className="text-[10px] text-[#86868b] mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Monthly Cost Trend by Payer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Monthly Cost Trend by Payer ($K)</h2>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} tickFormatter={v => `$${v}K`} />
              <Tooltip formatter={(v: number) => [`$${v}K`, '']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="simplyHealth" name="Simply Health" stroke="#F97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sunshineHealth" name="Sunshine Health" stroke="#0891B2" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humana" name="Humana" stroke="#7C3AED" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="aetna" name="Aetna" stroke="#DC2626" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="molina" name="Molina" stroke="#059669" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="wellcare" name="WellCare" stroke="#6366F1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top 20 Highest-Cost Patients */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Top 20 Highest-Cost Patients</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">#</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Patient</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">MRN</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Payer</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Total Cost</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Primary Condition</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">RAF Score</th>
                </tr>
              </thead>
              <tbody>
                {topPatients.map((p, i) => (
                  <tr key={p.mrn} className="border-b border-gray-50 hover:bg-[#f5f5f7] transition-colors">
                    <td className="py-2 text-xs text-[#86868b]">{i + 1}</td>
                    <td className="py-2 text-sm text-[#1d1d1f] font-medium">{p.name}</td>
                    <td className="py-2 text-xs text-[#86868b]">{p.mrn}</td>
                    <td className="py-2 text-xs text-[#6e6e73]">{p.payer}</td>
                    <td className="py-2 text-sm text-right font-semibold text-[#F97316]">${p.cost.toLocaleString()}</td>
                    <td className="py-2 text-xs text-[#6e6e73]">{p.condition}</td>
                    <td className="py-2 text-sm text-right font-medium text-[#1d1d1f]">{p.risk.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost by Service Category */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Cost by Service Category ($K)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={costByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {costByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}K`, 'Spend']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Service Category Breakdown</h2>
            <div className="space-y-4 mt-6">
              {costByCategory.map(c => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#1d1d1f]">{c.name}</span>
                    <span className="font-semibold text-[#1d1d1f]">${(c.value / 1000).toFixed(1)}M</span>
                  </div>
                  <div className="w-full bg-[#f5f5f7] rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${(c.value / 18240) * 100}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projected Savings from Interventions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-1">Projected Savings from Interventions</h2>
          <p className="text-xs text-[#86868b] mb-4">Estimated annual cost reduction based on population health models</p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Intervention</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Target Pop.</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Projected Savings</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {interventionSavings.map(s => (
                <tr key={s.intervention} className="border-b border-gray-50">
                  <td className="py-2.5 text-sm text-[#1d1d1f]">{s.intervention}</td>
                  <td className="py-2.5 text-sm text-right text-[#6e6e73]">{s.targetPop} members</td>
                  <td className="py-2.5 text-sm text-right font-semibold text-[#F97316]">{fmtM(s.projectedSaving)}</td>
                  <td className="py-2.5 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.confidence === 'High' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {s.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 p-4 bg-[#f5f5f7] rounded-xl">
            <p className="text-sm text-[#1d1d1f] font-medium">Total Projected Annual Savings: <span className="text-[#F97316] font-semibold">$3.75M</span></p>
            <p className="text-xs text-[#86868b] mt-1">Combined impact across 804 targeted members (4.4% of total population)</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
