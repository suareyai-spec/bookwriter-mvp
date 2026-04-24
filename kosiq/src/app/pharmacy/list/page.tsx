'use client';
import DashboardLayout from '@/components/DashboardLayout';

const rxList = Array.from({ length: 20 }, (_, i) => ({
  patient: ['Maria Gonzalez','Robert Smith','James Rodriguez','Patricia Williams','Elizabeth Martinez','Thomas Johnson','Linda Garcia','William Brown','Carol Davis','Kenneth Moore','Sandra Lopez','Donald Rivera','Ashley Torres','Steven Clark','Michelle Perez','George Wilson','Deborah Hall','Timothy Allen','Rebecca Young','Sharon King'][i],
  drug: ['Metformin TAB 1000MG','Eliquis TAB 5MG','Ozempic INJ 2MG/3ML','Lisinopril TAB 20MG','Atorvastatin TAB 40MG','Entresto TAB 97/103MG','Jardiance TAB 25MG','Amlodipine TAB 10MG','Gabapentin CAP 300MG','Omeprazole CAP 20MG','Metoprolol TAB 50MG','Xarelto TAB 20MG','Dupixent INJ 300/2ML','Losartan TAB 50MG','Furosemide TAB 40MG','Sertraline TAB 100MG','Carvedilol TAB 25MG','Trulicity INJ 1.5MG/0.5ML','Pantoprazole TAB 40MG','Levothyroxine TAB 100MCG'][i],
  type: i % 5 < 2 ? 'Generic' : i % 5 === 2 ? 'Brand' : 'Generic',
  cost: `$${(10 + i * 120).toLocaleString()}`,
  fillDate: `2025-${String(1 + (i % 12)).padStart(2, '0')}-${String(5 + i).padStart(2, '0')}`,
  prescriber: ['Dr. Maria Santos','Dr. James Chen','Dr. Robert Kumar','Dr. Angela Martinez','Dr. David Thompson'][i % 5],
}));

export default function PharmacyListPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Pharmacy List</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Patient','Drug Name','Type','Cost','Fill Date','Prescriber'].map(h=>(
                <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{rxList.map((r, i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-3 font-medium">{r.patient}</td>
                <td className="py-2.5 px-3">{r.drug}</td>
                <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${r.type === 'Brand' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{r.type}</span></td>
                <td className="py-2.5 px-3">{r.cost}</td>
                <td className="py-2.5 px-3 text-xs text-[#86868b]">{r.fillDate}</td>
                <td className="py-2.5 px-3 text-xs">{r.prescriber}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
