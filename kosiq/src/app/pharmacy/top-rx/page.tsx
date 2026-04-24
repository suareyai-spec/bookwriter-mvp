'use client';
import DashboardLayout from '@/components/DashboardLayout';

const topRx = [
  { drug: 'Dupixent INJ 300/2ML', cost: '$34,724.99', count: 14 },
  { drug: 'Imbruvica CAP 140MG', cost: '$30,431.67', count: 2 },
  { drug: 'Humira INJ 40MG/0.8ML', cost: '$28,900.00', count: 10 },
  { drug: 'Keytruda INJ 100MG/4ML', cost: '$20,400.00', count: 2 },
  { drug: 'Trodelvy SOL 180MG', cost: '$19,244.70', count: 2 },
  { drug: 'Biktarvy TAB', cost: '$17,650.92', count: 5 },
  { drug: 'Eliquis TAB 5MG', cost: '$17,263.26', count: 27 },
  { drug: 'Vyndamax CAP 61MG', cost: '$17,173.63', count: 4 },
  { drug: 'Mekinist TAB 0.5MG', cost: '$14,970.71', count: 2 },
  { drug: 'Ozempic INJ 2MG/3ML', cost: '$14,416.17', count: 20 },
  { drug: 'Entresto TAB 97/103MG', cost: '$12,400.00', count: 20 },
  { drug: 'Xarelto TAB 20MG', cost: '$11,550.00', count: 21 },
  { drug: 'Jardiance TAB 25MG', cost: '$10,880.00', count: 18 },
  { drug: 'Trulicity INJ 1.5MG/0.5ML', cost: '$10,200.00', count: 15 },
  { drug: 'Farxiga TAB 10MG', cost: '$8,960.00', count: 16 },
  { drug: 'Metformin TAB 1000MG', cost: '$2,400.00', count: 200 },
  { drug: 'Lisinopril TAB 20MG', cost: '$1,600.00', count: 200 },
  { drug: 'Atorvastatin TAB 40MG', cost: '$2,250.00', count: 150 },
  { drug: 'Amlodipine TAB 10MG', cost: '$1,500.00', count: 150 },
  { drug: 'Omeprazole CAP 20MG', cost: '$1,320.00', count: 120 },
];

export default function TopRxPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Top Rx</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Rank','Drug Name','Total Drug Cost','Rx Count'].map(h=>(
                <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{topRx.map((r, i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-3 font-bold text-[#0071e3]">{i + 1}</td>
                <td className="py-2.5 px-3 font-medium">{r.drug}</td>
                <td className="py-2.5 px-3">{r.cost}</td>
                <td className="py-2.5 px-3">{r.count}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
