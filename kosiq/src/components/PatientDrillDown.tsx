'use client';

import Modal from './Modal';
import { useToast } from './Toast';
import { useState, useMemo } from 'react';
import jsPDF from 'jspdf';

// Deterministic patient generator based on label + index
const firstNames = ['Maria', 'James', 'Robert', 'Patricia', 'Michael', 'Linda', 'David', 'Susan', 'Thomas', 'Helen', 'Carlos', 'Jennifer', 'William', 'Elizabeth', 'Jose', 'Margaret', 'Richard', 'Sandra', 'Charles', 'Dorothy', 'Daniel', 'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Karen', 'Mark', 'Betty', 'Steven', 'Ruth'];
const lastNames = ['Garcia', 'Wilson', 'Johnson', 'Brown', 'Davis', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Hall', 'Young', 'Allen', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell'];
const doctors = ['Dr. Martinez', 'Dr. Chen', 'Dr. Patel', 'Dr. Johnson', 'Dr. Williams', 'Dr. Lee', 'Dr. Kim', 'Dr. Rodriguez', 'Dr. Thompson', 'Dr. Davis'];
const conditions = ['Diabetes', 'Hypertension', 'CHF', 'COPD', 'CKD', 'Depression', 'Obesity', 'CAD', 'Asthma', 'A-Fib'];

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) { hash = ((hash << 5) - hash) + s.charCodeAt(i); hash |= 0; }
  return Math.abs(hash);
}

export function generatePatients(label: string, count: number, maxShow: number = 100) {
  const seed = hashCode(label);
  const n = Math.min(count, maxShow);
  return Array.from({ length: n }, (_, i) => {
    const h = hashCode(`${label}-${i}-${seed}`);
    return {
      name: `${firstNames[h % firstNames.length]} ${lastNames[(h >> 4) % lastNames.length]}`,
      dob: `${String((h % 12) + 1).padStart(2, '0')}/${String((h % 28) + 1).padStart(2, '0')}/${1948 + (h % 30)}`,
      mrn: `MRN-${String(1000 + (h % 9000)).padStart(4, '0')}`,
      doctor: doctors[(h >> 8) % doctors.length],
      condition: conditions[(h >> 12) % conditions.length],
      riskScore: ((h % 50) + 50) / 100,
    };
  });
}

interface PatientDrillDownProps {
  open: boolean;
  onClose: () => void;
  label: string;
  count: number;
  accent?: string;
}

export default function PatientDrillDown({ open, onClose, label, count, accent = '#8B5CF6' }: PatientDrillDownProps) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const patients = useMemo(() => generatePatients(label, count), [label, count]);

  const filtered = useMemo(() => {
    let list = patients.filter(p =>
      !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.doctor.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const av = (a as any)[sortCol], bv = (b as any)[sortCol];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [patients, search, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const arrow = (col: string) => sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  const copyList = () => {
    const text = `${label} — ${count.toLocaleString()} patients\n${'='.repeat(60)}\n` +
      filtered.map((p, i) => `${i + 1}. ${p.name} | DOB: ${p.dob} | MRN: ${p.mrn} | Provider: ${p.doctor}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast(`${filtered.length} patients copied to clipboard`);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    const accentRgb = accent === '#8B5CF6' ? [139, 92, 246] : accent === '#26acf7' ? [38, 172, 247] : accent === '#F59E0B' ? [245, 158, 11] : accent === '#10B981' ? [16, 185, 129] : accent === '#EC4899' ? [236, 72, 153] : accent === '#EF4444' ? [239, 68, 68] : [38, 172, 247];
    doc.setFontSize(16); doc.setTextColor(29, 29, 31);
    doc.text('KOSIQ — Patient List Report', 14, 20);
    doc.setFontSize(11); doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.text(label, 14, 28);
    doc.setFontSize(9); doc.setTextColor(134, 134, 139);
    doc.text(`${count.toLocaleString()} patients identified — Showing ${filtered.length} — Generated ${new Date().toLocaleDateString()}`, 14, 35);
    doc.setDrawColor(accentRgb[0], accentRgb[1], accentRgb[2]); doc.setLineWidth(0.5); doc.line(14, 38, 196, 38);
    let y = 46;
    doc.setFontSize(7); doc.setTextColor(134, 134, 139);
    doc.text('#', 14, y); doc.text('Patient', 22, y); doc.text('DOB', 75, y); doc.text('MRN', 100, y); doc.text('Provider', 132, y); doc.text('Risk', 180, y);
    y += 5;
    filtered.forEach((p, i) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.setFontSize(7); doc.setTextColor(29, 29, 31);
      doc.text(String(i + 1), 14, y); doc.text(p.name, 22, y); doc.text(p.dob, 75, y); doc.text(p.mrn, 100, y); doc.text(p.doctor, 132, y);
      const risk = (p.riskScore * 100).toFixed(0);
      doc.setTextColor(p.riskScore > 0.8 ? 239 : p.riskScore > 0.6 ? 245 : 16, p.riskScore > 0.8 ? 68 : p.riskScore > 0.6 ? 158 : 185, p.riskScore > 0.8 ? 68 : p.riskScore > 0.6 ? 11 : 129);
      doc.text(`${risk}%`, 180, y);
      y += 4.5;
    });
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(7); doc.setTextColor(134, 134, 139); doc.text(`KOSIQ — Page ${i} of ${pages}`, 105, 290, { align: 'center' }); }
    doc.save(`${label.replace(/[^a-zA-Z0-9]/g, '-')}-patients.pdf`);
    showToast('Patient list exported as PDF');
  };

  return (
    <Modal open={open} onClose={onClose} title={label} width="max-w-3xl">
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#86868b]">{count.toLocaleString()} patients identified — showing {filtered.length}</p>
          <div className="flex gap-2">
            <button onClick={copyList} className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors" style={{ backgroundColor: accent + '15', color: accent }}>
              Copy List
            </button>
            <button onClick={exportPdf} className="px-3 py-1.5 text-white text-xs font-medium rounded-lg" style={{ backgroundColor: accent }}>
              Export PDF
            </button>
          </div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, MRN, or provider..." className="w-full px-3 py-2 bg-[#f5f5f7] rounded-lg text-xs outline-none mb-3 focus:ring-2" style={{ ['--tw-ring-color' as any]: accent + '40' }} />
        <div className="max-h-[50vh] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-100">
                {[['name', 'Patient'], ['dob', 'DOB'], ['mrn', 'MRN'], ['doctor', 'Provider'], ['riskScore', 'Risk']].map(([key, lbl]) => (
                  <th key={key} onClick={() => toggleSort(key)} className="text-left text-[10px] font-semibold text-[#86868b] uppercase tracking-wider pb-2 cursor-pointer hover:text-[#1d1d1f]">
                    {lbl}{arrow(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2 text-sm font-medium text-[#1d1d1f]">{p.name}</td>
                  <td className="py-2 text-xs text-[#6e6e73]">{p.dob}</td>
                  <td className="py-2 text-xs text-[#6e6e73]">{p.mrn}</td>
                  <td className="py-2 text-xs" style={{ color: accent }}>{p.doctor}</td>
                  <td className="py-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${p.riskScore > 0.8 ? 'bg-red-50 text-red-600' : p.riskScore > 0.6 ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                      {(p.riskScore * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center text-sm text-[#86868b] py-8">No patients found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
