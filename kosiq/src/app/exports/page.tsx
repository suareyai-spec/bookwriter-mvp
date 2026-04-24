'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';

interface ExportCard {
  key: string;
  icon: string;
  title: string;
  description: string;
  hasDateRange?: boolean;
  hasPayerFilter?: boolean;
}

const EXPORTS: ExportCard[] = [
  { key: 'patients', icon: '◉', title: 'Patient Roster', description: 'Download Excel of all patients with risk scores and demographics.' },
  { key: 'claims', icon: '📄', title: 'Claims Data', description: 'Export claims data for a specific date range and optional payer filter.', hasDateRange: true, hasPayerFilter: true },
  { key: 'analytics', icon: '◆', title: 'Analytics Summary', description: 'Download cost analytics breakdown by category, payer, and diagnosis.' },
  { key: 'ens', icon: '⚡', title: 'ENS Events', description: 'Download all emergency notification events with patient details.' },
];

const PAYERS = ['', 'Simply Health', 'Sunshine Health', 'Humana', 'Aetna Better Health', 'Molina Healthcare', 'WellCare'];

export default function ExportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [payer, setPayer] = useState('');

  const handleDownload = async (key: string) => {
    setDownloading(key);
    try {
      let url = `/api/export/${key}`;
      if (key === 'claims') {
        const params = new URLSearchParams();
        if (dateFrom) params.set('from', dateFrom);
        if (dateTo) params.set('to', dateTo);
        if (payer) params.set('payer', payer);
        url += `?${params}`;
      }
      const res = await fetch(url, { credentials: 'include' });
      if (res.status === 401) { window.location.href = '/auth/login?expired=1'; return; }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const disposition = res.headers.get('content-disposition');
      a.download = disposition?.match(/filename="?(.+)"?/)?.[1] || `${key}-export.xlsx`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {} finally { setDownloading(null); }
  };

  const inputClass = "bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0071e3] text-[#1d1d1f]";

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Data Exports</h1>
        <p className="text-base text-[#86868b] mt-1">Download data in Excel format</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {EXPORTS.map(exp => (
          <div key={exp.key} className="glass-card p-7">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#0071e3]/8 flex items-center justify-center text-xl flex-shrink-0">
                {exp.icon}
              </div>
              <div>
                <h3 className="font-semibold text-[#1d1d1f] mb-1">{exp.title}</h3>
                <p className="text-sm text-[#86868b]">{exp.description}</p>
              </div>
            </div>

            {exp.hasDateRange && (
              <div className="flex gap-3 mb-3">
                <input type="month" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" className={`${inputClass} flex-1`} />
                <input type="month" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" className={`${inputClass} flex-1`} />
              </div>
            )}
            {exp.hasPayerFilter && (
              <div className="mb-4">
                <select value={payer} onChange={e => setPayer(e.target.value)} className={`${inputClass} w-full`}>
                  <option value="">All Payers</option>
                  {PAYERS.filter(Boolean).map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            )}

            <button
              onClick={() => handleDownload(exp.key)}
              disabled={downloading === exp.key}
              className="btn-primary disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {downloading === exp.key ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Downloading...</>
              ) : (
                <><span>⤓</span> Download</>
              )}
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
