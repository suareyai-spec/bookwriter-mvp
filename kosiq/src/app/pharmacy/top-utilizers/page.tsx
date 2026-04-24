'use client';
import DashboardLayout from '@/components/DashboardLayout';

const utilizers = [
  { name: 'Maria Gonzalez', id: 'KSQ-00042', rxCount: 14, totalCost: '$42,800', topDrug: 'Dupixent INJ 300/2ML', conditions: 'CHF, CKD4, DM2' },
  { name: 'James Rodriguez', id: 'KSQ-00205', rxCount: 12, totalCost: '$38,200', topDrug: 'Biktarvy TAB', conditions: 'ESRD, DM2, HTN' },
  { name: 'Robert Smith', id: 'KSQ-00118', rxCount: 11, totalCost: '$28,400', topDrug: 'Eliquis TAB 5MG', conditions: 'COPD, CHF, A-Fib' },
  { name: 'Linda Garcia', id: 'KSQ-00271', rxCount: 10, totalCost: '$24,600', topDrug: 'Ozempic INJ 2MG/3ML', conditions: 'DM2, CKD3, HTN' },
  { name: 'Patricia Williams', id: 'KSQ-00087', rxCount: 9, totalCost: '$22,100', topDrug: 'Entresto TAB 97/103MG', conditions: 'CHF, COPD, Obesity' },
  { name: 'Thomas Johnson', id: 'KSQ-00156', rxCount: 9, totalCost: '$19,800', topDrug: 'Xarelto TAB 20MG', conditions: 'Stroke, A-Fib, HTN' },
  { name: 'William Brown', id: 'KSQ-00098', rxCount: 8, totalCost: '$16,500', topDrug: 'Jardiance TAB 25MG', conditions: 'MI, CAD, DM2' },
  { name: 'Elizabeth Martinez', id: 'KSQ-00334', rxCount: 8, totalCost: '$14,200', topDrug: 'Trulicity INJ', conditions: 'DKA, CKD3' },
];

export default function PharmacyTopUtilizersPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Pharmacy Top Utilizers</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Patient','ID','Rx Count','Total Cost','Top Drug','Conditions'].map(h=>(
                <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{utilizers.map((u, i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-3 font-medium">{u.name}</td>
                <td className="py-2.5 px-3 text-xs text-[#86868b]">{u.id}</td>
                <td className="py-2.5 px-3 text-center font-medium">{u.rxCount}</td>
                <td className="py-2.5 px-3 font-medium text-[#ff3b30]">{u.totalCost}</td>
                <td className="py-2.5 px-3 text-xs">{u.topDrug}</td>
                <td className="py-2.5 px-3 text-xs text-[#6e6e73]">{u.conditions}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
