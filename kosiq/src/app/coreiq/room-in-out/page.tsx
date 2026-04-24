'use client';
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';

const ACCENT = '#059669';

const STAGES = [
  { key: 'checked-in', label: 'Checked In', icon: '✅' },
  { key: 'waiting', label: 'Waiting Room', icon: '⏳' },
  { key: 'vitals', label: 'Vitals', icon: '💉' },
  { key: 'exam-room', label: 'Exam Room', icon: '🏥' },
  { key: 'with-provider', label: 'With Provider', icon: '👨‍⚕️' },
  { key: 'checkout', label: 'Checkout', icon: '💳' },
  { key: 'completed', label: 'Completed', icon: '✔️' },
];

function getWaitMinutes(dateStr: string | null) {
  if (!dateStr) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000));
}

function WaitBadge({ minutes }: { minutes: number }) {
  const color = minutes > 30 ? 'bg-red-50 text-red-700' : minutes > 15 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700';
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${color}`}>{minutes}m</span>;
}

export default function RoomInOutPage() {
  const [flows, setFlows] = useState<any[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const { showToast } = useToast();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetch('/api/coreiq/patient-flow').then(r => r.json()).then(setFlows);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const movePatient = async (id: string, newStatus: string) => {
    const res = await fetch('/api/coreiq/patient-flow', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFlows(prev => prev.map(f => f.id === id ? updated : f));
      showToast('Patient moved', 'success');
    }
  };

  const stats = useMemo(() => {
    const total = flows.length;
    const waiting = flows.filter(f => ['checked-in', 'waiting'].includes(f.status)).length;
    const inExam = flows.filter(f => ['exam-room', 'with-provider'].includes(f.status)).length;
    const completed = flows.filter(f => f.status === 'completed').length;
    const waitTimes = flows.filter(f => f.checkedInAt && f.status !== 'completed').map(f => getWaitMinutes(f.checkedInAt));
    const avgWait = waitTimes.length ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;
    return { total, waiting, inExam, completed, avgWait };
  }, [flows, now]);

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Room In / Out</h1>
          <p className="text-sm text-[#86868b] mt-1">Patient flow tracking board</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Today', value: stats.total, color: 'text-gray-900' },
            { label: 'Avg Wait', value: `${stats.avgWait}m`, color: stats.avgWait > 20 ? 'text-red-600' : 'text-emerald-600' },
            { label: 'Waiting', value: stats.waiting, color: stats.waiting > 5 ? 'text-yellow-600' : 'text-gray-900' },
            { label: 'In Exam', value: stats.inExam, color: 'text-blue-600' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-[#86868b]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Board */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stageFlows = flows.filter(f => f.status === stage.key);
            return (
              <div key={stage.key} className="min-w-[200px] flex-shrink-0"
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); if (dragId) movePatient(dragId, stage.key); setDragId(null); }}
              >
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{stage.icon}</span>
                      <span className="text-xs font-semibold text-gray-700">{stage.label}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: ACCENT }}>{stageFlows.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[100px]">
                    {stageFlows.map(f => {
                      const stageStartMap: Record<string, string | null> = {
                        'checked-in': f.checkedInAt, waiting: f.checkedInAt, vitals: f.vitalsAt,
                        'exam-room': f.examRoomAt, 'with-provider': f.providerAt, checkout: f.checkoutAt, completed: f.completedAt,
                      };
                      const waitMin = getWaitMinutes(stageStartMap[f.status]);
                      return (
                        <div key={f.id} draggable onDragStart={() => setDragId(f.id)}
                          className="bg-white rounded-lg border border-gray-200 p-2.5 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-900 truncate">{f.patientName}</span>
                            <WaitBadge minutes={waitMin} />
                          </div>
                          <div className="text-[10px] text-[#86868b] space-y-0.5">
                            <div>{new Date(f.appointmentTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                            <div className="truncate">{f.provider}</div>
                            <div className="truncate">{f.reason}</div>
                            {f.roomNumber && <div className="font-medium text-emerald-600">{f.roomNumber}</div>}
                          </div>
                          {/* Quick move buttons */}
                          <div className="mt-2 flex gap-1">
                            {stage.key !== 'completed' && (
                              <button onClick={() => {
                                const idx = STAGES.findIndex(s => s.key === stage.key);
                                if (idx < STAGES.length - 1) movePatient(f.id, STAGES[idx + 1].key);
                              }} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                                Next →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
