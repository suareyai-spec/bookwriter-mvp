'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialPlans = [
  { id: 1, patient: 'Maria Garcia', conditions: ['Diabetes', 'HTN', 'CKD'], goals: 4, interventions: 8, assessments: 3, lastUpdated: 'Feb 28', nextReview: 'Mar 15', status: 'active' },
  { id: 2, patient: 'James Wilson', conditions: ['CHF'], goals: 3, interventions: 6, assessments: 2, lastUpdated: 'Feb 25', nextReview: 'Mar 10', status: 'active' },
  { id: 3, patient: 'Robert Johnson', conditions: ['COPD', 'CHF'], goals: 5, interventions: 10, assessments: 4, lastUpdated: 'Feb 20', nextReview: 'Mar 5', status: 'review' },
  { id: 4, patient: 'Patricia Brown', conditions: ['Diabetes', 'Obesity', 'Depression'], goals: 6, interventions: 12, assessments: 5, lastUpdated: 'Feb 22', nextReview: 'Mar 8', status: 'active' },
  { id: 5, patient: 'David Martinez', conditions: ['Diabetes', 'HTN'], goals: 3, interventions: 5, assessments: 2, lastUpdated: 'Feb 18', nextReview: 'Mar 3', status: 'overdue' },
  { id: 6, patient: 'Susan Anderson', conditions: ['CHF', 'AFib', 'CKD'], goals: 5, interventions: 9, assessments: 4, lastUpdated: 'Mar 1', nextReview: 'Mar 20', status: 'active' },
];

const templates = ['Diabetes Management', 'CHF Care Plan', 'COPD Management', 'Hypertension Control', 'Depression Care'];

export default function CarePlansPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState(initialPlans);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<number | null>(null);
  const [newPlan, setNewPlan] = useState({ patient: '', template: templates[0], conditions: '' });
  const [editGoals, setEditGoals] = useState(0);
  const [editInterventions, setEditInterventions] = useState(0);
  const [search, setSearch] = useState('');

  const handleCreate = () => {
    if (!newPlan.patient) return;
    setPlans(prev => [{
      id: Date.now(), patient: newPlan.patient,
      conditions: newPlan.conditions.split(',').map(s => s.trim()).filter(Boolean),
      goals: 3, interventions: 6, assessments: 1, lastUpdated: 'Today', nextReview: 'Mar 20', status: 'active',
    }, ...prev]);
    setCreateModal(false);
    setNewPlan({ patient: '', template: templates[0], conditions: '' });
    showToast(`Care plan created from "${newPlan.template}" template`);
  };

  const openEdit = (p: typeof plans[0]) => { setEditModal(p.id); setEditGoals(p.goals); setEditInterventions(p.interventions); };

  const saveEdit = () => {
    setPlans(prev => prev.map(p => p.id === editModal ? { ...p, goals: editGoals, interventions: editInterventions, lastUpdated: 'Today' } : p));
    setEditModal(null);
    showToast('Care plan updated');
  };

  const markComplete = (id: number) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, status: 'completed' } : p));
    showToast('Care plan marked complete');
  };

  const toggleStatus = (id: number) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next = p.status === 'active' ? 'review' : p.status === 'review' ? 'overdue' : 'active';
      return { ...p, status: next };
    }));
  };

  const deletePlan = (id: number) => {
    if (!confirm('Delete this care plan?')) return;
    setPlans(prev => prev.filter(p => p.id !== id));
    showToast('Care plan deleted');
  };

  const filtered = search ? plans.filter(p => p.patient.toLowerCase().includes(search.toLowerCase())) : plans;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Care Plans</h1>
            <p className="text-sm text-[#86868b] mt-1">Goals, interventions & assessments</p>
          </div>
          <div className="flex gap-3">
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm w-48" />
            <button onClick={() => setCreateModal(true)} className="px-4 py-2 bg-[#EC4899] text-white text-sm font-medium rounded-xl hover:bg-[#DB2777]">+ New Care Plan</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Patient</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Conditions</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Goals</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Interventions</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Next Review</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Status</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm font-medium text-[#1d1d1f]">{p.patient}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {p.conditions.map(c => <span key={c} className="px-1.5 py-0.5 bg-[#EC4899]/10 text-[#EC4899] text-[10px] rounded">{c}</span>)}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-center text-[#6e6e73]">{p.goals}</td>
                  <td className="px-5 py-3 text-sm text-center text-[#6e6e73]">{p.interventions}</td>
                  <td className="px-5 py-3 text-xs text-right text-[#86868b]">{p.nextReview}</td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => toggleStatus(p.id)} className={`text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer ${
                      p.status === 'active' ? 'bg-green-50 text-green-600' :
                      p.status === 'review' ? 'bg-yellow-50 text-yellow-600' :
                      p.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                      'bg-red-50 text-red-600'
                    }`}>{p.status}</button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openEdit(p)} className="text-[10px] px-2 py-1 bg-gray-50 rounded-lg hover:bg-gray-100">✏️ Edit</button>
                      <button onClick={() => markComplete(p.id)} className="text-[10px] px-2 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">✓</button>
                      <button onClick={() => deletePlan(p.id)} className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">✗</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Care Plan">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Patient Name</label>
            <input value={newPlan.patient} onChange={e => setNewPlan(p => ({ ...p, patient: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Template</label>
            <select value={newPlan.template} onChange={e => setNewPlan(p => ({ ...p, template: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              {templates.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Conditions (comma separated)</label>
            <input value={newPlan.conditions} onChange={e => setNewPlan(p => ({ ...p, conditions: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={handleCreate} className="px-4 py-2 text-sm bg-[#EC4899] text-white rounded-xl">Create Plan</button>
          </div>
        </div>
      </Modal>

      <Modal open={editModal !== null} onClose={() => setEditModal(null)} title="Edit Care Plan">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Goals</label>
            <input type="number" value={editGoals} onChange={e => setEditGoals(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Interventions</label>
            <input type="number" value={editInterventions} onChange={e => setEditInterventions(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={saveEdit} className="px-4 py-2 text-sm bg-[#EC4899] text-white rounded-xl">Save</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
