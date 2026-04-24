'use client';
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import PatientSearchInput, { PatientResult } from '@/components/PatientSearchInput';

const ACCENT = '#059669';
const TYPES = ['New Patient', 'Follow-up', 'Urgent', 'Telehealth', 'Annual Wellness', 'Chronic Care'];
const STATUSES = ['Scheduled', 'Checked-in', 'In Progress', 'Completed', 'No-show', 'Cancelled'];
const PROVIDERS = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Scheduled: 'bg-blue-50 text-blue-700', 'Checked-in': 'bg-yellow-50 text-yellow-700',
    'In Progress': 'bg-purple-50 text-purple-700', Completed: 'bg-emerald-50 text-emerald-700',
    'No-show': 'bg-red-50 text-red-700', Cancelled: 'bg-gray-100 text-gray-500',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

export default function SchedulingPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [view, setView] = useState<'list' | 'daily' | 'weekly'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [editAppt, setEditAppt] = useState<any>(null);
  const { showToast } = useToast();
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetch('/api/coreiq/appointments').then(r => r.json()).then(setAppointments);
  }, []);

  const sorted = useMemo(() => {
    const arr = [...appointments].filter(a => {
      if (search && !`${a.patient?.firstName} ${a.patient?.lastName} ${a.patient?.mrn}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && a.status !== filterStatus) return false;
      if (filterType && a.type !== filterType) return false;
      if (filterProvider && a.providerName !== filterProvider) return false;
      return true;
    });
    arr.sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (sortCol === 'patient') { va = a.patient?.lastName; vb = b.patient?.lastName; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [appointments, search, filterStatus, filterType, filterProvider, sortCol, sortDir]);

  const dailyAppts = useMemo(() => {
    return sorted.filter(a => new Date(a.date).toISOString().split('T')[0] === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [sorted, selectedDate]);

  const weekDates = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day + 1);
    return Array.from({ length: 5 }, (_, i) => {
      const dd = new Date(start);
      dd.setDate(start.getDate() + i);
      return dd.toISOString().split('T')[0];
    });
  }, [selectedDate]);

  const handleSave = async (formData: any) => {
    if (editAppt) {
      const res = await fetch(`/api/coreiq/appointments/${editAppt.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { showToast('Appointment updated'); setShowModal(false); fetch('/api/coreiq/appointments').then(r => r.json()).then(setAppointments); }
    } else {
      const res = await fetch('/api/coreiq/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { showToast('Appointment created'); setShowModal(false); fetch('/api/coreiq/appointments').then(r => r.json()).then(setAppointments); }
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/coreiq/appointments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    showToast(`Status updated to ${status}`);
  };

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const hours = Array.from({ length: 10 }, (_, i) => 8 + i);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Scheduling</h1>
          <button onClick={() => { setEditAppt(null); setShowModal(true); }} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>
            + New Appointment
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <PatientSearchInput
              filterMode
              onSelect={(p) => setSearch(`${p.lastName}, ${p.firstName}`)}
              onInputChange={(v) => setSearch(v)}
              placeholder="Search patient..."
              className="w-48"
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
              <option value="">All Types</option>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
              <option value="">All Providers</option>
              {PROVIDERS.map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="ml-auto flex gap-1">
              {(['list', 'daily', 'weekly'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === v ? 'text-white' : 'text-gray-600 bg-gray-100'}`} style={view === v ? { background: ACCENT } : {}}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {(view === 'daily' || view === 'weekly') && (
            <div className="mt-3">
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
            </div>
          )}
        </div>

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f5f5f7]">
                    {[{ key: 'date', label: 'Date' }, { key: 'time', label: 'Time' }, { key: 'patient', label: 'Patient' }, { key: 'type', label: 'Type' }, { key: 'providerName', label: 'Provider' }, { key: 'status', label: 'Status' }].map(c => (
                      <th key={c.key} onClick={() => toggleSort(c.key)} className="text-left py-3 px-4 text-[#86868b] font-medium cursor-pointer hover:text-[#1d1d1f]">
                        {c.label} {sortCol === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-[#86868b] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.slice(0, 50).map(a => (
                    <tr key={a.id} className="border-t border-gray-50 hover:bg-[#f5f5f7]">
                      <td className="py-3 px-4">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-mono">{a.time}</td>
                      <td className="py-3 px-4 font-medium">{a.patient?.lastName}, {a.patient?.firstName} <span className="text-[#86868b] text-xs">{a.patient?.mrn}</span></td>
                      <td className="py-3 px-4">{a.type}</td>
                      <td className="py-3 px-4">{a.providerName}</td>
                      <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                      <td className="py-3 px-4">
                        <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)} className="text-xs px-2 py-1 rounded border border-gray-200">
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 text-xs text-[#86868b] border-t border-gray-100">
              Showing {Math.min(50, sorted.length)} of {sorted.length} appointments
            </div>
          </div>
        )}

        {/* Daily View */}
        {view === 'daily' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
            <div className="space-y-1">
              {hours.map(h => {
                const timeStr = `${String(h).padStart(2, '0')}`;
                const appts = dailyAppts.filter(a => a.time.startsWith(timeStr));
                return (
                  <div key={h} className="flex border-b border-gray-50 min-h-[48px]">
                    <div className="w-20 py-2 text-sm text-[#86868b] font-mono flex-shrink-0">{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</div>
                    <div className="flex-1 flex gap-2 py-1 flex-wrap">
                      {appts.map(a => (
                        <div key={a.id} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ background: ACCENT }}>
                          <span className="font-medium">{a.time}</span> {a.patient?.lastName}, {a.patient?.firstName} — {a.type} <StatusBadge status={a.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weekly View */}
        {view === 'weekly' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-5 divide-x divide-gray-100">
              {weekDates.map(wd => {
                const dayAppts = sorted.filter(a => new Date(a.date).toISOString().split('T')[0] === wd).sort((a, b) => a.time.localeCompare(b.time));
                const d = new Date(wd + 'T12:00:00');
                return (
                  <div key={wd} className="min-h-[400px]">
                    <div className="p-3 text-center bg-[#f5f5f7] border-b border-gray-100">
                      <p className="text-xs text-[#86868b]">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <p className="text-lg font-semibold">{d.getDate()}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      {dayAppts.slice(0, 8).map(a => (
                        <div key={a.id} className="p-2 rounded-lg bg-emerald-50 text-xs">
                          <p className="font-mono text-[#86868b]">{a.time}</p>
                          <p className="font-medium text-[#1d1d1f] truncate">{a.patient?.lastName}</p>
                          <p className="text-[#86868b] truncate">{a.type}</p>
                        </div>
                      ))}
                      {dayAppts.length > 8 && <p className="text-xs text-[#86868b] text-center">+{dayAppts.length - 8} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* New/Edit Appointment Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title={editAppt ? 'Edit Appointment' : 'New Appointment'} width="max-w-lg">
          <AppointmentForm
            initial={editAppt}
            onSave={handleSave}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function AppointmentForm({ initial, onSave, onCancel }: any) {
  const [form, setForm] = useState({
    patientId: initial?.patientId || '',
    providerName: initial?.providerName || PROVIDERS[0],
    date: initial?.date ? new Date(initial.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: initial?.time || '09:00',
    duration: initial?.duration || 30,
    type: initial?.type || 'Follow-up',
    status: initial?.status || 'Scheduled',
    reason: initial?.reason || '',
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-[#86868b] block mb-1">Patient Search</label>
        <PatientSearchInput
          onSelect={(p: PatientResult) => setForm(f => ({ ...f, patientId: p.id }))}
          placeholder="Type to search patients..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[#86868b] block mb-1">Date</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-[#86868b] block mb-1">Time</label>
          <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[#86868b] block mb-1">Type</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[#86868b] block mb-1">Duration (min)</label>
          <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
            {[15, 30, 45, 60].map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-[#86868b] block mb-1">Provider</label>
        <select value={form.providerName} onChange={e => setForm(f => ({ ...f, providerName: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
          {PROVIDERS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-[#86868b] block mb-1">Reason</label>
        <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave({ ...form, date: new Date(form.date) })} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>Save</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-sm">Cancel</button>
      </div>
    </div>
  );
}
