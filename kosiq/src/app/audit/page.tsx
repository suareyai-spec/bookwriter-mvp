'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';

const ACTION_COLORS: Record<string, string> = {
  view: 'bg-gray-100 text-[#86868b]',
  export: 'bg-[#0071e3]/10 text-[#0071e3]',
  generate: 'bg-[#34c759]/10 text-[#34c759]',
  upload: 'bg-[#ff9f0a]/10 text-[#ff9f0a]',
  login: 'bg-[#af52de]/10 text-[#af52de]',
  update: 'bg-[#5856d6]/10 text-[#5856d6]',
  create: 'bg-[#34c759]/10 text-[#34c759]',
  delete: 'bg-[#ff3b30]/10 text-[#ff3b30]',
};

interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '50');
    if (actionFilter) params.set('action', actionFilter);
    if (userFilter) params.set('user', userFilter);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    fetch(`/api/audit?${params}`, { credentials: 'include' })
      .then(r => { if (r.status === 401) { window.location.href = '/auth/login?expired=1'; return null; } return r.json(); })
      .then(d => { if (d) { setLogs(d.logs || []); setTotal(d.total || 0); setLoading(false); } });
  };

  useEffect(() => { fetchLogs(); }, [page, actionFilter, userFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(total / 50);
  const inputClass = "bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0071e3] text-[#1d1d1f]";

  function getActionColor(action: string) {
    const key = Object.keys(ACTION_COLORS).find(k => action.toLowerCase().includes(k));
    return ACTION_COLORS[key || ''] || ACTION_COLORS.view;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Audit Log</h1>
        <p className="text-base text-[#86868b] mt-1">System activity and access history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} className={inputClass}>
          <option value="">All Actions</option>
          {['login', 'view', 'export', 'generate', 'upload', 'update', 'create', 'delete'].map(a => (
            <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
          ))}
        </select>
        <input type="text" placeholder="Filter by user..." value={userFilter}
          onChange={e => { setUserFilter(e.target.value); setPage(1); }} className={`${inputClass} w-48`} />
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className={inputClass} />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className={inputClass} />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th><th>User</th><th>Action</th><th>Resource</th><th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-[#86868b] py-8">No audit logs found</td></tr>
                  ) : logs.map(log => (
                    <tr key={log.id}>
                      <td className="text-xs text-[#424245] whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="text-sm text-[#1d1d1f] font-medium">{log.userName}</td>
                      <td>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="text-xs text-[#86868b]">{log.resource || '—'}</td>
                      <td className="text-xs font-mono text-[#86868b]">{log.ipAddress || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <p className="text-xs text-[#86868b]">Page {page} of {totalPages} ({total} entries)</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-30 hover:bg-gray-50">
                    Previous
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-30 hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
