'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Patient {
  name: string; mrn: string; age: number; riskTier: string; riskScore: number; conditions: string[]; lastVisit: string; nextAction: string;
}

interface ProviderDetail {
  name: string; specialty: string; panelSize: number; avgRiskScore: number; pmpm: number; qualityScore: number;
  riskDistribution: { tier: string; count: number }[];
  patients: Patient[];
}

const providerData: Record<string, ProviderDetail> = {
  'martinez': {
    name: 'Dr. Elena Martinez', specialty: 'Internal Medicine', panelSize: 842, avgRiskScore: 1.24, pmpm: 1405, qualityScore: 91.2,
    riskDistribution: [{ tier: 'Low', count: 412 }, { tier: 'Moderate', count: 256 }, { tier: 'High', count: 124 }, { tier: 'Very High', count: 50 }],
    patients: [
      { name: 'Maria Garcia', mrn: 'MRN-100234', age: 67, riskTier: 'High', riskScore: 2.14, conditions: ['T2DM', 'CHF', 'CKD Stage 3'], lastVisit: '2026-01-14', nextAction: 'HbA1c recheck' },
      { name: 'Patricia Brown', mrn: 'MRN-100891', age: 69, riskTier: 'Moderate', riskScore: 1.45, conditions: ['HTN', 'Osteoporosis'], lastVisit: '2026-02-20', nextAction: 'Mammography scheduling' },
      { name: 'Susan Anderson', mrn: 'MRN-101689', age: 68, riskTier: 'Low', riskScore: 0.82, conditions: ['Hyperlipidemia'], lastVisit: '2026-02-10', nextAction: 'Annual wellness visit' },
      { name: 'Barbara Robinson', mrn: 'MRN-103234', age: 75, riskTier: 'Moderate', riskScore: 1.38, conditions: ['HTN', 'T2DM'], lastVisit: '2025-12-28', nextAction: 'Cervical screening' },
      { name: 'Mark Lopez', mrn: 'MRN-104678', age: 73, riskTier: 'Very High', riskScore: 3.12, conditions: ['CHF', 'CKD Stage 4', 'Anemia'], lastVisit: '2026-01-05', nextAction: 'Nephrology referral' },
      { name: 'George Mitchell', mrn: 'MRN-106234', age: 74, riskTier: 'High', riskScore: 2.45, conditions: ['T2DM', 'COPD', 'Afib'], lastVisit: '2025-11-02', nextAction: 'Comprehensive diabetes visit' },
    ],
  },
  'lee': {
    name: 'Dr. Jennifer Lee', specialty: 'Geriatrics', panelSize: 198, avgRiskScore: 1.87, pmpm: 2560, qualityScore: 89.8,
    riskDistribution: [{ tier: 'Low', count: 42 }, { tier: 'Moderate', count: 68 }, { tier: 'High', count: 56 }, { tier: 'Very High', count: 32 }],
    patients: [
      { name: 'Dorothy Thomas', mrn: 'MRN-102012', age: 82, riskTier: 'High', riskScore: 2.34, conditions: ['COPD', 'Osteoarthritis', 'Depression'], lastVisit: '2025-11-28', nextAction: 'Flu vaccine, colorectal screening' },
      { name: 'Betty Clark', mrn: 'MRN-102890', age: 79, riskTier: 'Moderate', riskScore: 1.56, conditions: ['HTN', 'Hypothyroid'], lastVisit: '2026-02-15', nextAction: 'Flu vaccine' },
      { name: 'Daniel King', mrn: 'MRN-104234', age: 84, riskTier: 'Very High', riskScore: 3.45, conditions: ['Parkinson\'s', 'HTN', 'Falls Risk'], lastVisit: '2026-01-20', nextAction: 'PT evaluation' },
      { name: 'Edward Nelson', mrn: 'MRN-105890', age: 85, riskTier: 'Very High', riskScore: 3.78, conditions: ['Dementia', 'CHF', 'Afib', 'Osteoporosis'], lastVisit: '2025-09-10', nextAction: 'Urgent: caregiver assessment' },
    ],
  },
  'chen': {
    name: 'Dr. Wei Chen', specialty: 'Cardiology', panelSize: 567, avgRiskScore: 1.52, pmpm: 1823, qualityScore: 87.4,
    riskDistribution: [{ tier: 'Low', count: 178 }, { tier: 'Moderate', count: 212 }, { tier: 'High', count: 118 }, { tier: 'Very High', count: 59 }],
    patients: [
      { name: 'James Wilson', mrn: 'MRN-100567', age: 73, riskTier: 'Very High', riskScore: 3.56, conditions: ['CHF Class III', 'Afib', 'T2DM'], lastVisit: '2026-01-28', nextAction: 'Cardiology follow-up' },
      { name: 'Michael Davis', mrn: 'MRN-101467', age: 66, riskTier: 'Moderate', riskScore: 1.23, conditions: ['Afib', 'HTN', 'Hyperlipidemia'], lastVisit: '2026-01-05', nextAction: 'Statin adherence check' },
      { name: 'Richard Lewis', mrn: 'MRN-103012', age: 68, riskTier: 'High', riskScore: 2.12, conditions: ['CAD', 'Post-CABG', 'HTN'], lastVisit: '2025-11-05', nextAction: 'Cardiac rehab enrollment' },
      { name: 'Karen Wright', mrn: 'MRN-104456', age: 66, riskTier: 'Low', riskScore: 0.91, conditions: ['Hyperlipidemia', 'Prediabetes'], lastVisit: '2026-02-18', nextAction: 'HbA1c recheck in 3mo' },
      { name: 'Ruth Carter', mrn: 'MRN-106012', age: 69, riskTier: 'Moderate', riskScore: 1.34, conditions: ['HTN', 'Mitral Regurgitation'], lastVisit: '2025-12-12', nextAction: 'Mammography, echocardiogram' },
    ],
  },
  'kim': {
    name: 'Dr. Michael Kim', specialty: 'Family Medicine', panelSize: 956, avgRiskScore: 1.18, pmpm: 1413, qualityScore: 85.1,
    riskDistribution: [{ tier: 'Low', count: 498 }, { tier: 'Moderate', count: 278 }, { tier: 'High', count: 126 }, { tier: 'Very High', count: 54 }],
    patients: [
      { name: 'Charles Jackson', mrn: 'MRN-102234', age: 70, riskTier: 'High', riskScore: 2.01, conditions: ['T2DM', 'Obesity', 'Sleep Apnea', 'HTN'], lastVisit: '2025-10-10', nextAction: 'HbA1c + eye exam' },
      { name: 'Helen Hall', mrn: 'MRN-103678', age: 69, riskTier: 'Moderate', riskScore: 1.12, conditions: ['HTN', 'Anxiety'], lastVisit: '2026-01-28', nextAction: 'BP follow-up' },
      { name: 'Donna Green', mrn: 'MRN-105234', age: 67, riskTier: 'Low', riskScore: 0.78, conditions: ['Hyperlipidemia'], lastVisit: '2026-02-05', nextAction: 'Mammography' },
      { name: 'Deborah Turner', mrn: 'MRN-106890', age: 83, riskTier: 'Very High', riskScore: 3.24, conditions: ['CHF', 'Afib', 'CKD Stage 3', 'Depression'], lastVisit: '2025-10-22', nextAction: 'Urgent: care management enrollment' },
    ],
  },
  'patel': {
    name: 'Dr. Raj Patel', specialty: 'Endocrinology', panelSize: 423, avgRiskScore: 1.67, pmpm: 2081, qualityScore: 82.9,
    riskDistribution: [{ tier: 'Low', count: 98 }, { tier: 'Moderate', count: 156 }, { tier: 'High', count: 112 }, { tier: 'Very High', count: 57 }],
    patients: [
      { name: 'Robert Johnson', mrn: 'MRN-101023', age: 78, riskTier: 'High', riskScore: 2.67, conditions: ['COPD', 'T2DM', 'CHF'], lastVisit: '2025-12-15', nextAction: 'Pulmonology referral' },
      { name: 'David Martinez', mrn: 'MRN-101890', age: 74, riskTier: 'Moderate', riskScore: 1.45, conditions: ['T2DM', 'Neuropathy'], lastVisit: '2026-02-18', nextAction: 'HbA1c + foot exam' },
      { name: 'William Walker', mrn: 'MRN-103456', age: 80, riskTier: 'Very High', riskScore: 3.89, conditions: ['T1DM', 'Neuropathy', 'CKD Stage 4', 'Retinopathy'], lastVisit: '2025-08-30', nextAction: 'Urgent: endocrinology + nephrology' },
      { name: 'Paul Scott', mrn: 'MRN-105012', age: 81, riskTier: 'High', riskScore: 2.34, conditions: ['T2DM', 'Diabetic Foot Ulcer', 'PVD'], lastVisit: '2025-11-18', nextAction: 'Wound care follow-up' },
      { name: 'Sharon Perez', mrn: 'MRN-106456', age: 78, riskTier: 'Moderate', riskScore: 1.28, conditions: ['T2DM', 'HTN'], lastVisit: '2026-01-15', nextAction: 'BP optimization' },
    ],
  },
  'johnson': {
    name: 'Dr. Sarah Johnson', specialty: 'Pulmonology', panelSize: 312, avgRiskScore: 1.58, pmpm: 2393, qualityScore: 80.4,
    riskDistribution: [{ tier: 'Low', count: 89 }, { tier: 'Moderate', count: 112 }, { tier: 'High', count: 78 }, { tier: 'Very High', count: 33 }],
    patients: [
      { name: 'Linda Smith', mrn: 'MRN-101245', age: 71, riskTier: 'Moderate', riskScore: 1.34, conditions: ['Asthma', 'GERD', 'Obesity'], lastVisit: '2026-01-18', nextAction: 'Mammography' },
      { name: 'Thomas Allen', mrn: 'MRN-103890', age: 77, riskTier: 'Very High', riskScore: 3.12, conditions: ['COPD Stage 3', 'Pulm HTN', 'Cor Pulmonale'], lastVisit: '2025-12-01', nextAction: 'Spirometry + vaccine' },
      { name: 'Carol Baker', mrn: 'MRN-105678', age: 72, riskTier: 'Moderate', riskScore: 1.56, conditions: ['COPD', 'Lung Nodule F/U', 'Anxiety'], lastVisit: '2026-01-02', nextAction: 'CT follow-up + colorectal screening' },
    ],
  },
  'rodriguez': {
    name: 'Dr. Carlos Rodriguez', specialty: 'Internal Medicine', panelSize: 734, avgRiskScore: 1.31, pmpm: 1510, qualityScore: 78.6,
    riskDistribution: [{ tier: 'Low', count: 312 }, { tier: 'Moderate', count: 234 }, { tier: 'High', count: 134 }, { tier: 'Very High', count: 54 }],
    patients: [
      { name: 'Margaret White', mrn: 'MRN-102456', age: 76, riskTier: 'High', riskScore: 2.12, conditions: ['Osteoporosis', 'Vertebral Fracture', 'HTN'], lastVisit: '2025-12-08', nextAction: 'Bone density + mammography' },
      { name: 'Nancy Young', mrn: 'MRN-104012', age: 71, riskTier: 'Moderate', riskScore: 1.45, conditions: ['Depression', 'COPD', 'Fibromyalgia'], lastVisit: '2025-10-30', nextAction: 'Depression screening + mammography' },
      { name: 'Steven Adams', mrn: 'MRN-105456', age: 76, riskTier: 'Very High', riskScore: 3.01, conditions: ['T2DM', 'CHF', 'CKD Stage 3', 'HTN'], lastVisit: '2025-10-15', nextAction: 'Urgent: comprehensive care plan' },
    ],
  },
  'williams': {
    name: 'Dr. Amanda Williams', specialty: 'Nephrology', panelSize: 289, avgRiskScore: 1.72, pmpm: 2285, qualityScore: 76.2,
    riskDistribution: [{ tier: 'Low', count: 62 }, { tier: 'Moderate', count: 98 }, { tier: 'High', count: 86 }, { tier: 'Very High', count: 43 }],
    patients: [
      { name: 'Joseph Harris', mrn: 'MRN-102678', age: 72, riskTier: 'Very High', riskScore: 3.34, conditions: ['CKD Stage 4', 'HTN', 'Anemia', 'T2DM'], lastVisit: '2026-01-12', nextAction: 'Dialysis access planning' },
      { name: 'Sandra Hill', mrn: 'MRN-104890', age: 70, riskTier: 'High', riskScore: 2.01, conditions: ['CKD Stage 3', 'T2DM', 'Gout'], lastVisit: '2025-12-20', nextAction: 'Kidney monitoring + HbA1c' },
      { name: 'Kenneth Roberts', mrn: 'MRN-106678', age: 71, riskTier: 'Moderate', riskScore: 1.56, conditions: ['CKD Stage 3', 'HTN', 'Hyperlipidemia'], lastVisit: '2025-12-05', nextAction: 'Colonoscopy scheduling' },
    ],
  },
};

const TIER_COLORS: Record<string, string> = { Low: '#10b981', Moderate: '#f59e0b', High: '#f97316', 'Very High': '#ef4444' };

export default function ProviderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const provider = providerData[id];

  if (!provider) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-8">
          <Link href="/population-health" className="text-[#26acf7] text-sm hover:underline mb-4 inline-block">← Back to Population Health</Link>
          <p className="text-red-500">Provider not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <Link href="/population-health" className="text-[#26acf7] text-sm hover:underline mb-4 inline-block">← Back to Population Health</Link>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">{provider.name}</h1>
          <p className="text-sm text-[#86868b] mt-1">{provider.specialty}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-[#86868b]">Panel Size</p>
            <p className="text-2xl font-bold text-[#1d1d1f]">{provider.panelSize}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-[#86868b]">Avg Risk Score</p>
            <p className="text-2xl font-bold text-[#26acf7]">{provider.avgRiskScore}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-[#86868b]">PMPM</p>
            <p className="text-2xl font-bold text-[#1d1d1f]">${provider.pmpm.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-[#86868b]">Quality Score</p>
            <p className={`text-2xl font-bold ${provider.qualityScore >= 85 ? 'text-green-600' : provider.qualityScore >= 75 ? 'text-amber-500' : 'text-red-500'}`}>{provider.qualityScore}%</p>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <p className="text-sm font-medium text-[#1d1d1f] mb-3">Risk Tier Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={provider.riskDistribution}>
              <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {provider.riskDistribution.map((d, i) => (
                  <Cell key={i} fill={TIER_COLORS[d.tier] || '#86868b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-[#f5f5f7]">
            <p className="text-xs font-semibold text-[#86868b] uppercase">Patient Panel</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]/50">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-2">Patient</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-2">MRN</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-2">Age</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-2">Risk Tier</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-2">Score</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-2">Conditions</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-2">Last Visit</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-2">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {provider.patients.map((pt, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-[#1d1d1f]">{pt.name}</td>
                  <td className="px-3 py-3 text-xs text-[#86868b] font-mono">{pt.mrn}</td>
                  <td className="px-3 py-3 text-xs text-center text-[#6e6e73]">{pt.age}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full" style={{ backgroundColor: `${TIER_COLORS[pt.riskTier]}20`, color: TIER_COLORS[pt.riskTier] }}>{pt.riskTier}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-center font-semibold" style={{ color: TIER_COLORS[pt.riskTier] }}>{pt.riskScore}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {pt.conditions.map(c => <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-[#6e6e73] text-[9px] rounded">{c}</span>)}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-right text-[#86868b]">{pt.lastVisit}</td>
                  <td className="px-4 py-3 text-xs text-[#1d1d1f]">
                    {pt.nextAction.startsWith('Urgent') ? (
                      <span className="text-red-600 font-semibold">{pt.nextAction}</span>
                    ) : pt.nextAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

