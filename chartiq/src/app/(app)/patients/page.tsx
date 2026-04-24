'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const deptColors: Record<string, string> = {
  ICU: 'border-l-red-500', 'Med-Surg': 'border-l-green-500', Cardiac: 'border-l-blue-500',
  Neuro: 'border-l-purple-500', Oncology: 'border-l-amber-500', Orthopedics: 'border-l-teal-500',
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const s = searchParams.get('search') || '';
    setSearch(s);
    fetchPatients(s, department);
  }, [searchParams]);

  const fetchPatients = async (s: string, d: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (d) params.set('department', d);
    params.set('status', 'admitted');
    const res = await fetch(`/api/patients?${params}`);
    setPatients(await res.json());
    setLoading(false);
  };

  const handleSearch = () => fetchPatients(search, department);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-dark">Patients</h1>

      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-3">
        <input type="text" placeholder="Search by name or MRN..." value={search}
          onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none text-sm" />
        <select value={department} onChange={(e) => { setDepartment(e.target.value); fetchPatients(search, e.target.value); }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none">
          <option value="">All Departments</option>
          {['ICU', 'Med-Surg', 'Cardiac', 'Neuro', 'Oncology', 'Orthopedics'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={handleSearch} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90">Search</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['MRN', 'Patient', 'Room/Bed', 'Admitted', 'Diagnosis', 'Status', 'Attending'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((p) => {
                const dept = p.notes?.[0]?.department || '';
                const borderClass = deptColors[dept] || 'border-l-gray-300';
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 cursor-pointer border-l-4 ${borderClass} transition-colors`}
                    onClick={() => router.push(`/patients/${p.id}`)}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.mrn}</td>
                    <td className="px-4 py-3 font-medium text-dark">{p.lastName}, {p.firstName}</td>
                    <td className="px-4 py-3 text-gray-600">{p.roomNumber}-{p.bedNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(p.admissionDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{p.admissionDiagnosis}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'admitted' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.primaryPhysician}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {patients.length === 0 && <p className="text-center py-10 text-gray-400">No patients found</p>}
        </div>
      )}
    </div>
  );
}
