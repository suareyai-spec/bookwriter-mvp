'use client';
import DashboardLayout from '@/components/DashboardLayout';

const topUtilizers = [
  { name: 'Maria Gonzalez', id: 'KSQ-00042', admissions: 8, erVisits: 14, totalCost: '$187,400', diagnosis: 'CHF, CKD Stage 4, DM2' },
  { name: 'Robert Smith', id: 'KSQ-00118', admissions: 6, erVisits: 11, totalCost: '$142,800', diagnosis: 'COPD, CHF, A-Fib' },
  { name: 'James Rodriguez', id: 'KSQ-00205', admissions: 5, erVisits: 9, totalCost: '$198,200', diagnosis: 'ESRD, DM2, HTN' },
  { name: 'Patricia Williams', id: 'KSQ-00087', admissions: 5, erVisits: 12, totalCost: '$124,600', diagnosis: 'CHF, COPD, Obesity' },
  { name: 'Elizabeth Martinez', id: 'KSQ-00334', admissions: 4, erVisits: 8, totalCost: '$98,400', diagnosis: 'DKA, CKD Stage 3' },
  { name: 'Thomas Johnson', id: 'KSQ-00156', admissions: 4, erVisits: 7, totalCost: '$112,300', diagnosis: 'Stroke, A-Fib, HTN' },
  { name: 'Linda Garcia', id: 'KSQ-00271', admissions: 4, erVisits: 10, totalCost: '$156,700', diagnosis: 'Sepsis, DM2, CKD' },
  { name: 'William Brown', id: 'KSQ-00098', admissions: 3, erVisits: 9, totalCost: '$89,200', diagnosis: 'MI, CAD, DM2' },
  { name: 'Carol Davis', id: 'KSQ-00412', admissions: 3, erVisits: 6, totalCost: '$76,800', diagnosis: 'CHF, DM2, Obesity' },
  { name: 'Kenneth Moore', id: 'KSQ-00189', admissions: 3, erVisits: 8, totalCost: '$92,100', diagnosis: 'COPD, Depression, HTN' },
];

export default function TopUtilizersPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Top Patient Utilizers</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Rank','Patient','ID','Admissions','ER Visits','Total Cost','Primary Diagnoses'].map(h=>(
                <th key={h} className="text-left py-3 px-2 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{topUtilizers.map((p, i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-2 font-bold text-[#0071e3]">{i + 1}</td>
                <td className="py-2.5 px-2 font-medium">{p.name}</td>
                <td className="py-2.5 px-2 text-xs text-[#86868b]">{p.id}</td>
                <td className="py-2.5 px-2 text-center">{p.admissions}</td>
                <td className="py-2.5 px-2 text-center">{p.erVisits}</td>
                <td className="py-2.5 px-2 font-medium text-[#ff3b30]">{p.totalCost}</td>
                <td className="py-2.5 px-2 text-xs text-[#6e6e73]">{p.diagnosis}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
