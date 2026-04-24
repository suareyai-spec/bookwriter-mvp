'use client';
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import PatientSearchInput from '@/components/PatientSearchInput';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ACCENT = '#059669';
const CLAIM_STATUSES = ['Draft', 'Submitted', 'Accepted', 'Denied', 'Paid'];
const COLORS = ['#86868b', '#3B82F6', '#F59E0B', '#EF4444', '#059669'];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-600', Submitted: 'bg-blue-50 text-blue-700',
    Accepted: 'bg-yellow-50 text-yellow-700', Denied: 'bg-red-50 text-red-700', Paid: 'bg-emerald-50 text-emerald-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

export default function BillingPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showDetail, setShowDetail] = useState<any>(null);
  const [sortCol, setSortCol] = useState('dateOfService');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { showToast } = useToast();

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterStatus) params.set('status', filterStatus);
    fetch(`/api/coreiq/claims?${params}`).then(r => r.json()).then(setClaims);
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const filtered = useMemo(() => {
    return [...claims].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [claims, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const parseJSON = (s: string | null) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };

  // Revenue stats
  const totalCharged = claims.reduce((s, c) => s + c.totalCharge, 0);
  const totalPaid = claims.reduce((s, c) => s + c.paidAmount, 0);
  const totalDenied = claims.filter(c => c.status === 'Denied').reduce((s, c) => s + c.totalCharge, 0);
  const collectionRate = totalCharged > 0 ? (totalPaid / totalCharged * 100) : 0;

  // Status distribution
  const statusCounts: Record<string, { count: number; total: number }> = {};
  claims.forEach(c => {
    if (!statusCounts[c.status]) statusCounts[c.status] = { count: 0, total: 0 };
    statusCounts[c.status].count++;
    statusCounts[c.status].total += c.totalCharge;
  });
  const pieData = Object.entries(statusCounts).map(([name, v]) => ({ name, value: v.count }));

  // Aging report
  const now = Date.now();
  const aging = { '0-30': 0, '31-60': 0, '61-90': 0, '91-120': 0, '120+': 0 };
  claims.filter(c => c.status !== 'Paid' && c.status !== 'Denied').forEach(c => {
    const days = Math.floor((now - new Date(c.dateOfService).getTime()) / (24 * 60 * 60 * 1000));
    if (days <= 30) aging['0-30'] += c.totalCharge - c.paidAmount;
    else if (days <= 60) aging['31-60'] += c.totalCharge - c.paidAmount;
    else if (days <= 90) aging['61-90'] += c.totalCharge - c.paidAmount;
    else if (days <= 120) aging['91-120'] += c.totalCharge - c.paidAmount;
    else aging['120+'] += c.totalCharge - c.paidAmount;
  });
  const agingData = Object.entries(aging).map(([name, value]) => ({ name, value: +value.toFixed(2) }));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Billing & Claims</h1>

        {/* Revenue Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm" style={{ borderLeft: `3px solid ${ACCENT}` }}>
            <p className="text-xs text-[#86868b] uppercase tracking-wider">Total Charged</p>
            <p className="text-2xl font-bold mt-1" style={{ color: ACCENT }}>${totalCharged.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm" style={{ borderLeft: '3px solid #3B82F6' }}>
            <p className="text-xs text-[#86868b] uppercase tracking-wider">Total Collected</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm" style={{ borderLeft: '3px solid #EF4444' }}>
            <p className="text-xs text-[#86868b] uppercase tracking-wider">Total Denied</p>
            <p className="text-2xl font-bold mt-1 text-red-500">${totalDenied.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm" style={{ borderLeft: '3px solid #F59E0B' }}>
            <p className="text-xs text-[#86868b] uppercase tracking-wider">Collection Rate</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{collectionRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Claims by Status</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Aging Report (A/R Outstanding)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={agingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
          <PatientSearchInput
            filterMode
            onSelect={(p) => setSearch(`${p.lastName}, ${p.firstName}`)}
            onInputChange={(v) => setSearch(v)}
            placeholder="Search patient, payer..."
            className="w-64"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
            <option value="">All Statuses</option>
            {CLAIM_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f7]">
                  {[{ key: 'dateOfService', label: 'DOS' }, { key: 'patient', label: 'Patient' }, { key: 'payer', label: 'Payer' }, { key: 'totalCharge', label: 'Charge' }, { key: 'paidAmount', label: 'Paid' }, { key: 'patientBalance', label: 'Balance' }, { key: 'status', label: 'Status' }].map(c => (
                    <th key={c.key} onClick={() => toggleSort(c.key)} className="text-left py-3 px-4 text-[#86868b] font-medium cursor-pointer hover:text-[#1d1d1f] text-xs">
                      {c.label} {sortCol === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map(c => (
                  <tr key={c.id} onClick={() => setShowDetail(c)} className="border-t border-gray-50 hover:bg-[#f5f5f7] cursor-pointer">
                    <td className="py-3 px-4">{new Date(c.dateOfService).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium">{c.patient?.lastName}, {c.patient?.firstName}</td>
                    <td className="py-3 px-4 text-xs">{c.payer}</td>
                    <td className="py-3 px-4 text-right">${c.totalCharge.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${c.paidAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${c.patientBalance.toFixed(2)}</td>
                    <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs text-[#86868b] border-t border-gray-100">{filtered.length} claims</div>
        </div>

        {/* Detail Modal */}
        <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Claim Details" width="max-w-2xl">
          {showDetail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{showDetail.patient?.lastName}, {showDetail.patient?.firstName}</p>
                  <p className="text-sm text-[#86868b]">DOS: {new Date(showDetail.dateOfService).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={showDetail.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-[#86868b]">Payer</p><p className="font-medium">{showDetail.payer}</p></div>
                <div><p className="text-xs text-[#86868b]">Claim ID</p><p className="font-medium">{showDetail.payerClaimId || 'N/A'}</p></div>
                <div><p className="text-xs text-[#86868b]">Total Charge</p><p className="font-medium">${showDetail.totalCharge.toFixed(2)}</p></div>
                <div><p className="text-xs text-[#86868b]">Paid Amount</p><p className="font-medium text-emerald-600">${showDetail.paidAmount.toFixed(2)}</p></div>
                <div><p className="text-xs text-[#86868b]">Adjustments</p><p className="font-medium">${showDetail.adjustments.toFixed(2)}</p></div>
                <div><p className="text-xs text-[#86868b]">Patient Balance</p><p className="font-medium text-red-600">${showDetail.patientBalance.toFixed(2)}</p></div>
              </div>

              {/* Diagnoses */}
              {showDetail.diagnoses && (() => {
                const dx = parseJSON(showDetail.diagnoses);
                return dx?.length ? (
                  <div>
                    <p className="text-xs text-[#86868b] font-medium mb-1">Diagnoses</p>
                    {dx.map((d: any, i: number) => <p key={i} className="text-sm"><span className="font-mono" style={{ color: ACCENT }}>{d.code}</span> — {d.desc}</p>)}
                  </div>
                ) : null;
              })()}

              {/* Procedures */}
              {showDetail.procedures && (() => {
                const px = parseJSON(showDetail.procedures);
                return px?.length ? (
                  <div>
                    <p className="text-xs text-[#86868b] font-medium mb-1">Procedures</p>
                    {px.map((p: any, i: number) => <p key={i} className="text-sm"><span className="font-mono" style={{ color: ACCENT }}>{p.code}</span> — {p.desc} (${p.charge})</p>)}
                  </div>
                ) : null;
              })()}

              <div className="flex gap-2 pt-2">
                {showDetail.status === 'Draft' && (
                  <button onClick={async () => {
                    await fetch(`/api/coreiq/claims/${showDetail.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Submitted', submittedDate: new Date() }) });
                    showToast('Claim submitted'); setShowDetail(null); load();
                  }} className="px-3 py-1.5 rounded-xl text-white text-sm" style={{ background: ACCENT }}>Submit Claim</button>
                )}
                {showDetail.status === 'Denied' && (
                  <button onClick={async () => {
                    await fetch(`/api/coreiq/claims/${showDetail.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Submitted' }) });
                    showToast('Claim resubmitted'); setShowDetail(null); load();
                  }} className="px-3 py-1.5 rounded-xl text-white text-sm bg-blue-600">Resubmit</button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
