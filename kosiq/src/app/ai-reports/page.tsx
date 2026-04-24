'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';

interface Recommendation {
  title: string;
  description: string;
  priority: string;
  impact: string;
  affectedPatients: number;
}

interface AIReport {
  id: string;
  period: string;
  title: string;
  executiveSummary: string;
  keyMetrics: any;
  costDrivers: any;
  riskAlerts: any;
  qualityGaps: any;
  referralPatterns: any;
  recommendations: Recommendation[];
  generatedAt: string;
}

export default function AIReportsPage() {
  const [reports, setReports] = useState<AIReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai-reports')
      .then(r => r.json())
      .then(data => {
        setReports(data);
        if (data.length > 0) setSelectedReport(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      if (reports.length > 0) setSelectedReport(reports[0]);
    }, 2500);
  };

  const priorityColor = (p: string) => {
    if (p === 'Critical') return 'bg-red-50 text-red-700 border-red-200';
    if (p === 'High') return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">AI Recommendations</h1>
            <p className="text-sm text-[#86868b] mt-1">AI-generated intelligence reports with actionable recommendations</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 bg-[#0071e3] text-white rounded-xl text-sm font-medium hover:bg-[#0077ED] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Report...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Report List */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-[#1d1d1f]">Available Reports</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {reports.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className={`w-full text-left px-4 py-3 transition-all ${selectedReport?.id === r.id ? 'bg-[#0071e3]/5 border-l-2 border-[#0071e3]' : 'hover:bg-gray-50 border-l-2 border-transparent'}`}
                  >
                    <p className="text-sm font-medium text-[#1d1d1f]">{r.title}</p>
                    <p className="text-xs text-[#86868b] mt-0.5">{r.period}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Content */}
          {selectedReport && (
            <div className="flex-1 space-y-6">
              {/* Header */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center">
                    <span className="text-[#0071e3] text-sm font-bold">AI</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1d1d1f]">{selectedReport.title}</h2>
                    <p className="text-xs text-[#86868b]">Generated {new Date(selectedReport.generatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="bg-[#f5f5f7] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#1d1d1f] mb-2">Executive Summary</h3>
                  <p className="text-sm text-[#6e6e73] leading-relaxed">{selectedReport.executiveSummary}</p>
                </div>
              </div>

              {/* Key Metrics */}
              {selectedReport.keyMetrics && (
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'PMPM', value: `$${Math.round(selectedReport.keyMetrics.pmpm).toLocaleString()}` },
                    { label: 'ER Rate/1K', value: Math.round(selectedReport.keyMetrics.erRate).toString() },
                    { label: 'Readmission %', value: `${selectedReport.keyMetrics.readmitPct.toFixed(1)}%` },
                    { label: 'MRA Score', value: selectedReport.keyMetrics.mra.toFixed(2) },
                  ].map((m, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <p className="text-xs text-[#86868b] uppercase tracking-wider">{m.label}</p>
                      <p className="text-2xl font-semibold text-[#1d1d1f] mt-2">{m.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Cost Drivers */}
              {selectedReport.costDrivers && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Cost Drivers</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Inpatient', pct: selectedReport.costDrivers.inpatientPct },
                      { label: 'Pharmacy', pct: selectedReport.costDrivers.pharmacyPct },
                      { label: 'ER', pct: selectedReport.costDrivers.erPct },
                      { label: 'Specialist', pct: selectedReport.costDrivers.specialistPct },
                    ].map((d, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#6e6e73]">{d.label}</span>
                          <span className="font-medium text-[#1d1d1f]">{d.pct.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-[#0071e3] h-2 rounded-full" style={{ width: `${d.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Gaps */}
              {selectedReport.qualityGaps && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Quality Metrics</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'HEDIS Measure Gaps', value: selectedReport.qualityGaps.hedisGaps, target: '0' },
                      { label: 'AWV Completion', value: `${selectedReport.qualityGaps.awvCompletion.toFixed(0)}%`, target: '75%' },
                      { label: 'Diabetic Eye Exam', value: `${selectedReport.qualityGaps.diabeticEyeExam.toFixed(0)}%`, target: '65%' },
                      { label: 'Mammogram Rate', value: `${selectedReport.qualityGaps.mammogramRate.toFixed(0)}%`, target: '70%' },
                    ].map((q, i) => (
                      <div key={i} className="bg-[#f5f5f7] rounded-xl p-4">
                        <p className="text-xs text-[#86868b]">{q.label}</p>
                        <p className="text-xl font-semibold text-[#1d1d1f] mt-1">{q.value}</p>
                        <p className="text-xs text-[#86868b] mt-1">Target: {q.target}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Actionable Recommendations</h3>
                <div className="space-y-4">
                  {selectedReport.recommendations.map((rec, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${priorityColor(rec.priority)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${rec.priority === 'Critical' ? 'bg-red-100 text-red-800' : rec.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                              {rec.priority}
                            </span>
                            <span className="text-sm font-semibold text-[#1d1d1f]">{rec.title}</span>
                          </div>
                          <p className="text-sm text-[#6e6e73] mt-1">{rec.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-6 mt-3 pt-3 border-t border-current/10">
                        <div>
                          <p className="text-[10px] uppercase text-[#86868b]">Financial Impact</p>
                          <p className="text-sm font-semibold text-[#1d1d1f]">{rec.impact}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-[#86868b]">Affected Patients</p>
                          <p className="text-sm font-semibold text-[#1d1d1f]">{rec.affectedPatients}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
