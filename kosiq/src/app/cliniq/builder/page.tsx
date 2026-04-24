'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState, useRef, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';

const availableMetrics = [
  { category: 'Labs', items: ['HbA1c', 'LDL Cholesterol', 'eGFR', 'Creatinine', 'TSH', 'BMP', 'CBC', 'Lipid Panel', 'Hemoglobin', 'Albumin'] },
  { category: 'Vitals', items: ['Blood Pressure', 'BMI', 'Heart Rate', 'O2 Saturation', 'Temperature', 'Weight', 'Respiratory Rate'] },
  { category: 'Diagnoses', items: ['Diabetes', 'Hypertension', 'CHF', 'COPD', 'CKD', 'Depression', 'Obesity', 'Asthma', 'CAD', 'Atrial Fibrillation'] },
  { category: 'Medications', items: ['Metformin', 'Insulin', 'Lisinopril', 'Atorvastatin', 'Amlodipine', 'Metoprolol', 'Omeprazole'] },
];

// Mock patient data for each node
const mockPatients: Record<string, { name: string; dob: string; doctor: string; mrn: string }[]> = {
  'All Patients': [
    { name: 'Maria Garcia', dob: '03/15/1958', doctor: 'Dr. Martinez', mrn: 'MRN-001' },
    { name: 'James Wilson', dob: '07/22/1962', doctor: 'Dr. Chen', mrn: 'MRN-002' },
    { name: 'Robert Johnson', dob: '11/03/1955', doctor: 'Dr. Patel', mrn: 'MRN-003' },
    { name: 'Patricia Brown', dob: '09/18/1960', doctor: 'Dr. Martinez', mrn: 'MRN-004' },
    { name: 'Michael Davis', dob: '05/30/1968', doctor: 'Dr. Chen', mrn: 'MRN-005' },
  ],
  'Diabetes': [
    { name: 'Maria Garcia', dob: '03/15/1958', doctor: 'Dr. Martinez', mrn: 'MRN-001' },
    { name: 'Robert Johnson', dob: '11/03/1955', doctor: 'Dr. Patel', mrn: 'MRN-003' },
    { name: 'Thomas Moore', dob: '06/12/1961', doctor: 'Dr. Johnson', mrn: 'MRN-008' },
    { name: 'Helen White', dob: '02/28/1953', doctor: 'Dr. Martinez', mrn: 'MRN-012' },
  ],
  'HbA1c > 9': [
    { name: 'Maria Garcia', dob: '03/15/1958', doctor: 'Dr. Martinez', mrn: 'MRN-001' },
    { name: 'Thomas Moore', dob: '06/12/1961', doctor: 'Dr. Johnson', mrn: 'MRN-008' },
  ],
  'HbA1c ≤ 9': [
    { name: 'Robert Johnson', dob: '11/03/1955', doctor: 'Dr. Patel', mrn: 'MRN-003' },
    { name: 'Helen White', dob: '02/28/1953', doctor: 'Dr. Martinez', mrn: 'MRN-012' },
  ],
  'No Diabetes': [
    { name: 'James Wilson', dob: '07/22/1962', doctor: 'Dr. Chen', mrn: 'MRN-002' },
    { name: 'Patricia Brown', dob: '09/18/1960', doctor: 'Dr. Martinez', mrn: 'MRN-004' },
    { name: 'Michael Davis', dob: '05/30/1968', doctor: 'Dr. Chen', mrn: 'MRN-005' },
  ],
};

// Generate random patients for any node not in the mock data
function getPatientsForNode(label: string, count: number) {
  if (mockPatients[label]) return mockPatients[label];
  const doctors = ['Dr. Martinez', 'Dr. Chen', 'Dr. Patel', 'Dr. Johnson', 'Dr. Williams', 'Dr. Lee'];
  const firstNames = ['John', 'Mary', 'David', 'Sarah', 'Carlos', 'Linda', 'William', 'Jennifer', 'Jose', 'Elizabeth'];
  const lastNames = ['Smith', 'Rodriguez', 'Lee', 'Brown', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor', 'Anderson'];
  const n = Math.min(count, 100);
  return Array.from({ length: n }, (_, i) => ({
    name: `${firstNames[i % firstNames.length]} ${lastNames[(i + 3) % lastNames.length]}`,
    dob: `${String((i % 12) + 1).padStart(2, '0')}/${String((i * 7 % 28) + 1).padStart(2, '0')}/${1950 + (i * 3 % 25)}`,
    doctor: doctors[i % doctors.length],
    mrn: `MRN-${String(100 + i).padStart(3, '0')}`,
  }));
}

interface TreeNode {
  id: number;
  x: number;
  y: number;
  label: string;
  count: number;
  type: 'root' | 'filter' | 'metric';
  parentId: number | null;
}

const initialNodes: TreeNode[] = [
  { id: 1, x: 400, y: 50, label: 'All Patients', count: 18432, type: 'root', parentId: null },
  { id: 2, x: 200, y: 170, label: 'Diabetes', count: 3240, type: 'filter', parentId: 1 },
  { id: 3, x: 600, y: 170, label: 'No Diabetes', count: 15192, type: 'filter', parentId: 1 },
  { id: 4, x: 100, y: 290, label: 'HbA1c > 9', count: 460, type: 'metric', parentId: 2 },
  { id: 5, x: 300, y: 290, label: 'HbA1c ≤ 9', count: 2780, type: 'metric', parentId: 2 },
];

export default function TreeBuilderPage() {
  const { showToast } = useToast();
  const [nodes, setNodes] = useState<TreeNode[]>(initialNodes);
  const [dragCategory, setDragCategory] = useState<string | null>(null);
  const [metricsSearch, setMetricsSearch] = useState('');
  const [editNodeId, setEditNodeId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editCount, setEditCount] = useState(0);
  const [addModal, setAddModal] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeParent, setNewNodeParent] = useState<number>(1);
  const [newNodeType, setNewNodeType] = useState<'filter' | 'metric'>('filter');
  const [savedTrees, setSavedTrees] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [patientModal, setPatientModal] = useState<TreeNode | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const didDragRef = useRef(false);

  // Load template from localStorage if available
  useEffect(() => {
    const stored = localStorage.getItem('cliniq-template');
    if (stored) {
      localStorage.removeItem('cliniq-template');
      try {
        const template = JSON.parse(stored);
        if (template?.tree) {
          const newNodes: TreeNode[] = [];
          let idCounter = 1;
          const flatten = (node: any, parentId: number | null, x: number, y: number, spread: number) => {
            const id = idCounter++;
            newNodes.push({
              id, x, y,
              label: node.label,
              count: node.count || 0,
              type: parentId === null ? 'root' : (node.children ? 'filter' : 'metric'),
              parentId,
            });
            if (node.children) {
              const childSpread = spread / Math.max(node.children.length, 1);
              node.children.forEach((child: any, i: number) => {
                const cx = x + (i - (node.children.length - 1) / 2) * childSpread;
                flatten(child, id, cx, y + 120, childSpread * 0.8);
              });
            }
          };
          flatten(template.tree, null, 400, 50, 250);
          setNodes(newNodes);
          showToast(`Template "${template.name}" loaded with ${newNodes.length} nodes`);
        }
      } catch {}
    }
  }, []);

  // Drag node to reposition
  const handleNodeDrag = useCallback((id: number, e: React.MouseEvent) => {
    if (e.detail === 2) return;
    e.preventDefault();
    setDraggingId(id);
    const startX = e.clientX;
    const startY = e.clientY;
    const node = nodes.find(n => n.id === id)!;
    const startNodeX = node.x;
    const startNodeY = node.y;
    let moved = false;
    let didDrag = false;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
      moved = true;
      setNodes(prev => prev.map(n => n.id === id ? { ...n, x: startNodeX + dx, y: startNodeY + dy } : n));

      // Check for drop targets
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      let found: number | null = null;
      // Check overlap with other nodes
      setNodes(prev => {
        for (const n of prev) {
          if (n.id === id) continue;
          const nx = n.x - 60;
          const ny = n.y;
          if (mx >= nx && mx <= nx + 120 && my >= ny && my <= ny + 50) {
            found = n.id;
            break;
          }
        }
        setDropTarget(found);
        return prev;
      });
    };

    const onUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      didDragRef.current = didDrag;

      // If dropped on a target node, re-parent
      if (dropTarget && dropTarget !== id && moved) {
        setNodes(prev => {
          const target = prev.find(n => n.id === dropTarget);
          if (!target) return prev;
          return prev.map(n => {
            if (n.id === id) {
              const siblings = prev.filter(s => s.parentId === dropTarget && s.id !== id);
              return {
                ...n,
                parentId: dropTarget,
                x: target.x + (siblings.length * 150 - 75),
                y: target.y + 120,
              };
            }
            return n;
          });
        });
        showToast('Node re-parented');
      }
      setDraggingId(null);
      setDropTarget(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [nodes, dropTarget, showToast]);

  // Click to open patient list (only if not dragged)
  const handleNodeClick = (n: TreeNode) => {
    if (didDragRef.current) { didDragRef.current = false; return; }
    setPatientModal(n);
  };

  const openEditNode = (n: TreeNode) => { setEditNodeId(n.id); setEditLabel(n.label); setEditCount(n.count); };

  const saveEditNode = () => {
    setNodes(prev => prev.map(n => n.id === editNodeId ? { ...n, label: editLabel, count: editCount } : n));
    setEditNodeId(null);
    showToast('Node updated');
  };

  const removeNode = (id: number) => {
    if (id === 1) return;
    setNodes(prev => prev.filter(n => n.id !== id && n.parentId !== id));
    showToast('Node removed');
  };

  const handleAddNode = () => {
    if (!newNodeLabel) return;
    const parent = nodes.find(n => n.id === newNodeParent);
    const siblings = nodes.filter(n => n.parentId === newNodeParent);
    const newNode: TreeNode = {
      id: Date.now(),
      x: (parent?.x || 400) + (siblings.length * 150 - 75),
      y: (parent?.y || 50) + 120,
      label: newNodeLabel,
      count: Math.floor(Math.random() * 1000) + 100,
      type: newNodeType,
      parentId: newNodeParent,
    };
    setNodes(prev => [...prev, newNode]);
    setAddModal(false);
    setNewNodeLabel('');
    showToast('Node added');
  };

  const handleDropMetric = (item: string) => {
    const rootNode = nodes[0];
    const siblings = nodes.filter(n => n.parentId === 1);
    const newNode: TreeNode = {
      id: Date.now(),
      x: rootNode.x + (siblings.length * 150 - 75),
      y: rootNode.y + 120,
      label: item,
      count: Math.floor(Math.random() * 2000) + 200,
      type: 'metric',
      parentId: 1,
    };
    setNodes(prev => [...prev, newNode]);
    showToast(`Added "${item}" node`);
  };

  const handleSaveTree = () => {
    setSavedTrees(prev => [`Analysis ${prev.length + 1} (${new Date().toLocaleTimeString()})`, ...prev]);
    showToast('Analysis tree saved');
  };

  const copyPatientList = (patients: { name: string; dob: string; doctor: string; mrn: string }[], label: string) => {
    const text = `${label} — Patient List\n${'='.repeat(50)}\n` +
      patients.map((p, i) => `${i + 1}. ${p.name} | DOB: ${p.dob} | MRN: ${p.mrn} | Provider: ${p.doctor}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast(`${patients.length} patients copied to clipboard`);
  };

  const exportPatientListPdf = (patients: { name: string; dob: string; doctor: string; mrn: string }[], label: string, count: number) => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.setTextColor(29, 29, 31);
    doc.text('ClinIQ — Patient List', 14, 20);
    doc.setFontSize(11); doc.setTextColor(139, 92, 246);
    doc.text(label, 14, 28);
    doc.setFontSize(9); doc.setTextColor(134, 134, 139);
    doc.text(`${count.toLocaleString()} patients total — Showing ${patients.length} records — Generated ${new Date().toLocaleDateString()}`, 14, 35);
    doc.setDrawColor(139, 92, 246); doc.setLineWidth(0.5); doc.line(14, 38, 196, 38);
    let y = 46;
    doc.setFontSize(8); doc.setTextColor(134, 134, 139);
    doc.text('#', 14, y); doc.text('Patient Name', 22, y); doc.text('DOB', 80, y); doc.text('MRN', 110, y); doc.text('Provider', 145, y);
    y += 6;
    patients.forEach((p, i) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.setFontSize(8); doc.setTextColor(29, 29, 31);
      doc.text(String(i + 1), 14, y); doc.text(p.name, 22, y); doc.text(p.dob, 80, y); doc.text(p.mrn, 110, y); doc.text(p.doctor, 145, y);
      y += 5;
    });
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(7); doc.setTextColor(134, 134, 139); doc.text(`KOSIQ ClinIQ — Page ${i} of ${pages}`, 105, 290, { align: 'center' }); }
    doc.save(`${label.replace(/[^a-zA-Z0-9]/g, '-')}-patients.pdf`);
    showToast('Patient list exported as PDF');
  };

  const filteredMetrics = availableMetrics.map(cat => ({
    ...cat,
    items: metricsSearch ? cat.items.filter(i => i.toLowerCase().includes(metricsSearch.toLowerCase())) : cat.items,
  })).filter(cat => cat.items.length > 0);

  const lines = nodes.filter(n => n.parentId).map(n => {
    const parent = nodes.find(p => p.id === n.parentId);
    if (!parent) return null;
    return { x1: parent.x, y1: parent.y + 30, x2: n.x, y2: n.y };
  }).filter(Boolean);

  const patientData = patientModal ? getPatientsForNode(patientModal.label, patientModal.count) : [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Tree Builder</h1>
            <p className="text-sm text-[#86868b] mt-1">Click nodes to view patients. Drag onto another node to re-parent. Double-click to edit.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAddModal(true)} className="px-4 py-2 border border-gray-200 text-sm rounded-xl hover:bg-gray-50">+ Add Node</button>
            <button onClick={handleSaveTree} className="px-4 py-2 bg-[#8B5CF6] text-white text-sm font-medium rounded-xl hover:bg-[#7C3AED]">Save Tree</button>
          </div>
        </div>

        {savedTrees.length > 0 && (
          <div className="mb-4 flex gap-2 flex-wrap">
            <span className="text-xs text-[#86868b]">Saved:</span>
            {savedTrees.map((s, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full">{s}</span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Available Metrics</h3>
            <input placeholder="Search metrics..." value={metricsSearch} onChange={e => setMetricsSearch(e.target.value)} className="w-full px-3 py-2 text-xs bg-[#f5f5f7] rounded-lg mb-3 outline-none" />
            {filteredMetrics.map(cat => (
              <div key={cat.category} className="mb-4">
                <button onClick={() => setDragCategory(dragCategory === cat.category ? null : cat.category)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">
                  {cat.category}
                  <span className={`transition-transform ${dragCategory === cat.category ? 'rotate-90' : ''}`}>▶</span>
                </button>
                {(dragCategory === cat.category || !dragCategory) && (
                  <div className="space-y-1">
                    {cat.items.map(item => (
                      <div key={item}
                        draggable
                        onDragStart={e => { e.dataTransfer.setData('metric', item); e.dataTransfer.effectAllowed = 'copy'; }}
                        onClick={() => handleDropMetric(item)}
                        className="px-3 py-2 bg-[#f5f5f7] rounded-lg text-xs text-[#1d1d1f] cursor-grab hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] transition-colors active:cursor-grabbing">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div ref={canvasRef} className="col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 relative min-h-[600px] overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {lines.map((l, i) => l && <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#e5e7eb" strokeWidth="2" />)}
            </svg>
            {nodes.map(n => (
              <div key={n.id}
                onMouseDown={e => handleNodeDrag(n.id, e)}
                onClick={() => handleNodeClick(n)}
                onDoubleClick={() => openEditNode(n)}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDropTarget(n.id); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={e => {
                  e.preventDefault();
                  const metric = e.dataTransfer.getData('metric');
                  if (metric) {
                    const siblings = nodes.filter(s => s.parentId === n.id);
                    const newNode: TreeNode = {
                      id: Date.now(),
                      x: n.x + (siblings.length * 150 - 75),
                      y: n.y + 120,
                      label: metric,
                      count: Math.floor(Math.random() * (n.count * 0.4)) + 100,
                      type: 'metric',
                      parentId: n.id,
                    };
                    setNodes(prev => [...prev, newNode]);
                    showToast(`Added "${metric}" under "${n.label}"`);
                  }
                  setDropTarget(null);
                }}
                className={`absolute select-none ${draggingId === n.id ? 'z-20 cursor-grabbing' : 'z-10 cursor-pointer'} ${dropTarget === n.id ? 'scale-110' : ''} transition-transform`}
                style={{ left: n.x - 60, top: n.y }}>
                <div className={`px-4 py-3 rounded-xl shadow-md border-2 min-w-[120px] text-center hover:shadow-lg transition-shadow ${
                  dropTarget === n.id ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30' :
                  n.type === 'root' ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' :
                  n.type === 'filter' ? 'bg-white border-[#8B5CF6]/30 hover:border-[#8B5CF6]' : 'bg-white border-[#F59E0B]/30 hover:border-[#F59E0B]'
                }`}>
                  <p className={`text-xs font-semibold ${n.type === 'root' ? 'text-white' : 'text-[#1d1d1f]'}`}>{n.label}</p>
                  <p className={`text-[10px] mt-0.5 ${n.type === 'root' ? 'text-white/80' : 'text-[#86868b]'}`}>{n.count.toLocaleString()} patients</p>
                  {n.type !== 'root' && (
                    <button onClick={e => { e.stopPropagation(); removeNode(n.id); }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] leading-none flex items-center justify-center hover:bg-red-600">×</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient List Modal */}
      <Modal open={patientModal !== null} onClose={() => setPatientModal(null)} title={`${patientModal?.label || ''} — Patient List`} width="max-w-2xl">
        {patientModal && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#86868b]">{patientModal.count.toLocaleString()} patients total — showing {Math.min(patientData.length, patientModal.count)}</p>
              <div className="flex gap-2">
                <button onClick={() => copyPatientList(patientData, patientModal.label)} className="px-3 py-1.5 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium rounded-lg hover:bg-[#8B5CF6] hover:text-white transition-colors">
                  Copy List
                </button>
                <button onClick={() => exportPatientListPdf(patientData, patientModal.label, patientModal.count)} className="px-3 py-1.5 bg-[#8B5CF6] text-white text-xs font-medium rounded-lg hover:bg-[#7C3AED] transition-colors">
                  Export PDF
                </button>
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-2">#</th>
                    <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-2">Patient</th>
                    <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-2">DOB</th>
                    <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-2">MRN</th>
                    <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-2">Provider</th>
                  </tr>
                </thead>
                <tbody>
                  {patientData.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2 text-xs text-[#86868b]">{i + 1}</td>
                      <td className="py-2 text-sm font-medium text-[#1d1d1f]">{p.name}</td>
                      <td className="py-2 text-xs text-[#6e6e73]">{p.dob}</td>
                      <td className="py-2 text-xs text-[#6e6e73]">{p.mrn}</td>
                      <td className="py-2 text-xs text-[#8B5CF6]">{p.doctor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Node Modal */}
      <Modal open={editNodeId !== null} onClose={() => setEditNodeId(null)} title="Edit Node">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Label</label>
            <input value={editLabel} onChange={e => setEditLabel(e.target.value)} className="w-full px-3 py-2 bg-[#f5f5f7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8B5CF6]/30" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Patient Count</label>
            <input type="number" value={editCount} onChange={e => setEditCount(Number(e.target.value))} className="w-full px-3 py-2 bg-[#f5f5f7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8B5CF6]/30" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setEditNodeId(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button onClick={saveEditNode} className="px-4 py-2 text-sm bg-[#8B5CF6] text-white rounded-xl hover:bg-[#7C3AED]">Save</button>
          </div>
        </div>
      </Modal>

      {/* Add Node Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Node">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Label</label>
            <input value={newNodeLabel} onChange={e => setNewNodeLabel(e.target.value)} className="w-full px-3 py-2 bg-[#f5f5f7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8B5CF6]/30" placeholder="e.g., HbA1c > 8" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Parent Node</label>
            <select value={newNodeParent} onChange={e => setNewNodeParent(Number(e.target.value))} className="w-full px-3 py-2 bg-[#f5f5f7] rounded-xl text-sm outline-none">
              {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Type</label>
            <select value={newNodeType} onChange={e => setNewNodeType(e.target.value as 'filter' | 'metric')} className="w-full px-3 py-2 bg-[#f5f5f7] rounded-xl text-sm outline-none">
              <option value="filter">Filter</option>
              <option value="metric">Metric</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setAddModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button onClick={handleAddNode} className="px-4 py-2 text-sm bg-[#8B5CF6] text-white rounded-xl hover:bg-[#7C3AED]">Add Node</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
