'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import PatientSearchInput from '@/components/PatientSearchInput';

const ACCENT = '#059669';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [sortCol, setSortCol] = useState('lastName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const { showToast } = useToast();
  const router = useRouter();

  const loadPatients = () => {
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (search) params.set('search', search);
    if (filterStatus) params.set('status', filterStatus);
    fetch(`/api/coreiq/patients?${params}`).then(r => r.json()).then(d => {
      setPatients(d.patients || []);
      setTotal(d.total || 0);
    });
  };

  useEffect(() => { loadPatients(); }, [page, search, filterStatus]);

  const sorted = useMemo(() => {
    return [...patients].sort((a, b) => {
      const va = a[sortCol] || '';
      const vb = b[sortCol] || '';
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [patients, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const handleAdd = async (data: any) => {
    const res = await fetch('/api/coreiq/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { showToast('Patient added'); setShowAdd(false); loadPatients(); }
    else showToast('Error adding patient', 'error');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Patients</h1>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>+ Add Patient</button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
          <PatientSearchInput
            filterMode
            onSelect={(p) => { setSearch(`${p.lastName}, ${p.firstName}`); setPage(1); }}
            onInputChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search name, MRN, phone..."
            className="w-64"
          />
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
            <option value="">All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Deceased</option>
          </select>
          <span className="ml-auto text-sm text-[#86868b] self-center">{total} patients</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f7]">
                  {[{ key: 'mrn', label: 'MRN' }, { key: 'lastName', label: 'Name' }, { key: 'dateOfBirth', label: 'DOB' }, { key: 'gender', label: 'Gender' }, { key: 'phone', label: 'Phone' }, { key: 'insuranceName', label: 'Insurance' }, { key: 'status', label: 'Status' }].map(c => (
                    <th key={c.key} onClick={() => toggleSort(c.key)} className="text-left py-3 px-4 text-[#86868b] font-medium cursor-pointer hover:text-[#1d1d1f]">
                      {c.label} {sortCol === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-[#86868b] font-medium">Activity</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(p => (
                  <tr key={p.id} onClick={() => router.push(`/coreiq/patients/${p.id}`)} className="border-t border-gray-50 hover:bg-[#f5f5f7] cursor-pointer">
                    <td className="py-3 px-4 font-mono text-xs">{p.mrn}</td>
                    <td className="py-3 px-4 font-medium">{p.lastName}, {p.firstName}</td>
                    <td className="py-3 px-4">{new Date(p.dateOfBirth).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{p.gender}</td>
                    <td className="py-3 px-4">{p.phone}</td>
                    <td className="py-3 px-4 text-xs max-w-[180px] truncate">{p.insuranceName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : p.status === 'Inactive' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-700'}`}>{p.status}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-[#86868b]">
                      {p._count?.encounters || 0} enc · {p._count?.appointments || 0} appts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-[#86868b]">Page {page} of {Math.ceil(total / 25) || 1}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 25)} className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-40">Next →</button>
            </div>
          </div>
        </div>

        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Patient" width="max-w-2xl">
          <PatientForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function PatientForm({ initial, onSave, onCancel }: { initial?: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    mrn: initial?.mrn || `MRN${Date.now().toString().slice(-6)}`,
    firstName: initial?.firstName || '', lastName: initial?.lastName || '',
    dateOfBirth: initial?.dateOfBirth ? new Date(initial.dateOfBirth).toISOString().split('T')[0] : '',
    gender: initial?.gender || 'Male',
    email: initial?.email || '', phone: initial?.phone || '',
    address: initial?.address || '', city: initial?.city || '', state: initial?.state || '', zip: initial?.zip || '',
    maritalStatus: initial?.maritalStatus || 'Single', language: initial?.language || 'English',
    insuranceName: initial?.insuranceName || '', insuranceId: initial?.insuranceId || '',
    pharmacyName: initial?.pharmacyName || '',
  });
  const u = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-3 gap-3">
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">MRN</label><input value={form.mrn} onChange={u('mrn')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">First Name</label><input value={form.firstName} onChange={u('firstName')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Last Name</label><input value={form.lastName} onChange={u('lastName')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={u('dateOfBirth')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Gender</label><select value={form.gender} onChange={u('gender')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"><option>Male</option><option>Female</option><option>Other</option></select></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Language</label><select value={form.language} onChange={u('language')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"><option>English</option><option>Spanish</option><option>Creole</option></select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Phone</label><input value={form.phone} onChange={u('phone')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Email</label><input value={form.email} onChange={u('email')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-2"><label className="text-xs font-medium text-[#86868b] block mb-1">Address</label><input value={form.address} onChange={u('address')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">City</label><input value={form.city} onChange={u('city')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">State</label><input value={form.state} onChange={u('state')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Insurance</label><input value={form.insuranceName} onChange={u('insuranceName')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Insurance ID</label><input value={form.insuranceId} onChange={u('insuranceId')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
        <div><label className="text-xs font-medium text-[#86868b] block mb-1">Pharmacy</label><input value={form.pharmacyName} onChange={u('pharmacyName')} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave({ ...form, dateOfBirth: new Date(form.dateOfBirth) })} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>Save</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-sm">Cancel</button>
      </div>
    </div>
  );
}
