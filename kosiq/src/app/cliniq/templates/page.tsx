'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

interface TemplateNode {
  label: string;
  count: number;
  children?: TemplateNode[];
}

interface Template {
  id: number;
  name: string;
  description: string;
  nodes: number;
  category: string;
  uses: number;
  rating: number;
  tree: TemplateNode;
}

const initialTemplates: Template[] = [
  { id: 1, name: 'Diabetes Care Cascade', description: 'Full diabetes management tree: screening → diagnosis → treatment → outcomes', nodes: 47, category: 'Chronic Disease', uses: 234, rating: 4.8,
    tree: { label: 'All Diabetic Patients', count: 3240, children: [
      { label: 'HbA1c > 9 (Uncontrolled)', count: 460, children: [
        { label: 'No Ophthalmology Visit (12mo)', count: 312 },
        { label: 'No Foot Exam (12mo)', count: 267 },
        { label: 'No Nephrology Referral', count: 189 },
      ]},
      { label: 'HbA1c 7-9 (Moderate)', count: 1280, children: [
        { label: 'On Insulin', count: 456 },
        { label: 'Oral Meds Only', count: 824 },
      ]},
      { label: 'HbA1c < 7 (Controlled)', count: 1500, children: [
        { label: 'Annual Screening Due', count: 340 },
        { label: 'Up to Date', count: 1160 },
      ]},
    ]}},
  { id: 2, name: 'CHF Management Pathway', description: 'Heart failure staging, EF classification, medication optimization', nodes: 38, category: 'Cardiology', uses: 189, rating: 4.7,
    tree: { label: 'All CHF Patients', count: 1856, children: [
      { label: 'EF < 40% (HFrEF)', count: 620, children: [
        { label: 'On GDMT', count: 412 },
        { label: 'Not on GDMT', count: 208 },
      ]},
      { label: 'EF 40-50% (HFmrEF)', count: 456, children: [
        { label: '3+ ED Visits', count: 134 },
        { label: '< 3 ED Visits', count: 322 },
      ]},
      { label: 'EF > 50% (HFpEF)', count: 780, children: [
        { label: 'BP Uncontrolled', count: 234 },
        { label: 'BP Controlled', count: 546 },
      ]},
    ]}},
  { id: 3, name: 'CKD Progression Monitor', description: 'eGFR staging, proteinuria tracking, nephrology referral triggers', nodes: 29, category: 'Nephrology', uses: 156, rating: 4.6,
    tree: { label: 'All CKD Patients', count: 2100, children: [
      { label: 'Stage 3a (eGFR 45-59)', count: 890, children: [
        { label: 'Proteinuria Positive', count: 234 },
        { label: 'Proteinuria Negative', count: 656 },
      ]},
      { label: 'Stage 3b (eGFR 30-44)', count: 670, children: [
        { label: 'No Nephrology Referral', count: 312 },
        { label: 'Active Nephrology', count: 358 },
      ]},
      { label: 'Stage 4 (eGFR 15-29)', count: 410, children: [
        { label: 'Dialysis Planning', count: 156 },
        { label: 'Conservative Mgmt', count: 254 },
      ]},
      { label: 'Stage 5 / ESRD', count: 130 },
    ]}},
  { id: 4, name: 'COPD Exacerbation Risk', description: 'Pulmonary function decline, exacerbation frequency, O2 requirements', nodes: 24, category: 'Pulmonology', uses: 112, rating: 4.5,
    tree: { label: 'All COPD Patients', count: 892, children: [
      { label: 'FEV1 < 50%', count: 340, children: [
        { label: '2+ Exacerbations/yr', count: 145 },
        { label: '< 2 Exacerbations/yr', count: 195 },
      ]},
      { label: 'FEV1 50-80%', count: 412 },
      { label: 'FEV1 > 80%', count: 140 },
    ]}},
  { id: 5, name: 'Preventive Care Gaps', description: 'Age-appropriate screening compliance: mammogram, colonoscopy, vaccines', nodes: 52, category: 'Preventive', uses: 298, rating: 4.9,
    tree: { label: 'Screening Eligible Population', count: 12400, children: [
      { label: 'Mammogram Overdue', count: 2340 },
      { label: 'Colonoscopy Overdue', count: 3120 },
      { label: 'Flu Vaccine Due', count: 4560 },
      { label: 'Pneumonia Vaccine Due', count: 1890 },
      { label: 'A1C Screening Due', count: 2100 },
    ]}},
  { id: 6, name: 'Polypharmacy Risk', description: 'Medication count stratification, interaction detection, deprescribing candidates', nodes: 31, category: 'Pharmacy', uses: 87, rating: 4.4,
    tree: { label: 'Patients 10+ Medications', count: 1450, children: [
      { label: 'Drug Interaction Risk', count: 567 },
      { label: 'Deprescribing Candidates', count: 412 },
      { label: 'Duplicate Therapy', count: 234 },
      { label: 'High-Risk Meds (Beers)', count: 389 },
    ]}},
  { id: 7, name: 'Mental Health Screening', description: 'PHQ-9/GAD-7 scoring trees, treatment response tracking', nodes: 22, category: 'Behavioral', uses: 145, rating: 4.6,
    tree: { label: 'Screened Population', count: 5600, children: [
      { label: 'PHQ-9 ≥ 10 (Moderate+)', count: 890, children: [
        { label: 'On Antidepressant', count: 567 },
        { label: 'No Treatment', count: 323 },
      ]},
      { label: 'GAD-7 ≥ 10 (Moderate+)', count: 720, children: [
        { label: 'In Therapy', count: 345 },
        { label: 'No Therapy', count: 375 },
      ]},
    ]}},
  { id: 8, name: 'Post-Discharge Follow-Up', description: '30-day readmission risk, follow-up compliance, medication reconciliation', nodes: 35, category: 'Care Transitions', uses: 201, rating: 4.7,
    tree: { label: 'Recent Discharges (30d)', count: 456, children: [
      { label: 'No 7-Day Follow-Up', count: 189 },
      { label: 'Med Reconciliation Pending', count: 134 },
      { label: 'High Readmission Risk', count: 98 },
      { label: 'Follow-Up Complete', count: 267 },
    ]}},
];

const categories = ['All', 'Chronic Disease', 'Cardiology', 'Nephrology', 'Pulmonology', 'Preventive', 'Pharmacy', 'Behavioral', 'Care Transitions'];

export default function TemplatesPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [templates] = useState(initialTemplates);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);

  const handleUseTemplate = (t: Template) => {
    setActiveTemplate(t);
  };

  const handleDownloadPdf = (t: Template) => {
    const doc = new jsPDF();
    const purple = [139, 92, 246] as const;
    const dark = [29, 29, 31] as const;
    const gray = [134, 134, 139] as const;

    // Header
    doc.setFontSize(18); doc.setTextColor(...dark);
    doc.text('ClinIQ — Analysis Template', 14, 20);
    doc.setFontSize(13); doc.setTextColor(...purple);
    doc.text(t.name, 14, 28);
    doc.setFontSize(9); doc.setTextColor(...gray);
    doc.text(`${t.description}`, 14, 35);
    doc.text(`${t.nodes} nodes — ${t.uses} uses — Rating: ${t.rating}/5 — Category: ${t.category}`, 14, 41);
    doc.setDrawColor(...purple); doc.setLineWidth(0.5); doc.line(14, 44, 196, 44);

    let y = 52;
    const renderNode = (node: TemplateNode, depth: number) => {
      if (y > 275) { doc.addPage(); y = 20; }
      const indent = 14 + depth * 12;
      const prefix = depth === 0 ? '■' : depth === 1 ? '├' : '└';
      doc.setFontSize(depth === 0 ? 11 : 9);
      doc.setTextColor(...(depth === 0 ? purple : dark));
      doc.text(`${prefix} ${node.label}`, indent, y);
      doc.setTextColor(...gray);
      doc.text(`${node.count.toLocaleString()} patients`, 160, y);
      y += depth === 0 ? 8 : 6;
      if (node.children) node.children.forEach(c => renderNode(c, depth + 1));
    };
    renderNode(t.tree, 0);

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(...gray);
      doc.text(`KOSIQ ClinIQ Template — ${t.name} — Generated ${new Date().toLocaleDateString()} — Page ${i} of ${pages}`, 105, 290, { align: 'center' });
    }

    doc.save(`ClinIQ-${t.name.replace(/\s+/g, '-')}.pdf`);
    showToast(`"${t.name}" downloaded as PDF`);
  };

  let filtered = category === 'All' ? templates : templates.filter(t => t.category === category);
  if (search) filtered = filtered.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  // Recursive tree renderer
  const renderTree = (node: TemplateNode, depth: number = 0): JSX.Element => {
    const pct = activeTemplate ? ((node.count / activeTemplate.tree.count) * 100).toFixed(1) : '0';
    return (
      <div key={node.label} className={`${depth > 0 ? 'ml-6 border-l-2 border-[#8B5CF6]/20 pl-4' : ''}`}>
        <div className={`flex items-center justify-between py-2 ${depth === 0 ? 'bg-[#8B5CF6] text-white rounded-xl px-4 mb-2' : 'hover:bg-gray-50 rounded-lg px-3'}`}>
          <div>
            <p className={`text-sm font-medium ${depth === 0 ? 'text-white' : 'text-[#1d1d1f]'}`}>{node.label}</p>
            {depth > 0 && (
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-[#86868b]">{pct}%</span>
              </div>
            )}
          </div>
          <span className={`text-xs font-medium ${depth === 0 ? 'text-white/80' : 'text-[#8B5CF6]'}`}>{node.count.toLocaleString()}</span>
        </div>
        {node.children && node.children.map(c => renderTree(c, depth + 1))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Analysis Templates</h1>
            <p className="text-sm text-[#86868b] mt-1">Pre-built analysis trees ready to deploy</p>
          </div>
          <input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 bg-[#f5f5f7] border-none rounded-xl text-sm w-56 outline-none focus:ring-2 focus:ring-[#8B5CF6]/30" />
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 text-xs rounded-full transition-colors ${category === c ? 'bg-[#8B5CF6] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6]'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#1d1d1f] group-hover:text-[#8B5CF6] transition-colors">{t.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-[#f5f5f7] rounded-full text-[#86868b] mt-1 inline-block">{t.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#F59E0B] text-xs">★</span>
                  <span className="text-xs text-[#6e6e73]">{t.rating}</span>
                </div>
              </div>
              <p className="text-xs text-[#6e6e73] mb-4">{t.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <span className="text-[10px] text-[#86868b]">{t.nodes} nodes</span>
                  <span className="text-[10px] text-[#86868b]">{t.uses} uses</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownloadPdf(t)} className="px-3 py-1.5 bg-gray-100 text-[#6e6e73] text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    PDF
                  </button>
                  <button onClick={() => handleUseTemplate(t)} className="px-3 py-1.5 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium rounded-lg hover:bg-[#8B5CF6] hover:text-white transition-colors">
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Builder Modal */}
      <Modal open={activeTemplate !== null} onClose={() => setActiveTemplate(null)} title={activeTemplate?.name || ''} width="max-w-3xl">
        {activeTemplate && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-[#86868b]">{activeTemplate.description}</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-[10px] px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full">{activeTemplate.category}</span>
                  <span className="text-[10px] text-[#86868b]">{activeTemplate.nodes} nodes</span>
                  <span className="text-[10px] text-[#86868b]">★ {activeTemplate.rating}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDownloadPdf(activeTemplate)} className="px-3 py-1.5 bg-gray-100 text-[#6e6e73] text-xs font-medium rounded-lg hover:bg-gray-200">
                  Download PDF
                </button>
                <button onClick={() => {
                  // Store template in localStorage for builder to pick up
                  localStorage.setItem('cliniq-template', JSON.stringify(activeTemplate));
                  setActiveTemplate(null);
                  router.push('/cliniq/builder');
                  showToast(`"${activeTemplate.name}" loaded into Tree Builder`);
                }} className="px-3 py-1.5 bg-[#8B5CF6] text-white text-xs font-medium rounded-lg hover:bg-[#7C3AED]">
                  Load into Builder
                </button>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 max-h-[60vh] overflow-y-auto">
              <p className="text-[10px] text-[#86868b] uppercase tracking-wider font-semibold mb-3">Decision Tree Structure</p>
              {renderTree(activeTemplate.tree)}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
