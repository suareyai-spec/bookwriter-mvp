'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialKpis = [
  { id: 1, n: 'Simply Health', m: '5,432', s: 87, t: '+2.1%', target: 85, notes: '' },
  { id: 2, n: 'Sunshine Health', m: '4,123', s: 82, t: '+1.8%', target: 80, notes: '' },
  { id: 3, n: 'Humana', m: '3,567', s: 84, t: '+3.2%', target: 82, notes: '' },
  { id: 4, n: 'Aetna', m: '2,890', s: 79, t: '-0.5%', target: 80, notes: '' },
  { id: 5, n: 'Molina', m: '1,456', s: 76, t: '+4.1%', target: 78, notes: '' },
  { id: 6, n: 'WellCare', m: '964', s: 81, t: '+1.3%', target: 80, notes: '' },
];

export default function Page() {
  const { showToast } = useToast();
  const [kpis, setKpis] = useState(initialKpis);
  const [editModal, setEditModal] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState(0);
  const [editNotes, setEditNotes] = useState('');

  const openEdit = (k: typeof kpis[0]) => {
    setEditModal(k.id);
    setEditTarget(k.target);
    setEditNotes(k.notes);
  };

  const saveEdit = () => {
    setKpis(prev => prev.map(k => k.id === editModal ? { ...k, target: editTarget, notes: editNotes } : k));
    setEditModal(null);
    showToast('KPI target updated');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">KPI Tracking</h1>
        <p className="text-sm text-[#86868b] mb-8">Click ✏️ to update targets and add notes on variances</p>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-[#f5f5f7] rounded-xl text-center">
              <p className="text-2xl font-semibold text-[#F97316]">{kpis.length}</p>
              <p className="text-[10px] text-[#86868b]">Active Payers</p>
            </div>
            <div className="p-4 bg-[#f5f5f7] rounded-xl text-center">
              <p className="text-2xl font-semibold text-[#1d1d1f]">18,432</p>
              <p className="text-[10px] text-[#86868b]">Total Members</p>
            </div>
            <div className="p-4 bg-[#f5f5f7] rounded-xl text-center">
              <p className="text-2xl font-semibold text-[#1d1d1f]">$44.3M</p>
              <p className="text-[10px] text-[#86868b]">Claims YTD</p>
            </div>
          </div>
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase pb-3">Payer</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Members</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Score</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Target</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase pb-3">Trend</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase pb-3">Edit</th>
            </tr></thead>
            <tbody>
              {kpis.map(p => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-2.5 text-sm text-[#1d1d1f]">
                    {p.n}
                    {p.notes && <span className="ml-1 text-[10px] text-[#86868b]">📝</span>}
                  </td>
                  <td className="py-2.5 text-xs text-right text-[#6e6e73]">{p.m}</td>
                  <td className="py-2.5 text-sm text-right font-medium" style={{ color: p.s >= p.target ? '#10B981' : '#EF4444' }}>{p.s}%</td>
                  <td className="py-2.5 text-xs text-right text-[#86868b]">{p.target}%</td>
                  <td className="py-2.5 text-xs text-right"><span className={p.t.startsWith('+') ? 'text-green-600' : 'text-red-500'}>{p.t}</span></td>
                  <td className="py-2.5 text-center">
                    <button onClick={() => openEdit(p)} className="text-[#86868b] hover:text-[#F97316]">✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={editModal !== null} onClose={() => setEditModal(null)} title="Edit KPI Target">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Target (%)</label>
            <input type="number" value={editTarget} onChange={e => setEditTarget(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Notes on Variance</label>
            <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Explain variance..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={saveEdit} className="px-4 py-2 text-sm bg-[#F97316] text-white rounded-xl">Save</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
