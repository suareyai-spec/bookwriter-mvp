'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import jsPDF from 'jspdf';

const initialTrees = [
  { id: 1, name: 'Diabetes Complications', nodes: 8, patients: 3240, created: '2026-02-15', status: 'active', alerts: true, lastRun: '2h ago',
    results: [{ label: 'HbA1c > 9', count: 1240 }, { label: 'No Eye Exam', count: 892 }, { label: 'No Foot Exam', count: 673 }, { label: 'CKD Risk', count: 412 }] },
  { id: 2, name: 'CHF Risk Cascade', nodes: 6, patients: 1856, created: '2026-02-18', status: 'active', alerts: true, lastRun: '6h ago',
    results: [{ label: 'EF < 40%', count: 620 }, { label: '3+ ED Visits', count: 445 }, { label: 'Med Non-Adherent', count: 391 }, { label: 'No Cardio F/U', count: 400 }] },
  { id: 3, name: 'COPD Exacerbation', nodes: 5, patients: 892, created: '2026-02-20', status: 'paused', alerts: false, lastRun: '3d ago',
    results: [{ label: 'FEV1 < 50%', count: 340 }, { label: 'Frequent Steroid Use', count: 267 }, { label: '2+ Hospitalizations', count: 185 }, { label: 'No Pulm Rehab', count: 100 }] },
  { id: 4, name: 'Medication Adherence', nodes: 7, patients: 7231, created: '2026-02-22', status: 'active', alerts: true, lastRun: '12h ago',
    results: [{ label: 'Statin PDC < 80%', count: 2100 }, { label: 'ACE/ARB Gap', count: 1890 }, { label: 'Metformin Lapse', count: 1600 }, { label: 'Insulin Non-Fill', count: 1641 }] },
];

export default function AnalysisPage() {
  const [trees, setTrees] = useState(initialTrees);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showAlertConfig, setShowAlertConfig] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  const toast = useToast();

  const handleNewTree = () => {
    if (!newName.trim()) { toast('Enter a tree name', 'error'); return; }
    const t = { id: Date.now(), name: newName, nodes: 0, patients: 0, created: new Date().toISOString().slice(0, 10), status: 'active' as const, alerts: false, lastRun: 'Never', results: [] };
    setTrees([t, ...trees]);
    setShowNew(false);
    setNewName('');
    toast(`Tree "${t.name}" created — go to Builder to add nodes`);
  };

  const buildPdf = (items: typeof trees, title: string) => {
    const doc = new jsPDF();
    const blue = [139, 92, 246] as const;
    const dark = [29, 29, 31] as const;
    const gray = [134, 134, 139] as const;
    let y = 20;

    // Header
    doc.setFontSize(18); doc.setTextColor(...dark);
    doc.text('ClinIQ — Clinical Intelligence', 14, y); y += 8;
    doc.setFontSize(11); doc.setTextColor(...gray);
    doc.text(title, 14, y); y += 4;
    doc.setDrawColor(...blue); doc.setLineWidth(0.5);
    doc.line(14, y, 196, y); y += 10;

    items.forEach((t, idx) => {
      if (y > 250) { doc.addPage(); y = 20; }

      doc.setFontSize(13); doc.setTextColor(...dark);
      doc.text(`${idx + 1}. ${t.name}`, 14, y); y += 7;
      doc.setFontSize(9); doc.setTextColor(...gray);
      doc.text(`Nodes: ${t.nodes}  |  Patients: ${t.patients.toLocaleString()}  |  Status: ${t.status}  |  Last Run: ${t.lastRun}  |  Created: ${t.created}`, 14, y); y += 8;

      if (t.results.length > 0) {
        doc.setFontSize(9); doc.setTextColor(...blue);
        doc.text('Results:', 14, y); y += 5;
        t.results.forEach(r => {
          if (y > 275) { doc.addPage(); y = 20; }
          const pct = ((r.count / t.patients) * 100).toFixed(1);
          // Bar background
          doc.setFillColor(240, 240, 245); doc.rect(14, y - 3, 120, 5, 'F');
          // Bar fill
          doc.setFillColor(...blue); doc.rect(14, y - 3, 120 * (r.count / t.patients), 5, 'F');
          doc.setFontSize(8); doc.setTextColor(...dark);
          doc.text(`${r.label}`, 138, y); 
          doc.text(`${r.count.toLocaleString()} (${pct}%)`, 178, y, { align: 'right' });
          y += 7;
        });
      }
      y += 6;
    });

    // Footer
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(...gray);
      doc.text(`KOSIQ ClinIQ Report — Generated ${new Date().toLocaleDateString()} — Page ${i} of ${pages}`, 105, 290, { align: 'center' });
    }

    return doc;
  };

  const handleExport = (id: number) => {
    const t = trees.find(x => x.id === id);
    if (!t) return;
    const doc = buildPdf([t], `Analysis: ${t.name}`);
    doc.save(`${t.name.replace(/\s+/g, '-')}-report.pdf`);
    toast(`"${t.name}" exported as PDF`);
  };

  const handleExportAll = () => {
    const doc = buildPdf(trees, `All Analyses — ${trees.length} trees`);
    doc.save('ClinIQ-All-Analyses-Report.pdf');
    toast(`All ${trees.length} analyses exported as PDF`);
  };

  const toggleAlerts = (id: number) => {
    setTrees(trees.map(t => t.id === id ? { ...t, alerts: !t.alerts } : t));
    const t = trees.find(x => x.id === id);
    toast(`Alerts ${t?.alerts ? 'disabled' : 'enabled'} for "${t?.name}"`);
  };

  const toggleStatus = (id: number) => {
    setTrees(trees.map(t => t.id === id ? { ...t, status: t.status === 'active' ? 'paused' : 'active' } : t));
  };

  const runTree = (id: number) => {
    setTrees(trees.map(t => t.id === id ? { ...t, lastRun: 'Just now', patients: t.patients + Math.floor(Math.random() * 50) } : t));
    toast('Analysis running...');
  };

  const deleteTree = (id: number) => {
    const t = trees.find(x => x.id === id);
    setTrees(trees.filter(x => x.id !== id));
    toast(`"${t?.name}" deleted`, 'error');
  };

  const filtered = trees.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Analysis Trees</h1>
            <p className="text-sm text-[#86868b] mt-1">{trees.length} saved analyses</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportAll} className="px-4 py-2 border border-gray-200 text-sm rounded-xl hover:bg-gray-50">Export All</button>
            <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-[#8B5CF6] text-white text-sm font-medium rounded-xl hover:bg-[#7C3AED]">+ New Tree</button>
          </div>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search analyses..." className="w-full px-4 py-2.5 bg-[#f5f5f7] rounded-xl text-sm outline-none mb-6 focus:ring-2 focus:ring-[#8B5CF6]/30" />

        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                <span className="text-[#86868b] text-xs">{expanded === t.id ? '▼' : '▶'}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1d1d1f]">{t.name}</p>
                  <p className="text-[10px] text-[#86868b]">{t.nodes} nodes · <span className="cursor-pointer hover:underline hover:text-[#8B5CF6]" onClick={(e) => { e.stopPropagation(); setDrillDown({ label: t.name, count: t.patients }); }}>{t.patients.toLocaleString()} patients</span> · Last run: {t.lastRun}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); toggleAlerts(t.id); }} className={`px-2 py-1 text-[10px] rounded-full ${t.alerts ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'bg-gray-100 text-[#86868b]'}`}>
                  Alerts {t.alerts ? 'ON' : 'OFF'}
                </button>
                <button onClick={e => { e.stopPropagation(); toggleStatus(t.id); }} className={`px-2 py-1 text-[10px] rounded-full ${t.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                  {t.status}
                </button>
                <button onClick={e => { e.stopPropagation(); runTree(t.id); }} className="px-2 py-1 text-[10px] bg-[#8B5CF6]/10 text-[#8B5CF6] rounded hover:bg-[#8B5CF6]/20">Run</button>
                <button onClick={e => { e.stopPropagation(); handleExport(t.id); }} className="px-2 py-1 text-[10px] bg-gray-100 text-[#6e6e73] rounded hover:bg-gray-200">Export</button>
                <button onClick={e => { e.stopPropagation(); deleteTree(t.id); }} className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded hover:bg-red-100">Del</button>
              </div>
              {expanded === t.id && t.results.length > 0 && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-[#86868b] mb-3">Tree Results</p>
                  <div className="space-y-2">
                    {t.results.map((r, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-[#86868b] w-4">{i + 1}.</span>
                        <span className="text-sm text-[#1d1d1f] w-48">{r.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                          <div className="h-full bg-[#8B5CF6] rounded-full flex items-center justify-end pr-2" style={{ width: `${(r.count / t.patients * 100).toFixed(0)}%` }}>
                            <span className="text-[9px] text-white font-medium">{(r.count / t.patients * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <span className="text-xs text-[#6e6e73] w-16 text-right cursor-pointer hover:underline hover:text-[#8B5CF6]" onClick={() => setDrillDown({ label: r.label, count: r.count })}>{r.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-sm text-[#86868b] py-12">No analyses found</p>}
        </div>
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Analysis Tree">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#1d1d1f] block mb-1">Tree Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNewTree()} placeholder="e.g., CKD Progression Risk" className="w-full px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#8B5CF6]/30" autoFocus />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1d1d1f] block mb-2">Quick Start Templates</label>
            <div className="grid grid-cols-2 gap-2">
              {['Diabetes Management', 'Heart Failure Risk', 'CKD Progression', 'Readmission Prevention', 'Medication Adherence', 'ER Utilization'].map(t => (
                <button key={t} onClick={() => setNewName(t)} className={`px-3 py-2 text-xs rounded-lg text-left transition-colors ${newName === t ? 'bg-[#8B5CF6] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#8B5CF6]/10'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-[#6e6e73] hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleNewTree} className="px-4 py-2 text-sm bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED]">Create Tree</button>
          </div>
        </div>
      </Modal>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#8B5CF6" />
    </DashboardLayout>
  );
}
