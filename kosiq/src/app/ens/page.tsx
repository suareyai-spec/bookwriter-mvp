'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const RISK_COLORS: Record<string, string> = { Low: '#34c759', Medium: '#ff9f0a', High: '#ff6482', Critical: '#ff3b30' };

export default function ENSPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (hospitalFilter) params.set('hospital', hospitalFilter);
    fetch(`/api/ens?${params}`).then(r => r.json()).then(d => { setEvents(d.events); setLoading(false); });
  }, [statusFilter, hospitalFilter]);

  const activeCount = events.filter(e => e.status === 'Active').length;
  const inputClass = "bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0071e3] text-[#1d1d1f]";

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight flex items-center gap-3">
            ENS Feed
            {activeCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff3b30]/8 border border-[#ff3b30]/15">
                <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-pulse" />
                <span className="text-sm text-[#ff3b30] font-medium">{activeCount} Active</span>
              </span>
            )}
          </h1>
          <p className="text-base text-[#86868b] mt-1">Emergency Notification System — Real-time admissions</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputClass}>
          <option value="">All Status</option>
          <option>Active</option><option>Discharged</option>
        </select>
        <select value={hospitalFilter} onChange={e => setHospitalFilter(e.target.value)} className={inputClass}>
          <option value="">All Hospitals</option>
          {['Jackson Memorial','Baptist Health','Mount Sinai Miami','Aventura Hospital','Memorial Regional'].map(h => <option key={h}>{h}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="glass-card overflow-hidden">
              <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${e.status === 'Active' ? 'bg-[#ff3b30] animate-pulse' : 'bg-[#86868b]'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link href={`/patients/${e.patientId}`} className="font-medium text-[#1d1d1f] hover:text-[#0071e3]" onClick={ev => ev.stopPropagation()}>
                      {e.patientName}
                    </Link>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${RISK_COLORS[e.riskLevel]}12`, color: RISK_COLORS[e.riskLevel] }}>
                      Risk: {e.riskScore}
                    </span>
                    <span className="text-xs text-[#86868b]">DOB: {new Date(e.patientDob).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#86868b]">
                    <span className="text-[#0071e3] font-medium">{e.hospital}</span>
                    <span>•</span>
                    <span className={e.admissionType === 'ER' ? 'text-[#ff9f0a] font-medium' : ''}>{e.admissionType}</span>
                    <span>•</span>
                    <span>{e.diagnosis}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#86868b]">{new Date(e.admitDate).toLocaleString()}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full inline-block mt-1 font-medium ${
                    e.status === 'Active' ? 'bg-[#ff3b30]/8 text-[#ff3b30]' : 'bg-gray-100 text-[#86868b]'
                  }`}>{e.status}</span>
                </div>
              </div>
              {expanded === e.id && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div><p className="text-xs text-[#86868b] font-medium">Payer</p><p className="text-sm text-[#1d1d1f]">{e.payer}</p></div>
                    <div><p className="text-xs text-[#86868b] font-medium">Admission Type</p><p className="text-sm text-[#1d1d1f]">{e.admissionType}</p></div>
                    <div><p className="text-xs text-[#86868b] font-medium">Admit Date</p><p className="text-sm text-[#1d1d1f]">{new Date(e.admitDate).toLocaleString()}</p></div>
                    <div><p className="text-xs text-[#86868b] font-medium">Discharge</p><p className="text-sm text-[#1d1d1f]">{e.dischargeDate ? new Date(e.dischargeDate).toLocaleString() : 'Still admitted'}</p></div>
                  </div>
                  <Link href={`/patients/${e.patientId}`} className="inline-block mt-4 text-sm text-[#0071e3] hover:text-[#0077ed] font-medium">
                    View full patient record →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
