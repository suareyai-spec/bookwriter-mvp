'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';

const timelineEvents = [
  { id: 1, date: '2026-03-01 14:32', patient: 'Margaret Chen', mrn: 'MRN-4821', source: 'Baptist Health', type: 'Lab Result', detail: 'HbA1c: 8.2% (↑ from 7.6%)', severity: 'warning' },
  { id: 2, date: '2026-03-01 11:15', patient: 'Robert Williams', mrn: 'MRN-2093', source: 'Memorial Regional', type: 'Discharge', detail: 'CHF exacerbation — discharged with new medication regimen', severity: 'high' },
  { id: 3, date: '2026-03-01 09:47', patient: 'Gloria Martinez', mrn: 'MRN-7156', source: 'Quest Diagnostics', type: 'Lab Result', detail: 'eGFR: 28 mL/min (CKD Stage 4)', severity: 'high' },
  { id: 4, date: '2026-02-28 16:22', patient: 'James Thompson', mrn: 'MRN-3340', source: 'CVS/Caremark', type: 'Rx Fill', detail: 'Metformin 1000mg — 90-day supply filled', severity: 'normal' },
  { id: 5, date: '2026-02-28 14:08', patient: 'Dorothy Evans', mrn: 'MRN-5512', source: 'Apple Health', type: 'Vitals', detail: 'BP avg 158/94 over 7 days — sustained hypertension', severity: 'warning' },
  { id: 6, date: '2026-02-28 11:30', patient: 'William Harris', mrn: 'MRN-1287', source: 'Simply Health', type: 'Auth Decision', detail: 'Home health PT approved — 12 visits', severity: 'normal' },
  { id: 7, date: '2026-02-28 08:45', patient: 'Patricia Brown', mrn: 'MRN-6634', source: 'LabCorp', type: 'Lab Result', detail: 'TSH: 0.15 mIU/L — hyperthyroid range', severity: 'warning' },
  { id: 8, date: '2026-02-27 15:20', patient: 'Charles Davis', mrn: 'MRN-8901', source: 'Baptist Health', type: 'ER Visit', detail: 'Chest pain — ruled out MI, discharged with cardiology follow-up', severity: 'high' },
  { id: 9, date: '2026-02-27 10:12', patient: 'Helen Wilson', mrn: 'MRN-4455', source: 'Humana', type: 'Claim', detail: 'Claim denied: Prior auth required for MRI lumbar spine', severity: 'warning' },
  { id: 10, date: '2026-02-27 08:30', patient: 'Frank Anderson', mrn: 'MRN-2278', source: 'Memorial Regional', type: 'Admission', detail: 'COPD exacerbation — admitted to pulmonary unit', severity: 'high' },
];

const severityColors: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  normal: 'bg-green-50 text-green-700 border-green-200',
};

const typeIcons: Record<string, string> = {
  'Lab Result': '🔬', 'Discharge': '🏥', 'Rx Fill': '💊', 'Vitals': '❤️', 'Auth Decision': '✅',
  'ER Visit': '🚨', 'Claim': '📄', 'Admission': '🛏️',
};

const allTypes = ['All', 'Lab Result', 'Discharge', 'Rx Fill', 'Vitals', 'Auth Decision', 'ER Visit', 'Claim', 'Admission'];
const allSources = ['All', ...Array.from(new Set(timelineEvents.map(e => e.source)))];
const severityFilters = ['All', 'High Priority', 'Warning', 'Normal'];

export default function TimelinePage() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sevFilter, setSevFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = timelineEvents.filter(e => {
    if (typeFilter !== 'All' && e.type !== typeFilter) return false;
    if (sourceFilter !== 'All' && e.source !== sourceFilter) return false;
    if (sevFilter === 'High Priority' && e.severity !== 'high') return false;
    if (sevFilter === 'Warning' && e.severity !== 'warning') return false;
    if (sevFilter === 'Normal' && e.severity !== 'normal') return false;
    if (search && !e.patient.toLowerCase().includes(search.toLowerCase()) && !e.detail.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo + ' 23:59') return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Health Timeline</h1>
        <p className="text-sm text-[#86868b] mb-6">Filter by patient, source, type, date</p>

        <div className="flex gap-3 mb-6 flex-wrap items-center">
          <input placeholder="Search patient/detail..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm w-48" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            {allTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            {allSources.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sources' : s}</option>)}
          </select>
          <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            {severityFilters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          <span className="text-xs text-[#86868b]">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          <span className="text-xs text-[#86868b]">{filtered.length} events</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-3">
            {filtered.map(e => (
              <div key={e.id} className={`flex items-start gap-4 p-4 rounded-xl border ${severityColors[e.severity]}`}>
                <span className="text-lg">{typeIcons[e.type] || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{e.patient}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-white/60 rounded">{e.mrn}</span>
                  </div>
                  <p className="text-sm">{e.detail}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] opacity-70">{e.source}</span>
                    <span className="text-[10px] opacity-70">{e.type}</span>
                  </div>
                </div>
                <span className="text-[10px] opacity-60 whitespace-nowrap">{e.date}</span>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-center text-sm text-[#86868b] py-8">No events match filters</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
