'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const patients = [
  { name: 'Maria Garcia', eligible: true, consent: 'active', carePlan: 'active', lastClaim: 'Feb 28', nextBatch: 'Mar 15', status: 'enrolled' },
  { name: 'James Wilson', eligible: true, consent: 'active', carePlan: 'review', lastClaim: 'Feb 15', nextBatch: 'Mar 15', status: 'enrolled' },
  { name: 'Robert Johnson', eligible: true, consent: 'pending', carePlan: 'draft', lastClaim: 'N/A', nextBatch: 'N/A', status: 'pending' },
  { name: 'Patricia Brown', eligible: true, consent: 'active', carePlan: 'active', lastClaim: 'Feb 28', nextBatch: 'Mar 15', status: 'enrolled' },
  { name: 'Linda Smith', eligible: false, consent: 'N/A', carePlan: 'N/A', lastClaim: 'N/A', nextBatch: 'N/A', status: 'ineligible' },
  { name: 'David Martinez', eligible: true, consent: 'expired', carePlan: 'active', lastClaim: 'Jan 31', nextBatch: 'N/A', status: 'consent-needed' },
];

export default function APCMPage() {
  const toast = useToast();
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const handleVerify = () => { setVerifying(true); setTimeout(() => { setVerifying(false); toast('Eligibility verified — 847 of 892 patients eligible for APCM billing'); }, 1500); };
  const handleSubmit = () => { setSubmitting(true); setTimeout(() => { setSubmitting(false); toast('Batch claims submitted — 234 claims for $67,800 total'); }, 2000); };
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Advanced Primary Care Management</h1>
            <p className="text-sm text-[#86868b] mt-1">Eligibility, consent, care plans & batch claims</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleVerify} disabled={verifying} className="px-4 py-2 border border-gray-200 text-sm rounded-xl hover:bg-gray-50 disabled:opacity-50">{verifying ? 'Verifying...' : 'Verify Eligibility'}</button>
            <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-[#EC4899] text-white text-sm font-medium rounded-xl hover:bg-[#DB2777] disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit Batch Claims'}</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'APCM Enrolled', value: '345', sub: 'of 890 eligible' },
            { label: 'Pending Consent', value: '23', sub: 'Awaiting signature' },
            { label: 'Active Care Plans', value: '312', sub: '33 need review' },
            { label: 'Next Batch', value: 'Mar 15', sub: '289 claims ready' },
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
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Patient</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Eligible</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Consent</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Care Plan</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Last Claim</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Next Batch</th>
                <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                  <td className="px-5 py-3 text-sm font-medium text-[#1d1d1f]">{p.name}</td>
                  <td className="px-5 py-3 text-center">{p.eligible ? <span className="text-green-600">✓</span> : <span className="text-red-500">✗</span>}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      p.consent === 'active' ? 'bg-green-50 text-green-600' :
                      p.consent === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                      p.consent === 'expired' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'
                    }`}>{p.consent}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      p.carePlan === 'active' ? 'bg-green-50 text-green-600' :
                      p.carePlan === 'review' ? 'bg-yellow-50 text-yellow-600' :
                      p.carePlan === 'draft' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                    }`}>{p.carePlan}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-center text-[#6e6e73]">{p.lastClaim}</td>
                  <td className="px-5 py-3 text-xs text-center text-[#6e6e73]">{p.nextBatch}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'enrolled' ? 'bg-green-50 text-green-600' :
                      p.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                      p.status === 'consent-needed' ? 'bg-orange-50 text-orange-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
