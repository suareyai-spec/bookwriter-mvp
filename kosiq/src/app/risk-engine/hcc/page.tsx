'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import jsPDF from 'jspdf';

const codingGaps = [
  { patient: 'Maria Garcia', dob: '03/15/1958', raf: 2.34, potentialRAF: 2.89, gap: 'HCC 18 - Diabetes w/ Chronic Complications', icd: 'E11.65', lastCoded: 'Jan 2025', provider: 'Dr. Martinez', priority: 'high' },
  { patient: 'James Wilson', dob: '07/22/1962', raf: 1.87, potentialRAF: 2.21, gap: 'HCC 85 - Congestive Heart Failure', icd: 'I50.9', lastCoded: 'Nov 2024', provider: 'Dr. Chen', priority: 'high' },
  { patient: 'Robert Johnson', dob: '11/03/1955', raf: 3.12, potentialRAF: 3.56, gap: 'HCC 111 - COPD', icd: 'J44.1', lastCoded: 'Dec 2024', provider: 'Dr. Patel', priority: 'medium' },
  { patient: 'Patricia Brown', dob: '09/18/1960', raf: 1.56, potentialRAF: 1.98, gap: 'HCC 22 - Morbid Obesity', icd: 'E66.01', lastCoded: 'Oct 2024', provider: 'Dr. Martinez', priority: 'medium' },
  { patient: 'Michael Davis', dob: '05/30/1968', raf: 2.67, potentialRAF: 3.01, gap: 'HCC 136 - Vascular Disease', icd: 'I70.0', lastCoded: 'Sep 2024', provider: 'Dr. Chen', priority: 'high' },
  { patient: 'Linda Smith', dob: '01/14/1952', raf: 4.21, potentialRAF: 4.78, gap: 'HCC 8 - Lung Cancer', icd: 'C34.90', lastCoded: 'Aug 2024', provider: 'Dr. Johnson', priority: 'critical' },
  { patient: 'David Martinez', dob: '12/08/1970', raf: 1.23, potentialRAF: 1.67, gap: 'HCC 19 - Diabetes w/o Complication', icd: 'E11.9', lastCoded: 'Jul 2024', provider: 'Dr. Patel', priority: 'low' },
  { patient: 'Susan Anderson', dob: '04/25/1965', raf: 1.89, potentialRAF: 2.34, gap: 'HCC 96 - Specified Heart Arrhythmias', icd: 'I48.91', lastCoded: 'Nov 2024', provider: 'Dr. Martinez', priority: 'medium' },
];

const v28Changes = [
  { code: 'HCC 37', description: 'Diabetes w/ Acute Complications', v24RAF: 0.318, v28RAF: 0.274, impact: '-13.8%', patients: 89 },
  { code: 'HCC 18', description: 'Diabetes w/ Chronic Complications', v24RAF: 0.318, v28RAF: 0.302, impact: '-5.0%', patients: 456 },
  { code: 'HCC 85', description: 'CHF', v24RAF: 0.368, v28RAF: 0.341, impact: '-7.3%', patients: 234 },
  { code: 'HCC 111', description: 'COPD', v24RAF: 0.335, v28RAF: 0.312, impact: '-6.9%', patients: 178 },
  { code: 'HCC 8', description: 'Lung Cancer', v24RAF: 0.973, v28RAF: 0.892, impact: '-8.3%', patients: 23 },
];

export default function HCCPage() {
  const [tab, setTab] = useState<'gaps' | 'v28'>('gaps');
  const [recalculating, setRecalculating] = useState(false);
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  const toast = useToast();

  const handleExportGaps = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16); doc.setTextColor(29, 29, 31);
    doc.text('HCC Coding Gap Report', 14, 20);
    doc.setFontSize(9); doc.setTextColor(134, 134, 139);
    doc.text(`Generated ${new Date().toLocaleDateString()} — ${codingGaps.length} gaps identified`, 14, 27);
    doc.setDrawColor(245, 158, 11); doc.setLineWidth(0.5); doc.line(14, 30, 280, 30);
    let y = 38;
    doc.setFontSize(8); doc.setTextColor(134, 134, 139);
    doc.text('Patient', 14, y); doc.text('Gap', 70, y); doc.text('ICD', 170, y); doc.text('RAF', 195, y); doc.text('Potential', 215, y); doc.text('Priority', 240, y); doc.text('Provider', 260, y);
    y += 6;
    codingGaps.forEach(g => {
      if (y > 190) { doc.addPage(); y = 20; }
      doc.setTextColor(29, 29, 31); doc.setFontSize(8);
      doc.text(g.patient, 14, y); doc.text(g.gap, 70, y); doc.text(g.icd, 170, y);
      doc.text(g.raf.toFixed(2), 195, y); doc.text(g.potentialRAF.toFixed(2), 215, y);
      doc.setTextColor(g.priority === 'critical' ? 220 : g.priority === 'high' ? 239 : 134, g.priority === 'critical' ? 38 : g.priority === 'high' ? 68 : 134, g.priority === 'critical' ? 38 : g.priority === 'high' ? 68 : 139);
      doc.text(g.priority.toUpperCase(), 240, y);
      doc.setTextColor(29, 29, 31); doc.text(g.provider, 260, y);
      y += 6;
    });
    doc.save('HCC-Coding-Gap-Report.pdf');
    toast('HCC gap report exported as PDF');
  };

  const handleRecalculation = () => {
    setRecalculating(true);
    setTimeout(() => { setRecalculating(false); toast('RAF recalculation complete — 2,341 gaps re-evaluated'); }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">HCC Risk Adjustment</h1>
            <p className="text-sm text-[#86868b] mt-1">Coding gaps, RAF scores & V28 support</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportGaps} className="px-4 py-2 border border-gray-200 text-sm rounded-xl hover:bg-gray-50">Export Gaps</button>
            <button onClick={handleRecalculation} disabled={recalculating} className="px-4 py-2 bg-[#F59E0B] text-white text-sm font-medium rounded-xl hover:bg-[#D97706] disabled:opacity-50">{recalculating ? 'Recalculating...' : 'Run Recalculation'}</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Coding Gaps', value: '2,341', sub: 'Across 1,892 patients', clickCount: 1892 },
            { label: 'Potential RAF Lift', value: '+0.34', sub: 'Avg per patient' },
            { label: 'Est. Revenue Impact', value: '$4.2M', sub: 'Annual if resolved' },
            { label: 'V28 Impacted Codes', value: '156', sub: 'Need transition review' },
          ].map((s: any, i: number) => (
            <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100${s.clickCount ? ' cursor-pointer' : ''}`} onClick={() => s.clickCount && setDrillDown({ label: s.label, count: s.clickCount })}>
              <p className="text-[#86868b] text-xs mb-1">{s.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{s.value}</p>
              <p className="text-[11px] text-[#F59E0B] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#f5f5f7] rounded-xl p-1 w-fit">
          <button onClick={() => setTab('gaps')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === 'gaps' ? 'bg-white shadow-sm font-medium text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>Coding Gaps</button>
          <button onClick={() => setTab('v28')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === 'v28' ? 'bg-white shadow-sm font-medium text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>V28 Impact Analysis</button>
        </div>

        {tab === 'gaps' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f5f5f7]">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Patient</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Coding Gap</th>
                  <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Current RAF</th>
                  <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Potential RAF</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Last Coded</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Provider</th>
                  <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Priority</th>
                </tr>
              </thead>
              <tbody>
                {codingGaps.map((g, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => setDrillDown({ label: `${g.patient} — ${g.gap}`, count: 1 })}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#1d1d1f]">{g.patient}</p>
                      <p className="text-[10px] text-[#86868b]">DOB: {g.dob}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-[#1d1d1f]">{g.gap}</p>
                      <p className="text-[10px] text-[#F59E0B]">{g.icd}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-[#6e6e73]">{g.raf}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-[#F59E0B]">{g.potentialRAF}</td>
                    <td className="px-4 py-3 text-xs text-[#86868b]">{g.lastCoded}</td>
                    <td className="px-4 py-3 text-xs text-[#6e6e73]">{g.provider}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full ${
                        g.priority === 'critical' ? 'bg-red-50 text-red-600' :
                        g.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                        g.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>{g.priority}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'v28' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <p className="text-sm text-[#6e6e73]">CMS-HCC V28 transition analysis showing RAF coefficient changes and financial impact</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#f5f5f7]">
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">HCC Code</th>
                  <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Description</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">V24 RAF</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">V28 RAF</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Impact</th>
                  <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Patients</th>
                </tr>
              </thead>
              <tbody>
                {v28Changes.map((v, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-[#1d1d1f]">{v.code}</td>
                    <td className="px-5 py-3 text-xs text-[#6e6e73]">{v.description}</td>
                    <td className="px-5 py-3 text-sm text-right text-[#6e6e73]">{v.v24RAF}</td>
                    <td className="px-5 py-3 text-sm text-right text-[#1d1d1f]">{v.v28RAF}</td>
                    <td className="px-5 py-3 text-sm text-right text-red-500 font-medium">{v.impact}</td>
                    <td className="px-5 py-3 text-sm text-right text-[#6e6e73] cursor-pointer hover:underline hover:text-[#F59E0B]" onClick={() => setDrillDown({ label: `${v.code} — ${v.description}`, count: v.patients })}>{v.patients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#F59E0B" />
    </DashboardLayout>
  );
}
