'use client';
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';

const ACCENT = '#059669';
const STATUS_FLOW = ['sent', 'acknowledged', 'scheduled', 'completed', 'report-received'];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    sent: 'bg-blue-50 text-blue-700', acknowledged: 'bg-purple-50 text-purple-700', scheduled: 'bg-yellow-50 text-yellow-700',
    completed: 'bg-emerald-50 text-emerald-700', 'report-received': 'bg-green-50 text-green-800',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status.replace('-', ' ')}</span>;
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const colors: Record<string, string> = { stat: 'bg-red-50 text-red-700', urgent: 'bg-orange-50 text-orange-700', routine: 'bg-gray-50 text-gray-600' };
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[urgency]}`}>{urgency}</span>;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('outgoing');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [showNew, setShowNew] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/coreiq/clinical-referrals').then(r => r.json()).then(setReferrals);
  }, []);

  const filtered = useMemo(() => {
    return referrals.filter(r => {
      if (r.direction !== activeTab) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterUrgency && r.urgency !== filterUrgency) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.patientName.toLowerCase().includes(q) && !r.specialist.toLowerCase().includes(q) && !r.reason.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [referrals, activeTab, search, filterStatus, filterUrgency]);

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch('/api/coreiq/clinical-referrals', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setReferrals(prev => prev.map(r => r.id === id ? updated : r));
      setSelected((prev: any) => prev?.id === id ? updated : prev);
      showToast('Status updated', 'success');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Referrals</h1>
            <p className="text-sm text-[#86868b] mt-1">{referrals.length} total referrals</p>
          </div>
          <button onClick={() => setShowNew(true)} className="px-4 py-2 text-sm text-white rounded-xl" style={{ backgroundColor: ACCENT }}>
            + New Referral
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['outgoing', 'incoming'] as const).map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSelected(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`} style={activeTab === tab ? { backgroundColor: ACCENT } : {}}>
              {tab} ({referrals.filter(r => r.direction === tab).length})
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <input type="text" placeholder="Search patient, specialist, or reason..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 max-w-xs px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
            <option value="">All Statuses</option>
            {STATUS_FLOW.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
          </select>
          <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
            <option value="">All Urgencies</option>
            {['routine', 'urgent', 'stat'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        {/* Table + Detail */}
        <div className="flex gap-4">
          <div className={`${selected ? 'flex-1' : 'w-full'} bg-white rounded-xl border border-gray-200 overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f5f5f7]">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Patient</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">{activeTab === 'outgoing' ? 'Specialist' : 'Referring Provider'}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Specialty</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Reason</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Urgency</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} onClick={() => setSelected(r)} className={`border-b border-gray-50 hover:bg-emerald-50/30 cursor-pointer transition-colors ${selected?.id === r.id ? 'bg-emerald-50/50' : ''}`}>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{r.patientName}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{activeTab === 'outgoing' ? r.specialist : r.referringProvider}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{r.speciality}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 max-w-[150px] truncate">{r.reason}</td>
                    <td className="px-4 py-2.5"><UrgencyBadge urgency={r.urgency} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-[#86868b]">No referrals found</div>}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="w-96 bg-white rounded-xl border border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Referral Details</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Patient', value: selected.patientName },
                  { label: 'Referring Provider', value: selected.referringProvider },
                  { label: 'Specialist', value: selected.specialist },
                  { label: 'Specialty', value: selected.speciality },
                  { label: 'Reason', value: selected.reason },
                  { label: 'Created', value: new Date(selected.createdAt).toLocaleDateString() },
                  ...(selected.scheduledDate ? [{ label: 'Scheduled', value: new Date(selected.scheduledDate).toLocaleDateString() }] : []),
                  ...(selected.completedDate ? [{ label: 'Completed', value: new Date(selected.completedDate).toLocaleDateString() }] : []),
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-[#86868b]">{item.label}</span>
                    <span className="text-gray-900 text-right max-w-[180px]">{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="text-[#86868b]">Urgency</span><UrgencyBadge urgency={selected.urgency} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#86868b]">Status</span><StatusBadge status={selected.status} />
                </div>
              </div>

              {selected.notes && (
                <div className="mt-3 p-2 bg-[#f5f5f7] rounded-lg text-xs text-gray-600">{selected.notes}</div>
              )}

              {/* Status Progress */}
              <div className="mt-4">
                <div className="text-xs text-[#86868b] mb-2">Status Tracking</div>
                <div className="flex items-center gap-1">
                  {STATUS_FLOW.map((s, i) => {
                    const currentIdx = STATUS_FLOW.indexOf(selected.status);
                    const isActive = i <= currentIdx;
                    return (
                      <div key={s} className="flex items-center gap-1 flex-1">
                        <button onClick={() => updateStatus(selected.id, s)}
                          className={`w-full py-1 rounded text-[9px] font-medium transition-all ${isActive ? 'text-white' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                          style={isActive ? { backgroundColor: ACCENT } : {}}
                        >
                          {s.replace('-', ' ')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Referral Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Referral" width="max-w-lg">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#86868b] mb-1 block">Patient</label>
            <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Search patient..." />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-[#86868b] mb-1 block">Specialist</label>
              <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Search specialist..." />
            </div>
            <div className="flex-1">
              <label className="text-xs text-[#86868b] mb-1 block">Specialty</label>
              <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
                {['Cardiology', 'Orthopedics', 'Dermatology', 'GI', 'Neurology', 'ENT', 'Pulmonology', 'Endocrinology', 'Urology', 'Rheumatology'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#86868b] mb-1 block">Reason for Referral</label>
            <textarea rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none" placeholder="Reason..." />
          </div>
          <div>
            <label className="text-xs text-[#86868b] mb-1 block">Urgency</label>
            <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
              <option>Routine</option><option>Urgent</option><option>STAT</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#86868b] mb-1 block">Notes</label>
            <textarea rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none" placeholder="Additional notes..." />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={() => { showToast('Referral created', 'success'); setShowNew(false); }} className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: ACCENT }}>Create Referral</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
