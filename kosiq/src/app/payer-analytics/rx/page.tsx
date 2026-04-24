'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const topDrugsByCost = [
  { drug: 'Eliquis (Apixaban)', cost: 892 },
  { drug: 'Jardiance (Empagliflozin)', cost: 756 },
  { drug: 'Ozempic (Semaglutide)', cost: 684 },
  { drug: 'Xarelto (Rivarbagatran)', cost: 612 },
  { drug: 'Entresto (Sacubitril/Val)', cost: 548 },
  { drug: 'Humira (Adalimumab)', cost: 486 },
  { drug: 'Keytruda (Pembrolizumab)', cost: 445 },
  { drug: 'Trulicity (Dulaglutide)', cost: 398 },
  { drug: 'Farxiga (Dapagliflozin)', cost: 352 },
  { drug: 'Revlimid (Lenalidomide)', cost: 328 },
];

const specialtyDrugs = [
  { drug: 'Keytruda (Pembrolizumab)', patients: 8, monthlyCost: 18200, therapeutic: 'Oncology - PD-1 Inhibitor', generic: 'No' },
  { drug: 'Humira (Adalimumab)', patients: 24, monthlyCost: 6840, therapeutic: 'Immunology - TNF Inhibitor', generic: 'Biosimilar available' },
  { drug: 'Revlimid (Lenalidomide)', patients: 6, monthlyCost: 17800, therapeutic: 'Oncology - Immunomodulator', generic: 'No' },
  { drug: 'Ocrevus (Ocrelizumab)', patients: 4, monthlyCost: 5480, therapeutic: 'Neurology - Anti-CD20', generic: 'No' },
  { drug: 'Stelara (Ustekinumab)', patients: 12, monthlyCost: 4200, therapeutic: 'Immunology - IL-12/23', generic: 'Biosimilar pending' },
  { drug: 'Opdivo (Nivolumab)', patients: 5, monthlyCost: 14600, therapeutic: 'Oncology - PD-1 Inhibitor', generic: 'No' },
  { drug: 'Jakafi (Ruxolitinib)', patients: 3, monthlyCost: 12400, therapeutic: 'Oncology - JAK Inhibitor', generic: 'No' },
  { drug: 'Enbrel (Etanercept)', patients: 18, monthlyCost: 5200, therapeutic: 'Immunology - TNF Inhibitor', generic: 'Biosimilar available' },
  { drug: 'Rituxan (Rituximab)', patients: 7, monthlyCost: 8600, therapeutic: 'Oncology/Immunology', generic: 'Biosimilar available' },
  { drug: 'Tecfidera (Dimethyl Fumarate)', patients: 9, monthlyCost: 7200, therapeutic: 'Neurology - MS', generic: 'Yes (Vumerity)' },
];

const spendBreakdown = [
  { name: 'Generic', value: 3240, color: '#059669' },
  { name: 'Brand', value: 4890, color: '#F97316' },
  { name: 'Specialty', value: 2670, color: '#7C3AED' },
];

const adherenceByClass = [
  { drugClass: 'Statins', adherence: 78.2, patients: 312 },
  { drugClass: 'ACE Inhibitors/ARBs', adherence: 74.5, patients: 286 },
  { drugClass: 'Beta Blockers', adherence: 72.8, patients: 198 },
  { drugClass: 'Oral Diabetes Meds', adherence: 76.1, patients: 342 },
  { drugClass: 'Insulin', adherence: 68.4, patients: 156 },
  { drugClass: 'Anticoagulants', adherence: 82.3, patients: 124 },
  { drugClass: 'Inhalers (COPD/Asthma)', adherence: 64.2, patients: 178 },
  { drugClass: 'Antidepressants', adherence: 61.8, patients: 145 },
  { drugClass: 'Proton Pump Inhibitors', adherence: 70.6, patients: 198 },
  { drugClass: 'Thyroid Hormones', adherence: 84.1, patients: 112 },
];

const genericSubstitution = [
  { brand: 'Crestor (Rosuvastatin)', generic: 'Rosuvastatin Generic', patients: 42, monthlySaving: 285, annualSaving: 143640 },
  { brand: 'Humira (Adalimumab)', generic: 'Hadlima (Biosimilar)', patients: 24, monthlySaving: 2100, annualSaving: 604800 },
  { brand: 'Enbrel (Etanercept)', generic: 'Erelzi (Biosimilar)', patients: 18, monthlySaving: 1800, annualSaving: 388800 },
  { brand: 'Nexium (Esomeprazole)', generic: 'Esomeprazole Generic', patients: 68, monthlySaving: 180, annualSaving: 146880 },
  { brand: 'Rituxan (Rituximab)', generic: 'Truxima (Biosimilar)', patients: 7, monthlySaving: 2800, annualSaving: 235200 },
  { brand: 'Lyrica (Pregabalin)', generic: 'Pregabalin Generic', patients: 56, monthlySaving: 220, annualSaving: 147840 },
];

const totalGenericSavings = genericSubstitution.reduce((s, g) => s + g.annualSaving, 0);

export default function RxPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Pharmacy Analytics</h1>
        <p className="text-sm text-[#86868b] mb-8">Drug spend analysis, specialty drug tracking, adherence rates, and generic savings opportunities</p>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Rx Spend YTD', value: '$10.8M', sub: 'Apr 2025 - Mar 2026' },
            { label: 'Avg Cost / Member', value: '$586', sub: 'Per member per month' },
            { label: 'Generic Utilization', value: '68.2%', sub: 'Target: 75%' },
            { label: 'Specialty Drug %', value: '24.7%', sub: '$2.67M of total spend' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{k.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{k.value}</p>
              <p className="text-[10px] text-[#86868b] mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Top 10 Drugs by Cost */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Top 10 Drugs by Annual Cost ($K)</h2>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={topDrugsByCost} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#86868b' }} tickFormatter={v => `$${v}K`} />
              <YAxis dataKey="drug" type="category" tick={{ fontSize: 11, fill: '#86868b' }} width={180} />
              <Tooltip formatter={(v: number) => [`$${v}K`, 'Annual Cost']} />
              <Bar dataKey="cost" fill="#F97316" radius={[0, 4, 4, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Specialty Drugs Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">High-Cost Specialty Drugs</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Drug</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Patients</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Monthly Cost</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Therapeutic Class</th>
                  <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase pb-3">Generic Available?</th>
                </tr>
              </thead>
              <tbody>
                {specialtyDrugs.map(d => (
                  <tr key={d.drug} className="border-b border-gray-50 hover:bg-[#f5f5f7] transition-colors">
                    <td className="py-2 text-sm text-[#1d1d1f] font-medium">{d.drug}</td>
                    <td className="py-2 text-sm text-right text-[#6e6e73]">{d.patients}</td>
                    <td className="py-2 text-sm text-right font-semibold text-[#F97316]">${d.monthlyCost.toLocaleString()}</td>
                    <td className="py-2 text-xs text-[#6e6e73]">{d.therapeutic}</td>
                    <td className="py-2 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        d.generic === 'No' ? 'bg-red-50 text-red-700' :
                        d.generic.includes('Biosimilar available') ? 'bg-green-50 text-green-700' :
                        d.generic.includes('pending') ? 'bg-yellow-50 text-yellow-700' :
                        'bg-green-50 text-green-700'
                      }`}>{d.generic}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spend Breakdown + Adherence */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Spend Breakdown ($K)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={spendBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {spendBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}K`, 'Spend']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {spendBreakdown.map(s => (
                <span key={s.name} className="flex items-center gap-1.5 text-xs text-[#6e6e73]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}: ${(s.value / 1000).toFixed(1)}M
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">Medication Adherence by Drug Class</h2>
            <div className="space-y-3">
              {adherenceByClass.map(a => (
                <div key={a.drugClass}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#1d1d1f]">{a.drugClass}</span>
                    <span className={`font-medium ${a.adherence >= 80 ? 'text-green-600' : a.adherence >= 70 ? 'text-[#F97316]' : 'text-red-600'}`}>
                      {a.adherence}% ({a.patients} pts)
                    </span>
                  </div>
                  <div className="w-full bg-[#f5f5f7] rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${a.adherence}%`,
                        backgroundColor: a.adherence >= 80 ? '#059669' : a.adherence >= 70 ? '#F97316' : '#DC2626',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generic Substitution Savings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-1">Generic / Biosimilar Substitution Opportunities</h2>
          <p className="text-xs text-[#86868b] mb-4">Potential annual savings from switching eligible patients to generic or biosimilar alternatives</p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Brand Drug</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Generic/Biosimilar</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Patients</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Monthly Saving/Pt</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Annual Savings</th>
              </tr>
            </thead>
            <tbody>
              {genericSubstitution.map(g => (
                <tr key={g.brand} className="border-b border-gray-50">
                  <td className="py-2.5 text-sm text-[#1d1d1f]">{g.brand}</td>
                  <td className="py-2.5 text-sm text-[#059669]">{g.generic}</td>
                  <td className="py-2.5 text-sm text-right text-[#6e6e73]">{g.patients}</td>
                  <td className="py-2.5 text-sm text-right text-[#6e6e73]">${g.monthlySaving.toLocaleString()}</td>
                  <td className="py-2.5 text-sm text-right font-semibold text-[#F97316]">${g.annualSaving.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 p-4 bg-[#f5f5f7] rounded-xl">
            <p className="text-sm text-[#1d1d1f] font-medium">
              Total Potential Annual Savings: <span className="text-[#F97316] font-semibold">${(totalGenericSavings / 1000000).toFixed(2)}M</span>
            </p>
            <p className="text-xs text-[#86868b] mt-1">Across {genericSubstitution.reduce((s, g) => s + g.patients, 0)} patients eligible for therapeutic substitution</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
