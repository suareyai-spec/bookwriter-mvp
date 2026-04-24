'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialMeasures = [
  { id: 1, domain: 'Prevention', measure: 'Breast Cancer Screening (BCS)', num: 2345, den: 3001, rate: 78.2, target: 82, star: 4, notes: '' },
  { id: 2, domain: 'Prevention', measure: 'Colorectal Cancer Screening (COL)', num: 4123, den: 5719, rate: 72.1, target: 75, star: 3, notes: '' },
  { id: 3, domain: 'Prevention', measure: 'Cervical Cancer Screening (CCS)', num: 1987, den: 2447, rate: 81.2, target: 85, star: 4, notes: '' },
  { id: 4, domain: 'Prevention', measure: 'Childhood Immunizations (CIS)', num: 567, den: 645, rate: 87.9, target: 85, star: 5, notes: '' },
  { id: 5, domain: 'Prevention', measure: 'Flu Vaccinations (FVA)', num: 8923, den: 12456, rate: 71.6, target: 75, star: 3, notes: '' },
  { id: 6, domain: 'Chronic', measure: 'Comprehensive Diabetes Care - A1c (CDC)', num: 2678, den: 3240, rate: 82.7, target: 85, star: 4, notes: '' },
  { id: 7, domain: 'Chronic', measure: 'Eye Exam for Diabetes (EED)', num: 1987, den: 3240, rate: 61.3, target: 70, star: 2, notes: '' },
  { id: 8, domain: 'Chronic', measure: 'Controlling Blood Pressure (CBP)', num: 3701, den: 5412, rate: 68.4, target: 72, star: 3, notes: '' },
  { id: 9, domain: 'Chronic', measure: 'Statin Therapy Adherence (SPC)', num: 2345, den: 3134, rate: 74.8, target: 80, star: 3, notes: '' },
  { id: 10, domain: 'Chronic', measure: 'Kidney Health - Monitoring (KED)', num: 876, den: 1234, rate: 71.0, target: 75, star: 3, notes: '' },
  { id: 11, domain: 'Behavioral', measure: 'Antidepressant Med Mgmt (AMM)', num: 1234, den: 1876, rate: 65.8, target: 70, star: 3, notes: '' },
  { id: 12, domain: 'Behavioral', measure: 'Follow-Up After MH Visit (FUH)', num: 456, den: 678, rate: 67.3, target: 72, star: 3, notes: '' },
  { id: 13, domain: 'Behavioral', measure: 'Metabolic Monitoring SGA (SMD)', num: 234, den: 345, rate: 67.8, target: 70, star: 3, notes: '' },
  { id: 14, domain: 'Access', measure: 'Adults Access to Preventive (AAP)', num: 14567, den: 18432, rate: 79.0, target: 82, star: 4, notes: '' },
  { id: 15, domain: 'Access', measure: 'Children Access to PCP (CAP)', num: 2345, den: 2678, rate: 87.6, target: 90, star: 4, notes: '' },
  { id: 16, domain: 'Utilization', measure: 'ED Utilization (EDU)', num: 2341, den: 18432, rate: 12.7, target: 10, star: 3, notes: '' },
  { id: 17, domain: 'Utilization', measure: 'Inpatient Utilization (IPU)', num: 876, den: 18432, rate: 4.8, target: 4, star: 3, notes: '' },
  { id: 18, domain: 'Utilization', measure: 'Ambulatory Care (AMB)', num: 15678, den: 18432, rate: 85.1, target: 88, star: 4, notes: '' },
];

const domains = ['All', 'Prevention', 'Chronic', 'Behavioral', 'Access', 'Utilization'];

type SortKey = 'measure' | 'rate' | 'target' | 'star' | 'domain';
type SortDir = 'asc' | 'desc';

export default function HEDISPage() {
  const { showToast } = useToast();
  const [measures, setMeasures] = useState(initialMeasures);
  const [domain, setDomain] = useState('All');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('measure');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editModal, setEditModal] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState(0);
  const [editNotes, setEditNotes] = useState('');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortIndicator = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  let filtered = domain === 'All' ? measures : measures.filter(m => m.domain === domain);
  if (search) filtered = filtered.filter(m => m.measure.toLowerCase().includes(search.toLowerCase()));
  filtered = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'measure') return a.measure.localeCompare(b.measure) * dir;
    return ((a as any)[sortKey] - (b as any)[sortKey]) * dir;
  });

  const openEdit = (m: typeof measures[0]) => {
    setEditModal(m.id);
    setEditTarget(m.target);
    setEditNotes(m.notes);
  };

  const saveEdit = () => {
    setMeasures(prev => prev.map(m => m.id === editModal ? { ...m, target: editTarget, notes: editNotes } : m));
    setEditModal(null);
    showToast('Measure updated');
  };

  const editingMeasure = measures.find(m => m.id === editModal);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">HEDIS Measures</h1>
            <p className="text-sm text-[#86868b] mt-1">Click ✏️ to edit target rates and add notes</p>
          </div>
          <input placeholder="Search measures..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white w-64" />
        </div>

        <div className="flex gap-2 mb-6">
          {domains.map(d => (
            <button key={d} onClick={() => setDomain(d)} className={`px-4 py-2 text-xs rounded-full transition-colors ${domain === d ? 'bg-[#10B981] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#10B981]/10'}`}>
              {d}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]">
                <th onClick={() => toggleSort('domain')} className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3 cursor-pointer hover:text-[#1d1d1f]">Domain{sortIndicator('domain')}</th>
                <th onClick={() => toggleSort('measure')} className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3 cursor-pointer hover:text-[#1d1d1f]">Measure{sortIndicator('measure')}</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Num</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Den</th>
                <th onClick={() => toggleSort('rate')} className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3 cursor-pointer hover:text-[#1d1d1f]">Rate{sortIndicator('rate')}</th>
                <th onClick={() => toggleSort('target')} className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3 cursor-pointer hover:text-[#1d1d1f]">Target{sortIndicator('target')}</th>
                <th onClick={() => toggleSort('star')} className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3 cursor-pointer hover:text-[#1d1d1f]">Stars{sortIndicator('star')}</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3 w-32">Progress</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-[#10B981]/5 transition-colors">
                  <td className="px-4 py-3"><span className="text-[10px] px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] rounded-full">{m.domain}</span></td>
                  <td className="px-4 py-3 text-xs font-medium text-[#1d1d1f]">
                    {m.measure}
                    {m.notes && <span className="ml-2 text-[10px] text-[#86868b]">📝</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-right text-[#6e6e73]">{m.num.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-right text-[#6e6e73]">{m.den.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: m.rate >= m.target ? '#10B981' : '#EF4444' }}>{m.rate}%</td>
                  <td className="px-4 py-3 text-xs text-right text-[#86868b]">{m.target}%</td>
                  <td className="px-4 py-3 text-center text-xs text-[#F59E0B]">{'★'.repeat(m.star)}{'☆'.repeat(5 - m.star)}</td>
                  <td className="px-4 py-3 w-32">
                    <div className="bg-[#f5f5f7] rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (m.rate / m.target) * 100)}%`, backgroundColor: m.rate >= m.target ? '#10B981' : '#F59E0B' }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(m)} className="text-[#86868b] hover:text-[#10B981]">✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={editModal !== null} onClose={() => setEditModal(null)} title={`Edit: ${editingMeasure?.measure || ''}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Target Rate (%)</label>
            <input type="number" value={editTarget} onChange={e => setEditTarget(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Notes</label>
            <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Add notes for this measure..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm text-[#6e6e73] border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button onClick={saveEdit} className="px-4 py-2 text-sm bg-[#10B981] text-white rounded-xl hover:bg-[#059669]">Save Changes</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
