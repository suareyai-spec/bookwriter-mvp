'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialPatients = [
  { id: 1, name: 'James Wilson', dischargeDate: 'Feb 28', facility: 'Baptist Hospital', diagnosis: 'CHF Exacerbation', laceScore: 14, risk: 'high', contactMade: true, followUp: 'Mar 3', daysSince: 2, status: 'on-track' },
  { id: 2, name: 'Maria Garcia', dischargeDate: 'Feb 27', facility: 'Mount Sinai', diagnosis: 'DKA', laceScore: 11, risk: 'moderate', contactMade: true, followUp: 'Mar 2', daysSince: 3, status: 'on-track' },
  { id: 3, name: 'Robert Johnson', dischargeDate: 'Feb 26', facility: 'Memorial West', diagnosis: 'COPD Exacerbation', laceScore: 16, risk: 'high', contactMade: false, followUp: 'Overdue', daysSince: 4, status: 'overdue' },
  { id: 4, name: 'Linda Smith', dischargeDate: 'Feb 25', facility: 'Cleveland Clinic FL', diagnosis: 'Pneumonia', laceScore: 9, risk: 'moderate', contactMade: true, followUp: 'Mar 4', daysSince: 5, status: 'on-track' },
  { id: 5, name: 'Michael Davis', dischargeDate: 'Feb 24', facility: 'Baptist Hospital', diagnosis: 'Chest Pain - ACS', laceScore: 18, risk: 'very-high', contactMade: true, followUp: 'Mar 1', daysSince: 6, status: 'f/u-complete' },
  { id: 6, name: 'Susan Anderson', dischargeDate: 'Feb 22', facility: 'Memorial Regional', diagnosis: 'Atrial Fibrillation', laceScore: 12, risk: 'moderate', contactMade: true, followUp: 'Mar 5', daysSince: 8, status: 'on-track' },
];

export default function TCMPage() {
  const { showToast } = useToast();
  const [patients, setPatients] = useState(initialPatients);
  const [scheduleModal, setScheduleModal] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');

  const toggleContact = (id: number) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== id) return p;
      const contactMade = !p.contactMade;
      return { ...p, contactMade, status: contactMade && p.status === 'overdue' ? 'on-track' : p.status };
    }));
    showToast('Contact status updated');
  };

  const updateStatus = (id: number, status: string) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    showToast(`Status changed to ${status}`);
  };

  const handleSchedule = () => {
    if (scheduleModal === null || !scheduleDate) return;
    setPatients(prev => prev.map(p => p.id === scheduleModal ? { ...p, followUp: scheduleDate, status: 'on-track' } : p));
    setScheduleModal(null);
    setScheduleDate('');
    showToast('Follow-up scheduled');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Transitional Care Management</h1>
            <p className="text-sm text-[#86868b] mt-1">Post-discharge follow-up & LACE readmission prediction</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active TCM Cases', value: patients.length.toString(), sub: 'Current discharges' },
            { label: 'Contact within 2 days', value: `${Math.round(patients.filter(p => p.contactMade).length / patients.length * 100)}%`, sub: 'Target: 90%' },
            { label: 'F/U Completed', value: patients.filter(p => p.status === 'f/u-complete').length.toString(), sub: `of ${patients.length} patients` },
            { label: 'Overdue', value: patients.filter(p => p.status === 'overdue').length.toString(), sub: 'Need attention' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-[#86868b] text-xs mb-1">{m.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{m.value}</p>
              <p className="text-[11px] text-[#EC4899] mt-1">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Patient</th>
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Facility / Dx</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">LACE</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Risk</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Contact</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Follow-Up</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Status</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${p.status === 'overdue' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#1d1d1f]">{p.name}</p>
                    <p className="text-[10px] text-[#86868b]">Discharged {p.dischargeDate} · Day {p.daysSince}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-[#1d1d1f]">{p.facility}</p>
                    <p className="text-[10px] text-[#86868b]">{p.diagnosis}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-bold ${p.laceScore >= 15 ? 'text-red-600' : p.laceScore >= 10 ? 'text-orange-500' : 'text-green-600'}`}>{p.laceScore}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      p.risk === 'very-high' ? 'bg-red-100 text-red-600' : p.risk === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>{p.risk}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleContact(p.id)} className={`cursor-pointer ${p.contactMade ? 'text-green-600' : 'text-red-500'}`}>
                      {p.contactMade ? '✓' : '✗'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-center" style={{ color: p.followUp === 'Overdue' ? '#EF4444' : '#6e6e73' }}>{p.followUp}</td>
                  <td className="px-4 py-3 text-center">
                    <select value={p.status} onChange={e => updateStatus(p.id, e.target.value)} className={`text-[10px] px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer ${
                      p.status === 'on-track' ? 'bg-green-50 text-green-600' :
                      p.status === 'f/u-complete' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                    }`}>
                      <option value="on-track">on-track</option>
                      <option value="f/u-complete">f/u-complete</option>
                      <option value="overdue">overdue</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { setScheduleModal(p.id); setScheduleDate(''); }} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">📅 Schedule</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={scheduleModal !== null} onClose={() => setScheduleModal(null)} title="Schedule Follow-Up">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Follow-up Date</label>
            <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setScheduleModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={handleSchedule} className="px-4 py-2 text-sm bg-[#EC4899] text-white rounded-xl">Schedule</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
