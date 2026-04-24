'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialProviders = [
  { id: 1, name: 'Baptist Health South Florida', type: 'Health System', facilities: 12, providers: 2400, patients: 8920, status: 'Active', protocol: 'FHIR R4', since: '2024-06' },
  { id: 2, name: 'Memorial Healthcare System', type: 'Health System', facilities: 6, providers: 1800, patients: 6340, status: 'Active', protocol: 'HL7 v2.5', since: '2024-08' },
  { id: 3, name: 'Quest Diagnostics', type: 'Laboratory', facilities: 45, providers: 0, patients: 14200, status: 'Active', protocol: 'HL7 v2.5', since: '2024-06' },
  { id: 4, name: 'LabCorp', type: 'Laboratory', facilities: 38, providers: 0, patients: 9800, status: 'Degraded', protocol: 'HL7 v2.5', since: '2024-09' },
  { id: 5, name: 'CVS/Caremark', type: 'Pharmacy', facilities: 320, providers: 0, patients: 16500, status: 'Active', protocol: 'NCPDP D.0', since: '2024-07' },
  { id: 6, name: 'Simply Health', type: 'Payer', facilities: 1, providers: 0, patients: 22400, status: 'Active', protocol: '837/835', since: '2024-06' },
  { id: 7, name: 'Humana', type: 'Payer', facilities: 1, providers: 0, patients: 18900, status: 'Active', protocol: '837/835', since: '2024-06' },
  { id: 8, name: 'Aetna Better Health', type: 'Payer', facilities: 1, providers: 0, patients: 9400, status: 'Pending', protocol: 'FHIR R4', since: '—' },
  { id: 9, name: 'Jackson Memorial Hospital', type: 'Safety Net', facilities: 1, providers: 600, patients: 3100, status: 'Onboarding', protocol: 'FHIR R4', since: '—' },
];

const statusStyles: Record<string, string> = {
  Active: 'bg-green-50 text-green-700',
  Degraded: 'bg-red-50 text-red-700',
  Pending: 'bg-amber-50 text-amber-700',
  Onboarding: 'bg-blue-50 text-blue-700',
  Disconnected: 'bg-gray-100 text-gray-500',
};

const statusOptions = ['Active', 'Degraded', 'Pending', 'Onboarding', 'Disconnected'];

export default function NetworkPage() {
  const { showToast } = useToast();
  const [orgs, setOrgs] = useState(initialProviders);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [newOrg, setNewOrg] = useState({ name: '', type: 'Health System', protocol: 'FHIR R4' });
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');

  const changeStatus = (id: number, status: string) => {
    setOrgs(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    showToast(`Connection status changed to ${status}`);
  };

  const handleAdd = () => {
    if (!newOrg.name) return;
    setOrgs(prev => [...prev, { id: Date.now(), name: newOrg.name, type: newOrg.type, facilities: 0, providers: 0, patients: 0, status: 'Onboarding', protocol: newOrg.protocol, since: '—' }]);
    setAddModal(false);
    setNewOrg({ name: '', type: 'Health System', protocol: 'FHIR R4' });
    showToast('Organization added');
  };

  const openEdit = (o: typeof orgs[0]) => { setEditModal(o.id); setEditName(o.name); setEditType(o.type); };
  const saveEdit = () => {
    setOrgs(prev => prev.map(o => o.id === editModal ? { ...o, name: editName, type: editType } : o));
    setEditModal(null);
    showToast('Organization updated');
  };

  const handleRemove = (id: number) => {
    if (!confirm('Remove this organization?')) return;
    setOrgs(prev => prev.filter(o => o.id !== id));
    showToast('Organization removed');
  };

  const filtered = search ? orgs.filter(o => o.name.toLowerCase().includes(search.toLowerCase())) : orgs;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Network Directory</h1>
            <p className="text-sm text-[#86868b]">Connected providers, payers, labs, and pharmacies</p>
          </div>
          <div className="flex gap-3">
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm w-48" />
            <button onClick={() => setAddModal(true)} className="px-4 py-2 bg-[#3B82F6] text-white text-sm rounded-xl hover:bg-[#2563EB]">Add Organization</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="text-[#86868b] text-xs border-b border-gray-100">
              <th className="text-left pb-3 font-medium">Organization</th>
              <th className="text-left pb-3 font-medium">Type</th>
              <th className="text-right pb-3 font-medium">Patients</th>
              <th className="text-left pb-3 font-medium">Protocol</th>
              <th className="text-left pb-3 font-medium">Status</th>
              <th className="text-center pb-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="py-3 text-[#1d1d1f] font-medium">{p.name}</td>
                  <td className="py-3 text-[#86868b]">{p.type}</td>
                  <td className="py-3 text-right text-[#1d1d1f]">{p.patients.toLocaleString()}</td>
                  <td className="py-3 text-xs font-mono text-[#86868b]">{p.protocol}</td>
                  <td className="py-3">
                    <select value={p.status} onChange={e => changeStatus(p.id, e.target.value)} className={`text-[10px] px-2 py-0.5 rounded-full border-0 cursor-pointer ${statusStyles[p.status] || statusStyles.Active}`}>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openEdit(p)} className="text-[10px] px-2 py-1 bg-gray-50 rounded-lg hover:bg-gray-100">✏️</button>
                      <button onClick={() => handleRemove(p.id)} className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">✗</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Organization">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Name</label>
            <input value={newOrg.name} onChange={e => setNewOrg(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Type</label>
            <select value={newOrg.type} onChange={e => setNewOrg(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              {['Health System', 'Laboratory', 'Pharmacy', 'Payer', 'Safety Net', 'Academic Medical Center'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Protocol</label>
            <select value={newOrg.protocol} onChange={e => setNewOrg(p => ({ ...p, protocol: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              {['FHIR R4', 'HL7 v2.5', 'NCPDP D.0', '837/835'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setAddModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={handleAdd} className="px-4 py-2 text-sm bg-[#3B82F6] text-white rounded-xl">Add</button>
          </div>
        </div>
      </Modal>

      <Modal open={editModal !== null} onClose={() => setEditModal(null)} title="Edit Organization">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Name</label>
            <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Type</label>
            <input value={editType} onChange={e => setEditType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={saveEdit} className="px-4 py-2 text-sm bg-[#3B82F6] text-white rounded-xl">Save</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
