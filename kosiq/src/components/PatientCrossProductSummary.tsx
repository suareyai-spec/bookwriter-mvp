'use client';
import { useState } from 'react';
import Link from 'next/link';
import ProductBadge from './ProductBadge';

interface CrossProductData {
  patient: { id: string; name: string; mrn: string; dob: string; gender: string; status: string };
  coreiq: {
    recentEncounters: Array<{ id: string; date: string; chiefComplaint: string; provider: string; status: string }>;
    activePrescriptions: Array<{ id: string; medication: string; dosage: string; frequency: string; status: string }>;
    pendingLabs: Array<{ id: string; tests: string; orderDate: string; status: string }>;
    completedLabs: Array<{ id: string; tests: string; orderDate: string; results: string | null }>;
  };
  riskEngine: { riskScore: number; riskLevel: string; conditions: string; mraScore: number; predictiveRisk30: number; predictiveRisk60: number; predictiveRisk90: number; latestScore: { score: number; level: string } | null } | null;
  quality: { gaps: Array<{ measure: string; status: string; dueDate: string }> };
  careManagement: { carePlans: Array<{ id: string; program: string; status: string; startDate: string; goals: string[]; nextReview: string }> };
  claimiq: { claims: Array<{ id: string; dateOfService: string; charges: number; payer: string; status: string; denialReason: string | null; paidAmount: number }>; totalClaims: number; deniedCount: number };
  authiq: { priorAuths: Array<{ id: string; procedure: string; payer: string; status: string; urgency: string; submitDate: string; authNumber: string | null }>; pendingCount: number };
  rpm: { vitals: Array<{ type: string; value: string; date: string; status: string }>; hasDevice: boolean };
  behavioralHealth: { screenings: Array<{ type: string; score: number; severity: string; date: string }>; flags: string[] };
  compliance: { notes: Array<{ id: string; type: string; severity: string; status: string }> };
  fraud: { alerts: Array<{ id: string; alertType: string; severity: string; status: string }> };
  hospitalizations: { events: Array<{ id: string; facility: string; admitDate: string; dischargeDate: string | null; diagnosis: string; eventType: string }> } | null;
}

const SECTIONS = [
  { key: 'emr', label: 'EMR Summary', product: 'CoreIQ', color: '#059669', icon: '🏥' },
  { key: 'risk', label: 'Risk Score', product: 'Risk Engine', color: '#F59E0B', icon: '⚡' },
  { key: 'quality', label: 'Quality Gaps', product: 'Quality', color: '#10B981', icon: '✅' },
  { key: 'care', label: 'Care Plans', product: 'Care Management', color: '#EC4899', icon: '💗' },
  { key: 'claims', label: 'Claims', product: 'ClaimIQ', color: '#7C3AED', icon: '📄' },
  { key: 'auth', label: 'Prior Auths', product: 'AuthIQ', color: '#0891B2', icon: '🔐' },
  { key: 'rx', label: 'Prescriptions', product: 'CoreIQ', color: '#059669', icon: '💊' },
  { key: 'labs', label: 'Lab Results', product: 'CoreIQ', color: '#059669', icon: '🔬' },
  { key: 'bh', label: 'Behavioral Health', product: 'Behavioral Health', color: '#A855F7', icon: '🧠' },
  { key: 'rpm', label: 'RPM Vitals', product: 'RPM', color: '#06B6D4', icon: '📡' },
  { key: 'compliance', label: 'Compliance', product: 'ComplianceIQ', color: '#065F46', icon: '⚖️' },
  { key: 'fraud', label: 'Fraud Alerts', product: 'FraudIQ', color: '#DC2626', icon: '🛡️' },
];

function StatusDot({ status }: { status: string }) {
  const c = status === 'Active' || status === 'Normal' || status === 'Stable' || status === 'Paid' || status === 'Approved' || status === 'Completed'
    ? 'bg-emerald-400'
    : status === 'High' || status === 'Elevated' || status === 'Denied' || status === 'Overdue' || status === 'Critical' || status === 'Open'
    ? 'bg-red-400'
    : 'bg-yellow-400';
  return <span className={`inline-block w-2 h-2 rounded-full ${c}`} />;
}

export default function PatientCrossProductSummary({ data, compact = false }: { data: CrossProductData; compact?: boolean }) {
  const [activeSection, setActiveSection] = useState('emr');

  if (compact) {
    return <CompactView data={data} />;
  }

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex flex-wrap gap-1.5">
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeSection === s.key ? 'text-white shadow-sm' : 'text-[#86868b] bg-white border border-gray-100 hover:border-gray-200'
            }`}
            style={activeSection === s.key ? { backgroundColor: s.color } : {}}
          >
            <span className="mr-1">{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {activeSection === 'emr' && <EMRSection data={data} />}
        {activeSection === 'risk' && <RiskSection data={data} />}
        {activeSection === 'quality' && <QualitySection data={data} />}
        {activeSection === 'care' && <CareSection data={data} />}
        {activeSection === 'claims' && <ClaimsSection data={data} />}
        {activeSection === 'auth' && <AuthSection data={data} />}
        {activeSection === 'rx' && <RxSection data={data} />}
        {activeSection === 'labs' && <LabsSection data={data} />}
        {activeSection === 'bh' && <BHSection data={data} />}
        {activeSection === 'rpm' && <RPMSection data={data} />}
        {activeSection === 'compliance' && <ComplianceSection data={data} />}
        {activeSection === 'fraud' && <FraudSection data={data} />}
      </div>
    </div>
  );
}

function SectionHeader({ label, product, color, icon, linkTo }: { label: string; product: string; color: string; icon: string; linkTo: string }) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-gray-50">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-[#1d1d1f] text-sm">{label}</h3>
          <ProductBadge name={product} color={color} size="sm" />
        </div>
      </div>
      <Link href={linkTo} className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors" style={{ color }}>
        View in {product} →
      </Link>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-[#86868b] p-5 text-center">{message}</p>;
}

function EMRSection({ data }: { data: CrossProductData }) {
  return (
    <div>
      <SectionHeader label="EMR Summary" product="CoreIQ" color="#059669" icon="🏥" linkTo={`/coreiq/patients/${data.patient.id}`} />
      <div className="p-5 space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">Recent Encounters</h4>
          {data.coreiq.recentEncounters.length > 0 ? data.coreiq.recentEncounters.map(e => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-[#1d1d1f]">{e.chiefComplaint}</p>
                <p className="text-xs text-[#86868b]">{e.provider} · {new Date(e.date).toLocaleDateString()}</p>
              </div>
              <StatusDot status={e.status} />
            </div>
          )) : <EmptyState message="No recent encounters" />}
        </div>
      </div>
    </div>
  );
}

function RiskSection({ data }: { data: CrossProductData }) {
  const r = data.riskEngine;
  return (
    <div>
      <SectionHeader label="Risk Score" product="Risk Engine" color="#F59E0B" icon="⚡" linkTo="/risk-engine" />
      {r ? (
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[#f5f5f7]">
              <p className="text-xs text-[#86868b]">Risk Score</p>
              <p className="text-2xl font-bold" style={{ color: r.riskScore >= 70 ? '#DC2626' : r.riskScore >= 40 ? '#F59E0B' : '#10B981' }}>{r.riskScore}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#f5f5f7]">
              <p className="text-xs text-[#86868b]">Risk Level</p>
              <p className="text-lg font-semibold text-[#1d1d1f]">{r.riskLevel}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#f5f5f7]">
              <p className="text-xs text-[#86868b]">MRA Score</p>
              <p className="text-lg font-semibold text-[#1d1d1f]">{r.mraScore.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#f5f5f7]">
              <p className="text-xs text-[#86868b]">30-Day Risk</p>
              <p className="text-lg font-semibold text-[#1d1d1f]">{(r.predictiveRisk30 * 100).toFixed(0)}%</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1">Conditions</p>
            <div className="flex flex-wrap gap-1.5">
              {r.conditions.split(',').map(c => (
                <span key={c} className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs">{c.trim()}</span>
              ))}
            </div>
          </div>
        </div>
      ) : <EmptyState message="No risk data available" />}
    </div>
  );
}

function QualitySection({ data }: { data: CrossProductData }) {
  return (
    <div>
      <SectionHeader label="Quality Gaps" product="Quality" color="#10B981" icon="✅" linkTo="/quality/gaps" />
      <div className="p-5">
        {data.quality.gaps.length > 0 ? data.quality.gaps.map((g, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-[#1d1d1f]">{g.measure}</p>
              <p className="text-xs text-[#86868b]">Due: {new Date(g.dueDate).toLocaleDateString()}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              g.status === 'Overdue' ? 'bg-red-50 text-red-700' : g.status === 'Due Soon' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
            }`}>{g.status}</span>
          </div>
        )) : <EmptyState message="No quality gaps identified" />}
      </div>
    </div>
  );
}

function CareSection({ data }: { data: CrossProductData }) {
  return (
    <div>
      <SectionHeader label="Care Plans" product="Care Management" color="#EC4899" icon="💗" linkTo="/care-management/care-plans" />
      <div className="p-5">
        {data.careManagement.carePlans.length > 0 ? data.careManagement.carePlans.map(cp => (
          <div key={cp.id} className="p-3 rounded-xl bg-pink-50/50 border border-pink-100 mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#1d1d1f]">{cp.program} Care Plan</span>
              <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">{cp.status}</span>
            </div>
            <p className="text-xs text-[#86868b] mb-2">Started: {new Date(cp.startDate).toLocaleDateString()} · Next Review: {new Date(cp.nextReview).toLocaleDateString()}</p>
            <div className="space-y-1">
              {cp.goals.map((g, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#1d1d1f]">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  {g}
                </div>
              ))}
            </div>
          </div>
        )) : <EmptyState message="No active care plans" />}
      </div>
    </div>
  );
}

function ClaimsSection({ data }: { data: CrossProductData }) {
  return (
    <div>
      <SectionHeader label="Claims" product="ClaimIQ" color="#7C3AED" icon="📄" linkTo="/claimiq/queue" />
      <div className="p-5">
        <div className="flex gap-4 mb-4">
          <div className="p-3 rounded-xl bg-[#f5f5f7] flex-1">
            <p className="text-xs text-[#86868b]">Total Claims</p>
            <p className="text-xl font-bold text-[#1d1d1f]">{data.claimiq.totalClaims}</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 flex-1">
            <p className="text-xs text-red-600">Denied</p>
            <p className="text-xl font-bold text-red-700">{data.claimiq.deniedCount}</p>
          </div>
        </div>
        {data.claimiq.claims.slice(0, 5).map(c => (
          <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-[#1d1d1f]">${c.charges.toFixed(2)} — {c.payer}</p>
              <p className="text-xs text-[#86868b]">{new Date(c.dateOfService).toLocaleDateString()}{c.denialReason ? ` · Denial: ${c.denialReason}` : ''}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              c.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : c.status === 'Denied' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
            }`}>{c.status}</span>
          </div>
        ))}
        {data.claimiq.claims.length === 0 && <EmptyState message="No claims found" />}
      </div>
    </div>
  );
}

function AuthSection({ data }: { data: CrossProductData }) {
  return (
    <div>
      <SectionHeader label="Prior Authorizations" product="AuthIQ" color="#0891B2" icon="🔐" linkTo="/authiq/tracking" />
      <div className="p-5">
        {data.authiq.pendingCount > 0 && (
          <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 mb-4">
            <p className="text-sm font-medium text-cyan-800">{data.authiq.pendingCount} pending authorization(s)</p>
          </div>
        )}
        {data.authiq.priorAuths.map(a => (
          <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-[#1d1d1f]">{a.procedure}</p>
              <p className="text-xs text-[#86868b]">{a.payer} · {a.urgency} · {new Date(a.submitDate).toLocaleDateString()}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              a.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : a.status === 'Denied' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
            }`}>{a.status}</span>
          </div>
        ))}
        {data.authiq.priorAuths.length === 0 && <EmptyState message="No prior authorizations" />}
      </div>
    </div>
  );
}

function RxSection({ data }: { data: CrossProductData }) {
  return (
    <div>
      <SectionHeader label="Active Prescriptions" product="CoreIQ" color="#059669" icon="💊" linkTo="/coreiq/prescriptions" />
      <div className="p-5">
        {data.coreiq.activePrescriptions.map(rx => (
          <div key={rx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-[#1d1d1f]">{rx.medication}</p>
              <p className="text-xs text-[#86868b]">{rx.dosage} · {rx.frequency}</p>
            </div>
            <StatusDot status={rx.status} />
          </div>
        ))}
        {data.coreiq.activePrescriptions.length === 0 && <EmptyState message="No active prescriptions" />}
      </div>
    </div>
  );
}

function LabsSection({ data }: { data: CrossProductData }) {
  return (
    <div>
      <SectionHeader label="Lab Results" product="CoreIQ" color="#059669" icon="🔬" linkTo="/coreiq/labs" />
      <div className="p-5">
        {data.coreiq.pendingLabs.length > 0 && (
          <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100 mb-4">
            <p className="text-sm font-medium text-yellow-800">{data.coreiq.pendingLabs.length} pending lab(s)</p>
          </div>
        )}
        {data.coreiq.completedLabs.map(l => (
          <div key={l.id} className="py-2 border-b border-gray-50 last:border-0">
            <p className="text-sm font-medium text-[#1d1d1f]">{(() => { try { return JSON.parse(l.tests).panelName; } catch { return 'Lab Panel'; } })()}</p>
            <p className="text-xs text-[#86868b]">{new Date(l.orderDate).toLocaleDateString()}</p>
          </div>
        ))}
        {data.coreiq.completedLabs.length === 0 && data.coreiq.pendingLabs.length === 0 && <EmptyState message="No lab orders" />}
      </div>
    </div>
  );
}

function BHSection({ data }: { data: CrossProductData }) {
  return (
    <div>
      <SectionHeader label="Behavioral Health" product="Behavioral Health" color="#A855F7" icon="🧠" linkTo="/behavioral-health/screenings" />
      <div className="p-5">
        {data.behavioralHealth.flags.length > 0 && (
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 mb-4">
            {data.behavioralHealth.flags.map((f, i) => (
              <p key={i} className="text-xs text-purple-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" />{f}</p>
            ))}
          </div>
        )}
        {data.behavioralHealth.screenings.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#1d1d1f]">{s.type} Score: {s.score}</p>
              <p className="text-xs text-[#86868b]">Severity: {s.severity} · {new Date(s.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        {data.behavioralHealth.screenings.length === 0 && data.behavioralHealth.flags.length === 0 && <EmptyState message="No behavioral health data" />}
      </div>
    </div>
  );
}

function RPMSection({ data }: { data: CrossProductData }) {
  return (
    <div>
      <SectionHeader label="RPM Vitals" product="RPM" color="#06B6D4" icon="📡" linkTo="/rpm/vitals" />
      <div className="p-5">
        {data.rpm.hasDevice ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.rpm.vitals.map((v, i) => (
              <div key={i} className={`p-3 rounded-xl ${v.status === 'High' || v.status === 'Elevated' ? 'bg-red-50 border border-red-100' : 'bg-[#f5f5f7]'}`}>
                <p className="text-xs text-[#86868b]">{v.type}</p>
                <p className={`text-lg font-semibold ${v.status === 'High' || v.status === 'Elevated' ? 'text-red-700' : 'text-[#1d1d1f]'}`}>{v.value}</p>
                <p className="text-[10px] text-[#86868b]">{new Date(v.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : <EmptyState message="No RPM device assigned" />}
      </div>
    </div>
  );
}

function ComplianceSection({ data }: { data: CrossProductData }) {
  return (
    <div>
      <SectionHeader label="Compliance Notes" product="ComplianceIQ" color="#065F46" icon="⚖️" linkTo="/complianceiq" />
      <div className="p-5">
        {data.compliance.notes.map(n => (
          <div key={n.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-[#1d1d1f]">{n.type}</p>
              <p className="text-xs text-[#86868b]">Severity: {n.severity}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              n.severity === 'Critical' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
            }`}>{n.status}</span>
          </div>
        ))}
        {data.compliance.notes.length === 0 && <EmptyState message="No compliance notes" />}
      </div>
    </div>
  );
}

function FraudSection({ data }: { data: CrossProductData }) {
  return (
    <div>
      <SectionHeader label="Fraud Alerts" product="FraudIQ" color="#DC2626" icon="🛡️" linkTo="/fraudiq" />
      <div className="p-5">
        {data.fraud.alerts.map(f => (
          <div key={f.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-[#1d1d1f]">{f.alertType}</p>
              <p className="text-xs text-[#86868b]">Severity: {f.severity}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              f.severity === 'Critical' ? 'bg-red-50 text-red-700' : f.severity === 'High' ? 'bg-orange-50 text-orange-700' : 'bg-yellow-50 text-yellow-700'
            }`}>{f.status}</span>
          </div>
        ))}
        {data.fraud.alerts.length === 0 && <EmptyState message="No fraud alerts" />}
      </div>
    </div>
  );
}

// Compact view for embedding in other pages
function CompactView({ data }: { data: CrossProductData }) {
  const items = [
    { label: 'Risk Score', value: data.riskEngine ? `${data.riskEngine.riskScore} (${data.riskEngine.riskLevel})` : 'N/A', color: '#F59E0B', icon: '⚡', product: 'Risk Engine', link: '/risk-engine' },
    { label: 'Quality Gaps', value: `${data.quality.gaps.length} gap(s)`, color: '#10B981', icon: '✅', product: 'Quality', link: '/quality/gaps' },
    { label: 'Care Plans', value: `${data.careManagement.carePlans.length} active`, color: '#EC4899', icon: '💗', product: 'Care Management', link: '/care-management/care-plans' },
    { label: 'Claims', value: `${data.claimiq.totalClaims} total, ${data.claimiq.deniedCount} denied`, color: '#7C3AED', icon: '📄', product: 'ClaimIQ', link: '/claimiq' },
    { label: 'Prior Auths', value: `${data.authiq.pendingCount} pending`, color: '#0891B2', icon: '🔐', product: 'AuthIQ', link: '/authiq' },
    { label: 'RPM', value: data.rpm.hasDevice ? `${data.rpm.vitals.length} readings` : 'No device', color: '#06B6D4', icon: '📡', product: 'RPM', link: '/rpm' },
    { label: 'BH Flags', value: data.behavioralHealth.flags.length > 0 ? data.behavioralHealth.flags[0] : 'None', color: '#A855F7', icon: '🧠', product: 'Behavioral Health', link: '/behavioral-health' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(item => (
        <Link key={item.label} href={item.link} className="p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">{item.icon}</span>
            <ProductBadge name={item.product} color={item.color} size="sm" />
          </div>
          <p className="text-xs text-[#86868b]">{item.label}</p>
          <p className="text-sm font-semibold text-[#1d1d1f] mt-0.5">{item.value}</p>
        </Link>
      ))}
      <Link href={`/patient360/${data.patient.id}`} className="p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">🔍</p>
          <p className="text-xs font-medium text-[#86868b]">View Full Profile</p>
        </div>
      </Link>
    </div>
  );
}
