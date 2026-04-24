'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialPatients = [
  { id: 1, name: 'Maria Garcia', conditions: ['Diabetes', 'Hypertension', 'CKD'], enrolled: 'Jan 2025', minutes: 18, target: 20, lastContact: 'Feb 28', nextOutreach: 'Mar 5', status: 'on-track', notes: '' },
  { id: 2, name: 'Robert Johnson', conditions: ['COPD', 'CHF'], enrolled: 'Mar 2025', minutes: 22, target: 20, lastContact: 'Feb 25', nextOutreach: 'Mar 3', status: 'on-track', notes: '' },
  { id: 3, name: 'Patricia Brown', conditions: ['Diabetes', 'Obesity', 'Depression'], enrolled: 'Jun 2025', minutes: 12, target: 20, lastContact: 'Feb 20', nextOutreach: 'Mar 2', status: 'at-risk', notes: '' },
  { id: 4, name: 'David Martinez', conditions: ['Diabetes', 'Hypertension'], enrolled: 'Aug 2025', minutes: 8, target: 20, lastContact: 'Feb 15', nextOutreach: 'Mar 1', status: 'behind', notes: '' },
  { id: 5, name: 'Susan Anderson', conditions: ['CHF', 'Atrial Fib', 'CKD'], enrolled: 'Sep 2025', minutes: 20, target: 20, lastContact: 'Mar 1', nextOutreach: 'Mar 15', status: 'on-track', notes: '' },
  { id: 6, name: 'Karen Thomas', conditions: ['COPD', 'Diabetes', 'Anxiety'], enrolled: 'Nov 2025', minutes: 15, target: 20, lastContact: 'Feb 22', nextOutreach: 'Mar 4', status: 'at-risk', notes: '' },
  { id: 7, name: 'William Jackson', conditions: ['CHF', 'CKD', 'Diabetes'], enrolled: 'Dec 2025', minutes: 5, target: 20, lastContact: 'Feb 10', nextOutreach: 'Overdue', status: 'behind', notes: '' },
];

export default function CCMPage() {
  const { showToast } = useToast();
  const [patients, setPatients] = useState(initialPatients);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [enrollModal, setEnrollModal] = useState(false);
  const [timeModal, setTimeModal] = useState<number | null>(null);
  const [noteModal, setNoteModal] = useState<number | null>(null);
  const [newPatient, setNewPatient] = useState({ name: '', conditions: '' });
  const [addMinutes, setAddMinutes] = useState(0);
  const [noteText, setNoteText] = useState('');

  let filtered = filter === 'all' ? patients : patients.filter(p => p.status === filter);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleEnroll = () => {
    if (!newPatient.name) return;
    const p = {
      id: Date.now(),
      name: newPatient.name,
      conditions: newPatient.conditions.split(',').map(s => s.trim()).filter(Boolean),
      enrolled: 'Mar 2026',
      minutes: 0, target: 20, lastContact: 'New', nextOutreach: 'Mar 15', status: 'on-track', notes: '',
    };
    setPatients(prev => [p, ...prev]);
    setNewPatient({ name: '', conditions: '' });
    setEnrollModal(false);
    showToast('Patient enrolled in CCM');
  };

  const handleUnenroll = (id: number) => {
    if (!confirm('Unenroll this patient from CCM?')) return;
    setPatients(prev => prev.filter(p => p.id !== id));
    showToast('Patient unenrolled');
  };

  const handleLogTime = () => {
    if (timeModal === null || addMinutes <= 0) return;
    setPatients(prev => prev.map(p => {
      if (p.id !== timeModal) return p;
      const newMin = p.minutes + addMinutes;
      const status = newMin >= p.target ? 'on-track' : newMin >= p.target * 0.7 ? 'at-risk' : 'behind';
      return { ...p, minutes: newMin, status, lastContact: 'Today' };
    }));
    setTimeModal(null);
    setAddMinutes(0);
    showToast(`${addMinutes} minutes logged`);
  };

  const handleAddNote = () => {
    if (noteModal === null || !noteText) return;
    setPatients(prev => prev.map(p => p.id === noteModal ? { ...p, notes: noteText } : p));
    setNoteModal(null);
    setNoteText('');
    showToast('Care note saved');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Chronic Care Management (CCM)</h1>
            <p className="text-sm text-[#86868b] mt-1">Enrollment, time tracking & monthly outreach</p>
          </div>
          <button onClick={() => setEnrollModal(true)} className="px-4 py-2 bg-[#EC4899] text-white text-sm font-medium rounded-xl hover:bg-[#DB2777]">+ Enroll Patient</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Enrolled', value: patients.length.toString(), sub: 'Active CCM patients' },
            { label: 'Avg Minutes', value: (patients.reduce((s, p) => s + p.minutes, 0) / patients.length).toFixed(1), sub: 'Target: 20 min/month' },
            { label: 'On Track', value: patients.filter(p => p.status === 'on-track').length.toString(), sub: `${Math.round(patients.filter(p => p.status === 'on-track').length / patients.length * 100)}% compliance` },
            { label: 'Monthly Revenue', value: '$76.4K', sub: 'CPT 99490, 99439' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-[#86868b] text-xs mb-1">{m.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{m.value}</p>
              <p className="text-[11px] text-[#EC4899] mt-1">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4 items-center">
          {['all', 'on-track', 'at-risk', 'behind'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded-full capitalize ${filter === f ? 'bg-[#EC4899] text-white' : 'bg-[#f5f5f7] text-[#6e6e73]'}`}>
              {f === 'all' ? 'All Enrolled' : f}
            </button>
          ))}
          <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="ml-auto px-3 py-1.5 border border-gray-200 rounded-xl text-sm w-48" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Patient</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Conditions</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Minutes</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Status</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#1d1d1f]">{p.name}</p>
                    <p className="text-[10px] text-[#86868b]">Since {p.enrolled} {p.notes && '📝'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {p.conditions.map(c => <span key={c} className="px-1.5 py-0.5 bg-[#EC4899]/10 text-[#EC4899] text-[10px] rounded">{c}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-12 bg-[#f5f5f7] rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (p.minutes / p.target) * 100)}%`, backgroundColor: p.minutes >= p.target ? '#10B981' : p.minutes >= p.target * 0.7 ? '#F59E0B' : '#EF4444' }} />
                      </div>
                      <span className="text-xs text-[#6e6e73]">{p.minutes}/{p.target}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                      p.status === 'on-track' ? 'bg-green-50 text-green-600' :
                      p.status === 'at-risk' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => { setTimeModal(p.id); setAddMinutes(5); }} className="px-2 py-1 text-[10px] bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">⏱ Log Time</button>
                      <button onClick={() => { setNoteModal(p.id); setNoteText(p.notes); }} className="px-2 py-1 text-[10px] bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">📝 Note</button>
                      <button onClick={() => handleUnenroll(p.id)} className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded-lg hover:bg-red-100">✗</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={enrollModal} onClose={() => setEnrollModal(false)} title="Enroll Patient in CCM">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Patient Name</label>
            <input value={newPatient.name} onChange={e => setNewPatient(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Conditions (comma separated)</label>
            <input value={newPatient.conditions} onChange={e => setNewPatient(p => ({ ...p, conditions: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Diabetes, HTN, CKD" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setEnrollModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={handleEnroll} className="px-4 py-2 text-sm bg-[#EC4899] text-white rounded-xl">Enroll</button>
          </div>
        </div>
      </Modal>

      <Modal open={timeModal !== null} onClose={() => setTimeModal(null)} title="Log Time Entry">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Minutes</label>
            <input type="number" value={addMinutes} onChange={e => setAddMinutes(Number(e.target.value))} min={1} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setTimeModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={handleLogTime} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl">Log Time</button>
          </div>
        </div>
      </Modal>

      <Modal open={noteModal !== null} onClose={() => setNoteModal(null)} title="Care Note">
        <div className="space-y-4">
          <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Enter care note..." />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setNoteModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={handleAddNote} className="px-4 py-2 text-sm bg-[#EC4899] text-white rounded-xl">Save Note</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
