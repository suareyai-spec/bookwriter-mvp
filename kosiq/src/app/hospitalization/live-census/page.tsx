'use client';
import DashboardLayout from '@/components/DashboardLayout';

const censusData = [
  { name: 'Maria Gonzalez', id: 'KSQ-00042', hospital: 'Jackson Memorial', admitDate: '2026-02-10', type: 'Inpatient', diagnosis: 'CHF Exacerbation', pcp: 'Dr. Maria Santos', payer: 'Simply Health', los: 3 },
  { name: 'Robert Smith', id: 'KSQ-00118', hospital: 'Baptist Health', admitDate: '2026-02-11', type: 'ER', diagnosis: 'Chest Pain', pcp: 'Dr. James Chen', payer: 'Sunshine Health', los: 2 },
  { name: 'James Rodriguez', id: 'KSQ-00205', hospital: 'Mount Sinai', admitDate: '2026-02-09', type: 'Inpatient', diagnosis: 'COPD Exacerbation', pcp: 'Dr. Robert Kumar', payer: 'Humana', los: 4 },
  { name: 'Patricia Williams', id: 'KSQ-00087', hospital: 'Aventura Hospital', admitDate: '2026-02-12', type: 'Observation', diagnosis: 'Syncope', pcp: 'Dr. Angela Martinez', payer: 'Simply Health', los: 1 },
  { name: 'Elizabeth Martinez', id: 'KSQ-00334', hospital: 'Memorial Regional', admitDate: '2026-02-08', type: 'Inpatient', diagnosis: 'Pneumonia', pcp: 'Dr. David Thompson', payer: 'Florida Blue', los: 5 },
  { name: 'Thomas Johnson', id: 'KSQ-00156', hospital: 'Jackson Memorial', admitDate: '2026-02-13', type: 'ER', diagnosis: 'Acute Abdominal Pain', pcp: 'Dr. Lisa Park', payer: 'WellCare', los: 0 },
  { name: 'Linda Garcia', id: 'KSQ-00271', hospital: 'Mercy Hospital', admitDate: '2026-02-07', type: 'Inpatient', diagnosis: 'Sepsis', pcp: 'Dr. Michael Brown', payer: 'Sunshine Health', los: 6 },
];

export default function LiveCensusPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Live Census</h1>
        <p className="text-sm text-[#86868b] mb-6">{censusData.length} patients currently admitted</p>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Patient','ID','Hospital','Admit Date','Type','Diagnosis','PCP','Payer','LOS (days)'].map(h=>(
                <th key={h} className="text-left py-3 px-2 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{censusData.map((p, i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-2 font-medium">{p.name}</td>
                <td className="py-2.5 px-2 text-xs text-[#86868b]">{p.id}</td>
                <td className="py-2.5 px-2 text-xs">{p.hospital}</td>
                <td className="py-2.5 px-2 text-xs">{p.admitDate}</td>
                <td className="py-2.5 px-2"><span className={`px-2 py-0.5 rounded-full text-xs ${p.type === 'ER' ? 'bg-red-50 text-red-700' : p.type === 'Inpatient' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'}`}>{p.type}</span></td>
                <td className="py-2.5 px-2 text-xs">{p.diagnosis}</td>
                <td className="py-2.5 px-2 text-xs">{p.pcp}</td>
                <td className="py-2.5 px-2 text-xs">{p.payer}</td>
                <td className="py-2.5 px-2 text-center font-medium">{p.los}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
