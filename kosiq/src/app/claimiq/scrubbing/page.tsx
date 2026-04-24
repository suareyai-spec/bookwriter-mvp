'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState, useMemo } from 'react';
import PatientSearchInput from '@/components/PatientSearchInput';

const errorTypes = ['Missing Modifier', 'Invalid Code Combo', 'Demographic Mismatch', 'Missing Auth', 'Duplicate Claim', 'Age/Gender Mismatch', 'Invalid Place of Service', 'Bundled Procedure'] as const;
const severityLevels = ['Error', 'Warning', 'Info'] as const;

const scrubResults = Array.from({ length: 80 }, (_, i) => ({
  claimId: `CLM-2026-${String(10000 + i).slice(1)}`,
  patient: ['Maria Santos', 'Robert Chen', 'James Williams', 'Patricia Brown', 'John Garcia', 'Jennifer Miller'][i % 6],
  provider: ['Dr. Maria Santos', 'Dr. James Chen', 'Dr. Patricia Williams', 'Dr. Robert Kumar'][i % 4],
  errorType: errorTypes[i % errorTypes.length],
  severity: severityLevels[i % severityLevels.length],
  description: [
    'CPT 99215 requires modifier 25 when billed with 36415',
    'E11.9 and E11.65 cannot be billed together per CCI edits',
    'Patient DOB does not match payer records',
    'Prior authorization required for CPT 27447',
    'Duplicate claim found within 30 days for same CPT/DOS',
    'CPT 76856 is age-restricted; patient age < 12',
    'POS 11 invalid for CPT 99223 (inpatient code)',
    'CPT 29881 is bundled with 29880 per CCI edits',
  ][i % 8],
  suggestion: [
    'Add modifier 25 to E/M code',
    'Remove secondary diagnosis or use more specific code',
    'Verify patient demographics with payer portal',
    'Obtain prior authorization before submission',
    'Review DOS and CPT — void duplicate if applicable',
    'Verify procedure is age-appropriate or add medical necessity',
    'Change POS to 21 for inpatient service',
    'Remove bundled code or add modifier 59 if distinct service',
  ][i % 8],
  autoFixAvailable: i % 3 === 0,
}));

const sevColor: Record<string, string> = { Error: 'bg-red-100 text-red-700', Warning: 'bg-yellow-100 text-yellow-700', Info: 'bg-blue-100 text-blue-700' };

export default function ScrubbingPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSev, setFilterSev] = useState('');

  const filtered = useMemo(() => scrubResults.filter(r =>
    (!search || r.claimId.toLowerCase().includes(search.toLowerCase()) || r.patient.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || r.errorType === filterType) &&
    (!filterSev || r.severity === filterSev)
  ), [search, filterType, filterSev]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Claim Scrubbing</h1>
            <p className="text-sm text-[#86868b]">Pre-submission validation and error detection</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => showToast('Batch scrub started for 120 claims')} className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-purple-700">Run Batch Scrub</button>
            <button onClick={() => showToast('Auto-fix applied to 12 claims')} className="px-4 py-2 bg-gray-100 text-[#1d1d1f] text-sm rounded-lg hover:bg-gray-200">Auto-Fix All</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Scrubbed', value: '3,240', color: '#7C3AED' },
            { label: 'Errors Found', value: '287', color: '#DC2626' },
            { label: 'Warnings', value: '156', color: '#EAB308' },
            { label: 'Clean Claims', value: '2,797', color: '#22C55E' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <PatientSearchInput
            filterMode
            onSelect={(p) => setSearch(`${p.lastName}, ${p.firstName}`)}
            onInputChange={(v) => setSearch(v)}
            placeholder="Search claims, patients..."
            className="w-72"
          />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Error Types</option>
            {errorTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterSev} onChange={e => setFilterSev(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Severities</option>
            {severityLevels.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="text-xs text-[#86868b] self-center ml-auto">{filtered.length} issues</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Claim</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Patient</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Error Type</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Severity</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Description</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Suggestion</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Action</th>
            </tr></thead>
            <tbody>
              {filtered.slice(0, 40).map((r, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 text-xs">
                  <td className="px-3 py-3 font-mono text-[#7C3AED]">{r.claimId}</td>
                  <td className="px-3 py-3 text-[#1d1d1f]">{r.patient}</td>
                  <td className="px-3 py-3 text-[#6e6e73]">{r.errorType}</td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sevColor[r.severity]}`}>{r.severity}</span></td>
                  <td className="px-3 py-3 text-[#1d1d1f] max-w-[200px] truncate">{r.description}</td>
                  <td className="px-3 py-3 text-[#059669] max-w-[200px] truncate">{r.suggestion}</td>
                  <td className="px-3 py-3">
                    {r.autoFixAvailable ? (
                      <button onClick={() => showToast('Auto-fix applied')} className="text-[#7C3AED] hover:underline text-xs">Auto-Fix</button>
                    ) : (
                      <button onClick={() => showToast('Marked for review')} className="text-[#86868b] hover:underline text-xs">Review</button>
                    )}
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
