'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialClinicians = [
  { id: 1, n: 'Dr. Adams', s: 'Psychiatry', p: 156, hr: 12, se: 48, cap: 88 },
  { id: 2, n: 'Dr. Rivera', s: 'Psychiatry', p: 134, hr: 18, se: 42, cap: 76 },
  { id: 3, n: 'Dr. Park', s: 'Psychology', p: 178, hr: 8, se: 52, cap: 92 },
  { id: 4, n: 'Sarah Wells, LCSW', s: 'Social Work', p: 145, hr: 14, se: 45, cap: 82 },
  { id: 5, n: 'Maria Santos, LMHC', s: 'Counseling', p: 167, hr: 10, se: 50, cap: 94 },
];

export default function CaseloadPage() {
  const { showToast } = useToast();
  const [clinicians, setClinicians] = useState(initialClinicians);
  const [reassignModal, setReassignModal] = useState(false);
  const [reassignFrom, setReassignFrom] = useState('');
  const [reassignTo, setReassignTo] = useState('');
  const [reassignCount, setReassignCount] = useState(5);

  const handleReassign = () => {
    if (!reassignFrom || !reassignTo || reassignFrom === reassignTo) return;
    setClinicians(prev => prev.map(c => {
      if (c.n === reassignFrom) return { ...c, p: Math.max(0, c.p - reassignCount), cap: Math.max(0, c.cap - 3) };
      if (c.n === reassignTo) return { ...c, p: c.p + reassignCount, cap: Math.min(100, c.cap + 3) };
      return c;
    }));
    setReassignModal(false);
    showToast(`${reassignCount} patients reassigned from ${reassignFrom} to ${reassignTo}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Clinician Caseload</h1>
            <p className="text-sm text-[#86868b]">Provider workload & patient distribution</p>
          </div>
          <button onClick={() => { setReassignModal(true); setReassignFrom(clinicians[0].n); setReassignTo(clinicians[1].n); }} className="px-4 py-2 bg-[#A855F7] text-white text-sm rounded-xl hover:bg-[#9333EA]">↔ Reassign Patients</button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Clinician</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Patients</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">High Risk</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Sessions/Mo</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3 w-40">Capacity</th>
            </tr></thead>
            <tbody>
              {clinicians.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3"><p className="text-sm font-medium text-[#1d1d1f]">{c.n}</p><p className="text-[10px] text-[#86868b]">{c.s}</p></td>
                  <td className="px-5 py-3 text-sm text-right text-[#1d1d1f]">{c.p}</td>
                  <td className="px-5 py-3 text-sm text-right text-red-500">{c.hr}</td>
                  <td className="px-5 py-3 text-sm text-right text-[#6e6e73]">{c.se}</td>
                  <td className="px-5 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#f5f5f7] rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: c.cap + '%', backgroundColor: c.cap >= 90 ? '#EF4444' : c.cap >= 75 ? '#F59E0B' : '#A855F7' }} />
                      </div>
                      <span className="text-xs text-[#6e6e73] w-8">{c.cap}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={reassignModal} onClose={() => setReassignModal(false)} title="Reassign Patients">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">From</label>
            <select value={reassignFrom} onChange={e => setReassignFrom(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              {clinicians.map(c => <option key={c.id} value={c.n}>{c.n} ({c.p} patients)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">To</label>
            <select value={reassignTo} onChange={e => setReassignTo(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              {clinicians.map(c => <option key={c.id} value={c.n}>{c.n} ({c.p} patients)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Number of Patients</label>
            <input type="number" value={reassignCount} onChange={e => setReassignCount(Number(e.target.value))} min={1} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setReassignModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={handleReassign} className="px-4 py-2 text-sm bg-[#A855F7] text-white rounded-xl">Reassign</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
