'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

const TIER_COLORS: Record<string, string> = {
  Healthy: '#10b981', 'At-Risk': '#f59e0b', Chronic: '#f97316', Complex: '#ef4444', Catastrophic: '#991b1b',
};
const GENDER_COLORS = ['#26acf7', '#f472b6', '#a78bfa'];
const CHART_BLUE = '#26acf7';

function Section({ icon, color, title, children }: { icon: string; color: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold`}>{icon}</div>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}>{children}</div>;
}

function StatCard({ label, value, sub, onClick }: { label: string; value: string; sub?: string; onClick?: () => void }) {
  return (
    <Card className={onClick ? 'cursor-pointer' : ''}>
      <div onClick={onClick}>
        <p className="text-xs text-[#86868b] mb-1">{label}</p>
        <p className={`text-2xl font-semibold text-[#1d1d1f]${onClick ? ' hover:underline' : ''}`}>{value}</p>
        {sub && <p className="text-xs text-[#86868b] mt-1">{sub}</p>}
      </div>
    </Card>
  );
}

export default function PopulationHealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);

  useEffect(() => {
    fetch('/api/population-health').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#26acf7]" />
        </div>
      </DashboardLayout>
    );
  }
  const router = useRouter();

  const providerIdMap: Record<string, string> = {
    'Dr. Elena Martinez': 'martinez', 'Dr. Jennifer Lee': 'lee', 'Dr. Wei Chen': 'chen',
    'Dr. Michael Kim': 'kim', 'Dr. Raj Patel': 'patel', 'Dr. Sarah Johnson': 'johnson',
    'Dr. Carlos Rodriguez': 'rodriguez', 'Dr. Amanda Williams': 'williams',
  };

  if (!data || data.error) {
    return <DashboardLayout><div className="p-8 text-red-500">Error loading population health data: {data?.error || 'Unknown'}</div></DashboardLayout>;
  }

  const { demographics: d, healthStatus, costConcentration, diseasePrevalence, comorbidityHighlights, preventionGaps, sdoh, providerPanels, trends } = data;
  const totalGaps = preventionGaps.reduce((s: number, g: any) => s + g.gapCount, 0);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">Population Health</h1>
          <p className="text-sm text-[#86868b] mt-1">Comprehensive view of your Medicare Advantage population</p>
        </div>

        {/* Section 1: Population Overview */}
        <Section icon="👥" color="from-[#26acf7] to-[#0071e3]" title="Population Overview">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatCard label="Total Members" value={d.totalMembers.toLocaleString()} onClick={() => setDrillDown({ label: 'Total Members', count: d.totalMembers })} />
            <StatCard label="Avg Age" value={`${d.avgAge} yrs`} />
            <StatCard label="Gender Split" value={`${d.genderSplit.male}M / ${d.genderSplit.female}F`} />
            <StatCard label="Avg Risk Score" value={String(d.avgRiskScore)} />
            <StatCard label="Total Annual Cost" value={fmt(d.totalAnnualCost)} />
            <StatCard label="Cost PMPM" value={fmt(d.costPMPM)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <p className="text-sm font-medium text-[#1d1d1f] mb-3">Age Distribution</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={d.ageDistribution} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="bucket" tick={{ fontSize: 11 }} width={50} />
                  <Tooltip />
                  <Bar dataKey="count" fill={CHART_BLUE} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <p className="text-sm font-medium text-[#1d1d1f] mb-3">Gender Distribution</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
                  <Pie data={[
                    { name: 'Male', value: d.genderSplit.male },
                    { name: 'Female', value: d.genderSplit.female },
                    ...(d.genderSplit.other > 0 ? [{ name: 'Other', value: d.genderSplit.other }] : []),
                  ]} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true}>
                    {GENDER_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Section>

        {/* Section 2: Health Status Pyramid */}
        <Section icon="🔺" color="from-[#f59e0b] to-[#ef4444]" title="Health Status Pyramid">
          <Card className="mb-4">
            <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 rounded-xl">
              <span className="text-amber-600 text-lg">💡</span>
              <p className="text-sm text-amber-800 font-medium">Top 5% of patients account for {costConcentration}% of total costs</p>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <BarChart data={[healthStatus.reduce((o: any, t: any) => { o[t.tier] = t.count; return o; }, {})]} layout="horizontal" stackOffset="expand">
                <XAxis type="number" hide />
                <YAxis type="category" hide dataKey={() => ''} />
                <Tooltip formatter={(v: any, name: any) => [`${v} patients`, name]} />
                {healthStatus.map((t: any) => <Bar key={t.tier} dataKey={t.tier} stackId="a" fill={TIER_COLORS[t.tier]} />)}
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {healthStatus.map((t: any) => (
              <Card key={t.tier}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TIER_COLORS[t.tier] }} />
                  <p className="text-sm font-semibold text-[#1d1d1f]">{t.tier}</p>
                </div>
                <p className="text-xl font-bold text-[#1d1d1f] cursor-pointer hover:underline" onClick={() => setDrillDown({ label: `${t.tier} Tier`, count: t.count })}>{t.count.toLocaleString()}</p>
                <div className="mt-2 space-y-1 text-xs text-[#86868b]">
                  <p>{t.pctPopulation}% of population</p>
                  <p>{t.pctCost}% of costs</p>
                  <p>Avg cost: {fmt(t.avgCost)}</p>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Section 3: Disease Prevalence */}
        <Section icon="🦠" color="from-[#ef4444] to-[#dc2626]" title="Disease Prevalence">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card>
              <p className="text-sm font-medium text-[#1d1d1f] mb-3">Prevalence Rates (%)</p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={diseasePrevalence} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="condition" tick={{ fontSize: 10 }} width={140} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Bar dataKey="prevalence" fill={CHART_BLUE} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <p className="text-sm font-medium text-[#1d1d1f] mb-3">Disease Detail</p>
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-100 text-left text-[#86868b]">
                      <th className="py-2 pr-2">Condition</th>
                      <th className="py-2 pr-2 text-right">Patients</th>
                      <th className="py-2 pr-2 text-right">Prev %</th>
                      <th className="py-2 pr-2 text-right">Avg Cost</th>
                      <th className="py-2 text-right">Cost %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diseasePrevalence.map((d: any) => (
                      <tr key={d.condition} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 pr-2 font-medium text-[#1d1d1f]">{d.condition}</td>
                        <td className="py-2 pr-2 text-right cursor-pointer hover:underline hover:text-[#26acf7]" onClick={() => setDrillDown({ label: d.condition, count: d.count })}>{d.count}</td>
                        <td className="py-2 pr-2 text-right">{d.prevalence}%</td>
                        <td className="py-2 pr-2 text-right">{fmt(d.avgCost)}</td>
                        <td className="py-2 text-right">{d.costBurden}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {comorbidityHighlights.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl space-y-1">
                  {comorbidityHighlights.map((c: any, i: number) => (
                    <p key={i} className="text-xs text-blue-800">🔗 {c.text}</p>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </Section>

        {/* Section 4: Prevention & Wellness Gaps */}
        <Section icon="🛡️" color="from-[#10b981] to-[#059669]" title="Prevention & Wellness Gaps">
          <Card className="mb-4">
            <p className="text-sm text-[#86868b]">Total care gap closures needed</p>
            <p className="text-3xl font-bold text-[#ef4444] cursor-pointer hover:underline" onClick={() => setDrillDown({ label: 'Total Care Gaps', count: totalGaps })}>{totalGaps.toLocaleString()}</p>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {preventionGaps.map((g: any) => {
              const color = g.gapPct < 20 ? 'border-l-emerald-500 bg-emerald-50' : g.gapPct < 40 ? 'border-l-amber-500 bg-amber-50' : 'border-l-red-500 bg-red-50';
              const textColor = g.gapPct < 20 ? 'text-emerald-700' : g.gapPct < 40 ? 'text-amber-700' : 'text-red-700';
              return (
                <Card key={g.screening} className={`border-l-4 ${color}`}>
                  <p className="text-sm font-semibold text-[#1d1d1f] mb-2">{g.screening}</p>
                  <p className={`text-2xl font-bold ${textColor}`}>{g.gapPct}%</p>
                  <p className="text-xs text-[#86868b] mt-1"><span className="cursor-pointer hover:underline" onClick={() => setDrillDown({ label: `${g.screening} — Gap`, count: g.gapCount })}>{g.gapCount}</span> of {g.eligible} eligible</p>
                  <p className="text-[10px] text-[#86868b] mt-2 italic">{g.potentialImpact}</p>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* Section 5: Social Determinants of Health */}
        <Section icon="🏠" color="from-[#8b5cf6] to-[#7c3aed]" title="Social Determinants of Health">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {sdoh.map((s: any) => (
              <Card key={s.factor}>
                <p className="text-xs font-semibold text-[#1d1d1f] mb-2">{s.factor}</p>
                <p className="text-xl font-bold text-[#1d1d1f] cursor-pointer hover:underline" onClick={() => setDrillDown({ label: `SDOH: ${s.factor}`, count: s.affectedCount })}>{s.affectedCount}</p>
                <p className="text-xs text-[#86868b]">{s.pctAffected}% of population</p>
                <div className="mt-2 px-2 py-1 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-700 font-medium">{s.erMultiplier}x ER utilization</p>
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <p className="text-sm font-medium text-[#1d1d1f] mb-3">ER Utilization Multiplier by SDOH Factor</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sdoh}>
                <XAxis dataKey="factor" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 3]} />
                <Tooltip formatter={(v: any) => `${v}x`} />
                <Bar dataKey="erMultiplier" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Section>

        {/* Section 6: Provider Panel Analysis */}
        <Section icon="👨‍⚕" color="from-[#0071e3] to-[#0077ED]" title="Provider Panel Analysis">
          <Card>
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-100 text-left text-[#86868b]">
                    <th className="py-2 pr-3">PCP</th>
                    <th className="py-2 pr-3 text-right">Panel Size</th>
                    <th className="py-2 pr-3 text-right">Avg Risk</th>
                    <th className="py-2 pr-3 text-right">Avg Age</th>
                    <th className="py-2 pr-3 text-right">Chronic %</th>
                    <th className="py-2 text-right">Cost/Member</th>
                  </tr>
                </thead>
                <tbody>
                  {providerPanels.map((p: any) => {
                    const flagSize = p.panelSize > 100;
                    const flagRisk = p.avgRisk > 70;
                    return (
                      <tr key={p.pcp} className={`border-b border-gray-50 hover:bg-gray-50 ${flagSize || flagRisk ? 'bg-red-50/50' : ''}`}>
                        <td className="py-2 pr-3 font-medium text-[#1d1d1f]">
                          <span
                            className={`${providerIdMap[p.pcp] ? 'text-[#26acf7] hover:underline cursor-pointer' : ''}`}
                            onClick={() => { if (providerIdMap[p.pcp]) router.push(`/population-health/provider/${providerIdMap[p.pcp]}`); }}
                          >
                            {p.pcp}
                          </span>
                          {flagSize && <span className="ml-1 text-[10px] text-red-500">⚠ Large panel</span>}
                          {flagRisk && <span className="ml-1 text-[10px] text-red-500">⚠ High risk</span>}
                        </td>
                        <td className="py-2 pr-3 text-right cursor-pointer hover:underline hover:text-[#26acf7]" onClick={() => setDrillDown({ label: `${p.pcp} Panel`, count: p.panelSize })}>{p.panelSize}</td>
                        <td className="py-2 pr-3 text-right">{p.avgRisk}</td>
                        <td className="py-2 pr-3 text-right">{p.avgAge}</td>
                        <td className="py-2 pr-3 text-right">{p.chronicPct}%</td>
                        <td className="py-2 text-right">{fmt(p.costPerMember)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>

        {/* Section 7: Population Trends */}
        <Section icon="📈" color="from-[#26acf7] to-[#0071e3]" title="Population Trends (12-Month)">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <p className="text-sm font-medium text-[#1d1d1f] mb-3">Cost & Utilization Trends</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="left" type="monotone" dataKey="pmpm" name="PMPM ($)" stroke="#26acf7" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="erRate" name="ER Rate/1K" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="admissionRate" name="Admit Rate/1K" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <p className="text-sm font-medium text-[#1d1d1f] mb-3">Risk Score & Chronic Prevalence Trends</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="left" type="monotone" dataKey="avgRiskScore" name="Avg Risk Score" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="chronicPrevalence" name="Chronic Prev %" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Section>
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#26acf7" />
    </DashboardLayout>
  );
}
