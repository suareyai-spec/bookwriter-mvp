'use client';
import DashboardLayout from '@/components/DashboardLayout';

const discharged = [
  { name: 'John Wilson', id: 'KSQ-00312', hospital: 'Jackson Memorial', admitDate: '2026-02-05', dischargeDate: '2026-02-08', los: 3, diagnosis: 'Pneumonia', readmitRisk: 'High' },
  { name: 'Susan Taylor', id: 'KSQ-00198', hospital: 'Baptist Health', admitDate: '2026-02-06', dischargeDate: '2026-02-09', los: 3, diagnosis: 'CHF Exacerbation', readmitRisk: 'Critical' },
  { name: 'Michael Harris', id: 'KSQ-00445', hospital: 'Mount Sinai', admitDate: '2026-02-07', dischargeDate: '2026-02-10', los: 3, diagnosis: 'COPD Exacerbation', readmitRisk: 'High' },
  { name: 'Karen Clark', id: 'KSQ-00567', hospital: 'Aventura Hospital', admitDate: '2026-02-08', dischargeDate: '2026-02-10', los: 2, diagnosis: 'UTI/Pyelonephritis', readmitRisk: 'Medium' },
  { name: 'David Lewis', id: 'KSQ-00234', hospital: 'Memorial Regional', admitDate: '2026-02-04', dischargeDate: '2026-02-11', los: 7, diagnosis: 'Sepsis', readmitRisk: 'Critical' },
  { name: 'Jennifer Lopez', id: 'KSQ-00389', hospital: 'Mercy Hospital', admitDate: '2026-02-09', dischargeDate: '2026-02-11', los: 2, diagnosis: 'Cellulitis', readmitRisk: 'Low' },
  { name: 'Richard Martinez', id: 'KSQ-00123', hospital: 'South Miami Hospital', admitDate: '2026-02-10', dischargeDate: '2026-02-12', los: 2, diagnosis: 'Dehydration', readmitRisk: 'Medium' },
  { name: 'Barbara Anderson', id: 'KSQ-00678', hospital: 'Jackson Memorial', admitDate: '2026-02-03', dischargeDate: '2026-02-12', los: 9, diagnosis: 'Hip Fracture', readmitRisk: 'High' },
];

export default function DischargedPatientsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Discharged Patients</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Patient','ID','Hospital','Admit','Discharge','LOS','Diagnosis','Readmit Risk'].map(h=>(
                <th key={h} className="text-left py-3 px-2 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{discharged.map((p, i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-2 font-medium">{p.name}</td>
                <td className="py-2.5 px-2 text-xs text-[#86868b]">{p.id}</td>
                <td className="py-2.5 px-2 text-xs">{p.hospital}</td>
                <td className="py-2.5 px-2 text-xs">{p.admitDate}</td>
                <td className="py-2.5 px-2 text-xs">{p.dischargeDate}</td>
                <td className="py-2.5 px-2 text-center">{p.los}</td>
                <td className="py-2.5 px-2 text-xs">{p.diagnosis}</td>
                <td className="py-2.5 px-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.readmitRisk === 'Critical' ? 'bg-red-50 text-red-700' : p.readmitRisk === 'High' ? 'bg-orange-50 text-orange-700' : p.readmitRisk === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>{p.readmitRisk}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
