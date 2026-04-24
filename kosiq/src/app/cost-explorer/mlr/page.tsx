'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const payerMLR = [
  { payer: 'Simply Health', mlr: 87.2, target: 85, premium: 48200000, claims: 42030000, variance: 2.2 },
  { payer: 'Humana', mlr: 83.1, target: 85, premium: 35600000, claims: 29584000, variance: -1.9 },
  { payer: 'Aetna', mlr: 89.4, target: 85, premium: 22100000, claims: 19757000, variance: 4.4 },
  { payer: 'UnitedHealth', mlr: 84.7, target: 85, premium: 41800000, claims: 35405000, variance: -0.3 },
  { payer: 'Cigna', mlr: 81.3, target: 85, premium: 18900000, claims: 15366000, variance: -3.7 },
];
const PIE_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981'];

interface HighCostPatient {
  name: string; mrn: string; age: number; conditions: string[]; totalClaims: number; erVisits: number; admissions: number; pmpm: number; avoidableCost: number;
}

interface MLRProvider {
  id: number; name: string; specialty: string; panelSize: number; mlrContrib: number; totalClaims: number; pmpm: number; highUtilizers: number;
  patients: HighCostPatient[];
}

const providers: MLRProvider[] = [
  { id: 1, name: 'Dr. Elena Martinez', specialty: 'Internal Medicine', panelSize: 842, mlrContrib: 12.4, totalClaims: 14200000, pmpm: 1405, highUtilizers: 8,
    patients: [
      { name: 'Maria Garcia', mrn: 'MRN-100234', age: 67, conditions: ['T2DM', 'CHF', 'CKD Stage 3'], totalClaims: 78400, erVisits: 4, admissions: 2, pmpm: 6533, avoidableCost: 22100 },
      { name: 'George Mitchell', mrn: 'MRN-106234', age: 74, conditions: ['T2DM', 'COPD', 'Atrial Fib'], totalClaims: 92100, erVisits: 6, admissions: 3, pmpm: 7675, avoidableCost: 34500 },
      { name: 'Mark Lopez', mrn: 'MRN-104678', age: 73, conditions: ['CHF', 'CKD Stage 4', 'Anemia'], totalClaims: 112300, erVisits: 8, admissions: 4, pmpm: 9358, avoidableCost: 45200 },
      { name: 'Patricia Brown', mrn: 'MRN-100891', age: 69, conditions: ['Breast CA (remission)', 'HTN', 'Osteoporosis'], totalClaims: 54200, erVisits: 2, admissions: 1, pmpm: 4517, avoidableCost: 8900 },
    ]},
  { id: 2, name: 'Dr. Wei Chen', specialty: 'Cardiology', panelSize: 567, mlrContrib: 10.8, totalClaims: 12400000, pmpm: 1823, highUtilizers: 6,
    patients: [
      { name: 'James Wilson', mrn: 'MRN-100567', age: 73, conditions: ['CHF Class III', 'Afib', 'T2DM'], totalClaims: 134500, erVisits: 9, admissions: 5, pmpm: 11208, avoidableCost: 52300 },
      { name: 'Richard Lewis', mrn: 'MRN-103012', age: 68, conditions: ['CAD', 'Post-CABG', 'HTN'], totalClaims: 67800, erVisits: 3, admissions: 2, pmpm: 5650, avoidableCost: 18700 },
      { name: 'Michael Davis', mrn: 'MRN-101467', age: 66, conditions: ['Afib', 'HTN', 'Hyperlipidemia'], totalClaims: 52100, erVisits: 2, admissions: 1, pmpm: 4342, avoidableCost: 12400 },
    ]},
  { id: 3, name: 'Dr. Raj Patel', specialty: 'Endocrinology', panelSize: 423, mlrContrib: 9.2, totalClaims: 10560000, pmpm: 2081, highUtilizers: 7,
    patients: [
      { name: 'William Walker', mrn: 'MRN-103456', age: 80, conditions: ['T1DM', 'Neuropathy', 'CKD Stage 4', 'Retinopathy'], totalClaims: 156700, erVisits: 11, admissions: 6, pmpm: 13058, avoidableCost: 67800 },
      { name: 'Robert Johnson', mrn: 'MRN-101023', age: 78, conditions: ['COPD', 'T2DM', 'CHF'], totalClaims: 89200, erVisits: 7, admissions: 3, pmpm: 7433, avoidableCost: 31200 },
      { name: 'Paul Scott', mrn: 'MRN-105012', age: 81, conditions: ['T2DM', 'Diabetic Foot Ulcer', 'PVD'], totalClaims: 71400, erVisits: 5, admissions: 2, pmpm: 5950, avoidableCost: 24100 },
    ]},
  { id: 4, name: 'Dr. Michael Kim', specialty: 'Family Medicine', panelSize: 956, mlrContrib: 14.1, totalClaims: 16200000, pmpm: 1413, highUtilizers: 11,
    patients: [
      { name: 'Charles Jackson', mrn: 'MRN-102234', age: 70, conditions: ['T2DM', 'Obesity', 'Sleep Apnea', 'HTN'], totalClaims: 68900, erVisits: 5, admissions: 2, pmpm: 5742, avoidableCost: 21300 },
      { name: 'Deborah Turner', mrn: 'MRN-106890', age: 83, conditions: ['CHF', 'Afib', 'CKD Stage 3', 'Depression'], totalClaims: 104500, erVisits: 8, admissions: 4, pmpm: 8708, avoidableCost: 41200 },
      { name: 'Helen Hall', mrn: 'MRN-103678', age: 69, conditions: ['HTN', 'Hyperlipidemia', 'Prediabetes'], totalClaims: 28400, erVisits: 1, admissions: 0, pmpm: 2367, avoidableCost: 4200 },
    ]},
  { id: 5, name: 'Dr. Jennifer Lee', specialty: 'Geriatrics', panelSize: 198, mlrContrib: 5.3, totalClaims: 6080000, pmpm: 2560, highUtilizers: 5,
    patients: [
      { name: 'Edward Nelson', mrn: 'MRN-105890', age: 85, conditions: ['Dementia', 'CHF', 'Afib', 'Osteoporosis'], totalClaims: 142300, erVisits: 10, admissions: 5, pmpm: 11858, avoidableCost: 56700 },
      { name: 'Dorothy Thomas', mrn: 'MRN-102012', age: 82, conditions: ['COPD', 'Osteoarthritis', 'Depression'], totalClaims: 61200, erVisits: 4, admissions: 2, pmpm: 5100, avoidableCost: 19800 },
      { name: 'Daniel King', mrn: 'MRN-104234', age: 84, conditions: ['Parkinson\'s', 'HTN', 'Falls Risk'], totalClaims: 73800, erVisits: 6, admissions: 3, pmpm: 6150, avoidableCost: 28900 },
    ]},
  { id: 6, name: 'Dr. Sarah Johnson', specialty: 'Pulmonology', panelSize: 312, mlrContrib: 7.8, totalClaims: 8960000, pmpm: 2393, highUtilizers: 5,
    patients: [
      { name: 'Thomas Allen', mrn: 'MRN-103890', age: 77, conditions: ['COPD Stage 3', 'Pulm HTN', 'Cor Pulmonale'], totalClaims: 118900, erVisits: 9, admissions: 4, pmpm: 9908, avoidableCost: 43600 },
      { name: 'Linda Smith', mrn: 'MRN-101245', age: 71, conditions: ['Asthma', 'GERD', 'Obesity'], totalClaims: 42100, erVisits: 3, admissions: 1, pmpm: 3508, avoidableCost: 11200 },
      { name: 'Carol Baker', mrn: 'MRN-105678', age: 72, conditions: ['COPD', 'Lung Nodule F/U', 'Anxiety'], totalClaims: 55600, erVisits: 4, admissions: 2, pmpm: 4633, avoidableCost: 16800 },
    ]},
  { id: 7, name: 'Dr. Carlos Rodriguez', specialty: 'Internal Medicine', panelSize: 734, mlrContrib: 11.6, totalClaims: 13300000, pmpm: 1510, highUtilizers: 9,
    patients: [
      { name: 'Steven Adams', mrn: 'MRN-105456', age: 76, conditions: ['T2DM', 'CHF', 'CKD Stage 3', 'HTN'], totalClaims: 96700, erVisits: 7, admissions: 3, pmpm: 8058, avoidableCost: 35400 },
      { name: 'Nancy Young', mrn: 'MRN-104012', age: 71, conditions: ['Depression', 'COPD', 'Fibromyalgia'], totalClaims: 58300, erVisits: 5, admissions: 2, pmpm: 4858, avoidableCost: 18900 },
      { name: 'Margaret White', mrn: 'MRN-102456', age: 76, conditions: ['Osteoporosis', 'Vertebral Fracture', 'HTN'], totalClaims: 63100, erVisits: 3, admissions: 2, pmpm: 5258, avoidableCost: 15600 },
    ]},
  { id: 8, name: 'Dr. Amanda Williams', specialty: 'Nephrology', panelSize: 289, mlrContrib: 6.9, totalClaims: 7920000, pmpm: 2285, highUtilizers: 6,
    patients: [
      { name: 'Joseph Harris', mrn: 'MRN-102678', age: 72, conditions: ['CKD Stage 4', 'HTN', 'Anemia', 'T2DM'], totalClaims: 128400, erVisits: 8, admissions: 4, pmpm: 10700, avoidableCost: 48200 },
      { name: 'Sandra Hill', mrn: 'MRN-104890', age: 70, conditions: ['CKD Stage 3', 'T2DM', 'Gout'], totalClaims: 54200, erVisits: 3, admissions: 1, pmpm: 4517, avoidableCost: 12100 },
      { name: 'Kenneth Roberts', mrn: 'MRN-106678', age: 71, conditions: ['CKD Stage 3', 'HTN', 'Hyperlipidemia'], totalClaims: 47800, erVisits: 2, admissions: 1, pmpm: 3983, avoidableCost: 9400 },
    ]},
  { id: 9, name: 'Dr. Lisa Nguyen', specialty: 'Rheumatology', panelSize: 245, mlrContrib: 4.2, totalClaims: 4820000, pmpm: 1639, highUtilizers: 3,
    patients: [
      { name: 'Agnes Cooper', mrn: 'MRN-107012', age: 74, conditions: ['Rheumatoid Arthritis', 'Osteoporosis', 'CKD Stage 2'], totalClaims: 72300, erVisits: 4, admissions: 2, pmpm: 6025, avoidableCost: 19800 },
      { name: 'Frank Evans', mrn: 'MRN-107234', age: 79, conditions: ['Lupus', 'CKD Stage 3', 'HTN'], totalClaims: 88900, erVisits: 6, admissions: 3, pmpm: 7408, avoidableCost: 31200 },
    ]},
  { id: 10, name: 'Dr. Robert Taylor', specialty: 'Oncology', panelSize: 178, mlrContrib: 5.8, totalClaims: 6650000, pmpm: 3113, highUtilizers: 4,
    patients: [
      { name: 'Virginia Morris', mrn: 'MRN-107456', age: 72, conditions: ['Lung CA Stage III', 'COPD', 'Cachexia'], totalClaims: 187600, erVisits: 12, admissions: 6, pmpm: 15633, avoidableCost: 58900 },
      { name: 'Raymond Phillips', mrn: 'MRN-107678', age: 77, conditions: ['Colon CA Stage II', 'T2DM', 'HTN'], totalClaims: 94200, erVisits: 5, admissions: 3, pmpm: 7850, avoidableCost: 27400 },
    ]},
  { id: 11, name: 'Dr. Maria Santos', specialty: 'Internal Medicine', panelSize: 612, mlrContrib: 3.8, totalClaims: 4360000, pmpm: 594, highUtilizers: 2,
    patients: [
      { name: 'Harold Jenkins', mrn: 'MRN-107890', age: 68, conditions: ['HTN', 'Prediabetes', 'BPH'], totalClaims: 31200, erVisits: 2, admissions: 0, pmpm: 2600, avoidableCost: 6800 },
    ]},
  { id: 12, name: 'Dr. Kevin O\'Brien', specialty: 'Cardiology', panelSize: 398, mlrContrib: 4.1, totalClaims: 4700000, pmpm: 984, highUtilizers: 3,
    patients: [
      { name: 'Dorothy Reed', mrn: 'MRN-108012', age: 81, conditions: ['Aortic Stenosis', 'CHF', 'Afib'], totalClaims: 145200, erVisits: 9, admissions: 5, pmpm: 12100, avoidableCost: 52100 },
      { name: 'Wayne Cox', mrn: 'MRN-108234', age: 75, conditions: ['Post-MI', 'HTN', 'T2DM'], totalClaims: 62400, erVisits: 3, admissions: 1, pmpm: 5200, avoidableCost: 14300 },
    ]},
  { id: 13, name: 'Dr. Susan Park', specialty: 'Neurology', panelSize: 267, mlrContrib: 2.1, totalClaims: 2410000, pmpm: 752, highUtilizers: 2,
    patients: [
      { name: 'Ethel Barnes', mrn: 'MRN-108456', age: 80, conditions: ['Alzheimer\'s', 'Seizure Disorder', 'Falls Risk'], totalClaims: 98700, erVisits: 7, admissions: 3, pmpm: 8225, avoidableCost: 36400 },
    ]},
  { id: 14, name: 'Dr. James Foster', specialty: 'Gastroenterology', panelSize: 321, mlrContrib: 1.9, totalClaims: 2180000, pmpm: 566, highUtilizers: 1,
    patients: [
      { name: 'Clarence Howard', mrn: 'MRN-108678', age: 73, conditions: ['Cirrhosis', 'Portal HTN', 'T2DM'], totalClaims: 112400, erVisits: 8, admissions: 4, pmpm: 9367, avoidableCost: 41200 },
    ]},
];

const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

const overallMLR = 85.3;
const overallTarget = 85.0;
const totalPremium = payerMLR.reduce((s, p) => s + p.premium, 0);
const totalClaims = payerMLR.reduce((s, p) => s + p.claims, 0);

export default function MLRPage() {
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null);

  const allHighCostPatients = providers.flatMap(p => p.patients.filter(pt => pt.totalClaims >= 50000));
  const totalAvoidable = providers.flatMap(p => p.patients).reduce((s, pt) => s + pt.avoidableCost, 0);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">Medical Loss Ratio Analysis</h1>
          <p className="text-sm text-[#86868b] mt-1">MLR by payer, provider drill-down to high-cost patients</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-[#86868b]">Overall MLR</p>
            <p className={`text-2xl font-bold ${overallMLR > overallTarget ? 'text-red-500' : 'text-green-600'}`}>{overallMLR}%</p>
            <p className="text-[10px] text-[#86868b]">Target: {overallTarget}%</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-[#86868b]">Total Premium</p>
            <p className="text-2xl font-bold text-[#1d1d1f]">{fmt(totalPremium)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-[#86868b]">Total Claims</p>
            <p className="text-2xl font-bold text-[#1d1d1f]">{fmt(totalClaims)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-[#86868b]">High Utilizers (&gt;$50K)</p>
            <p className="text-2xl font-bold text-red-500">{allHighCostPatients.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-[#86868b]">Avoidable Costs</p>
            <p className="text-2xl font-bold text-amber-500">{fmt(totalAvoidable)}</p>
          </div>
        </div>

        {/* MLR by Payer charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm font-medium text-[#1d1d1f] mb-3">MLR by Payer</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={payerMLR}>
                <XAxis dataKey="payer" tick={{ fontSize: 10 }} />
                <YAxis domain={[70, 95]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Bar dataKey="mlr" radius={[6, 6, 0, 0]}>
                  {payerMLR.map((p, i) => (
                    <Cell key={i} fill={p.mlr > p.target ? '#EF4444' : '#10B981'} />
                  ))}
                </Bar>
                <Bar dataKey="target" fill="none" stroke="#86868b" strokeDasharray="4 4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm font-medium text-[#1d1d1f] mb-3">Claims Distribution by Payer</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={payerMLR} dataKey="claims" nameKey="payer" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine>
                  {payerMLR.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => fmt(v as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payer detail table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-5 py-3 bg-[#f5f5f7]">
            <p className="text-xs font-semibold text-[#86868b] uppercase">MLR by Payer Detail</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]/50">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-2">Payer</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-2">Premium</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-2">Claims</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-2">MLR</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-2">Target</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-2">Variance</th>
              </tr>
            </thead>
            <tbody>
              {payerMLR.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm font-medium text-[#1d1d1f]">{p.payer}</td>
                  <td className="px-4 py-3 text-xs text-right text-[#6e6e73]">{fmt(p.premium)}</td>
                  <td className="px-4 py-3 text-xs text-right text-[#6e6e73]">{fmt(p.claims)}</td>
                  <td className="px-4 py-3 text-center"><span className={`text-sm font-bold ${p.mlr > p.target ? 'text-red-500' : 'text-green-600'}`}>{p.mlr}%</span></td>
                  <td className="px-4 py-3 text-xs text-center text-[#86868b]">{p.target}%</td>
                  <td className="px-4 py-3 text-center"><span className={`text-xs font-semibold ${p.variance > 0 ? 'text-red-500' : 'text-green-600'}`}>{p.variance > 0 ? '+' : ''}{p.variance}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Provider MLR Table with drill-down */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-[#f5f5f7]">
            <p className="text-xs font-semibold text-[#86868b] uppercase">Provider MLR Contribution — Click to see high-cost patients</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]/50">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-2">Provider</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-2">Panel</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-2">Total Claims</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-2">PMPM</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-2">MLR Contrib %</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-2">High Util.</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <>
                  <tr
                    key={`r-${p.id}`}
                    onClick={() => setExpandedProvider(expandedProvider === p.id ? null : p.id)}
                    className="border-b border-gray-50 hover:bg-[#EF4444]/5 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] transition-transform ${expandedProvider === p.id ? 'rotate-90' : ''}`}>▶</span>
                        <div>
                          <p className="text-sm font-medium text-[#1d1d1f]">{p.name}</p>
                          <p className="text-[10px] text-[#86868b]">{p.specialty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-right text-[#6e6e73]">{p.panelSize}</td>
                    <td className="px-3 py-3 text-xs text-right text-[#6e6e73]">{fmt(p.totalClaims)}</td>
                    <td className="px-3 py-3 text-xs text-right font-medium text-[#1d1d1f]">${p.pmpm.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center"><span className={`text-xs font-bold ${p.mlrContrib > 10 ? 'text-red-500' : 'text-[#6e6e73]'}`}>{p.mlrContrib}%</span></td>
                    <td className="px-3 py-3 text-center"><span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${p.highUtilizers >= 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{p.highUtilizers}</span></td>
                  </tr>
                  {expandedProvider === p.id && (
                    <tr key={`d-${p.id}`}>
                      <td colSpan={6} className="px-5 py-0">
                        <div className="bg-[#f5f5f7] rounded-xl p-4 mb-3 mt-1">
                          <p className="text-xs font-semibold text-[#1d1d1f] mb-3">High-Cost Patients — {p.name}</p>
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-[10px] text-[#86868b] uppercase">
                                <th className="pb-2 pr-2">Patient</th>
                                <th className="pb-2 pr-2">MRN</th>
                                <th className="pb-2 pr-2 text-center">Age</th>
                                <th className="pb-2 pr-2">Conditions</th>
                                <th className="pb-2 pr-2 text-right">Claims (12mo)</th>
                                <th className="pb-2 pr-2 text-center">ER</th>
                                <th className="pb-2 pr-2 text-center">Admits</th>
                                <th className="pb-2 pr-2 text-right">PMPM</th>
                                <th className="pb-2 text-right">Avoidable</th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.patients.map((pt, j) => (
                                <tr key={j} className="border-t border-gray-200/50 hover:bg-white/50">
                                  <td className="py-2 pr-2 text-xs font-medium text-[#1d1d1f]">
                                    {pt.name}
                                    {pt.totalClaims >= 50000 && <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded">HIGH UTIL</span>}
                                  </td>
                                  <td className="py-2 pr-2 text-[10px] text-[#86868b] font-mono">{pt.mrn}</td>
                                  <td className="py-2 pr-2 text-[10px] text-center text-[#6e6e73]">{pt.age}</td>
                                  <td className="py-2 pr-2">
                                    <div className="flex gap-1 flex-wrap">
                                      {pt.conditions.map(c => (
                                        <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-[#6e6e73] text-[9px] rounded">{c}</span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className={`py-2 pr-2 text-xs text-right font-semibold ${pt.totalClaims >= 100000 ? 'text-red-600' : pt.totalClaims >= 50000 ? 'text-amber-600' : 'text-[#1d1d1f]'}`}>${pt.totalClaims.toLocaleString()}</td>
                                  <td className="py-2 pr-2 text-xs text-center text-[#6e6e73]">{pt.erVisits}</td>
                                  <td className="py-2 pr-2 text-xs text-center text-[#6e6e73]">{pt.admissions}</td>
                                  <td className="py-2 pr-2 text-xs text-right text-[#1d1d1f]">${pt.pmpm.toLocaleString()}</td>
                                  <td className="py-2 text-xs text-right text-amber-600 font-medium">${pt.avoidableCost.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
