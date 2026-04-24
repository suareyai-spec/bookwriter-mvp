'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

type OutreachStatus = 'Not contacted' | 'Scheduled' | 'Completed';

interface Patient {
  id: number;
  name: string;
  mrn: string;
  age: number;
  pcp: string;
  openGaps: string[];
  daysOverdue: number;
  lastContact: string;
  outreach: OutreachStatus;
}

const initialPatients: Patient[] = [
  { id: 1, name: 'Maria Garcia', mrn: 'MRN-100234', age: 67, pcp: 'Dr. Elena Martinez', openGaps: ['HbA1c Test', 'Diabetic Eye Exam'], daysOverdue: 112, lastContact: '2025-11-14', outreach: 'Not contacted' },
  { id: 2, name: 'James Wilson', mrn: 'MRN-100567', age: 73, pcp: 'Dr. Wei Chen', openGaps: ['Colorectal Screening'], daysOverdue: 95, lastContact: '2025-12-02', outreach: 'Scheduled' },
  { id: 3, name: 'Patricia Brown', mrn: 'MRN-100891', age: 69, pcp: 'Dr. Elena Martinez', openGaps: ['Mammography', 'Blood Pressure Control'], daysOverdue: 134, lastContact: '2025-10-20', outreach: 'Not contacted' },
  { id: 4, name: 'Robert Johnson', mrn: 'MRN-101023', age: 78, pcp: 'Dr. Raj Patel', openGaps: ['Flu Vaccine', 'Pneumonia Vaccine', 'Spirometry'], daysOverdue: 156, lastContact: '2025-09-15', outreach: 'Not contacted' },
  { id: 5, name: 'Linda Smith', mrn: 'MRN-101245', age: 71, pcp: 'Dr. Sarah Johnson', openGaps: ['Mammography'], daysOverdue: 45, lastContact: '2026-01-18', outreach: 'Scheduled' },
  { id: 6, name: 'Michael Davis', mrn: 'MRN-101467', age: 66, pcp: 'Dr. Wei Chen', openGaps: ['Statin Adherence', 'LDL Recheck'], daysOverdue: 62, lastContact: '2026-01-05', outreach: 'Not contacted' },
  { id: 7, name: 'Susan Anderson', mrn: 'MRN-101689', age: 68, pcp: 'Dr. Elena Martinez', openGaps: ['Cervical Screening', 'Depression Screening'], daysOverdue: 23, lastContact: '2026-02-10', outreach: 'Completed' },
  { id: 8, name: 'David Martinez', mrn: 'MRN-101890', age: 74, pcp: 'Dr. Raj Patel', openGaps: ['HbA1c Test', 'Foot Exam'], daysOverdue: 78, lastContact: '2025-12-18', outreach: 'Scheduled' },
  { id: 9, name: 'Dorothy Thomas', mrn: 'MRN-102012', age: 82, pcp: 'Dr. Jennifer Lee', openGaps: ['Colorectal Screening', 'Flu Vaccine'], daysOverdue: 102, lastContact: '2025-11-28', outreach: 'Not contacted' },
  { id: 10, name: 'Charles Jackson', mrn: 'MRN-102234', age: 70, pcp: 'Dr. Michael Kim', openGaps: ['HbA1c Test', 'Diabetic Eye Exam', 'Statin Adherence'], daysOverdue: 145, lastContact: '2025-10-10', outreach: 'Not contacted' },
  { id: 11, name: 'Margaret White', mrn: 'MRN-102456', age: 76, pcp: 'Dr. Carlos Rodriguez', openGaps: ['Mammography', 'Bone Density'], daysOverdue: 88, lastContact: '2025-12-08', outreach: 'Scheduled' },
  { id: 12, name: 'Joseph Harris', mrn: 'MRN-102678', age: 72, pcp: 'Dr. Amanda Williams', openGaps: ['Blood Pressure Control', 'Kidney Monitoring'], daysOverdue: 54, lastContact: '2026-01-12', outreach: 'Not contacted' },
  { id: 13, name: 'William Walker', mrn: 'MRN-103456', age: 80, pcp: 'Dr. Raj Patel', openGaps: ['HbA1c Test', 'Diabetic Eye Exam', 'Foot Exam', 'Flu Vaccine'], daysOverdue: 178, lastContact: '2025-08-30', outreach: 'Not contacted' },
  { id: 14, name: 'Edward Nelson', mrn: 'MRN-105890', age: 85, pcp: 'Dr. Jennifer Lee', openGaps: ['Pneumonia Vaccine', 'Flu Vaccine', 'Depression Screening'], daysOverdue: 167, lastContact: '2025-09-10', outreach: 'Not contacted' },
  { id: 15, name: 'George Mitchell', mrn: 'MRN-106234', age: 74, pcp: 'Dr. Elena Martinez', openGaps: ['HbA1c Test', 'Kidney Monitoring', 'Diabetic Eye Exam'], daysOverdue: 118, lastContact: '2025-11-02', outreach: 'Scheduled' },
];

const allMeasures = ['All', 'HbA1c Test', 'Mammography', 'Colonoscopy', 'Colorectal Screening', 'Diabetic Eye Exam', 'Blood Pressure Control', 'Statin Adherence', 'Flu Vaccine', 'Pneumonia Vaccine', 'Depression Screening', 'Cervical Screening', 'Spirometry', 'Kidney Monitoring', 'Bone Density', 'Foot Exam', 'LDL Recheck'];
const overdueOptions = ['All', '>90 days', '30-90 days', '<30 days'];
const outreachOptions: OutreachStatus[] = ['Not contacted', 'Scheduled', 'Completed'];

function urgencyColor(days: number) {
  if (days > 90) return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
  if (days >= 30) return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
  return { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' };
}

const outreachColors: Record<OutreachStatus, string> = {
  'Not contacted': 'bg-gray-100 text-gray-600',
  'Scheduled': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
};

export default function GapsPage() {
  const { showToast } = useToast();
  const [patients, setPatients] = useState(initialPatients);
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  const [measure, setMeasure] = useState('All');
  const [provider, setProvider] = useState('All');
  const [overdue, setOverdue] = useState('All');
  const [search, setSearch] = useState('');

  const allProviders = ['All', ...Array.from(new Set(patients.map(p => p.pcp)))];

  const updateOutreach = (id: number, status: OutreachStatus) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, outreach: status } : p));
    showToast(`Outreach status updated to "${status}"`);
  };

  const filtered = patients.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.mrn.toLowerCase().includes(search.toLowerCase())) return false;
    if (measure !== 'All' && !p.openGaps.includes(measure)) return false;
    if (provider !== 'All' && p.pcp !== provider) return false;
    if (overdue === '>90 days' && p.daysOverdue <= 90) return false;
    if (overdue === '30-90 days' && (p.daysOverdue < 30 || p.daysOverdue > 90)) return false;
    if (overdue === '<30 days' && p.daysOverdue >= 30) return false;
    return true;
  });

  const critical = patients.filter(p => p.daysOverdue > 90).length;
  const amber = patients.filter(p => p.daysOverdue >= 30 && p.daysOverdue <= 90).length;
  const green = patients.filter(p => p.daysOverdue < 30).length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Gap-in-Care — Patient View</h1>
            <p className="text-sm text-[#86868b] mt-1">{patients.length} patients with open quality gaps</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-full cursor-pointer hover:bg-red-100" onClick={() => setDrillDown({ label: 'Critical Gaps (>90 days)', count: critical })}>{critical} Critical (&gt;90d)</span>
            <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-medium rounded-full cursor-pointer hover:bg-amber-100" onClick={() => setDrillDown({ label: 'Amber Gaps (30-90 days)', count: amber })}>{amber} Amber (30-90d)</span>
            <span className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-medium rounded-full cursor-pointer hover:bg-green-100" onClick={() => setDrillDown({ label: 'On Track (<30 days)', count: green })}>{green} On Track (&lt;30d)</span>
          </div>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white w-48" />
          <select value={measure} onChange={e => setMeasure(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
            {allMeasures.map(m => <option key={m} value={m}>{m === 'All' ? 'All Measures' : m}</option>)}
          </select>
          <select value={provider} onChange={e => setProvider(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
            {allProviders.map(p => <option key={p} value={p}>{p === 'All' ? 'All Providers' : p}</option>)}
          </select>
          <select value={overdue} onChange={e => setOverdue(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
            {overdueOptions.map(o => <option key={o} value={o}>{o === 'All' ? 'All Overdue' : o}</option>)}
          </select>
          <span className="px-3 py-2 text-sm text-[#86868b]">{filtered.length} shown</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Patient</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">MRN</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Age</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">PCP</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Open Gaps</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Days Overdue</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Outreach</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const u = urgencyColor(p.daysOverdue);
                return (
                  <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${u.bg}`}>
                    <td className="px-4 py-3 text-sm font-medium text-[#1d1d1f]">{p.name}</td>
                    <td className="px-4 py-3 text-xs text-[#6e6e73] font-mono">{p.mrn}</td>
                    <td className="px-3 py-3 text-xs text-center text-[#6e6e73]">{p.age}</td>
                    <td className="px-4 py-3 text-xs text-[#6e6e73]">{p.pcp}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.openGaps.map(g => <span key={g} className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] text-[10px] rounded-full">{g}</span>)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${u.dot}`} />
                        <span className={`text-xs font-semibold ${u.text}`}>{p.daysOverdue}d</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={p.outreach}
                        onChange={e => updateOutreach(p.id, e.target.value as OutreachStatus)}
                        className={`text-[10px] px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${outreachColors[p.outreach]}`}
                      >
                        {outreachOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#10B981" />
    </DashboardLayout>
  );
}
