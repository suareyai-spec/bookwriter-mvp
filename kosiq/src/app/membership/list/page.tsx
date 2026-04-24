'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';

export default function MembershipListPage() {
  const [patients, setPatients] = useState<any[]>([]);
  useEffect(() => { fetch('/api/patients?limit=50').then(r => r.json()).then(d => setPatients(d.patients || d)).catch(() => {}); }, []);
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Membership List</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Last Name','First Name','DOB','Gender','Status','LOB','Health Plan','PCP','Medical Center'].map(h=>(
                <th key={h} className="text-left py-3 px-2 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{patients.map((p: any, i: number)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2 px-2 font-medium">{p.lastName}</td>
                <td className="py-2 px-2">{p.firstName}</td>
                <td className="py-2 px-2 text-xs text-[#86868b]">{new Date(p.dob).toLocaleDateString()}</td>
                <td className="py-2 px-2 text-xs">{p.gender}</td>
                <td className="py-2 px-2"><span className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700">Current</span></td>
                <td className="py-2 px-2 text-xs">{p.lob}</td>
                <td className="py-2 px-2 text-xs">{p.healthPlan}</td>
                <td className="py-2 px-2 text-xs">{p.pcpName}</td>
                <td className="py-2 px-2 text-xs text-[#86868b]">{p.medicalCenter}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
