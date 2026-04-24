'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialDevices = [
  { id: 1, type: 'Blood Glucose Monitor', models: 'Dexcom G7, FreeStyle Libre 3', connected: 342, status: 'Active' },
  { id: 2, type: 'Blood Pressure', models: 'Omron Evolv, Withings BPM', connected: 289, status: 'Active' },
  { id: 3, type: 'Pulse Oximeter', models: 'Masimo, Nonin', connected: 178, status: 'Active' },
  { id: 4, type: 'Smart Scale', models: 'Withings Body+', connected: 234, status: 'Active' },
  { id: 5, type: 'Wearable', models: 'Apple Watch, Fitbit, Garmin', connected: 312, status: 'Active' },
  { id: 6, type: 'Thermometer', models: 'Withings Thermo', connected: 101, status: 'Inactive' },
];

export default function Page() {
  const { showToast } = useToast();
  const [devices, setDevices] = useState(initialDevices);
  const [addModal, setAddModal] = useState(false);
  const [newDevice, setNewDevice] = useState({ type: '', models: '', patient: '' });

  const toggleStatus = (id: number) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d));
    showToast('Device status changed');
  };

  const handleAdd = () => {
    if (!newDevice.type) return;
    setDevices(prev => [...prev, { id: Date.now(), type: newDevice.type, models: newDevice.models, connected: 1, status: 'Active' }]);
    setAddModal(false);
    setNewDevice({ type: '', models: '', patient: '' });
    showToast('Device added');
  };

  const handleRemove = (id: number) => {
    if (!confirm('Remove this device category?')) return;
    setDevices(prev => prev.filter(d => d.id !== id));
    showToast('Device removed');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Device Management</h1>
            <p className="text-sm text-[#86868b]">Connected devices & wearables</p>
          </div>
          <button onClick={() => setAddModal(true)} className="px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2]">+ Add Device</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {devices.map(d => (
            <div key={d.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-[#1d1d1f]">{d.type}</h3>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(d.id)} className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer ${d.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{d.status}</button>
                  <button onClick={() => handleRemove(d.id)} className="text-[10px] text-red-400 hover:text-red-600">✗</button>
                </div>
              </div>
              <p className="text-[10px] text-[#86868b] mb-3">{d.models}</p>
              <p className="text-2xl font-semibold text-[#06B6D4]">{d.connected} <span className="text-xs text-[#86868b]">connected</span></p>
            </div>
          ))}
        </div>
      </div>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Device">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Device Type</label>
            <input value={newDevice.type} onChange={e => setNewDevice(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="e.g., Blood Glucose Monitor" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Models</label>
            <input value={newDevice.models} onChange={e => setNewDevice(p => ({ ...p, models: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="e.g., Dexcom G7" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Assign to Patient (optional)</label>
            <input value={newDevice.patient} onChange={e => setNewDevice(p => ({ ...p, patient: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Patient name" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setAddModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={handleAdd} className="px-4 py-2 text-sm bg-[#06B6D4] text-white rounded-xl">Add Device</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
