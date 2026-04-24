'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import PatientSearchInput, { PatientResult } from '@/components/PatientSearchInput';

const payers = ['Simply Health', 'Sunshine Health', 'Humana', 'Florida Blue', 'WellCare'];
const urgencies = ['Routine', 'Urgent', 'Emergent'];

export default function NewAuthRequestPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ patient: '', provider: '', procedure: '', cptCode: '', icdCode: '', payer: '', urgency: 'Routine', justification: '', notes: '' });

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Prior authorization request submitted');
    setForm({ patient: '', provider: '', procedure: '', cptCode: '', icdCode: '', payer: '', urgency: 'Routine', justification: '', notes: '' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">New Prior Authorization Request</h1>
        <p className="text-sm text-[#86868b] mb-8">Submit a new prior authorization to the payer</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase mb-1">Patient Name</label>
              <PatientSearchInput
                onSelect={(p: PatientResult) => update('patient', `${p.lastName}, ${p.firstName}`)}
                placeholder="Search patient..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase mb-1">Provider</label>
              <input value={form.provider} onChange={e => update('provider', e.target.value)} placeholder="Ordering provider..." className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase mb-1">Procedure / Service</label>
              <input value={form.procedure} onChange={e => update('procedure', e.target.value)} placeholder="e.g., Knee Replacement" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase mb-1">CPT Code</label>
              <input value={form.cptCode} onChange={e => update('cptCode', e.target.value)} placeholder="e.g., 27447" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase mb-1">ICD-10 Code</label>
              <input value={form.icdCode} onChange={e => update('icdCode', e.target.value)} placeholder="e.g., M17.11" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase mb-1">Payer</label>
              <select value={form.payer} onChange={e => update('payer', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" required>
                <option value="">Select payer...</option>
                {payers.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase mb-1">Urgency</label>
              <select value={form.urgency} onChange={e => update('urgency', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase mb-1">Clinical Justification</label>
            <textarea value={form.justification} onChange={e => update('justification', e.target.value)} rows={4} placeholder="Provide clinical justification for this procedure..." className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white resize-none" required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase mb-1">Additional Notes</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} placeholder="Any additional notes..." className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white resize-none" />
          </div>

          <div className="bg-[#f5f5f7] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-[#86868b] uppercase mb-2">Supporting Documentation</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-sm text-[#86868b]">Drag & drop files or <button type="button" onClick={() => showToast('File upload simulated')} className="text-[#0891B2] hover:underline">browse</button></p>
              <p className="text-xs text-[#86868b] mt-1">PDF, DOCX, images up to 10MB each</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-[#0891B2] text-white text-sm rounded-lg hover:bg-cyan-700 font-medium">Submit Authorization</button>
            <button type="button" onClick={() => showToast('Saved as draft')} className="px-6 py-2.5 bg-gray-100 text-[#1d1d1f] text-sm rounded-lg hover:bg-gray-200 font-medium">Save Draft</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
