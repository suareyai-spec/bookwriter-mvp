'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';

export default function ReferralDetailsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  useEffect(() => { fetch('/api/referrals').then(r => r.json()).then(setReferrals).catch(() => {}); }, []);
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Referral Details</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['Patient','DOB','Referral Date','Specialty','From Facility','To Facility','Status','Priority'].map(h=>(
                  <th key={h} className="text-left py-3 px-2 text-xs font-medium text-[#86868b] uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {referrals.slice(0, 50).map((r: any, i: number)=>(
                  <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                    <td className="py-2.5 px-2 font-medium">{r.patient?.firstName} {r.patient?.lastName}</td>
                    <td className="py-2.5 px-2 text-xs text-[#86868b]">{r.patient?.dob ? new Date(r.patient.dob).toLocaleDateString() : ''}</td>
                    <td className="py-2.5 px-2 text-xs">{new Date(r.referralDate).toLocaleDateString()}</td>
                    <td className="py-2.5 px-2 text-xs">{r.specialty}</td>
                    <td className="py-2.5 px-2 text-xs text-[#86868b]">{r.fromFacility}</td>
                    <td className="py-2.5 px-2 text-xs text-[#86868b]">{r.toFacility}</td>
                    <td className="py-2.5 px-2"><span className={`px-2 py-0.5 rounded-full text-xs ${r.status === 'Completed' ? 'bg-green-50 text-green-700' : r.status === 'Open' ? 'bg-blue-50 text-blue-700' : r.status === 'Cancelled' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>{r.status}</span></td>
                    <td className="py-2.5 px-2 text-xs">{r.priority}</td>
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
