'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';

export default function RevenueDetailsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/patients?limit=50').then(r => r.json()).then(d => setPatients(d.patients || d)).catch(() => {});
  }, []);
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Revenue Details</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['First Name','Last Name','DOB','Patient ID','PCP','Health Plan','LOB'].map(h=>(
                  <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {patients.map((p: any, i: number)=>(
                  <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                    <td className="py-2.5 px-3">{p.firstName}</td>
                    <td className="py-2.5 px-3">{p.lastName}</td>
                    <td className="py-2.5 px-3 text-xs text-[#86868b]">{new Date(p.dob).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 text-xs text-[#86868b]">{p.externalId}</td>
                    <td className="py-2.5 px-3 text-xs">{p.pcpName}</td>
                    <td className="py-2.5 px-3 text-xs">{p.healthPlan}</td>
                    <td className="py-2.5 px-3 text-xs">{p.lob}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
