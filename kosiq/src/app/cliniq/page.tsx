'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialAnalyses = [
  { id: 1, name: 'Diabetes Complications Tree', metrics: 47, patients: 3240, lastRun: '2 hours ago', status: 'active', alerts: 12 },
  { id: 2, name: 'CHF Risk Cascade', metrics: 32, patients: 1856, lastRun: '6 hours ago', status: 'active', alerts: 8 },
  { id: 3, name: 'Hypertension Control Pathway', metrics: 28, patients: 5412, lastRun: '1 day ago', status: 'active', alerts: 23 },
  { id: 4, name: 'COPD Exacerbation Triggers', metrics: 19, patients: 892, lastRun: '3 hours ago', status: 'paused', alerts: 5 },
  { id: 5, name: 'Medication Adherence Impact', metrics: 53, patients: 7231, lastRun: '12 hours ago', status: 'active', alerts: 31 },
  { id: 6, name: 'Post-Surgical Outcome Analysis', metrics: 41, patients: 1124, lastRun: '2 days ago', status: 'active', alerts: 2 },
];

const recentQueries = [
  'Show me patients with HbA1c > 9 and no ophthalmology visit in 12 months',
  'Build tree for CHF patients with 3+ ED visits, stratify by ejection fraction',
  'Analyze medication adherence patterns for statin therapy by provider',
  'Which diabetic patients have rising creatinine and no nephrology referral?',
];

const metricCategories = [
  { name: 'Clinical Labs', count: 247, color: '#8B5CF6' },
  { name: 'Diagnoses', count: 312, color: '#A78BFA' },
  { name: 'Medications', count: 189, color: '#7C3AED' },
  { name: 'Vitals', count: 84, color: '#6D28D9' },
  { name: 'Procedures', count: 156, color: '#5B21B6' },
  { name: 'Social Determinants', count: 67, color: '#4C1D95' },
];

// Tree generation results
const treeResults: Record<string, { nodes: { label: string; count: number; pct: string }[]; total: number }> = {
  'default': {
    total: 3420,
    nodes: [
      { label: 'HbA1c > 9.0', count: 1240, pct: '36.3%' },
      { label: 'No Ophthalmology Visit (12mo)', count: 892, pct: '26.1%' },
      { label: 'No Foot Exam (12mo)', count: 673, pct: '19.7%' },
      { label: 'eGFR < 60 (CKD Risk)', count: 412, pct: '12.0%' },
      { label: 'No A1C Test (6mo)', count: 203, pct: '5.9%' },
    ]
  }
};

export default function ClinIQDashboard() {
  const [query, setQuery] = useState('');
  const [analyses, setAnalyses] = useState(initialAnalyses);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTreeResult, setShowTreeResult] = useState(false);
  const [generatingTree, setGeneratingTree] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  const toast = useToast();

  const handleGenerateTree = () => {
    if (!query.trim()) { toast('Please enter a query first', 'error'); return; }
    setGeneratingTree(true);
    setTimeout(() => {
      setGeneratingTree(false);
      setShowTreeResult(true);
      toast('Tree analysis generated successfully');
    }, 1500);
  };

  const handleNewAnalysis = () => {
    if (!newName.trim()) { toast('Please enter an analysis name', 'error'); return; }
    const a = {
      id: Date.now(),
      name: newName,
      metrics: Math.floor(Math.random() * 40) + 10,
      patients: Math.floor(Math.random() * 5000) + 500,
      lastRun: 'Just now',
      status: 'active' as const,
      alerts: 0,
    };
    setAnalyses([a, ...analyses]);
    setShowNewModal(false);
    setNewName('');
    setNewDesc('');
    toast(`Analysis "${a.name}" created`);
  };

  const toggleStatus = (id: number) => {
    setAnalyses(analyses.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a));
    const a = analyses.find(x => x.id === id);
    toast(`${a?.name} ${a?.status === 'active' ? 'paused' : 'activated'}`);
  };

  const deleteAnalysis = (id: number) => {
    const a = analyses.find(x => x.id === id);
    setAnalyses(analyses.filter(x => x.id !== id));
    toast(`"${a?.name}" deleted`, 'error');
  };

  const runAnalysis = (id: number) => {
    setAnalyses(analyses.map(a => a.id === id ? { ...a, lastRun: 'Just now', alerts: Math.floor(Math.random() * 20) } : a));
    toast('Analysis running...');
  };

  const filtered = analyses.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">ClinIQ — Clinical Intelligence</h1>
            <p className="text-sm text-[#86868b] mt-1">AI-powered clinical decision tree analysis</p>
          </div>
          <button onClick={() => setShowNewModal(true)} className="px-4 py-2 bg-[#8B5CF6] text-white text-xs font-medium rounded-lg hover:bg-[#7C3AED] transition-colors">
            + New Analysis
          </button>
        </div>

        {/* AI Search Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <label className="text-sm font-medium text-[#1d1d1f] mb-3 block">AI-Powered Analysis Search</label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerateTree()}
              placeholder="Ask anything... e.g., 'Show patients with uncontrolled diabetes and rising A1C'"
              className="w-full px-4 py-3 pr-28 bg-[#f5f5f7] rounded-xl border-none outline-none text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:ring-2 focus:ring-[#8B5CF6]/30"
            />
            <button
              onClick={handleGenerateTree}
              disabled={generatingTree}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#8B5CF6] text-white text-xs font-medium rounded-lg hover:bg-[#7C3AED] transition-colors disabled:opacity-50"
            >
              {generatingTree ? 'Generating...' : 'Generate Tree'}
            </button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {recentQueries.map((q, i) => (
              <button key={i} onClick={() => { setQuery(q); setShowTreeResult(false); }} className="px-3 py-1 bg-[#f5f5f7] text-[#6e6e73] text-[11px] rounded-full hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] transition-colors truncate max-w-xs">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Tree Result */}
        {showTreeResult && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#8B5CF6]/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1d1d1f]">Analysis Result</h3>
                <p className="text-xs text-[#86868b] mt-1">{query}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  const a = { id: Date.now(), name: query.slice(0, 50), metrics: treeResults.default.nodes.length, patients: treeResults.default.total, lastRun: 'Just now', status: 'active' as const, alerts: 0 };
                  setAnalyses([a, ...analyses]);
                  toast('Analysis saved');
                }} className="px-3 py-1.5 bg-[#8B5CF6] text-white text-xs rounded-lg hover:bg-[#7C3AED]">Save Analysis</button>
                <button onClick={() => setShowTreeResult(false)} className="px-3 py-1.5 bg-gray-100 text-[#6e6e73] text-xs rounded-lg hover:bg-gray-200">Close</button>
              </div>
            </div>
            <p className="text-sm text-[#8B5CF6] font-semibold mb-3 cursor-pointer hover:underline" onClick={() => setDrillDown({ label: 'Tree Analysis — All Identified', count: treeResults.default.total })}>{treeResults.default.total.toLocaleString()} patients identified</p>
            <div className="space-y-2">
              {treeResults.default.nodes.map((n, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-64">
                    <span className="text-xs text-[#86868b] w-4">{i + 1}.</span>
                    <span className="text-sm text-[#1d1d1f]">{n.label}</span>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div className="h-full bg-[#8B5CF6] rounded-full flex items-center justify-end pr-2 transition-all duration-500" style={{ width: n.pct }}>
                      <span className="text-[10px] text-white font-medium">{n.pct}</span>
                    </div>
                  </div>
                  <span className="text-xs text-[#6e6e73] w-16 text-right cursor-pointer hover:underline hover:text-[#8B5CF6]" onClick={() => setDrillDown({ label: n.label, count: n.count })}>{n.count.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Analyses', value: analyses.filter(a => a.status === 'active').length.toString(), change: `${analyses.length} total` },
            { label: 'Total Metrics', value: '1,055', change: '6 categories' },
            { label: 'Patients Analyzed', value: '18,432', change: '92% of pop.', clickCount: 18432 },
            { label: 'Active Alerts', value: analyses.reduce((s, a) => s + a.alerts, 0).toString(), change: `${analyses.filter(a => a.alerts > 10).length} high` },
          ].map((s: any, i: number) => (
            <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100${s.clickCount ? ' cursor-pointer' : ''}`} onClick={() => s.clickCount && setDrillDown({ label: s.label, count: s.clickCount })}>
              <p className="text-[#86868b] text-xs mb-1">{s.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{s.value}</p>
              <p className="text-[11px] text-[#8B5CF6] mt-1">{s.change}</p>
            </div>
          ))}
        </div>

        {/* Metric Categories */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Metric Categories</h3>
          <div className="grid grid-cols-6 gap-3">
            {metricCategories.map(c => (
              <div key={c.name} onClick={() => toast(`Browsing ${c.name} — ${c.count} metrics available`)} className="text-center p-4 rounded-xl hover:bg-[#f5f5f7] transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: c.color }}>
                  {c.count}
                </div>
                <p className="text-xs text-[#1d1d1f] font-medium">{c.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Analyses Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1d1d1f]">Saved Analyses</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search analyses..."
                className="px-3 py-1.5 bg-[#f5f5f7] rounded-lg text-xs outline-none w-48 focus:ring-2 focus:ring-[#8B5CF6]/30"
              />
              <button onClick={() => setShowNewModal(true)} className="px-3 py-1.5 bg-[#8B5CF6] text-white text-xs font-medium rounded-lg hover:bg-[#7C3AED]">+ New Analysis</button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-3">Analysis</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-3">Metrics</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-3">Patients</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-3">Last Run</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-3">Alerts</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-3">Status</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 text-sm font-medium text-[#1d1d1f]">{a.name}</td>
                  <td className="py-3 text-sm text-right text-[#6e6e73]">{a.metrics}</td>
                  <td className="py-3 text-sm text-right text-[#6e6e73] cursor-pointer hover:text-[#8B5CF6] hover:underline" onClick={() => setDrillDown({ label: a.name, count: a.patients })}>{a.patients.toLocaleString()}</td>
                  <td className="py-3 text-xs text-right text-[#86868b]">{a.lastRun}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs rounded-full">{a.alerts}</span>
                  </td>
                  <td className="py-3 text-center">
                    <button onClick={() => toggleStatus(a.id)} className={`px-2 py-0.5 text-xs rounded-full cursor-pointer ${a.status === 'active' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}>
                      {a.status}
                    </button>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => runAnalysis(a.id)} className="px-2 py-1 text-[10px] bg-[#8B5CF6]/10 text-[#8B5CF6] rounded hover:bg-[#8B5CF6]/20" title="Run">Run</button>
                      <button onClick={() => deleteAnalysis(a.id)} className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded hover:bg-red-100" title="Delete">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-sm text-[#86868b] py-8">No analyses found</p>}
        </div>
      </div>

      {/* New Analysis Modal */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="New Analysis">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#1d1d1f] block mb-1">Analysis Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNewAnalysis()}
              placeholder="e.g., Diabetes Risk Pathway"
              className="w-full px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#8B5CF6]/30"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1d1d1f] block mb-1">Description (optional)</label>
            <textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="What does this analysis look for?"
              className="w-full px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 h-20 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1d1d1f] block mb-2">Quick Templates</label>
            <div className="grid grid-cols-2 gap-2">
              {['Diabetes Management', 'CHF Risk Cascade', 'Medication Adherence', 'ER Utilization'].map(t => (
                <button key={t} onClick={() => { setNewName(t); }} className="px-3 py-2 bg-[#f5f5f7] text-xs text-[#6e6e73] rounded-lg hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] text-left">
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm text-[#6e6e73] hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleNewAnalysis} className="px-4 py-2 text-sm bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED]">Create Analysis</button>
          </div>
        </div>
      </Modal>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#8B5CF6" />
    </DashboardLayout>
  );
}
