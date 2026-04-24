'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialQueue = [
  { id: 1, p: 'William Jackson', r: 'Critical SpO2', pr: 'urgent', a: 'RN Sarah', done: false },
  { id: 2, p: 'David Martinez', r: 'Glucose >200 x3d', pr: 'high', a: 'RN Maria', done: false },
  { id: 3, p: 'Robert Johnson', r: 'SpO2 declining', pr: 'high', a: 'RN Sarah', done: false },
  { id: 4, p: 'James Wilson', r: 'BP needs med review', pr: 'medium', a: 'RN Tom', done: false },
  { id: 5, p: 'Maria Garcia', r: 'Monthly RPM review', pr: 'routine', a: 'RN Tom', done: false },
];

const prColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-600',
  high: 'bg-orange-100 text-orange-600',
  medium: 'bg-yellow-100 text-yellow-600',
  routine: 'bg-blue-100 text-blue-600',
};

const staff = ['RN Sarah', 'RN Maria', 'RN Tom', 'RN Jessica'];
const priorities = ['urgent', 'high', 'medium', 'routine'];

export default function Page() {
  const { showToast } = useToast();
  const [queue, setQueue] = useState(initialQueue);

  const markComplete = (id: number) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, done: true } : q));
    showToast('Task marked complete');
  };

  const changeAssignee = (id: number, a: string) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, a } : q));
    showToast(`Assigned to ${a}`);
  };

  const changePriority = (id: number, pr: string) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, pr } : q));
    showToast(`Priority changed to ${pr}`);
  };

  const sorted = [...queue].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const pOrder = { urgent: 0, high: 1, medium: 2, routine: 3 };
    return (pOrder[a.pr as keyof typeof pOrder] || 3) - (pOrder[b.pr as keyof typeof pOrder] || 3);
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Work Queue</h1>
        <p className="text-sm text-[#86868b] mb-8">Clinical staff task queue — {queue.filter(q => !q.done).length} open tasks</p>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {sorted.map(q => (
            <div key={q.id} className={`flex items-center gap-4 p-4 border-b border-gray-50 ${q.done ? 'opacity-40' : ''}`}>
              <select value={q.pr} onChange={e => changePriority(q.id, e.target.value)} className={`px-2 py-0.5 text-[10px] rounded-full font-semibold uppercase border-0 cursor-pointer ${prColors[q.pr]}`}>
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <span className="text-sm font-medium text-[#1d1d1f] w-40">{q.p}</span>
              <span className="text-xs text-[#6e6e73] flex-1">{q.r}</span>
              <select value={q.a} onChange={e => changeAssignee(q.id, e.target.value)} className="text-xs text-[#86868b] border border-gray-200 rounded-lg px-2 py-1 cursor-pointer">
                {staff.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {!q.done ? (
                <button onClick={() => markComplete(q.id)} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">Complete</button>
              ) : (
                <span className="text-xs text-green-600">✓ Done</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
