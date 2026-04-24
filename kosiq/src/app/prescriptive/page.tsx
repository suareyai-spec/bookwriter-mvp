'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useState, useEffect } from 'react';
import {
  ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, ZAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
const fmtFull = (n: number) => `$${n.toLocaleString()}`;

const RUB_COLORS: Record<string, string> = {
  'Non-User': '#d1d5db', 'Healthy': '#10b981', 'Low': '#34d399',
  'Moderate': '#f59e0b', 'High': '#f97316', 'Very High': '#ef4444',
};

export default function PrescriptivePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [programFilter, setProgramFilter] = useState('all');
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);

  useEffect(() => {
    fetch('/api/predictive')
      .then(r => r.json())
      .then(d => { setData(d.prescriptive); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#26acf7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#86868b]">Running prescriptive analytics engine...</p>
        </div>
      </div>
    </DashboardLayout>
  );

  if (!data) return (
    <DashboardLayout>
      <div className="text-center py-20 text-[#86868b]">No prescriptive data available.</div>
    </DashboardLayout>
  );

  const filteredPrograms = programFilter === 'all' 
    ? data.populationPrograms 
    : data.populationPrograms.filter((p: any) => p.priority === programFilter);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white text-sm font-bold">Rx</div>
            <div>
              <h1 className="text-xl font-semibold text-[#1d1d1f]">Prescriptive Analytics</h1>
              <p className="text-sm text-[#86868b]">AI-recommended actions: what SHOULD be done and the expected ROI</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Potential Savings', value: fmt(data.summary.totalPrescriptiveSavings), sub: 'Across all recommended programs', color: '#10b981' },
            { label: 'Implementation Cost', value: fmt(data.summary.totalImplementationCost), sub: 'Total investment required', color: '#f59e0b' },
            { label: 'Net Savings', value: fmt(data.summary.netSavings), sub: `Overall ROI: ${data.summary.overallROI}x`, color: '#26acf7' },
            { label: 'Patients Impacted', value: data.summary.totalPatientsImpacted, sub: `${data.summary.quickWins} quick wins, ${data.summary.strategicInvestments} strategic`, color: '#8b5cf6', clickCount: data.summary.totalPatientsImpacted },
          ].map((s: any, i: number) => (
            <div key={i} className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100${s.clickCount ? ' cursor-pointer' : ''}`} onClick={() => s.clickCount && setDrillDown({ label: s.label, count: typeof s.clickCount === 'string' ? parseInt(String(s.clickCount).replace(/,/g,'')) : s.clickCount })}>
              <p className="text-xs text-[#86868b] mb-1">{s.label}</p>
              <p className="text-3xl font-semibold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-[#86868b] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Intervention Priority Matrix */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f]">Intervention Priority Matrix</h2>
              <p className="text-xs text-[#86868b]">Bubble size = target population. Position = difficulty vs expected impact.</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#10b981]" /> Quick Win</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#26acf7]" /> Strategic</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f59e0b]" /> Monitor</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#9ca3af]" /> Deprioritize</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={450}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 45, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" dataKey="x" name="Difficulty" domain={[0, 5]} tick={{ fontSize: 11 }} label={{ value: 'Implementation Difficulty →', position: 'insideBottom', fontSize: 12, offset: -10 }} />
              <YAxis type="number" dataKey="y" name="Impact" domain={[0, 5.5]} tick={{ fontSize: 11 }} label={{ value: '← Expected Impact', angle: -90, position: 'insideLeft', fontSize: 12, offset: 10 }} />
              <ZAxis type="number" dataKey="z" range={[80, 600]} name="Patients" />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 text-xs max-w-[280px]">
                      <p className="font-semibold text-[#1d1d1f] mb-1 text-sm">{d.name}</p>
                      <p className="text-[#86868b]">Target: {d.z} patients</p>
                      <p className="text-[#86868b]">Difficulty: {d.x}/5 | Impact: {d.y}/5</p>
                      <p className="text-[#10b981] font-medium mt-1">ROI: {d.roi}x | Savings: {fmtFull(d.savings)}</p>
                      <p className="mt-1 font-semibold" style={{ color: d.color }}>{d.quadrant}</p>
                    </div>
                  );
                }}
              />
              {(() => {
                const md = data.matrixData || [];
                const groups: Record<string, any[]> = { '#10b981': [], '#26acf7': [], '#f59e0b': [], '#9ca3af': [] };
                md.forEach((d: any) => (groups[d.color] || groups['#9ca3af']).push(d));
                return Object.entries(groups).filter(([, arr]) => arr.length > 0).map(([color, arr]) => (
                  <Scatter key={color} data={arr} fill={color} fillOpacity={0.75} />
                ));
              })()}
            </ScatterChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="text-center p-3 bg-[#10b981]/5 rounded-lg border border-[#10b981]/20">
              <p className="text-xs font-semibold text-[#10b981]">Quick Wins</p>
              <p className="text-[10px] text-[#86868b]">Low difficulty, high impact</p>
            </div>
            <div className="text-center p-3 bg-[#26acf7]/5 rounded-lg border border-[#26acf7]/20">
              <p className="text-xs font-semibold text-[#26acf7]">Strategic Investments</p>
              <p className="text-[10px] text-[#86868b]">High difficulty, high impact</p>
            </div>
            <div className="text-center p-3 bg-[#f59e0b]/5 rounded-lg border border-[#f59e0b]/20">
              <p className="text-xs font-semibold text-[#f59e0b]">Monitor</p>
              <p className="text-[10px] text-[#86868b]">Low difficulty, low impact</p>
            </div>
            <div className="text-center p-3 bg-gray-100 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-[#9ca3af]">Deprioritize</p>
              <p className="text-[10px] text-[#86868b]">High difficulty, low impact</p>
            </div>
          </div>
        </div>

        {/* Population Programs ROI */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f]">Recommended Population Programs</h2>
              <p className="text-xs text-[#86868b]">Data-driven intervention programs with ROI projections</p>
            </div>
            <div className="flex items-center gap-2">
              {['all', 'High', 'Medium', 'Low'].map(f => (
                <button key={f} onClick={() => setProgramFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${programFilter === f ? 'bg-[#26acf7] text-white' : 'bg-gray-100 text-[#6e6e73] hover:bg-gray-200'}`}>
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f5f5f7]">
                    {['Program', 'Priority', 'Target Pop.', 'Cost', 'Est. Savings', 'ROI', 'Payback', 'Outcome'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#86868b] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.map((prog: any, i: number) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-[#1d1d1f]">{prog.name}</p>
                        <p className="text-xs text-[#86868b] mt-0.5 max-w-[220px]">{prog.description}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          prog.priority === 'High' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                          prog.priority === 'Medium' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                          'bg-gray-100 text-gray-500'
                        }`}>{prog.priority}</span>
                      </td>
                      <td className="px-4 py-4 font-medium cursor-pointer hover:underline hover:text-[#26acf7]" onClick={() => setDrillDown({ label: prog.name, count: prog.targetPopulation })}>{prog.targetPopulation} pts</td>
                      <td className="px-4 py-4 text-[#f59e0b] font-medium">{fmtFull(prog.implementationCost)}</td>
                      <td className="px-4 py-4 text-[#10b981] font-bold">{fmtFull(prog.estimatedSavings)}</td>
                      <td className="px-4 py-4">
                        <span className={`font-bold text-lg ${prog.netROI >= 2 ? 'text-[#10b981]' : prog.netROI >= 1 ? 'text-[#26acf7]' : 'text-[#f59e0b]'}`}>{prog.netROI}x</span>
                      </td>
                      <td className="px-4 py-4 font-medium">{prog.paybackMonths} mo</td>
                      <td className="px-4 py-4 text-xs text-[#86868b] max-w-[200px]">{prog.expectedOutcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Patient-Level Prescriptions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f]">Patient-Level Prescriptions</h2>
              <p className="text-xs text-[#86868b]">Specific recommended actions for top 30 high-risk patients</p>
            </div>
            <div className="text-xs text-[#86868b]">
              Total patient-level savings: <span className="font-bold text-[#10b981] text-sm">{fmtFull(data.patientPrescriptions.reduce((s: number, p: any) => s + p.totalActionSavings, 0))}</span>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f5f5f7]">
                  {['Patient', 'Risk', 'RUB', 'Predicted Cost', 'Recommended Actions', 'Est. Savings'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#86868b] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.patientPrescriptions.map((p: any, i: number) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1d1d1f]">{p.name}</p>
                      <p className="text-xs text-[#86868b]">Age {p.age} • {p.pcp}</p>
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {p.conditions.slice(0, 3).map((c: string, j: number) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-[#6e6e73]">{c}</span>
                        ))}
                        {p.conditions.length > 3 && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-[#6e6e73]">+{p.conditions.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-lg font-bold ${p.compositeRisk >= 4 ? 'text-[#ef4444]' : p.compositeRisk >= 2.5 ? 'text-[#f59e0b]' : 'text-[#1d1d1f]'}`}>{p.compositeRisk}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${RUB_COLORS[p.rub] || '#6b7280'}20`, color: RUB_COLORS[p.rub] || '#6b7280' }}>{p.rub}</span>
                    </td>
                    <td className="px-4 py-3 font-medium">{fmtFull(Math.round(p.predictedCost))}</td>
                    <td className="px-4 py-3 max-w-[420px]">
                      <div className="space-y-1.5">
                        {p.actions.map((a: any, j: number) => {
                          const typeIcons: Record<string, string> = { medication: '💊', program: '🏥', screening: '🔍', provider: '👨‍⚕️', social: '🤝' };
                          const typeBg: Record<string, string> = { medication: 'bg-purple-50 border-purple-100', program: 'bg-blue-50 border-blue-100', screening: 'bg-emerald-50 border-emerald-100', provider: 'bg-orange-50 border-orange-100', social: 'bg-cyan-50 border-cyan-100' };
                          return (
                            <div key={j} className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg border ${typeBg[a.type] || 'bg-gray-50 border-gray-100'}`}>
                              <span className="text-xs mt-px">{typeIcons[a.type] || '📋'}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-[#1d1d1f] leading-tight">{a.description}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-[#10b981] font-medium">+{fmtFull(a.estimatedSavings)}</span>
                                  <span className="text-[10px] text-[#86868b]">{Math.round(a.confidence * 100)}% confidence</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#10b981] text-base">{fmtFull(p.totalActionSavings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#26acf7" />
    </DashboardLayout>
  );
}
