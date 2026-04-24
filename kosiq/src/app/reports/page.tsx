'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

type Role = 'admin' | 'cmo' | 'analyst' | 'viewer';
const ROLE_HIERARCHY: Record<Role, number> = { admin: 4, cmo: 3, analyst: 2, viewer: 1 };
function hasMinRole(r: Role, min: Role) { return (ROLE_HIERARCHY[r] || 0) >= (ROLE_HIERARCHY[min] || 0); }

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const { data: session } = useSession();
  const role = ((session?.user as any)?.role || 'viewer') as Role;

  const fetchReports = () => {
    fetch('/api/reports', { credentials: 'include' })
      .then(r => { if (r.status === 401) { window.location.href = '/auth/login?expired=1'; return null; } return r.json(); })
      .then(d => { if (d) { setReports(d.reports || []); setLoading(false); } });
  };

  useEffect(() => { fetchReports(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month }),
        credentials: 'include',
      });
      if (res.status === 401) { window.location.href = '/auth/login?expired=1'; return; }
      if (res.ok) fetchReports();
    } catch {} finally { setGenerating(false); }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/pipeline/refresh', { method: 'POST', credentials: 'include' });
      if (res.status === 401) { window.location.href = '/auth/login?expired=1'; return; }
    } catch {} finally { setRefreshing(false); }
  };

  const handleDownloadPdf = async (reportId: string) => {
    setDownloadingPdf(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}/pdf`, { credentials: 'include' });
      if (res.status === 401) { window.location.href = '/auth/login?expired=1'; return; }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `report-${reportId}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {} finally { setDownloadingPdf(null); }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Monthly Reports</h1>
          <p className="text-base text-[#86868b] mt-1">AI-generated executive summaries and cost analysis</p>
        </div>
        <div className="flex gap-3">
          {hasMinRole(role, 'cmo') && (
            <button onClick={handleRefresh} disabled={refreshing}
              className="border border-gray-200 text-[#6e6e73] rounded-full px-5 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2">
              {refreshing ? <><div className="w-4 h-4 border-2 border-[#6e6e73] border-t-transparent rounded-full animate-spin" /> Refreshing...</> : '🔄 Refresh All Data'}
            </button>
          )}
          {hasMinRole(role, 'cmo') && (
            <button onClick={handleGenerate} disabled={generating} className="btn-primary disabled:opacity-50 flex items-center gap-2">
              {generating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> AI Processing...</>
              ) : 'Generate Report'}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map(r => (
            <div key={r.id} className="glass-card overflow-hidden cursor-pointer transition-all"
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#0071e3] font-mono font-medium">{r.period}</span>
                  <span className="text-xs text-[#86868b]">{new Date(r.generatedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold mb-3 text-[#1d1d1f]">{r.title}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#86868b]">Total Cost</p>
                    <p className="font-mono text-[#1d1d1f] font-semibold">{formatCurrency(r.summary.totalCostOfCare)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#86868b]">ER Visits</p>
                    <p className="font-mono text-[#1d1d1f]">{r.summary.erVisits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#86868b]">High Risk</p>
                    <p className="font-mono text-[#ff9f0a] font-medium">{r.summary.highRiskCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#86868b]">Admissions</p>
                    <p className="font-mono text-[#1d1d1f]">{r.summary.hospitalAdmissions}</p>
                  </div>
                </div>
              </div>
              {expanded === r.id && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                  <div>
                    <p className="text-xs text-[#86868b] uppercase tracking-wider mb-1.5 font-medium">Executive Summary</p>
                    <p className="text-sm leading-relaxed text-[#424245]">{r.summary.executiveSummary}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#86868b] uppercase tracking-wider mb-1.5 font-medium">AI Recommendations</p>
                    <ul className="space-y-1.5">
                      {r.summary.aiRecommendations?.map((rec: string, i: number) => (
                        <li key={i} className="text-sm text-[#424245] pl-3 border-l-2 border-[#5856d6]/25">{rec}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownloadPdf(r.id); }}
                    disabled={downloadingPdf === r.id}
                    className="btn-primary text-xs flex items-center gap-2"
                  >
                    {downloadingPdf === r.id ? (
                      <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Downloading...</>
                    ) : '📄 Download PDF'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
