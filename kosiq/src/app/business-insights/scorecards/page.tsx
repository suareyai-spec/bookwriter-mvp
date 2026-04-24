'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';

const providers = [
  { name: 'Dr. Maria Santos', specialty: 'Internal Medicine', patients: { medicare: 180, medicaid: 42, commercial: 28, ffs: 5, total: 255 }, highCost: 3, highCostPct: 1.18, mlr: { medicare: 78.5, medicaid: 65.2 }, mra: 1.24, admitRate: 32.5, readmitRate: 8.2, erRate: 245, los: 3.1, pmpm: { medicare: 1380, medicaid: 225 }, pharmPmpm: 28.5, pharmScripts: 3850, gdr: 87.2, awv: 142, awvPct: 55.7, avgWait: 18, uniqueSeen: { medicare: 12.4, medicaid: 8.2 }, withoutVisit: { medicare: 15, medicaid: 8 }, referralPct: 4.2, routine: 18, urgent: 3, stat: 0 },
  { name: 'Dr. James Chen', specialty: 'Internal Medicine', patients: { medicare: 165, medicaid: 38, commercial: 22, ffs: 8, total: 233 }, highCost: 2, highCostPct: 0.86, mlr: { medicare: 82.1, medicaid: 58.7 }, mra: 1.18, admitRate: 28.4, readmitRate: 6.5, erRate: 198, los: 2.8, pmpm: { medicare: 1420, medicaid: 210 }, pharmPmpm: 32.1, pharmScripts: 4120, gdr: 82.5, awv: 128, awvPct: 52.3, avgWait: 22, uniqueSeen: { medicare: 11.8, medicaid: 7.5 }, withoutVisit: { medicare: 20, medicaid: 12 }, referralPct: 5.1, routine: 22, urgent: 4, stat: 1 },
  { name: 'Dr. Patricia Williams', specialty: 'Family Medicine', patients: { medicare: 145, medicaid: 55, commercial: 35, ffs: 3, total: 238 }, highCost: 1, highCostPct: 0.42, mlr: { medicare: 72.3, medicaid: 61.8 }, mra: 1.22, admitRate: 24.8, readmitRate: 5.2, erRate: 175, los: 2.5, pmpm: { medicare: 1280, medicaid: 198 }, pharmPmpm: 25.8, pharmScripts: 3680, gdr: 89.1, awv: 135, awvPct: 58.2, avgWait: 15, uniqueSeen: { medicare: 13.2, medicaid: 9.8 }, withoutVisit: { medicare: 8, medicaid: 5 }, referralPct: 3.5, routine: 15, urgent: 2, stat: 0 },
];

export default function PhysicianScorecardsPage() {
  const [selected, setSelected] = useState(0);
  const p = providers[selected];

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Physician Scorecards</h1>

        {/* Provider Selector */}
        <div className="flex gap-2 mb-6">
          {providers.map((prov, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selected === i ? 'bg-[#0071e3] text-white' : 'bg-white text-[#6e6e73] border border-gray-200 hover:bg-gray-50'}`}>
              {prov.name}
            </button>
          ))}
        </div>

        {/* Provider Profile */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#f5f5f7] flex items-center justify-center text-2xl font-bold text-[#86868b]">
              {p.name.split(' ').map(n => n[0]).join('').slice(1)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[#1d1d1f]">{p.name}</h2>
              <p className="text-sm text-[#86868b]">{p.specialty}</p>
              <div className="grid grid-cols-6 gap-4 mt-4">
                {[
                  { label: 'Medicare', value: p.patients.medicare },
                  { label: 'Medicaid', value: p.patients.medicaid },
                  { label: 'Commercial', value: p.patients.commercial },
                  { label: 'FFS', value: p.patients.ffs },
                  { label: 'Total', value: p.patients.total },
                  { label: 'High Cost', value: p.highCost },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-[10px] text-[#86868b] uppercase">{s.label}</p>
                    <p className="text-lg font-semibold text-[#1d1d1f]">{s.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#86868b] mt-2">High Cost Patients: {p.highCostPct}% | Threshold: $50,000</p>
            </div>
          </div>
        </div>

        {/* 4-Column Scorecard */}
        <div className="grid grid-cols-4 gap-4">
          {/* Health & Healthcare Outcomes */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-4">Health & Healthcare Outcomes</h3>
            <div className="space-y-3">
              {[
                { label: 'MLR (Medicare)', value: `${p.mlr.medicare}%` },
                { label: 'MLR (Medicaid)', value: `${p.mlr.medicaid}%` },
                { label: 'MRA Score', value: p.mra.toFixed(2) },
                { label: 'Admission Rate/1K', value: p.admitRate.toString() },
                { label: 'Readmission Rate/1K', value: p.readmitRate.toString() },
                { label: 'ER Visit Rate/1K', value: p.erRate.toString() },
                { label: 'Admissions LOS', value: p.los.toString() },
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-xs text-[#6e6e73]">{m.label}</span>
                  <span className="text-xs font-semibold text-[#1d1d1f]">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Panel */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-4">Patient Panel</h3>
            <div className="space-y-3">
              {[
                { label: 'Medicare PMPM', value: `$${p.pmpm.medicare.toLocaleString()}` },
                { label: 'Medicaid PMPM', value: `$${p.pmpm.medicaid}` },
                { label: 'Pharmacy PMPM', value: `$${p.pharmPmpm}` },
                { label: 'Pharmacy Scripts/1K', value: p.pharmScripts.toLocaleString() },
                { label: 'GDR %', value: `${p.gdr}%` },
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-xs text-[#6e6e73]">{m.label}</span>
                  <span className="text-xs font-semibold text-[#1d1d1f]">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Operations */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-4">Appointment Operations</h3>
            <div className="space-y-3">
              {[
                { label: 'AWV Completed', value: p.awv.toString() },
                { label: 'AWV Completion %', value: `${p.awvPct}%` },
                { label: 'Avg Wait Time (min)', value: p.avgWait.toString() },
                { label: 'Unique Patients/Day (MC)', value: p.uniqueSeen.medicare.toString() },
                { label: 'Unique Patients/Day (MA)', value: p.uniqueSeen.medicaid.toString() },
                { label: 'W/O Office Visit (MC)', value: p.withoutVisit.medicare.toString() },
                { label: 'W/O Office Visit (MA)', value: p.withoutVisit.medicaid.toString() },
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-xs text-[#6e6e73]">{m.label}</span>
                  <span className="text-xs font-semibold text-[#1d1d1f]">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Management */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-4">Referral Management</h3>
            <div className="space-y-3">
              {[
                { label: '% Referrals', value: `${p.referralPct}%` },
                { label: 'Routine Referrals', value: p.routine.toString() },
                { label: 'Urgent Referrals', value: p.urgent.toString() },
                { label: 'Stat Referrals', value: p.stat.toString() },
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-xs text-[#6e6e73]">{m.label}</span>
                  <span className="text-xs font-semibold text-[#1d1d1f]">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
