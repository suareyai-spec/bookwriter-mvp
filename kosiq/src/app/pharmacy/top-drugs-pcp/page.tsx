'use client';
import DashboardLayout from '@/components/DashboardLayout';

const data = [
  { pcp: 'Dr. Maria Santos', topDrug: 'Metformin TAB 1000MG', rxCount: 45, totalCost: '$540', gdr: '87.2%' },
  { pcp: 'Dr. James Chen', topDrug: 'Eliquis TAB 5MG', rxCount: 38, totalCost: '$24,320', gdr: '82.5%' },
  { pcp: 'Dr. Patricia Williams', topDrug: 'Lisinopril TAB 20MG', rxCount: 42, totalCost: '$336', gdr: '89.1%' },
  { pcp: 'Dr. Robert Kumar', topDrug: 'Ozempic INJ 2MG/3ML', rxCount: 28, totalCost: '$20,160', gdr: '78.4%' },
  { pcp: 'Dr. Angela Martinez', topDrug: 'Atorvastatin TAB 40MG', rxCount: 40, totalCost: '$600', gdr: '86.8%' },
  { pcp: 'Dr. David Thompson', topDrug: 'Entresto TAB 97/103MG', rxCount: 22, totalCost: '$13,640', gdr: '80.2%' },
  { pcp: 'Dr. Lisa Park', topDrug: 'Amlodipine TAB 10MG', rxCount: 35, totalCost: '$350', gdr: '88.5%' },
  { pcp: 'Dr. Michael Brown', topDrug: 'Jardiance TAB 25MG', rxCount: 25, totalCost: '$14,500', gdr: '81.3%' },
  { pcp: 'Dr. Sarah Johnson', topDrug: 'Metoprolol TAB 50MG', rxCount: 38, totalCost: '$342', gdr: '87.9%' },
  { pcp: 'Dr. Kevin Lee', topDrug: 'Gabapentin CAP 300MG', rxCount: 32, totalCost: '$448', gdr: '85.6%' },
];

export default function TopDrugsByPCPPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Top Drugs by PCP</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['PCP','Top Drug','Rx Count','Total Cost','GDR %'].map(h=>(
                <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{data.map((r, i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-3 font-medium">{r.pcp}</td>
                <td className="py-2.5 px-3">{r.topDrug}</td>
                <td className="py-2.5 px-3 text-center">{r.rxCount}</td>
                <td className="py-2.5 px-3">{r.totalCost}</td>
                <td className="py-2.5 px-3 font-medium text-[#34c759]">{r.gdr}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
