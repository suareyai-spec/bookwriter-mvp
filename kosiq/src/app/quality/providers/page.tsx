'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';

interface PatientGap {
  name: string;
  mrn: string;
  age: number;
  missingMeasures: string[];
  outreach: 'Not contacted' | 'Scheduled' | 'Completed';
  daysOverdue: number;
}

interface Provider {
  name: string;
  specialty: string;
  patients: number;
  overallScore: number;
  bcs: number;
  col: number;
  cbp: number;
  cdc: number;
  spc: number;
  gaps: number;
  trend: string;
  patientGaps: PatientGap[];
}

const providers: Provider[] = [
  {
    name: 'Dr. Elena Martinez', specialty: 'Internal Medicine', patients: 842, overallScore: 91.2, bcs: 84, col: 78, cbp: 72, cdc: 88, spc: 81, gaps: 45, trend: '+2.1%',
    patientGaps: [
      { name: 'Maria Garcia', mrn: 'MRN-100234', age: 67, missingMeasures: ['HbA1c Test', 'Diabetic Eye Exam'], outreach: 'Not contacted', daysOverdue: 112 },
      { name: 'Patricia Brown', mrn: 'MRN-100891', age: 69, missingMeasures: ['Mammography', 'Blood Pressure Control'], outreach: 'Not contacted', daysOverdue: 134 },
      { name: 'Susan Anderson', mrn: 'MRN-101689', age: 68, missingMeasures: ['Cervical Screening', 'Depression Screening'], outreach: 'Completed', daysOverdue: 23 },
      { name: 'Barbara Robinson', mrn: 'MRN-103234', age: 75, missingMeasures: ['Mammography', 'Cervical Screening'], outreach: 'Scheduled', daysOverdue: 67 },
      { name: 'Mark Lopez', mrn: 'MRN-104678', age: 73, missingMeasures: ['Colonoscopy', 'Blood Pressure Control', 'Statin Adherence'], outreach: 'Not contacted', daysOverdue: 99 },
      { name: 'George Mitchell', mrn: 'MRN-106234', age: 74, missingMeasures: ['HbA1c Test', 'Kidney Monitoring', 'Diabetic Eye Exam'], outreach: 'Scheduled', daysOverdue: 118 },
    ],
  },
  {
    name: 'Dr. Jennifer Lee', specialty: 'Geriatrics', patients: 198, overallScore: 89.8, bcs: 82, col: 76, cbp: 74, cdc: 90, spc: 79, gaps: 23, trend: '+3.4%',
    patientGaps: [
      { name: 'Dorothy Thomas', mrn: 'MRN-102012', age: 82, missingMeasures: ['Colorectal Screening', 'Flu Vaccine'], outreach: 'Not contacted', daysOverdue: 102 },
      { name: 'Betty Clark', mrn: 'MRN-102890', age: 79, missingMeasures: ['Flu Vaccine'], outreach: 'Completed', daysOverdue: 18 },
      { name: 'Daniel King', mrn: 'MRN-104234', age: 84, missingMeasures: ['Flu Vaccine', 'Pneumonia Vaccine'], outreach: 'Scheduled', daysOverdue: 42 },
      { name: 'Edward Nelson', mrn: 'MRN-105890', age: 85, missingMeasures: ['Pneumonia Vaccine', 'Flu Vaccine', 'Depression Screening'], outreach: 'Not contacted', daysOverdue: 167 },
    ],
  },
  {
    name: 'Dr. Wei Chen', specialty: 'Cardiology', patients: 567, overallScore: 87.4, bcs: 79, col: 71, cbp: 81, cdc: 84, spc: 86, gaps: 67, trend: '+1.2%',
    patientGaps: [
      { name: 'James Wilson', mrn: 'MRN-100567', age: 73, missingMeasures: ['Colorectal Screening'], outreach: 'Scheduled', daysOverdue: 95 },
      { name: 'Michael Davis', mrn: 'MRN-101467', age: 66, missingMeasures: ['Statin Adherence', 'LDL Recheck'], outreach: 'Not contacted', daysOverdue: 62 },
      { name: 'Richard Lewis', mrn: 'MRN-103012', age: 68, missingMeasures: ['Colonoscopy', 'Statin Adherence'], outreach: 'Not contacted', daysOverdue: 110 },
      { name: 'Karen Wright', mrn: 'MRN-104456', age: 66, missingMeasures: ['HbA1c Test'], outreach: 'Completed', daysOverdue: 15 },
      { name: 'Ruth Carter', mrn: 'MRN-106012', age: 69, missingMeasures: ['Mammography', 'Cervical Screening'], outreach: 'Not contacted', daysOverdue: 82 },
    ],
  },
  {
    name: 'Dr. Michael Kim', specialty: 'Family Medicine', patients: 956, overallScore: 85.1, bcs: 76, col: 74, cbp: 68, cdc: 82, spc: 76, gaps: 112, trend: '-0.5%',
    patientGaps: [
      { name: 'Charles Jackson', mrn: 'MRN-102234', age: 70, missingMeasures: ['HbA1c Test', 'Diabetic Eye Exam', 'Statin Adherence'], outreach: 'Not contacted', daysOverdue: 145 },
      { name: 'Helen Hall', mrn: 'MRN-103678', age: 69, missingMeasures: ['Blood Pressure Control'], outreach: 'Completed', daysOverdue: 34 },
      { name: 'Donna Green', mrn: 'MRN-105234', age: 67, missingMeasures: ['Mammography'], outreach: 'Completed', daysOverdue: 28 },
      { name: 'Deborah Turner', mrn: 'MRN-106890', age: 83, missingMeasures: ['Flu Vaccine', 'Bone Density', 'Depression Screening'], outreach: 'Not contacted', daysOverdue: 130 },
    ],
  },
  {
    name: 'Dr. Raj Patel', specialty: 'Endocrinology', patients: 423, overallScore: 82.9, bcs: 73, col: 69, cbp: 65, cdc: 86, spc: 74, gaps: 89, trend: '+0.8%',
    patientGaps: [
      { name: 'Robert Johnson', mrn: 'MRN-101023', age: 78, missingMeasures: ['Flu Vaccine', 'Pneumonia Vaccine', 'Spirometry'], outreach: 'Not contacted', daysOverdue: 156 },
      { name: 'David Martinez', mrn: 'MRN-101890', age: 74, missingMeasures: ['HbA1c Test', 'Foot Exam'], outreach: 'Scheduled', daysOverdue: 78 },
      { name: 'William Walker', mrn: 'MRN-103456', age: 80, missingMeasures: ['HbA1c Test', 'Diabetic Eye Exam', 'Foot Exam', 'Flu Vaccine'], outreach: 'Not contacted', daysOverdue: 178 },
      { name: 'Paul Scott', mrn: 'MRN-105012', age: 81, missingMeasures: ['Diabetic Eye Exam', 'Flu Vaccine'], outreach: 'Not contacted', daysOverdue: 105 },
      { name: 'Sharon Perez', mrn: 'MRN-106456', age: 78, missingMeasures: ['Blood Pressure Control'], outreach: 'Completed', daysOverdue: 47 },
    ],
  },
  {
    name: 'Dr. Sarah Johnson', specialty: 'Pulmonology', patients: 312, overallScore: 80.4, bcs: 71, col: 67, cbp: 63, cdc: 78, spc: 72, gaps: 78, trend: '-1.2%',
    patientGaps: [
      { name: 'Linda Smith', mrn: 'MRN-101245', age: 71, missingMeasures: ['Mammography'], outreach: 'Scheduled', daysOverdue: 45 },
      { name: 'Thomas Allen', mrn: 'MRN-103890', age: 77, missingMeasures: ['Spirometry', 'Flu Vaccine'], outreach: 'Scheduled', daysOverdue: 92 },
      { name: 'Carol Baker', mrn: 'MRN-105678', age: 72, missingMeasures: ['Colorectal Screening', 'Flu Vaccine'], outreach: 'Scheduled', daysOverdue: 58 },
    ],
  },
  {
    name: 'Dr. Carlos Rodriguez', specialty: 'Internal Medicine', patients: 734, overallScore: 78.6, bcs: 68, col: 64, cbp: 61, cdc: 76, spc: 70, gaps: 134, trend: '-0.3%',
    patientGaps: [
      { name: 'Margaret White', mrn: 'MRN-102456', age: 76, missingMeasures: ['Mammography', 'Bone Density'], outreach: 'Scheduled', daysOverdue: 88 },
      { name: 'Nancy Young', mrn: 'MRN-104012', age: 71, missingMeasures: ['Mammography', 'Colorectal Screening', 'Depression Screening'], outreach: 'Not contacted', daysOverdue: 125 },
      { name: 'Steven Adams', mrn: 'MRN-105456', age: 76, missingMeasures: ['Blood Pressure Control', 'Statin Adherence', 'HbA1c Test'], outreach: 'Not contacted', daysOverdue: 140 },
    ],
  },
  {
    name: 'Dr. Amanda Williams', specialty: 'Nephrology', patients: 289, overallScore: 76.2, bcs: 65, col: 62, cbp: 59, cdc: 74, spc: 68, gaps: 98, trend: '+0.5%',
    patientGaps: [
      { name: 'Joseph Harris', mrn: 'MRN-102678', age: 72, missingMeasures: ['Blood Pressure Control', 'Kidney Monitoring'], outreach: 'Not contacted', daysOverdue: 54 },
      { name: 'Sandra Hill', mrn: 'MRN-104890', age: 70, missingMeasures: ['Kidney Monitoring', 'HbA1c Test'], outreach: 'Scheduled', daysOverdue: 73 },
      { name: 'Kenneth Roberts', mrn: 'MRN-106678', age: 71, missingMeasures: ['Colonoscopy', 'Statin Adherence'], outreach: 'Not contacted', daysOverdue: 91 },
    ],
  },
];

const MeasureCell = ({ value, target }: { value: number; target: number }) => (
  <td className="px-3 py-3 text-center">
    <span className={`text-xs font-medium ${value >= target ? 'text-[#10B981]' : value >= target - 5 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>{value}%</span>
  </td>
);

function urgencyColor(days: number) {
  if (days > 90) return { text: 'text-red-700', dot: 'bg-red-500' };
  if (days >= 30) return { text: 'text-amber-700', dot: 'bg-amber-500' };
  return { text: 'text-green-700', dot: 'bg-green-500' };
}

export default function ProviderScorecard() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Provider Scorecard</h1>
            <p className="text-sm text-[#86868b] mt-1">Click a provider to see their patient panel with open gaps</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Provider</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Pts</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Overall</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">BCS</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">COL</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">CBP</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">CDC</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">SPC</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Gaps</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Trend</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p, i) => (
                <>
                  <tr
                    key={`row-${i}`}
                    onClick={() => setExpanded(expanded === p.name ? null : p.name)}
                    className="border-b border-gray-50 hover:bg-[#10B981]/5 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] transition-transform ${expanded === p.name ? 'rotate-90' : ''}`}>▶</span>
                        <div>
                          <p className="text-sm font-medium text-[#1d1d1f]">{p.name}</p>
                          <p className="text-[10px] text-[#86868b]">{p.specialty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-right text-[#6e6e73]">{p.patients}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-sm font-semibold ${p.overallScore >= 85 ? 'text-[#10B981]' : p.overallScore >= 75 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>{p.overallScore}%</span>
                    </td>
                    <MeasureCell value={p.bcs} target={82} />
                    <MeasureCell value={p.col} target={75} />
                    <MeasureCell value={p.cbp} target={72} />
                    <MeasureCell value={p.cdc} target={85} />
                    <MeasureCell value={p.spc} target={80} />
                    <td className="px-3 py-3 text-xs text-right text-red-500">{p.gaps}</td>
                    <td className="px-3 py-3 text-xs text-right">
                      <span className={p.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}>{p.trend}</span>
                    </td>
                  </tr>
                  {expanded === p.name && (
                    <tr key={`detail-${i}`}>
                      <td colSpan={10} className="px-4 py-0">
                        <div className="bg-[#f5f5f7] rounded-xl p-4 mb-3 mt-1">
                          <p className="text-xs font-semibold text-[#1d1d1f] mb-3">Patients with Open Gaps — {p.name}</p>
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-[10px] text-[#86868b] uppercase">
                                <th className="pb-2 pr-3">Patient</th>
                                <th className="pb-2 pr-3">MRN</th>
                                <th className="pb-2 pr-3 text-center">Age</th>
                                <th className="pb-2 pr-3">Missing Measures</th>
                                <th className="pb-2 pr-3 text-center">Days Overdue</th>
                                <th className="pb-2 text-center">Outreach</th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.patientGaps.map((pg, j) => {
                                const u = urgencyColor(pg.daysOverdue);
                                return (
                                  <tr key={j} className="border-t border-gray-200/50 hover:bg-white/50">
                                    <td className="py-2 pr-3 text-xs font-medium text-[#1d1d1f]">{pg.name}</td>
                                    <td className="py-2 pr-3 text-xs text-[#6e6e73] font-mono">{pg.mrn}</td>
                                    <td className="py-2 pr-3 text-xs text-center text-[#6e6e73]">{pg.age}</td>
                                    <td className="py-2 pr-3">
                                      <div className="flex gap-1 flex-wrap">
                                        {pg.missingMeasures.map(m => (
                                          <span key={m} className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full">{m}</span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="py-2 pr-3 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${u.dot}`} />
                                        <span className={`text-xs font-semibold ${u.text}`}>{pg.daysOverdue}d</span>
                                      </div>
                                    </td>
                                    <td className="py-2 text-center">
                                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                        pg.outreach === 'Completed' ? 'bg-green-100 text-green-700' :
                                        pg.outreach === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-200 text-gray-600'
                                      }`}>{pg.outreach}</span>
                                    </td>
                                  </tr>
                                );
                              })}
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
