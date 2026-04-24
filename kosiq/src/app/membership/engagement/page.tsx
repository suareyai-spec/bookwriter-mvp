'use client';
import DashboardLayout from '@/components/DashboardLayout';

const engagementData = [
  { name: 'Maria Gonzalez', id: 'KSQ-00042', lastVisit: '2025-12-15', daysSince: 60, status: 'Unengaged', risk: 'Critical' },
  { name: 'Robert Smith', id: 'KSQ-00118', lastVisit: '2026-01-20', daysSince: 24, status: 'Engaged', risk: 'High' },
  { name: 'James Rodriguez', id: 'KSQ-00205', lastVisit: '2025-11-08', daysSince: 97, status: 'Unengaged', risk: 'Critical' },
  { name: 'Patricia Williams', id: 'KSQ-00087', lastVisit: '2026-02-01', daysSince: 12, status: 'Engaged', risk: 'High' },
  { name: 'Elizabeth Martinez', id: 'KSQ-00334', lastVisit: '2025-10-22', daysSince: 114, status: 'Unengaged', risk: 'High' },
  { name: 'Thomas Johnson', id: 'KSQ-00156', lastVisit: '2026-02-10', daysSince: 3, status: 'Engaged', risk: 'High' },
  { name: 'Linda Garcia', id: 'KSQ-00271', lastVisit: '2025-09-15', daysSince: 151, status: 'Unengaged', risk: 'Critical' },
  { name: 'William Brown', id: 'KSQ-00098', lastVisit: '2025-12-28', daysSince: 47, status: 'At Risk', risk: 'High' },
  { name: 'Carol Davis', id: 'KSQ-00412', lastVisit: '2025-11-30', daysSince: 75, status: 'Unengaged', risk: 'Medium' },
  { name: 'Kenneth Moore', id: 'KSQ-00189', lastVisit: '2026-01-05', daysSince: 39, status: 'At Risk', risk: 'High' },
];

export default function PatientEngagementPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Patient Engagement</h1>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Engaged', value: '1,420', pct: '71%', color: '#34c759' },
            { label: 'At Risk (30-90 days)', value: '340', pct: '17%', color: '#ff9f0a' },
            { label: 'Unengaged (90+ days)', value: '240', pct: '12%', color: '#ff3b30' },
            { label: 'AWV Completion', value: '58.4%', pct: 'Target: 75%', color: '#0071e3' },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-[#86868b] uppercase tracking-wider">{k.label}</p>
              <p className="text-2xl font-semibold mt-2" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs text-[#86868b] mt-1">{k.pct}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Patient Engagement Status</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Patient','ID','Last Visit','Days Since','Status','Risk Level'].map(h=>(
                <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{engagementData.map((p, i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-3 font-medium">{p.name}</td>
                <td className="py-2.5 px-3 text-xs text-[#86868b]">{p.id}</td>
                <td className="py-2.5 px-3 text-xs">{p.lastVisit}</td>
                <td className="py-2.5 px-3 text-center">{p.daysSince}</td>
                <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'Engaged' ? 'bg-green-50 text-green-700' : p.status === 'At Risk' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{p.status}</span></td>
                <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.risk === 'Critical' ? 'bg-red-50 text-red-700' : p.risk === 'High' ? 'bg-orange-50 text-orange-700' : 'bg-yellow-50 text-yellow-700'}`}>{p.risk}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
