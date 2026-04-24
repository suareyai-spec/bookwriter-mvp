'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState, useMemo } from 'react';

const modules = [
  { id: 'TR-001', title: 'HIPAA Privacy Fundamentals', category: 'Privacy', dueDate: '2026-03-31', required: true, duration: '2 hours', completed: 47, total: 52, status: 'Active' },
  { id: 'TR-002', title: 'HIPAA Security Awareness', category: 'Security', dueDate: '2026-03-31', required: true, duration: '1.5 hours', completed: 44, total: 52, status: 'Active' },
  { id: 'TR-003', title: 'Fraud, Waste & Abuse Prevention', category: 'Compliance', dueDate: '2026-03-31', required: true, duration: '1 hour', completed: 37, total: 52, status: 'Active' },
  { id: 'TR-004', title: 'OSHA Bloodborne Pathogens', category: 'Safety', dueDate: '2026-04-30', required: true, duration: '1 hour', completed: 42, total: 45, status: 'Active' },
  { id: 'TR-005', title: 'Cultural Competency in Healthcare', category: 'Clinical', dueDate: '2026-04-30', required: false, duration: '2 hours', completed: 33, total: 52, status: 'Active' },
  { id: 'TR-006', title: 'Emergency Preparedness', category: 'Safety', dueDate: '2026-06-30', required: true, duration: '1.5 hours', completed: 28, total: 52, status: 'Active' },
  { id: 'TR-007', title: 'Anti-Kickback Statute', category: 'Compliance', dueDate: '2026-06-30', required: true, duration: '1 hour', completed: 15, total: 52, status: 'Active' },
  { id: 'TR-008', title: 'Patient Rights & Responsibilities', category: 'Clinical', dueDate: '2026-06-30', required: false, duration: '45 min', completed: 22, total: 52, status: 'Active' },
  { id: 'TR-009', title: 'Cybersecurity Best Practices', category: 'Security', dueDate: '2026-03-31', required: true, duration: '1 hour', completed: 40, total: 52, status: 'Active' },
  { id: 'TR-010', title: 'Medicare Documentation Guidelines', category: 'Compliance', dueDate: '2026-04-30', required: true, duration: '2 hours', completed: 31, total: 40, status: 'Active' },
  { id: 'TR-011', title: 'Infection Control Procedures', category: 'Clinical', dueDate: '2026-05-31', required: true, duration: '1 hour', completed: 25, total: 45, status: 'Active' },
  { id: 'TR-012', title: 'Social Determinants of Health', category: 'Clinical', dueDate: '2026-06-30', required: false, duration: '1.5 hours', completed: 18, total: 52, status: 'Active' },
  { id: 'TR-013', title: 'Stark Law Overview', category: 'Compliance', dueDate: '2026-06-30', required: true, duration: '1 hour', completed: 12, total: 52, status: 'Active' },
  { id: 'TR-014', title: 'Medication Safety', category: 'Clinical', dueDate: '2026-05-31', required: true, duration: '1.5 hours', completed: 20, total: 45, status: 'Active' },
  { id: 'TR-015', title: 'Data Privacy for Front Desk', category: 'Privacy', dueDate: '2026-04-30', required: true, duration: '45 min', completed: 14, total: 15, status: 'Active' },
  { id: 'TR-016', title: 'Telehealth Compliance', category: 'Compliance', dueDate: '2026-05-31', required: false, duration: '1 hour', completed: 19, total: 30, status: 'Active' },
  { id: 'TR-017', title: 'Risk Management Basics', category: 'Safety', dueDate: '2026-06-30', required: false, duration: '1 hour', completed: 10, total: 52, status: 'Active' },
  { id: 'TR-018', title: 'Coding Compliance (E/M)', category: 'Compliance', dueDate: '2026-04-30', required: true, duration: '2 hours', completed: 26, total: 40, status: 'Active' },
  { id: 'TR-019', title: 'Workplace Violence Prevention', category: 'Safety', dueDate: '2026-06-30', required: true, duration: '1 hour', completed: 8, total: 52, status: 'Active' },
  { id: 'TR-020', title: 'Advanced HIPAA for IT Staff', category: 'Security', dueDate: '2026-05-31', required: true, duration: '3 hours', completed: 5, total: 8, status: 'Active' },
];

export default function TrainingPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterReq, setFilterReq] = useState('');

  const categories = [...new Set(modules.map(m => m.category))];

  const filtered = useMemo(() => modules.filter(m =>
    (!search || m.title.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat || m.category === filterCat) &&
    (!filterReq || (filterReq === 'required' ? m.required : !m.required))
  ), [search, filterCat, filterReq]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-semibold text-[#1d1d1f]">Training Management</h1><p className="text-sm text-[#86868b]">Staff training modules & completion tracking</p></div>
          <button onClick={() => showToast('New training module created')} className="px-4 py-2 bg-[#065F46] text-white text-sm rounded-lg">+ Add Module</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Modules', value: modules.length, color: '#065F46' },
            { label: 'Mandatory', value: modules.filter(m => m.required).length, color: '#DC2626' },
            { label: 'Avg Completion', value: `${Math.round(modules.reduce((s, m) => s + (m.completed / m.total) * 100, 0) / modules.length)}%`, color: '#0891B2' },
            { label: 'Overdue', value: modules.filter(m => m.dueDate <= '2026-03-31' && m.completed < m.total).length, color: '#F97316' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <input placeholder="Search modules..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-72" />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterReq} onChange={e => setFilterReq(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All</option><option value="required">Mandatory</option><option value="optional">Optional</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Module</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Category</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Required</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Duration</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Due Date</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Completion</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Action</th>
            </tr></thead>
            <tbody>
              {filtered.map((m, i) => {
                const pct = Math.round((m.completed / m.total) * 100);
                return (
                  <tr key={i} className="border-t border-gray-50 text-xs hover:bg-[#f5f5f7]/50">
                    <td className="px-3 py-3 text-[#1d1d1f] font-medium">{m.title}</td>
                    <td className="px-3 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-[#6e6e73]">{m.category}</span></td>
                    <td className="px-3 py-3 text-center">{m.required ? <span className="text-[#DC2626] font-semibold">Yes</span> : <span className="text-[#86868b]">No</span>}</td>
                    <td className="px-3 py-3 text-[#6e6e73]">{m.duration}</td>
                    <td className="px-3 py-3 text-[#86868b]">{m.dueDate}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-[#f0f0f0] rounded-full"><div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? '#065F46' : pct >= 50 ? '#F97316' : '#DC2626' }} /></div>
                        <span className="text-[10px] text-[#86868b]">{m.completed}/{m.total} ({pct}%)</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => showToast('Reminder sent')} className="text-[#065F46] hover:underline">Send Reminder</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
