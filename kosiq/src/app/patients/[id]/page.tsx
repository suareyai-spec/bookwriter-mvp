'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RISK_COLORS: Record<string, string> = { Low: '#34c759', Medium: '#ff9f0a', High: '#ff6482', Critical: '#ff3b30' };
const COLORS = ['#0071e3', '#5856d6', '#af52de', '#64d2ff', '#34c759', '#ff9f0a', '#ff6482', '#e879f9'];

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

const tooltipStyle = { background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };

export default function PatientDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [recalculating, setRecalculating] = useState(false);

  const fetchData = () => {
    fetch(`/api/patients/${id}`, { credentials: 'include' })
      .then(r => { if (r.status === 401) { window.location.href = '/auth/login?expired=1'; return null; } return r.json(); })
      .then(d => { if (d) setData(d); });
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRecalculateRisk = async () => {
    setRecalculating(true);
    try {
      const res = await fetch('/api/ai/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: id }),
        credentials: 'include',
      });
      if (res.status === 401) { window.location.href = '/auth/login?expired=1'; return; }
      if (res.ok) fetchData();
    } catch {} finally { setRecalculating(false); }
  };

  if (!data) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-12 h-12 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const { patient, costTimeline, costByCategory, insights, claims, ensEvents, riskScores } = data;

  // Parse risk factors from the latest risk score
  let riskFactors: string[] = [];
  if (riskScores && riskScores.length > 0) {
    try {
      const factors = JSON.parse(riskScores[0].factors);
      riskFactors = Array.isArray(factors) ? factors : [];
    } catch { riskFactors = []; }
  }

  return (
    <DashboardLayout>
      <Link href="/patients" className="text-sm text-[#0071e3] hover:text-[#0077ed] mb-4 inline-block font-medium">← Back to Patients</Link>

      {/* Demographics */}
      <div className="glass-card p-7 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">{patient.firstName} {patient.lastName}</h1>
            <p className="text-sm text-[#86868b] mt-1">{patient.externalId}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: `${RISK_COLORS[patient.riskLevel]}12`, border: `1px solid ${RISK_COLORS[patient.riskLevel]}25` }}>
            <div className="w-3 h-3 rounded-full" style={{ background: RISK_COLORS[patient.riskLevel] }} />
            <span className="font-mono font-semibold" style={{ color: RISK_COLORS[patient.riskLevel] }}>Risk: {patient.riskScore}</span>
            <span className="text-xs text-[#86868b]">({patient.riskLevel})</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {[
            ['DOB', new Date(patient.dob).toLocaleDateString()],
            ['Gender', patient.gender === 'M' ? 'Male' : 'Female'],
            ['Payer', patient.primaryPayer],
            ['PCP', patient.pcpName],
            ['Total Cost', formatCurrency(patient.totalCost)],
          ].map(([label, value], i) => (
            <div key={i}>
              <p className="text-xs text-[#86868b] uppercase tracking-wider font-medium">{label}</p>
              <p className="text-sm font-medium mt-1 text-[#1d1d1f]">{value}</p>
            </div>
          ))}
        </div>
        {patient.conditions.length > 0 && (
          <div className="mt-5">
            <p className="text-xs text-[#86868b] uppercase tracking-wider mb-2 font-medium">Conditions</p>
            <div className="flex flex-wrap gap-2">
              {patient.conditions.map((c: string, i: number) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs bg-[#5856d6]/8 border border-[#5856d6]/15 text-[#5856d6] font-medium">{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk Score Section */}
      <div className="glass-card p-7 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">Risk Assessment</h3>
          <button onClick={handleRecalculateRisk} disabled={recalculating}
            className="btn-primary text-xs disabled:opacity-50 flex items-center gap-2">
            {recalculating ? (
              <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Recalculating...</>
            ) : '🔄 Recalculate Risk'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Risk */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: `${RISK_COLORS[patient.riskLevel]}15` }}>
                <span className="text-3xl font-bold font-mono" style={{ color: RISK_COLORS[patient.riskLevel] }}>{patient.riskScore}</span>
              </div>
              <div>
                <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: `${RISK_COLORS[patient.riskLevel]}15`, color: RISK_COLORS[patient.riskLevel] }}>
                  {patient.riskLevel} Risk
                </span>
                <p className="text-xs text-[#86868b] mt-2">
                  {riskScores && riskScores.length > 0 ? `Last calculated: ${new Date(riskScores[0].calculatedAt).toLocaleDateString()}` : 'No risk scores available'}
                </p>
              </div>
            </div>

            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <div>
                <p className="text-xs text-[#86868b] uppercase tracking-wider mb-2 font-medium">Risk Factors</p>
                <div className="space-y-1.5">
                  {riskFactors.map((f: string, i: number) => (
                    <div key={i} className="text-sm text-[#424245] pl-3 border-l-2 border-[#ff9f0a]/30">{f}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Historical Risk Scores */}
          {riskScores && riskScores.length > 1 && (
            <div>
              <p className="text-xs text-[#86868b] uppercase tracking-wider mb-3 font-medium">Risk Score History</p>
              <div className="space-y-2">
                {riskScores.slice(0, 10).map((rs: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: RISK_COLORS[rs.level] }} />
                      <span className="font-mono font-medium text-sm" style={{ color: RISK_COLORS[rs.level] }}>{rs.score}</span>
                      <span className="text-xs text-[#86868b]">{rs.level}</span>
                    </div>
                    <span className="text-xs text-[#86868b]">{new Date(rs.calculatedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-5 text-[#6e6e73] uppercase tracking-wider">12-Month Cost Timeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={costTimeline}>
              <defs>
                <linearGradient id="ptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0071e3" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fill: '#86868b', fontSize: 11 }} tickFormatter={v => v.split('-')[1]} />
              <YAxis tick={{ fill: '#86868b', fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="total" stroke="#0071e3" fill="url(#ptGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-5 text-[#6e6e73] uppercase tracking-wider">Cost by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#86868b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#86868b', fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {costByCategory?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="glass-card p-7 mb-6 border-l-3 border-l-[#5856d6]">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <span className="text-[#5856d6]">🧠</span>
          <span className="text-[#6e6e73] uppercase tracking-wider">AI Clinical Insights</span>
        </h3>
        <div className="space-y-3">
          {insights?.map((insight: string, i: number) => (
            <p key={i} className="text-sm text-[#424245] leading-relaxed pl-4 border-l-2 border-[#5856d6]/20">{insight}</p>
          ))}
        </div>
      </div>

      {/* Claims History */}
      <div className="glass-card overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">Claims History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>Type</th><th>Provider</th><th>Amount</th><th>Status</th><th>Dx Code</th>
              </tr>
            </thead>
            <tbody>
              {claims?.slice(0, 20).map((c: any) => (
                <tr key={c.id}>
                  <td className="text-xs text-[#424245]">{new Date(c.date).toLocaleDateString()}</td>
                  <td><span className="text-xs px-2 py-0.5 rounded-md bg-[#f5f5f7] text-[#424245] font-medium">{c.type}</span></td>
                  <td className="text-xs text-[#424245]">{c.provider}</td>
                  <td className="font-mono text-sm text-[#1d1d1f]">${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td><span className={`text-xs font-medium ${c.status === 'paid' ? 'text-[#34c759]' : c.status === 'denied' ? 'text-[#ff3b30]' : 'text-[#ff9f0a]'}`}>{c.status}</span></td>
                  <td className="text-xs font-mono text-[#86868b]">{c.diagnosis || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ENS Events */}
      {ensEvents && ensEvents.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">ER/Hospital Admissions</h3>
          </div>
          <div className="p-5 space-y-3">
            {ensEvents.map((e: any) => (
              <div key={e.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#f5f5f7]">
                <div className={`w-2 h-2 rounded-full ${e.status === 'Active' ? 'bg-[#ff3b30] animate-pulse' : 'bg-[#86868b]'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1d1d1f]">{e.hospital} — <span className="text-[#0071e3]">{e.type}</span></p>
                  <p className="text-xs text-[#86868b]">{e.diagnosis} • {new Date(e.admitDate).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${e.status === 'Active' ? 'bg-[#ff3b30]/10 text-[#ff3b30]' : 'bg-gray-100 text-[#86868b]'}`}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
