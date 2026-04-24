'use client';

import DashboardLayout from '@/components/DashboardLayout';
import MetricCard from '@/components/MetricCard';
import PatientDrillDown from '@/components/PatientDrillDown';
import ProductBadge from '@/components/ProductBadge';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const PAYERS = ['All', 'Simply Health', 'Sunshine Health', 'Humana', 'Aetna Better Health', 'Molina', 'WellCare'];
const ORGS = ['All', 'KOSIQ Health Network', 'South Florida Medical Group'];
const LOCATIONS = ['All', 'Miami-Dade', 'Broward', 'Palm Beach'];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  const [payer, setPayer] = useState('All');
  const [org, setOrg] = useState('All');
  const [location, setLocation] = useState('All');
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchData = () => {
    const params = new URLSearchParams();
    if (payer !== 'All') params.set('payer', payer);
    if (period) params.set('period', period);
    fetch(`/api/dashboard?${params}`, { credentials: 'include' })
      .then(r => { if (r.status === 401) { window.location.href = '/auth/login?expired=1'; return null; } return r.json(); })
      .then(d => { if (d) setData(d); });
  };

  useEffect(() => { fetchData(); }, [payer, period]);

  if (!data) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#86868b] text-sm">Loading AtlasIQ Dashboard...</p>
        </div>
      </div>
    </DashboardLayout>
  );

  const ac = data.actionCenter;
  const fmtCurrency = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toLocaleString()}`;
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">AtlasIQ Dashboard</h1>
        <p className="text-sm text-[#86868b] mt-1">Population health & cost intelligence</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 mb-8 flex flex-wrap items-end gap-6">
        <FilterSelect label="Organization" value={org} onChange={setOrg} options={ORGS} />
        <FilterSelect label="Location" value={location} onChange={setLocation} options={LOCATIONS} />
        <FilterSelect label="Health Plan" value={payer} onChange={setPayer} options={PAYERS} />
        <div>
          <label className="text-[10px] text-[#86868b] uppercase tracking-wider font-semibold block mb-1">Period</label>
          <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-[#1d1d1f] focus:ring-1 focus:ring-[#0071e3]/30 outline-none" />
        </div>
      </div>

      {/* Membership Overview */}
      <Section title="Membership Overview" icon="◉">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard title="Total Enrolled Members" value={ac.membership.totalEnrolled.value} previousValue={ac.membership.totalEnrolled.previous} format="number" color="blue" icon="👥" onClick={() => setDrillDown({ label: 'Total Enrolled Members', count: ac.membership.totalEnrolled.value })} />
          <MetricCard title="Missing Contact Info" value={ac.membership.missingContact.value} previousValue={ac.membership.missingContact.previous} format="number" color="red" icon="📱" onClick={() => setDrillDown({ label: 'Missing Contact Info', count: ac.membership.missingContact.value })} />
          <MetricCard title="Unassigned PCP" value={ac.membership.unassignedPcp.value} previousValue={ac.membership.unassignedPcp.previous} format="number" color="red" icon="🩺" onClick={() => setDrillDown({ label: 'Unassigned PCP', count: ac.membership.unassignedPcp.value })} />
          <MetricCard title="Out of Network" value={ac.membership.outOfNetwork.value} previousValue={ac.membership.outOfNetwork.previous} format="number" color="orange" icon="🌐" onClick={() => setDrillDown({ label: 'Out of Network', count: ac.membership.outOfNetwork.value })} />
          <MetricCard title="New Enrollees (This Month)" value={ac.membership.newEnrollees.value} previousValue={ac.membership.newEnrollees.previous} format="number" color="green" icon="➕" onClick={() => setDrillDown({ label: 'New Enrollees', count: ac.membership.newEnrollees.value })} />
          <MetricCard title="Disenrolled (This Month)" value={ac.membership.disenrolled.value} previousValue={ac.membership.disenrolled.previous} format="number" color="red" icon="➖" onClick={() => setDrillDown({ label: 'Disenrolled Members', count: ac.membership.disenrolled.value })} />
        </div>
      </Section>

      {/* Clinical Alerts — Dr. J.D. */}
      <Section title="Clinical Alerts (Dr. J.D. Suarez)" icon="🚨">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="SMI Program Candidates" value={ac.clinicalAlerts?.smi?.value ?? 34} previousValue={ac.clinicalAlerts?.smi?.previous ?? 38} format="number" color="red" icon="🧠" onClick={() => setDrillDown({ label: 'SMI Program Candidates', count: ac.clinicalAlerts?.smi?.value ?? 34 })} />
          <MetricCard title="HIV — Not in Clear Choice" value={ac.clinicalAlerts?.hiv?.value ?? 8} previousValue={ac.clinicalAlerts?.hiv?.previous ?? 11} format="number" color="red" icon="🔬" onClick={() => setDrillDown({ label: 'HIV — Not in Clear Choice', count: ac.clinicalAlerts?.hiv?.value ?? 8 })} />
          <MetricCard title="ESRD — Unmatched Insurance" value={ac.clinicalAlerts?.esrd?.value ?? 5} previousValue={ac.clinicalAlerts?.esrd?.previous ?? 7} format="number" color="red" icon="🫘" onClick={() => setDrillDown({ label: 'ESRD — Unmatched Insurance', count: ac.clinicalAlerts?.esrd?.value ?? 5 })} />
          <MetricCard title="CKD 3b/4 — Early Intervention" value={ac.clinicalAlerts?.ckd?.value ?? 19} previousValue={ac.clinicalAlerts?.ckd?.previous ?? 15} format="number" color="orange" icon="⚕️" onClick={() => setDrillDown({ label: 'CKD 3b/4 — Early Intervention', count: ac.clinicalAlerts?.ckd?.value ?? 19 })} />
          <MetricCard title="HbA1c > 9 — Aggressive Therapy" value={ac.clinicalAlerts?.hba1c?.value ?? 42} previousValue={ac.clinicalAlerts?.hba1c?.previous ?? 48} format="number" color="red" icon="🩸" onClick={() => setDrillDown({ label: 'HbA1c > 9 — Aggressive Therapy', count: ac.clinicalAlerts?.hba1c?.value ?? 42 })} />
          <MetricCard title="Asthma/COPD Frequent Hospitalizers" value={ac.clinicalAlerts?.asthmaCopd?.value ?? 28} previousValue={ac.clinicalAlerts?.asthmaCopd?.previous ?? 33} format="number" color="orange" icon="🫁" onClick={() => setDrillDown({ label: 'Asthma/COPD Frequent Hospitalizers', count: ac.clinicalAlerts?.asthmaCopd?.value ?? 28 })} />
          <MetricCard title="Unengaged Members (No PCP Visit)" value={ac.clinicalAlerts?.unengaged?.value ?? 200} previousValue={ac.clinicalAlerts?.unengaged?.previous ?? 212} format="number" color="red" icon="🚷" onClick={() => setDrillDown({ label: 'Unengaged Members (No PCP Visit)', count: ac.clinicalAlerts?.unengaged?.value ?? 200 })} />
          <MetricCard title="Age-Provider Mismatch" value={ac.clinicalAlerts?.ageMismatch?.value ?? 14} previousValue={ac.clinicalAlerts?.ageMismatch?.previous ?? 22} format="number" color="orange" icon="⚠️" onClick={() => setDrillDown({ label: 'Age-Provider Mismatch', count: ac.clinicalAlerts?.ageMismatch?.value ?? 14 })} />
        </div>
      </Section>

      {/* Risk Stratification */}
      <Section title="Risk Stratification" icon="⚠">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Critical Risk (>80)" value={ac.riskStratification.critical.value} previousValue={ac.riskStratification.critical.previous} format="number" color="red" icon="🔴" onClick={() => setDrillDown({ label: 'Critical Risk (>80)', count: ac.riskStratification.critical.value })} />
          <MetricCard title="High Risk (60-80)" value={ac.riskStratification.high.value} previousValue={ac.riskStratification.high.previous} format="number" color="orange" icon="🟠" onClick={() => setDrillDown({ label: 'High Risk (60-80)', count: ac.riskStratification.high.value })} />
          <MetricCard title="Moderate Risk (30-60)" value={ac.riskStratification.moderate.value} previousValue={ac.riskStratification.moderate.previous} format="number" color="yellow" icon="🟡" onClick={() => setDrillDown({ label: 'Moderate Risk (30-60)', count: ac.riskStratification.moderate.value })} />
          <MetricCard title="Low Risk (<30)" value={ac.riskStratification.low.value} previousValue={ac.riskStratification.low.previous} format="number" color="green" icon="🟢" onClick={() => setDrillDown({ label: 'Low Risk (<30)', count: ac.riskStratification.low.value })} />
        </div>
      </Section>

      {/* Cost Metrics */}
      <Section title="Cost Metrics (Current Month)" icon="💰">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard title="Total Medical Spend" value={fmtCurrency(ac.costMetrics.totalSpend.value)} previousValue={ac.costMetrics.totalSpend.previous} format="currency" color="blue" icon="💵" />
          <MetricCard title="PMPM" value={fmtCurrency(ac.costMetrics.pmpm.value)} previousValue={ac.costMetrics.pmpm.previous} format="currency" color="blue" icon="📊" />
          <MetricCard title={`Inpatient Costs (${ac.costMetrics.inpatientCost.pctOfTotal}% of total)`} value={fmtCurrency(ac.costMetrics.inpatientCost.value)} previousValue={ac.costMetrics.inpatientCost.previous} format="currency" color="purple" icon="🏥" />
          <MetricCard title={`ER Visits (${ac.costMetrics.erVisits.value} visits)`} value={fmtCurrency(ac.costMetrics.erVisits.cost)} previousValue={ac.costMetrics.erVisits.prevCost} format="currency" color="red" icon="🚑" />
          <MetricCard title="Pharmacy Costs" value={fmtCurrency(ac.costMetrics.pharmacyCost.value)} previousValue={ac.costMetrics.pharmacyCost.previous} format="currency" color="blue" icon="💊" />
          <MetricCard title="Specialist Referral Costs" value={fmtCurrency(ac.costMetrics.specialistCost.value)} previousValue={ac.costMetrics.specialistCost.previous} format="currency" color="blue" icon="↗" />
        </div>
      </Section>

      {/* Hospitalization */}
      <Section title="Hospitalization" icon="🏥">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard title="Admissions This Month" value={ac.hospitalization.admissions.value} previousValue={ac.hospitalization.admissions.previous} format="number" color="blue" icon="🛏" onClick={() => setDrillDown({ label: 'Admissions This Month', count: ac.hospitalization.admissions.value })} />
          <MetricCard title={`Readmissions 30-day (${ac.hospitalization.readmissions.rate}%)`} value={ac.hospitalization.readmissions.value} previousValue={ac.hospitalization.readmissions.previous} format="number" color="red" icon="🔁" onClick={() => setDrillDown({ label: 'Readmissions 30-day', count: ac.hospitalization.readmissions.value })} />
          <MetricCard title="Average Length of Stay" value={`${ac.hospitalization.avgLos.value} days`} previousValue={ac.hospitalization.avgLos.previous} format="number" color="blue" icon="📅" />
        </div>
      </Section>

      {/* Claims Alerts */}
      <Section title="Claims Alerts" icon="📄">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard title="Claims Pending Review" value={ac.claimsAlerts.pending.value} previousValue={ac.claimsAlerts.pending.previous} format="number" color="orange" icon="⏳" />
          <MetricCard title="High-Cost Claims (>$50K)" value={ac.claimsAlerts.highCost.value} previousValue={ac.claimsAlerts.highCost.previous} format="number" color="blue" icon="💰" />
          <MetricCard title={`Denied Claims (${ac.claimsAlerts.denied.rate}% rate)`} value={ac.claimsAlerts.denied.value} previousValue={ac.claimsAlerts.denied.previous} format="number" color="red" icon="❌" />
        </div>
      </Section>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#26acf7" />

      {/* Cross-Product Widgets */}
      <PlatformActivityWidget />
    </DashboardLayout>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-[10px] text-[#86868b] uppercase tracking-wider font-semibold block mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-[#1d1d1f] focus:ring-1 focus:ring-[#0071e3]/30 outline-none">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function PlatformActivityWidget() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/platform-activity?limit=15')
      .then(r => r.json())
      .then(res => { if (res.success) setData(res.data); })
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Platform Activity Feed */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <h3 className="font-semibold text-[#1d1d1f] flex items-center gap-2">
            <span>🔄</span> Platform Activity
          </h3>
          <p className="text-xs text-[#86868b] mt-0.5">Recent actions across all products</p>
        </div>
        <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
          {data.activities?.map((a: any) => (
            <div key={a.id} className="px-5 py-3 hover:bg-[#f5f5f7] transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg flex-shrink-0">{a.productIcon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <ProductBadge name={a.productName} color={a.productColor} size="sm" />
                    <span className="text-[10px] text-[#86868b]">{new Date(a.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-[#1d1d1f] truncate">{a.action}</p>
                  <p className="text-xs text-[#86868b] truncate">{a.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Product Insights */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <h3 className="font-semibold text-[#1d1d1f] flex items-center gap-2">
            <span>💡</span> Cross-Product Insights
          </h3>
          <p className="text-xs text-[#86868b] mt-0.5">Actionable connections across products</p>
        </div>
        <div className="p-4 space-y-3">
          {data.insights?.map((insight: any, i: number) => (
            <Link key={i} href={insight.linkTo} className="block p-3 rounded-xl border border-gray-100 hover:shadow-sm hover:border-gray-200 transition-all">
              <div className="flex items-start gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                  insight.severity === 'critical' ? 'bg-red-500' : insight.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`}>
                  {insight.count}
                </span>
                <p className="text-xs text-[#1d1d1f] leading-relaxed">{insight.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
