'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  ScatterChart, Scatter, CartesianGrid, ZAxis,
  LineChart, Line,
} from 'recharts';

const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
const fmtFull = (n: number) => `$${n.toLocaleString()}`;
const fmtAny = (v: any) => typeof v === 'number' ? v.toLocaleString() : String(v ?? '');
const fmtCurrency = (v: any) => typeof v === 'number' ? fmtFull(v) : String(v ?? 'N/A');
const fmtCurrencyOrNA = (v: any) => (typeof v === 'number' ? fmtFull(v) : 'N/A');

const RUB_COLORS: Record<string, string> = {
  'Non-User': '#d1d5db', 'Healthy': '#10b981', 'Low': '#34d399',
  'Moderate': '#f59e0b', 'High': '#f97316', 'Very High': '#ef4444',
};

const RATING_COLORS: Record<string, string> = {
  'High Performer': '#10b981', 'Above Average': '#34d399', 'Average': '#6b7280',
  'Below Average': '#f59e0b', 'Needs Review': '#ef4444',
};

interface PredictiveData {
  population: any;
  models: any[];
  scatterData: any[];
  segments: any[];
  careManagement: any;
  providerPerformance: any[];
  trends: any[];
  prescriptive: any;
}

export default function PredictiveAIPage() {
  const [data, setData] = useState<PredictiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [programFilter, setProgramFilter] = useState('All');
  const [activeSection, setActiveSection] = useState('');
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);

  useEffect(() => {
    fetch('/api/predictive')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = () => {
      const sections = ['risk-stratification', 'predictive-models', 'segments', 'care-targeting', 'provider-performance', 'trends', 'prescriptive'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 200) setActiveSection(id);
      }
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#26acf7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#86868b] text-sm">Loading Predictive Analytics Engine...</p>
          <p className="text-[#86868b] text-xs mt-1">Analyzing 500+ patients across 35K+ claims</p>
        </div>
      </div>
    </DashboardLayout>
  );

  if (!data) return (
    <DashboardLayout>
      <div className="text-center py-20 text-red-500">Failed to load predictive data.</div>
    </DashboardLayout>
  );

  const { population, models, scatterData, segments, careManagement, providerPerformance, trends, prescriptive } = data;
  const filteredTargets = programFilter === 'All'
    ? careManagement.targets
    : careManagement.targets.filter((t: any) => t.program === programFilter);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#26acf7] to-[#0071e3] flex items-center justify-center text-white text-sm font-bold">AI</div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1d1d1f]">Predictive Analytics Engine</h1>
              <p className="text-sm text-[#86868b]">ARC-Style Risk Classification & Population Health Intelligence</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Patients', value: population.totalPatients.toLocaleString(), sub: 'Medicare Advantage', clickCount: population.totalPatients },
            { label: 'Avg Risk Score', value: population.avgRiskScore.toFixed(2), sub: 'Composite (0-5)' },
            { label: 'Predicted Annual Cost', value: fmt(population.totalPredictedCost), sub: '12-month forecast' },
            { label: 'High/Very High Risk', value: `${population.highVeryHighPct}%`, sub: 'of population', alert: population.highVeryHighPct > 20 },
          ].map((s: any, i: number) => (
            <div key={i} className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100${s.clickCount ? ' cursor-pointer' : ''}`} onClick={() => s.clickCount && setDrillDown({ label: s.label, count: s.clickCount })}>
              <p className="text-xs text-[#86868b] mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.alert ? 'text-[#ef4444]' : 'text-[#1d1d1f]'}`}>{s.value}</p>
              <p className="text-[10px] text-[#86868b] mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Section 1: Risk Stratification */}
        <div id="risk-stratification" className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Population Risk Distribution</h2>
            <p className="text-sm text-[#86868b]">Risk Utilization Bands (RUB) — ARC morbidity-based risk classification</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-[#86868b] mb-3">Patient Count by Risk Band</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={population.rubDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="rub" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={fmtAny} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {population.rubDistribution.map((d: any, i: number) => (
                      <Cell key={i} fill={RUB_COLORS[d.rub] || '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-[#86868b] mb-3">Predicted Cost Distribution by Risk Band</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={population.rubDistribution.filter((d: any) => d.totalCost > 0)} dataKey="totalCost" nameKey="rub" cx="50%" cy="50%" outerRadius={100} label={({ rub, percent }: any) => `${rub}: ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#86868b' }}>
                    {population.rubDistribution.map((d: any, i: number) => (
                      <Cell key={i} fill={RUB_COLORS[d.rub] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={fmtCurrency} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ARC Groups */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-[#86868b] mb-3">Adaptive Risk Classification (ARC) Distribution</p>
            <div className="grid grid-cols-2 gap-2">
              {population.acgDistribution.slice(0, 12).map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#f5f5f7] rounded-lg">
                  <span className="text-xs text-[#1d1d1f]">{a.acg}</span>
                  <span className="text-xs font-medium text-[#26acf7] cursor-pointer hover:underline" onClick={() => setDrillDown({ label: a.acg, count: a.count })}>{a.count} patients</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Predictive Models */}
        <div id="predictive-models" className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Predictive Models</h2>
            <p className="text-sm text-[#86868b]">Machine learning models for cost, utilization, and risk prediction</p>
          </div>
          <div className="grid grid-cols-5 gap-3 mb-4">
            {models.map((m, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#26acf7]/10 text-[#26acf7] font-medium">{m.type === 'regression' ? 'Regression' : 'Classification'}</span>
                  <span className="text-xs font-bold text-[#1d1d1f]">{m.metric}: {m.accuracy}</span>
                </div>
                <p className="text-xs font-semibold text-[#1d1d1f] mb-2 leading-tight">{m.name}</p>
                <div className="space-y-1 mb-3">
                  {m.topFactors.slice(0, 3).map((f: string, j: number) => (
                    <div key={j} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#26acf7]" style={{ opacity: 1 - j * 0.25 }} />
                      <span className="text-[10px] text-[#86868b]">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-50 pt-2 space-y-0.5">
                  {Object.entries(m.summary).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[10px] text-[#86868b] capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-[10px] font-medium text-[#1d1d1f]">{typeof v === 'number' && v > 100 ? fmtFull(v) : v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Scatter: Predicted vs Actual */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-[#86868b] mb-3">Predicted vs Actual Cost (Top 200 by Risk)</p>
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 10, right: 30, bottom: 40, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="actual" name="Actual Cost" tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt(v)} label={{ value: 'Actual Cost', position: 'insideBottom', offset: -10, fontSize: 11 }} />
                <YAxis dataKey="predicted" name="Predicted Cost" tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt(v)} label={{ value: 'Predicted Cost', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }} />
                <ZAxis range={[30, 30]} />
                <Tooltip formatter={fmtCurrency} />
                <Scatter data={scatterData} fill="#26acf7" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Population Segments */}
        <div id="segments" className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Population Segments</h2>
            <p className="text-sm text-[#86868b]">Actionable cohorts for targeted intervention strategies</p>
          </div>
          <div className="grid grid-cols-5 gap-3 mb-4">
            {segments.map((seg: any, i: number) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: seg.color }} />
                <p className="text-xs font-semibold text-[#1d1d1f] mb-1">{seg.name}</p>
                <p className="text-[10px] text-[#86868b] mb-3 leading-relaxed">{seg.description}</p>
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[#86868b]">Patients</span>
                    <span className="text-xs font-bold text-[#1d1d1f] cursor-pointer hover:underline" onClick={() => setDrillDown({ label: seg.name, count: seg.patientCount })}>{seg.patientCount} <span className="text-[10px] font-normal text-[#86868b]">({seg.pctOfPopulation}%)</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[#86868b]">Avg Cost</span>
                    <span className="text-xs font-medium text-[#1d1d1f]">{fmt(seg.avgCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[#86868b]">Avg Risk</span>
                    <span className="text-xs font-medium text-[#1d1d1f]">{seg.avgRisk}</span>
                  </div>
                </div>
                <div className="border-t border-gray-50 pt-2">
                  <p className="text-[10px] text-[#86868b] mb-1">Interventions:</p>
                  {seg.interventions.map((int: string, j: number) => (
                    <span key={j} className="inline-block text-[9px] px-1.5 py-0.5 bg-[#f5f5f7] rounded text-[#6e6e73] mr-1 mb-1">{int}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Segment comparison bar chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-[#86868b] mb-3">Segment Cost Comparison</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={segments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt(v)} />
                <Tooltip formatter={fmtCurrency} />
                <Bar dataKey="avgCost" name="Avg Cost" radius={[6, 6, 0, 0]}>
                  {segments.map((seg: any, i: number) => (
                    <Cell key={i} fill={seg.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 4: Care Management Targeting */}
        <div id="care-targeting" className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1d1d1f]">Care Management Targeting</h2>
              <p className="text-sm text-[#86868b]">Top patients ranked by intervention impactability and estimated savings</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#10b981]/10 px-4 py-2 rounded-lg">
                <p className="text-[10px] text-[#10b981]">Total Estimated Savings</p>
                <p className="text-lg font-bold text-[#10b981]">{fmt(careManagement.totalEstimatedSavings)}</p>
              </div>
            </div>
          </div>

          {/* Program ROI */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {careManagement.programROI.map((p: any, i: number) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-[10px] font-semibold text-[#1d1d1f] mb-2">{p.program}</p>
                <div className="space-y-1">
                  <div className="flex justify-between"><span className="text-[10px] text-[#86868b]">Patients</span><span className="text-xs font-medium cursor-pointer hover:underline hover:text-[#26acf7]" onClick={() => setDrillDown({ label: p.program, count: p.patientCount })}>{p.patientCount}</span></div>
                  <div className="flex justify-between"><span className="text-[10px] text-[#86868b]">Savings</span><span className="text-xs font-medium text-[#10b981]">{fmt(p.totalEstimatedSavings)}</span></div>
                  <div className="flex justify-between"><span className="text-[10px] text-[#86868b]">Cost</span><span className="text-xs font-medium text-[#f59e0b]">{fmt(p.programCost)}</span></div>
                  <div className="flex justify-between"><span className="text-[10px] text-[#86868b]">ROI</span><span className={`text-xs font-bold ${p.roi >= 1 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{p.roi}x</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter + Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="text-xs text-[#86868b]">Filter:</span>
              {['All', 'Case Management', 'Disease Management', 'Transitional Care', 'Medication Therapy Management', 'Wellness Programs'].map(p => (
                <button key={p} onClick={() => setProgramFilter(p)}
                  className={`text-[10px] px-3 py-1 rounded-full transition-colors ${programFilter === p ? 'bg-[#26acf7] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#f5f5f7]">
                    {['Patient', 'Risk Score', 'RUB', 'Predicted Cost', 'Hosp Risk', 'ER Risk', 'Program', 'Impactability', 'Est. Savings'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTargets.map((t: any, i: number) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-[#1d1d1f]">{t.name}</p>
                        <p className="text-[10px] text-[#86868b]">{t.pcp}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`font-bold ${t.compositeRisk >= 4 ? 'text-[#ef4444]' : t.compositeRisk >= 2.5 ? 'text-[#f59e0b]' : 'text-[#1d1d1f]'}`}>{t.compositeRisk}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${RUB_COLORS[t.rub]}20`, color: RUB_COLORS[t.rub] }}>{t.rub}</span>
                      </td>
                      <td className="px-4 py-2.5 font-medium">{fmtFull(Math.round(t.predictedCost))}</td>
                      <td className="px-4 py-2.5">
                        <span className={t.hospProb > 50 ? 'text-[#ef4444] font-bold' : ''}>{t.hospProb}%</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={t.erProb > 50 ? 'text-[#f59e0b] font-bold' : ''}>{t.erProb}%</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#26acf7]/10 text-[#26acf7]">{t.program}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#26acf7] rounded-full" style={{ width: `${t.impactability * 100}%` }} />
                          </div>
                          <span className="text-[10px]">{(t.impactability * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-[#10b981]">{fmtFull(t.estimatedSavings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 5: Provider Performance */}
        <div id="provider-performance" className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Provider Risk-Adjusted Performance</h2>
            <p className="text-sm text-[#86868b]">PCP performance adjusted for patient morbidity burden (casemix index)</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#f5f5f7]">
                    {['PCP', 'Panel Size', 'Avg Patient Risk', 'Casemix Index', 'Raw Cost/Pt', 'Risk-Adj Cost', 'Actual ER Rate', 'Expected ER Rate', 'ER Ratio', 'Rating'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {providerPerformance.map((p: any, i: number) => (
                    <tr key={i} className={`border-t border-gray-50 ${p.rating === 'Needs Review' ? 'bg-red-50/30' : p.rating === 'High Performer' ? 'bg-green-50/30' : ''}`}>
                      <td className="px-4 py-2.5 font-medium text-[#1d1d1f]">{p.pcp}</td>
                      <td className="px-4 py-2.5">{p.panelSize}</td>
                      <td className="px-4 py-2.5">{p.avgPatientRisk}</td>
                      <td className="px-4 py-2.5 font-medium">{p.casemixIndex}</td>
                      <td className="px-4 py-2.5">{fmtFull(p.rawCostPerPatient)}</td>
                      <td className="px-4 py-2.5 font-bold">{fmtFull(p.riskAdjustedCost)}</td>
                      <td className="px-4 py-2.5">{p.actualERRate}%</td>
                      <td className="px-4 py-2.5">{p.expectedERRate}%</td>
                      <td className="px-4 py-2.5">
                        <span className={p.erRatio > 1.2 ? 'text-[#ef4444] font-bold' : p.erRatio < 0.8 ? 'text-[#10b981] font-bold' : ''}>{p.erRatio}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${RATING_COLORS[p.rating] || '#6b7280'}20`, color: RATING_COLORS[p.rating] || '#6b7280' }}>{p.rating}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 6: Trend Analysis */}
        <div id="trends" className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Trend Analysis</h2>
            <p className="text-sm text-[#86868b]">12-month population risk and cost trends</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-[#86868b] mb-3">Population Avg Risk Score</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgRiskScore" stroke="#26acf7" strokeWidth={2} dot={{ r: 3 }} name="Avg Risk" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-[#86868b] mb-3">Predicted vs Actual Cost (PMPM)</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: number) => fmt(v)} />
                  <Tooltip formatter={fmtCurrencyOrNA} />
                  <Line type="monotone" dataKey="predictedCost" stroke="#26acf7" strokeWidth={2} dot={{ r: 3 }} name="Predicted" />
                  <Line type="monotone" dataKey="actualCost" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Actual" connectNulls={false} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-[#86868b] mb-3">Rising Risk Patient Count</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="risingRiskCount" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Rising Risk" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section 7: Prescriptive Analytics */}
        {/* Section 7: Prescriptive Analytics */}
        {prescriptive && (
        <div id="prescriptive" className="mb-10">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white text-xs font-bold">Rx</div>
              <div>
                <h2 className="text-lg font-semibold text-[#1d1d1f]">Prescriptive Analytics — AI-Recommended Actions</h2>
                <p className="text-sm text-[#86868b]">Beyond prediction: data-driven recommendations for what SHOULD be done</p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Potential Savings', value: fmt(prescriptive.summary.totalPrescriptiveSavings), sub: 'Across all recommended programs', color: '#10b981' },
              { label: 'Implementation Cost', value: fmt(prescriptive.summary.totalImplementationCost), sub: 'Total investment required', color: '#f59e0b' },
              { label: 'Net Savings', value: fmt(prescriptive.summary.netSavings), sub: `Overall ROI: ${prescriptive.summary.overallROI}x`, color: '#26acf7' },
              { label: 'Patients Impacted', value: prescriptive.summary.totalPatientsImpacted, sub: `${prescriptive.summary.quickWins} quick wins, ${prescriptive.summary.strategicInvestments} strategic`, color: '#8b5cf6', clickCount: prescriptive.summary.totalPatientsImpacted },
            ].map((s: any, i: number) => (
              <div key={i} className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100${s.clickCount ? ' cursor-pointer' : ''}`} onClick={() => s.clickCount && setDrillDown({ label: s.label, count: typeof s.clickCount === 'string' ? parseInt(s.clickCount.replace(/,/g,'')) : s.clickCount })}>
                <p className="text-xs text-[#86868b] mb-1">{s.label}</p>
                <p className="text-2xl font-semibold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-[#86868b] mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Intervention Priority Matrix */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-[#1d1d1f]">Intervention Priority Matrix</p>
                <p className="text-[10px] text-[#86868b]">Bubble size = target population. Position = difficulty vs impact.</p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Quick Win</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#26acf7]" /> Strategic</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Monitor</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#9ca3af]" /> Deprioritize</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="x" name="Difficulty" domain={[0, 5]} tick={{ fontSize: 10 }} label={{ value: 'Implementation Difficulty →', position: 'insideBottom', fontSize: 11, offset: -10 }} />
                <YAxis type="number" dataKey="y" name="Impact" domain={[0, 5.5]} tick={{ fontSize: 10 }} label={{ value: '← Expected Impact', angle: -90, position: 'insideLeft', fontSize: 11, offset: 10 }} />
                <ZAxis type="number" dataKey="z" range={[60, 500]} name="Patients" />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-xs max-w-[250px]">
                        <p className="font-semibold text-[#1d1d1f] mb-1">{d.name}</p>
                        <p className="text-[#86868b]">Target: {d.z} patients</p>
                        <p className="text-[#86868b]">Difficulty: {d.x}/5 | Impact: {d.y}/5</p>
                        <p className="text-[#10b981] font-medium">ROI: {d.roi}x | Savings: {fmtFull(d.savings)}</p>
                        <p className="mt-1 font-medium" style={{ color: d.color }}>{d.quadrant}</p>
                      </div>
                    );
                  }}
                />
                {(() => {
                  const md = prescriptive.matrixData || [];
                  const groups: Record<string, any[]> = { '#10b981': [], '#26acf7': [], '#f59e0b': [], '#9ca3af': [] };
                  md.forEach((d: any) => (groups[d.color] || groups['#9ca3af']).push(d));
                  return Object.entries(groups).filter(([, arr]) => arr.length > 0).map(([color, arr]) => (
                    <Scatter key={color} data={arr} fill={color} fillOpacity={0.75} />
                  ));
                })()}
              </ScatterChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="text-center p-2 bg-[#10b981]/5 rounded-lg border border-[#10b981]/20">
                <p className="text-[10px] font-semibold text-[#10b981]">Quick Wins</p>
                <p className="text-[9px] text-[#86868b]">Easy + High Impact</p>
              </div>
              <div className="text-center p-2 bg-[#26acf7]/5 rounded-lg border border-[#26acf7]/20">
                <p className="text-[10px] font-semibold text-[#26acf7]">Strategic Investments</p>
                <p className="text-[9px] text-[#86868b]">Hard + High Impact</p>
              </div>
              <div className="text-center p-2 bg-[#f59e0b]/5 rounded-lg border border-[#f59e0b]/20">
                <p className="text-[10px] font-semibold text-[#f59e0b]">Monitor</p>
                <p className="text-[9px] text-[#86868b]">Easy + Low Impact</p>
              </div>
              <div className="text-center p-2 bg-gray-100 rounded-lg border border-gray-200">
                <p className="text-[10px] font-semibold text-[#9ca3af]">Deprioritize</p>
                <p className="text-[9px] text-[#86868b]">Hard + Low Impact</p>
              </div>
            </div>
          </div>

          {/* Population Programs ROI Table */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#1d1d1f] mb-3">Recommended Population Programs — ROI Calculator</p>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#f5f5f7]">
                      {['Program', 'Priority', 'Target Pop.', 'Implementation Cost', 'Est. Annual Savings', 'Net ROI', 'Payback', 'Expected Outcome'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptive.populationPrograms.map((prog: any, i: number) => (
                      <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#1d1d1f]">{prog.name}</p>
                          <p className="text-[10px] text-[#86868b] mt-0.5 max-w-[200px]">{prog.description}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            prog.priority === 'High' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                            prog.priority === 'Medium' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                            'bg-gray-100 text-gray-500'
                          }`}>{prog.priority}</span>
                        </td>
                        <td className="px-4 py-3 font-medium">{prog.targetPopulation} pts</td>
                        <td className="px-4 py-3 text-[#f59e0b] font-medium">{fmtFull(prog.implementationCost)}</td>
                        <td className="px-4 py-3 text-[#10b981] font-bold">{fmtFull(prog.estimatedSavings)}</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${prog.netROI >= 2 ? 'text-[#10b981]' : prog.netROI >= 1 ? 'text-[#26acf7]' : 'text-[#f59e0b]'}`}>{prog.netROI}x</span>
                        </td>
                        <td className="px-4 py-3 font-medium">{prog.paybackMonths} mo</td>
                        <td className="px-4 py-3 text-[10px] text-[#86868b] max-w-[180px]">{prog.expectedOutcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Patient-Level Prescriptions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#1d1d1f]">Patient-Level Prescriptions — Top 30 High-Risk</p>
                <p className="text-[10px] text-[#86868b]">Specific recommended actions per patient with confidence scores</p>
              </div>
              <div className="text-[10px] text-[#86868b]">
                Total patient-level savings: <span className="font-bold text-[#10b981]">{fmtFull(prescriptive.patientPrescriptions.reduce((s: number, p: any) => s + p.totalActionSavings, 0))}</span>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#f5f5f7]">
                    {['Patient', 'Risk', 'RUB', 'Predicted Cost', 'Recommended Actions', 'Est. Savings'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prescriptive.patientPrescriptions.map((p: any, i: number) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1d1d1f]">{p.name}</p>
                        <p className="text-[10px] text-[#86868b]">Age {p.age} • {p.pcp}</p>
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {p.conditions.slice(0, 3).map((c: string, j: number) => (
                            <span key={j} className="text-[8px] px-1.5 py-0.5 bg-gray-100 rounded text-[#6e6e73]">{c}</span>
                          ))}
                          {p.conditions.length > 3 && <span className="text-[8px] px-1.5 py-0.5 bg-gray-100 rounded text-[#6e6e73]">+{p.conditions.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${p.compositeRisk >= 4 ? 'text-[#ef4444]' : p.compositeRisk >= 2.5 ? 'text-[#f59e0b]' : 'text-[#1d1d1f]'}`}>{p.compositeRisk}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${RUB_COLORS[p.rub] || '#6b7280'}20`, color: RUB_COLORS[p.rub] || '#6b7280' }}>{p.rub}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{fmtFull(Math.round(p.predictedCost))}</td>
                      <td className="px-4 py-3 max-w-[400px]">
                        <div className="space-y-1">
                          {p.actions.map((a: any, j: number) => {
                            const typeIcons: Record<string, string> = { medication: '💊', program: '🏥', screening: '🔍', provider: '👨‍⚕️', social: '🤝' };
                            const typeBg: Record<string, string> = { medication: 'bg-purple-50 border-purple-100', program: 'bg-blue-50 border-blue-100', screening: 'bg-emerald-50 border-emerald-100', provider: 'bg-orange-50 border-orange-100', social: 'bg-cyan-50 border-cyan-100' };
                            return (
                              <div key={j} className={`flex items-start gap-1.5 px-2 py-1 rounded border ${typeBg[a.type] || 'bg-gray-50 border-gray-100'}`}>
                                <span className="text-[10px] mt-px">{typeIcons[a.type] || '📋'}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-[#1d1d1f] leading-tight">{a.description}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] text-[#10b981] font-medium">+{fmtFull(a.estimatedSavings)}</span>
                                    <span className="text-[9px] text-[#86868b]">{Math.round(a.confidence * 100)}% confidence</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#10b981]">{fmtFull(p.totalActionSavings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#26acf7" />
    </DashboardLayout>
  );
}
