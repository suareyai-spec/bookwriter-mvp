'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import PatientCrossProductSummary from '@/components/PatientCrossProductSummary';
import ProductBadge from '@/components/ProductBadge';

const TABS = ['Timeline', 'Summary', 'Financials', 'Clinical', 'Risk & Quality', 'Care Plans'];

interface TimelineEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  description: string;
  product: string;
  productName: string;
  productColor: string;
  productIcon: string;
  linkTo?: string;
}

export default function Patient360Page() {
  const { id } = useParams();
  const router = useRouter();
  const [tab, setTab] = useState('Timeline');
  const [crossProduct, setCrossProduct] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/patients/${id}/cross-product`).then(r => r.json()),
      fetch(`/api/patients/${id}/timeline?limit=100`).then(r => r.json()),
    ])
      .then(([cpRes, tlRes]) => {
        if (cpRes.success) setCrossProduct(cpRes.data);
        else setError('Patient not found');
        if (tlRes.success) setTimeline(tlRes.data);
      })
      .catch(() => setError('Failed to load patient data'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#86868b]">Loading Patient 360...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !crossProduct) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-xl font-semibold text-[#1d1d1f] mb-2">Patient Not Found</h1>
          <p className="text-sm text-[#86868b] mb-6">{error || 'Unable to load cross-product data for this patient.'}</p>
          <button onClick={() => router.back()} className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-sm">Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  const patient = crossProduct.patient;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => router.back()} className="text-sm text-[#0071e3] mb-2 block">← Back</button>
            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Patient 360°</h1>
            <p className="text-sm text-[#86868b] mt-1">Complete cross-product view for {patient.name}</p>
          </div>
          <Link href={`/coreiq/patients/${patient.id}`} className="px-4 py-2 rounded-xl bg-[#059669] text-white text-sm font-medium">
            Open in CoreIQ →
          </Link>
        </div>

        {/* Patient Banner */}
        <div className="bg-gradient-to-r from-[#1d1d1f] to-[#424245] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur">
              {patient.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{patient.name}</h2>
              <p className="text-white/60 text-sm">MRN: {patient.mrn} · {patient.gender} · DOB: {new Date(patient.dob).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-3">
              {crossProduct.riskEngine && (
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur text-center min-w-[80px]">
                  <p className="text-xs text-white/60">Risk Score</p>
                  <p className="text-2xl font-bold">{crossProduct.riskEngine.riskScore}</p>
                  <p className="text-xs text-white/80">{crossProduct.riskEngine.riskLevel}</p>
                </div>
              )}
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur text-center min-w-[80px]">
                <p className="text-xs text-white/60">Claims</p>
                <p className="text-2xl font-bold">{crossProduct.claimiq.totalClaims}</p>
                <p className="text-xs text-white/80">{crossProduct.claimiq.deniedCount} denied</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur text-center min-w-[80px]">
                <p className="text-xs text-white/60">Quality</p>
                <p className="text-2xl font-bold">{crossProduct.quality.gaps.length}</p>
                <p className="text-xs text-white/80">gap(s)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact cross-product cards */}
        <PatientCrossProductSummary data={crossProduct} compact />

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? 'bg-[#1d1d1f] text-white' : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'Timeline' && <TimelineTab events={timeline} />}
        {tab === 'Summary' && <PatientCrossProductSummary data={crossProduct} />}
        {tab === 'Financials' && <FinancialsTab data={crossProduct} />}
        {tab === 'Clinical' && <ClinicalTab data={crossProduct} />}
        {tab === 'Risk & Quality' && <RiskQualityTab data={crossProduct} />}
        {tab === 'Care Plans' && <CarePlansTab data={crossProduct} />}
      </div>
    </DashboardLayout>
  );
}

function TimelineTab({ events }: { events: TimelineEvent[] }) {
  const [filter, setFilter] = useState('all');
  const productTypes = Array.from(new Set(events.map(e => e.productName)));

  const filtered = filter === 'all' ? events : events.filter(e => e.productName === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === 'all' ? 'bg-[#1d1d1f] text-white' : 'bg-white border border-gray-200 text-[#86868b]'}`}>All</button>
        {productTypes.map(pt => (
          <button key={pt} onClick={() => setFilter(pt)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === pt ? 'bg-[#1d1d1f] text-white' : 'bg-white border border-gray-200 text-[#86868b]'}`}>{pt}</button>
        ))}
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-0">
          {filtered.length > 0 ? filtered.map(event => (
            <div key={event.id} className="relative flex gap-4 py-3">
              {/* Dot */}
              <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 border-2 border-white shadow-sm" style={{ backgroundColor: event.productColor + '20' }}>
                <span>{event.productIcon}</span>
              </div>
              {/* Content */}
              <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <ProductBadge name={event.productName} color={event.productColor} size="sm" />
                    <span className="text-[10px] text-[#86868b]">{new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {event.linkTo && (
                    <Link href={event.linkTo} className="text-[10px] font-medium hover:underline" style={{ color: event.productColor }}>View →</Link>
                  )}
                </div>
                <p className="text-sm font-medium text-[#1d1d1f]">{event.title}</p>
                <p className="text-xs text-[#86868b] mt-0.5">{event.description}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-sm text-[#86868b]">No timeline events found</div>
          )}
        </div>
      </div>
    </div>
  );
}

function FinancialsTab({ data }: { data: any }) {
  const claims = data.claimiq.claims || [];
  const totalCharges = claims.reduce((s: number, c: any) => s + c.charges, 0);
  const totalPaid = claims.reduce((s: number, c: any) => s + c.paidAmount, 0);
  const denied = claims.filter((c: any) => c.status === 'Denied');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Charges', value: `$${totalCharges.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: '#1d1d1f' },
          { label: 'Total Paid', value: `$${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: '#059669' },
          { label: 'Denied Claims', value: denied.length.toString(), color: '#DC2626' },
          { label: 'Pending Auths', value: data.authiq.pendingCount.toString(), color: '#0891B2' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
            <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <h3 className="font-semibold text-sm text-[#1d1d1f]">Claims History</h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-[#f5f5f7]">
            <th className="text-left py-3 px-4 text-[#86868b] font-medium text-xs">Date</th>
            <th className="text-left py-3 px-4 text-[#86868b] font-medium text-xs">Payer</th>
            <th className="text-right py-3 px-4 text-[#86868b] font-medium text-xs">Charges</th>
            <th className="text-right py-3 px-4 text-[#86868b] font-medium text-xs">Paid</th>
            <th className="text-left py-3 px-4 text-[#86868b] font-medium text-xs">Status</th>
          </tr></thead>
          <tbody>
            {claims.map((c: any) => (
              <tr key={c.id} className="border-t border-gray-50 hover:bg-[#f5f5f7]">
                <td className="py-3 px-4 text-xs">{new Date(c.dateOfService).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-xs">{c.payer}</td>
                <td className="py-3 px-4 text-xs text-right">${c.charges.toFixed(2)}</td>
                <td className="py-3 px-4 text-xs text-right">${c.paidAmount.toFixed(2)}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : c.status === 'Denied' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {claims.length === 0 && <p className="text-sm text-[#86868b] p-6 text-center">No claims data</p>}
      </div>
    </div>
  );
}

function ClinicalTab({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {/* Encounters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#1d1d1f]">Recent Encounters</h3>
          <ProductBadge name="CoreIQ" color="#059669" icon="🏥" />
        </div>
        <div className="p-4 space-y-3">
          {data.coreiq.recentEncounters.length > 0 ? data.coreiq.recentEncounters.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-[#1d1d1f]">{e.chiefComplaint}</p>
                <p className="text-xs text-[#86868b]">{e.provider} · {new Date(e.date).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${e.status === 'Signed' || e.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{e.status}</span>
            </div>
          )) : <p className="text-sm text-[#86868b] text-center py-4">No encounters</p>}
        </div>
      </div>

      {/* Medications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#1d1d1f]">Active Medications</h3>
          <ProductBadge name="CoreIQ" color="#059669" icon="💊" />
        </div>
        <div className="p-4 space-y-2">
          {data.coreiq.activePrescriptions.length > 0 ? data.coreiq.activePrescriptions.map((rx: any) => (
            <div key={rx.id} className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-sm font-medium text-[#1d1d1f]">{rx.medication}</p>
                <p className="text-xs text-[#86868b]">{rx.dosage} · {rx.frequency}</p>
              </div>
            </div>
          )) : <p className="text-sm text-[#86868b] text-center py-4">No active medications</p>}
        </div>
      </div>

      {/* RPM Vitals */}
      {data.rpm.hasDevice && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#1d1d1f]">RPM Vitals</h3>
            <ProductBadge name="RPM" color="#06B6D4" icon="📡" />
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.rpm.vitals.map((v: any, i: number) => (
              <div key={i} className={`p-3 rounded-xl ${v.status === 'High' || v.status === 'Elevated' ? 'bg-red-50' : 'bg-[#f5f5f7]'}`}>
                <p className="text-xs text-[#86868b]">{v.type}</p>
                <p className={`text-lg font-semibold ${v.status === 'High' || v.status === 'Elevated' ? 'text-red-700' : 'text-[#1d1d1f]'}`}>{v.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Behavioral Health */}
      {data.behavioralHealth.flags.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#1d1d1f]">Behavioral Health</h3>
            <ProductBadge name="Behavioral Health" color="#A855F7" icon="🧠" />
          </div>
          <div className="p-4">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
              {data.behavioralHealth.flags.map((f: string, i: number) => (
                <p key={i} className="text-xs text-purple-800 flex items-center gap-1.5 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" />{f}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RiskQualityTab({ data }: { data: any }) {
  const r = data.riskEngine;
  return (
    <div className="space-y-4">
      {r && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#1d1d1f]">Risk Profile</h3>
            <ProductBadge name="Risk Engine" color="#F59E0B" icon="⚡" />
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 rounded-xl bg-[#f5f5f7] text-center">
                <p className="text-xs text-[#86868b]">Risk Score</p>
                <p className="text-3xl font-bold" style={{ color: r.riskScore >= 70 ? '#DC2626' : r.riskScore >= 40 ? '#F59E0B' : '#10B981' }}>{r.riskScore}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#f5f5f7] text-center">
                <p className="text-xs text-[#86868b]">MRA</p>
                <p className="text-xl font-bold text-[#1d1d1f]">{r.mraScore.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#f5f5f7] text-center">
                <p className="text-xs text-[#86868b]">30-Day Risk</p>
                <p className="text-xl font-bold text-[#1d1d1f]">{(r.predictiveRisk30 * 100).toFixed(0)}%</p>
              </div>
              <div className="p-3 rounded-xl bg-[#f5f5f7] text-center">
                <p className="text-xs text-[#86868b]">90-Day Risk</p>
                <p className="text-xl font-bold text-[#1d1d1f]">{(r.predictiveRisk90 * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {r.conditions.split(',').map((c: string) => (
                <span key={c} className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs">{c.trim()}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#1d1d1f]">Quality Gaps</h3>
          <ProductBadge name="Quality" color="#10B981" icon="✅" />
        </div>
        <div className="p-5">
          {data.quality.gaps.length > 0 ? data.quality.gaps.map((g: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-[#1d1d1f]">{g.measure}</p>
                <p className="text-xs text-[#86868b]">Due: {new Date(g.dueDate).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${g.status === 'Overdue' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>{g.status}</span>
            </div>
          )) : <p className="text-sm text-[#86868b] text-center py-4">No quality gaps</p>}
        </div>
      </div>
    </div>
  );
}

function CarePlansTab({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#1d1d1f]">Active Care Plans</h3>
          <ProductBadge name="Care Management" color="#EC4899" icon="💗" />
        </div>
        <div className="p-5">
          {data.careManagement.carePlans.length > 0 ? data.careManagement.carePlans.map((cp: any) => (
            <div key={cp.id} className="p-4 rounded-xl bg-pink-50/50 border border-pink-100 mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-[#1d1d1f]">{cp.program} Care Plan</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">{cp.status}</span>
              </div>
              <p className="text-xs text-[#86868b] mb-3">Started: {new Date(cp.startDate).toLocaleDateString()} · Next Review: {new Date(cp.nextReview).toLocaleDateString()}</p>
              <div className="space-y-2">
                {cp.goals.map((g: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded border border-pink-300 flex items-center justify-center text-pink-500 text-xs">
                      {i === 0 ? '✓' : '○'}
                    </div>
                    <span className={i === 0 ? 'line-through text-[#86868b]' : 'text-[#1d1d1f]'}>{g}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Link href="/care-management/care-plans" className="text-xs font-medium px-3 py-1.5 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors">
                  View in Care Management →
                </Link>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">💗</p>
              <p className="text-sm text-[#86868b]">No active care plans</p>
              <Link href="/care-management/care-plans" className="text-xs text-pink-600 font-medium mt-2 inline-block">Create Care Plan →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Prior Auths section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#1d1d1f]">Prior Authorizations</h3>
          <ProductBadge name="AuthIQ" color="#0891B2" icon="🔐" />
        </div>
        <div className="p-5">
          {data.authiq.priorAuths.length > 0 ? data.authiq.priorAuths.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-[#1d1d1f]">{a.procedure}</p>
                <p className="text-xs text-[#86868b]">{a.payer} · {a.urgency}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : a.status === 'Denied' ? 'bg-red-50 text-red-700' : 'bg-cyan-50 text-cyan-700'}`}>{a.status}</span>
            </div>
          )) : <p className="text-sm text-[#86868b] text-center py-4">No prior authorizations</p>}
        </div>
      </div>
    </div>
  );
}
