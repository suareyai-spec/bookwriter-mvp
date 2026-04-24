'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialMetrics = [
  { id: 1, name: 'HbA1c', category: 'Labs', type: 'Numeric', source: 'Lab Interface', usage: 342, description: 'Glycated hemoglobin, 3-month glucose average' },
  { id: 2, name: 'LDL Cholesterol', category: 'Labs', type: 'Numeric', source: 'Lab Interface', usage: 289, description: 'Low-density lipoprotein cholesterol level' },
  { id: 3, name: 'eGFR', category: 'Labs', type: 'Numeric', source: 'Lab Interface', usage: 267, description: 'Estimated glomerular filtration rate' },
  { id: 4, name: 'Blood Pressure Systolic', category: 'Vitals', type: 'Numeric', source: 'EMR', usage: 456, description: 'Systolic blood pressure measurement' },
  { id: 5, name: 'BMI', category: 'Vitals', type: 'Numeric', source: 'EMR', usage: 412, description: 'Body mass index calculation' },
  { id: 6, name: 'PHQ-9 Score', category: 'Assessments', type: 'Score', source: 'Screening', usage: 198, description: 'Patient Health Questionnaire depression screening' },
  { id: 7, name: 'Diabetes Dx', category: 'Diagnoses', type: 'Boolean', source: 'Claims/EMR', usage: 523, description: 'Active diabetes diagnosis (ICD E11.x)' },
  { id: 8, name: 'Statin Rx', category: 'Medications', type: 'Boolean', source: 'Pharmacy', usage: 301, description: 'Active statin prescription' },
  { id: 9, name: 'ED Visits (12mo)', category: 'Utilization', type: 'Count', source: 'Claims', usage: 234, description: 'Emergency department visits in past 12 months' },
  { id: 10, name: 'Days Since Last PCP', category: 'Utilization', type: 'Numeric', source: 'Scheduling', usage: 189, description: 'Days since last primary care visit' },
  { id: 11, name: 'Flu Vaccine Current', category: 'Preventive', type: 'Boolean', source: 'Registry', usage: 156, description: 'Current season influenza vaccination status' },
  { id: 12, name: 'SDOH Food Insecurity', category: 'Social', type: 'Boolean', source: 'Screening', usage: 87, description: 'Social determinant: food insecurity identified' },
];

const categories = ['All', 'Labs', 'Vitals', 'Diagnoses', 'Medications', 'Assessments', 'Utilization', 'Preventive', 'Social', 'Custom'];
const types = ['Numeric', 'Boolean', 'Count', 'Score', 'Text'];
const sources = ['Lab Interface', 'EMR', 'Claims', 'Claims/EMR', 'Pharmacy', 'Screening', 'Registry', 'Scheduling', 'Manual Entry'];

export default function MetricsLibraryPage() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [sortCol, setSortCol] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [newMetric, setNewMetric] = useState({ name: '', category: 'Custom', type: 'Numeric', source: 'Manual Entry', description: '' });
  const toast = useToast();

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const filtered = metrics
    .filter(m => (cat === 'All' || m.category === cat) && (!search || m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      const av = (a as any)[sortCol], bv = (b as any)[sortCol];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleAdd = () => {
    if (!newMetric.name.trim()) { toast('Metric name is required', 'error'); return; }
    setMetrics([{ ...newMetric, id: Date.now(), usage: 0 }, ...metrics]);
    setShowAdd(false);
    setNewMetric({ name: '', category: 'Custom', type: 'Numeric', source: 'Manual Entry', description: '' });
    toast(`Metric "${newMetric.name}" created`);
  };

  const deleteMetric = (id: number) => {
    const m = metrics.find(x => x.id === id);
    setMetrics(metrics.filter(x => x.id !== id));
    toast(`"${m?.name}" removed`, 'error');
  };

  const arrow = (col: string) => sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Metrics Library</h1>
            <p className="text-sm text-[#86868b] mt-1">{metrics.length} discrete metrics across clinical data</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#8B5CF6] text-white text-sm font-medium rounded-xl hover:bg-[#7C3AED]">+ Custom Metric</button>
        </div>

        <div className="flex gap-4 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search metrics..." className="flex-1 px-4 py-2.5 bg-[#f5f5f7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8B5CF6]/30" />
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 text-xs rounded-full transition-colors ${cat === c ? 'bg-[#8B5CF6] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#8B5CF6]/10'}`}>
                {c} {c !== 'All' ? `(${metrics.filter(m => m.category === c).length})` : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]">
                {[['name', 'Metric'], ['category', 'Category'], ['type', 'Type'], ['source', 'Source'], ['usage', 'Usage']].map(([key, label]) => (
                  <th key={key} onClick={() => toggleSort(key)} className={`text-left text-[10px] font-semibold text-[#86868b] uppercase tracking-wider px-5 py-3 cursor-pointer hover:text-[#8B5CF6] ${key === 'usage' ? 'text-right' : ''}`}>
                    {label}{arrow(key)}
                  </th>
                ))}
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-[#1d1d1f]">{m.name}</p>
                    <p className="text-[10px] text-[#86868b]">{m.description}</p>
                  </td>
                  <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full">{m.category}</span></td>
                  <td className="px-5 py-3 text-xs text-[#6e6e73]">{m.type}</td>
                  <td className="px-5 py-3 text-xs text-[#6e6e73]">{m.source}</td>
                  <td className="px-5 py-3 text-sm text-right text-[#6e6e73]">{m.usage}</td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => deleteMetric(m.id)} className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded hover:bg-red-100">Remove</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center text-sm text-[#86868b] py-8">No metrics found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Custom Metric">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#1d1d1f] block mb-1">Metric Name</label>
            <input value={newMetric.name} onChange={e => setNewMetric({ ...newMetric, name: e.target.value })} placeholder="e.g., Creatinine Clearance" className="w-full px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#8B5CF6]/30" autoFocus />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-[#1d1d1f] block mb-1">Category</label>
              <select value={newMetric.category} onChange={e => setNewMetric({ ...newMetric, category: e.target.value })} className="w-full px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm outline-none">
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#1d1d1f] block mb-1">Type</label>
              <select value={newMetric.type} onChange={e => setNewMetric({ ...newMetric, type: e.target.value })} className="w-full px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm outline-none">
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#1d1d1f] block mb-1">Source</label>
              <select value={newMetric.source} onChange={e => setNewMetric({ ...newMetric, source: e.target.value })} className="w-full px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm outline-none">
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#1d1d1f] block mb-1">Description</label>
            <textarea value={newMetric.description} onChange={e => setNewMetric({ ...newMetric, description: e.target.value })} placeholder="What does this metric measure?" className="w-full px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm outline-none h-16 resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-[#6e6e73] hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleAdd} className="px-4 py-2 text-sm bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED]">Create Metric</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
