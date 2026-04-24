'use client';
import DashboardLayout from '@/components/DashboardLayout';

const cases = Array.from({ length: 20 }, (_, i) => ({
  name: ['Maria Gonzalez','Robert Smith','James Rodriguez','Patricia Williams','Elizabeth Martinez','Thomas Johnson','Linda Garcia','William Brown','Carol Davis','Kenneth Moore','Sandra Lopez','Donald Rivera','Ashley Torres','Steven Clark','Michelle Perez','George Wilson','Deborah Hall','Timothy Allen','Rebecca Young','Sharon King'][i],
  id: `KSQ-${String(42 + i * 23).padStart(5, '0')}`,
  diagnoses: [3, 5, 4, 6, 3, 4, 5, 3, 4, 3, 5, 4, 3, 6, 4, 3, 5, 4, 3, 4][i],
  ccmScore: [8.2, 7.5, 9.1, 6.8, 5.4, 7.2, 8.8, 4.9, 6.1, 5.7, 7.3, 6.5, 4.2, 8.4, 5.9, 4.6, 7.1, 6.3, 5.1, 6.7][i],
  status: i % 3 === 0 ? 'Seen' : 'Unseen',
  lastVisit: `2026-0${1 + (i % 2)}-${String(5 + i).padStart(2, '0')}`,
  cost: `$${(18000 + i * 2400).toLocaleString()}`,
}));

export default function ComplexCasesDetailsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Complex Cases — Details</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Patient','ID','Diagnosis Count','CCM Score','Status','Last Visit','Total Cost'].map(h=>(
                <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{cases.map((c, i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-3 font-medium">{c.name}</td>
                <td className="py-2.5 px-3 text-xs text-[#86868b]">{c.id}</td>
                <td className="py-2.5 px-3 text-center">{c.diagnoses}</td>
                <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.ccmScore >= 7 ? 'bg-red-50 text-red-700' : c.ccmScore >= 5 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>{c.ccmScore}</span></td>
                <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.status === 'Seen' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-[#86868b]'}`}>{c.status}</span></td>
                <td className="py-2.5 px-3 text-xs">{c.lastVisit}</td>
                <td className="py-2.5 px-3 font-medium">{c.cost}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
