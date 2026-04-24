'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialAlerts = [
  { id: 1, p: 'William Jackson', d: 'Pulse Ox', r: '88% SpO2', s: 'critical', acked: false, note: '' },
  { id: 2, p: 'David Martinez', d: 'Glucose', r: '234 mg/dL', s: 'alert', acked: false, note: '' },
  { id: 3, p: 'Robert Johnson', d: 'Pulse Ox', r: '91% SpO2', s: 'warning', acked: false, note: '' },
  { id: 4, p: 'James Wilson', d: 'BP', r: '148/92', s: 'warning', acked: false, note: '' },
  { id: 5, p: 'Maria Garcia', d: 'Glucose', r: '198 mg/dL', s: 'alert', acked: false, note: '' },
];

export default function Page() {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState(initialAlerts);
  const [noteModal, setNoteModal] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const acknowledge = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acked: true } : a));
    showToast('Alert acknowledged');
  };

  const dismiss = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showToast('Alert dismissed');
  };

  const saveNote = () => {
    if (noteModal === null) return;
    setAlerts(prev => prev.map(a => a.id === noteModal ? { ...a, note: noteText } : a));
    setNoteModal(null);
    showToast('Clinical note saved');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">RPM Alerts</h1>
        <p className="text-sm text-[#86868b] mb-8">Out-of-range threshold alerts — {alerts.filter(a => !a.acked).length} unacknowledged</p>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {alerts.map(a => (
            <div key={a.id} className={`flex items-center gap-4 p-4 border-b border-gray-50 ${a.s === 'critical' ? 'bg-red-50/30' : ''} ${a.acked ? 'opacity-60' : ''}`}>
              <span className={`w-3 h-3 rounded-full ${a.s === 'critical' ? 'bg-red-500 animate-pulse' : a.s === 'alert' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
              <span className="text-sm font-medium text-[#1d1d1f] w-40">{a.p}</span>
              <span className="text-xs text-[#6e6e73] w-24">{a.d}</span>
              <span className="text-sm font-mono font-medium text-[#1d1d1f] flex-1">{a.r}</span>
              {a.note && <span className="text-[10px] text-[#86868b]">📝</span>}
              <div className="flex gap-2">
                <button onClick={() => { setNoteModal(a.id); setNoteText(a.note); }} className="px-2 py-1 text-[10px] bg-gray-100 rounded-lg hover:bg-gray-200">📝 Note</button>
                {!a.acked ? (
                  <button onClick={() => acknowledge(a.id)} className="px-3 py-1 bg-[#06B6D4] text-white text-xs rounded-lg hover:bg-[#0891B2]">Acknowledge</button>
                ) : (
                  <span className="px-3 py-1 text-xs text-green-600">✓ Ack'd</span>
                )}
                <button onClick={() => dismiss(a.id)} className="px-2 py-1 text-[10px] text-red-500 bg-red-50 rounded-lg hover:bg-red-100">Dismiss</button>
              </div>
            </div>
          ))}
          {alerts.length === 0 && <p className="p-8 text-center text-sm text-[#86868b]">No active alerts</p>}
        </div>
      </div>

      <Modal open={noteModal !== null} onClose={() => setNoteModal(null)} title="Clinical Note">
        <div className="space-y-4">
          <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Add clinical note..." />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setNoteModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={saveNote} className="px-4 py-2 text-sm bg-[#06B6D4] text-white rounded-xl">Save</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
