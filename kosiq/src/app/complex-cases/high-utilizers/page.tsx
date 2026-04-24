'use client';
import DashboardLayout from '@/components/DashboardLayout';

const utilizers = [
  { name: 'Maria Gonzalez', id: 'KSQ-00042', admissions: 8, erVisits: 14, totalCost: '$187,400', ccm: 8.2, conditions: 'CHF, CKD4, DM2, A-Fib, Obesity' },
  { name: 'James Rodriguez', id: 'KSQ-00205', admissions: 5, erVisits: 9, totalCost: '$198,200', ccm: 9.1, conditions: 'ESRD, DM2, HTN, Anemia, CAD' },
  { name: 'Robert Smith', id: 'KSQ-00118', admissions: 6, erVisits: 11, totalCost: '$142,800', ccm: 7.5, conditions: 'COPD, CHF, A-Fib, Depression' },
  { name: 'Linda Garcia', id: 'KSQ-00271', admissions: 4, erVisits: 10, totalCost: '$156,700', ccm: 8.8, conditions: 'Sepsis, DM2, CKD3, HTN, Obesity' },
  { name: 'Patricia Williams', id: 'KSQ-00087', admissions: 5, erVisits: 12, totalCost: '$124,600', ccm: 6.8, conditions: 'CHF, COPD, Obesity, Sleep Apnea' },
];

export default function HighUtilizersPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Complex Cases — High Utilizers</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Patient','ID','Admissions','ER Visits','CCM Score','Total Cost','Conditions'].map(h=>(
                <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{utilizers.map((u, i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-3 font-medium">{u.name}</td>
                <td className="py-2.5 px-3 text-xs text-[#86868b]">{u.id}</td>
                <td className="py-2.5 px-3 text-center">{u.admissions}</td>
                <td className="py-2.5 px-3 text-center">{u.erVisits}</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">{u.ccm}</span></td>
                <td className="py-2.5 px-3 font-medium text-[#ff3b30]">{u.totalCost}</td>
                <td className="py-2.5 px-3 text-xs text-[#6e6e73]">{u.conditions}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
