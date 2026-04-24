'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialAlerts = [
  { id: 1, tree: 'Diabetes Complications', node: 'HbA1c > 9%', condition: 'Count increased by 15%', severity: 'critical', patients: 53, triggered: '2 hours ago', assignee: 'Dr. Martinez', enabled: true, threshold: 15 },
  { id: 2, tree: 'CHF Risk Cascade', node: 'EF < 30%', condition: '8 new patients', severity: 'critical', patients: 8, triggered: '4 hours ago', assignee: 'Dr. Chen', enabled: true, threshold: 5 },
  { id: 3, tree: 'Medication Adherence', node: 'Non-adherent > 30 days', condition: 'Threshold exceeded', severity: 'warning', patients: 127, triggered: '6 hours ago', assignee: 'Care Team A', enabled: true, threshold: 100 },
  { id: 4, tree: 'Hypertension Pathway', node: 'BP > 180/110', condition: '3 new patients', severity: 'critical', patients: 3, triggered: '8 hours ago', assignee: 'Dr. Patel', enabled: true, threshold: 2 },
  { id: 5, tree: 'COPD Triggers', node: '3+ Exacerbations/year', condition: 'New patients identified', severity: 'warning', patients: 14, triggered: '12 hours ago', assignee: 'Dr. Johnson', enabled: true, threshold: 10 },
  { id: 6, tree: 'Preventive Care', node: 'Overdue Colonoscopy', condition: 'Monthly report', severity: 'info', patients: 234, triggered: '1 day ago', assignee: 'Quality Team', enabled: false, threshold: 200 },
  { id: 7, tree: 'CKD Progression', node: 'eGFR < 30', condition: 'Rapid decline detected', severity: 'critical', patients: 5, triggered: '1 day ago', assignee: 'Dr. Williams', enabled: true, threshold: 3 },
  { id: 8, tree: 'Polypharmacy Risk', node: '10+ Medications', condition: 'New additions', severity: 'warning', patients: 19, triggered: '2 days ago', assignee: 'Pharmacy Team', enabled: true, threshold: 15 },
];

export default function AlertsPage() {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState(initialAlerts);
  const [editModal, setEditModal] = useState<number | null>(null);
  const [editThreshold, setEditThreshold] = useState(0);
  const [addModal, setAddModal] = useState(false);
  const [newAlert, setNewAlert] = useState({ tree: '', node: '', condition: '', severity: 'warning', assignee: '' });

  const toggleAlert = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    const alert = alerts.find(a => a.id === id);
    showToast(`Alert ${alert?.enabled ? 'disabled' : 'enabled'}: ${alert?.tree}`);
  };

  const openEdit = (a: typeof alerts[0]) => { setEditModal(a.id); setEditThreshold(a.threshold); };

  const saveEdit = () => {
    setAlerts(prev => prev.map(a => a.id === editModal ? { ...a, threshold: editThreshold } : a));
    setEditModal(null);
    showToast('Alert threshold updated');
  };

  const handleAdd = () => {
    if (!newAlert.tree) return;
    setAlerts(prev => [...prev, { id: Date.now(), ...newAlert, patients: 0, triggered: 'Just created', enabled: true, threshold: 10 }]);
    setAddModal(false);
    setNewAlert({ tree: '', node: '', condition: '', severity: 'warning', assignee: '' });
    showToast('Alert rule created');
  };

  const critical = alerts.filter(a => a.severity === 'critical' && a.enabled).length;
  const warning = alerts.filter(a => a.severity === 'warning' && a.enabled).length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Alerts</h1>
            <p className="text-sm text-[#86868b] mt-1">Toggle alerts on/off, set thresholds</p>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">{critical} Critical</span>
            <span className="px-3 py-1.5 bg-yellow-50 text-yellow-600 text-xs font-medium rounded-full">{warning} Warning</span>
            <button onClick={() => setAddModal(true)} className="px-4 py-2 bg-[#8B5CF6] text-white text-sm font-medium rounded-xl hover:bg-[#7C3AED]">+ New Alert Rule</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]">
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">On/Off</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Severity</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Analysis / Node</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Condition</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Patients</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Assignee</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${!a.enabled ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-4 text-center">
                    <div onClick={() => toggleAlert(a.id)} className={`w-9 h-5 rounded-full relative cursor-pointer mx-auto transition-colors ${a.enabled ? 'bg-[#34c759]' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm ${a.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-[10px] font-semibold uppercase rounded-full ${
                      a.severity === 'critical' ? 'bg-red-50 text-red-600' :
                      a.severity === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'
                    }`}>{a.severity}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-[#1d1d1f]">{a.tree}</p>
                    <p className="text-xs text-[#8B5CF6]">{a.node}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-[#6e6e73]">{a.condition}</td>
                  <td className="px-5 py-4 text-sm text-right font-medium text-[#1d1d1f]">{a.patients}</td>
                  <td className="px-5 py-4 text-xs text-[#6e6e73]">{a.assignee}</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => openEdit(a)} className="text-xs px-2 py-1 bg-[#f5f5f7] rounded-lg hover:bg-[#8B5CF6]/10 text-[#6e6e73] hover:text-[#8B5CF6]">
                      {a.threshold} ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={editModal !== null} onClose={() => setEditModal(null)} title="Edit Alert Threshold">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Threshold</label>
            <input type="number" value={editThreshold} onChange={e => setEditThreshold(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={saveEdit} className="px-4 py-2 text-sm bg-[#8B5CF6] text-white rounded-xl">Save</button>
          </div>
        </div>
      </Modal>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="New Alert Rule">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Analysis Tree</label>
            <input value={newAlert.tree} onChange={e => setNewAlert(p => ({ ...p, tree: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Node</label>
            <input value={newAlert.node} onChange={e => setNewAlert(p => ({ ...p, node: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Condition</label>
            <input value={newAlert.condition} onChange={e => setNewAlert(p => ({ ...p, condition: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#86868b] mb-1 uppercase">Severity</label>
              <select value={newAlert.severity} onChange={e => setNewAlert(p => ({ ...p, severity: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#86868b] mb-1 uppercase">Assignee</label>
              <input value={newAlert.assignee} onChange={e => setNewAlert(p => ({ ...p, assignee: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setAddModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={handleAdd} className="px-4 py-2 text-sm bg-[#8B5CF6] text-white rounded-xl">Create Rule</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
