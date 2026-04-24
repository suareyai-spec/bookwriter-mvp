'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useMemo } from 'react';

const providerData = [
  { name: 'Miami Primary Care Associates', npi: '1234567890', specialty: 'Internal Medicine', avgCharge: 285, peerAvg: 192, stdDev: 2.4, flaggedCPTs: '99215, 99214', totalClaims: 1240, flaggedClaims: 87, referralScore: 1.8, riskLevel: 'High' },
  { name: 'South Florida Specialists', npi: '2345678901', specialty: 'Cardiology', avgCharge: 425, peerAvg: 380, stdDev: 1.2, flaggedCPTs: '93306, 93312', totalClaims: 890, flaggedClaims: 34, referralScore: 0.9, riskLevel: 'Low' },
  { name: 'Coral Gables Medical Group', npi: '3456789012', specialty: 'Family Medicine', avgCharge: 312, peerAvg: 185, stdDev: 3.1, flaggedCPTs: '99215, 99213, 99214', totalClaims: 1560, flaggedClaims: 156, referralScore: 2.7, riskLevel: 'Critical' },
  { name: 'Aventura Health Center', npi: '4567890123', specialty: 'Orthopedics', avgCharge: 520, peerAvg: 445, stdDev: 1.5, flaggedCPTs: '27447, 29881', totalClaims: 670, flaggedClaims: 28, referralScore: 1.1, riskLevel: 'Medium' },
  { name: 'Dade County Internal Medicine', npi: '5678901234', specialty: 'Internal Medicine', avgCharge: 198, peerAvg: 192, stdDev: 0.3, flaggedCPTs: '-', totalClaims: 980, flaggedClaims: 5, referralScore: 0.4, riskLevel: 'Low' },
  { name: 'Kendall Family Practice', npi: '6789012345', specialty: 'Family Medicine', avgCharge: 267, peerAvg: 185, stdDev: 2.0, flaggedCPTs: '99215, 99214', totalClaims: 1120, flaggedClaims: 67, referralScore: 2.1, riskLevel: 'High' },
  { name: 'Hialeah Community Health', npi: '7890123456', specialty: 'General Practice', avgCharge: 210, peerAvg: 178, stdDev: 0.9, flaggedCPTs: '99213', totalClaims: 1450, flaggedClaims: 21, referralScore: 0.7, riskLevel: 'Low' },
  { name: 'Doral Medical Center', npi: '8901234567', specialty: 'Cardiology', avgCharge: 489, peerAvg: 380, stdDev: 2.8, flaggedCPTs: '93306, 93307, 93312', totalClaims: 540, flaggedClaims: 89, referralScore: 3.2, riskLevel: 'Critical' },
  { name: 'Palmetto Bay Clinic', npi: '9012345678', specialty: 'Internal Medicine', avgCharge: 225, peerAvg: 192, stdDev: 1.0, flaggedCPTs: '99214', totalClaims: 780, flaggedClaims: 15, referralScore: 0.6, riskLevel: 'Low' },
  { name: 'Biscayne Medical Group', npi: '0123456789', specialty: 'Pulmonology', avgCharge: 378, peerAvg: 310, stdDev: 1.7, flaggedCPTs: '94060, 94375', totalClaims: 420, flaggedClaims: 38, referralScore: 1.4, riskLevel: 'Medium' },
  { name: 'Homestead Health Partners', npi: '1122334455', specialty: 'Family Medicine', avgCharge: 295, peerAvg: 185, stdDev: 2.6, flaggedCPTs: '99215, 99214, 99213', totalClaims: 1340, flaggedClaims: 112, referralScore: 2.4, riskLevel: 'High' },
  { name: 'Miami Lakes Medical', npi: '2233445566', specialty: 'Nephrology', avgCharge: 445, peerAvg: 390, stdDev: 1.3, flaggedCPTs: '90960', totalClaims: 310, flaggedClaims: 18, referralScore: 0.8, riskLevel: 'Low' },
];

const riskColor: Record<string, string> = { Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Medium: 'bg-yellow-100 text-yellow-700', Low: 'bg-green-100 text-green-700' };

export default function ProviderOutliersPage() {
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [sortField, setSortField] = useState('stdDev');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  const filtered = useMemo(() => {
    let d = providerData.filter(p =>
      (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.npi.includes(search) || p.specialty.toLowerCase().includes(search.toLowerCase())) &&
      (!filterRisk || p.riskLevel === filterRisk)
    );
    d.sort((a, b) => {
      const av = (a as any)[sortField], bv = (b as any)[sortField];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return d;
  }, [search, filterRisk, sortField, sortDir]);

  const toggleSort = (f: string) => { if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('desc'); } };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Provider Outliers</h1>
        <p className="text-sm text-[#86868b] mb-6">Billing pattern comparison vs peers</p>

        <div className="flex gap-3 mb-4">
          <input placeholder="Search providers, NPI, specialty..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-72" />
          <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Risk Levels</option>
            {['Critical','High','Medium','Low'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              {[['name','Provider'],['specialty','Specialty'],['avgCharge','Avg Charge'],['peerAvg','Peer Avg'],['stdDev','Std Dev'],['flaggedCPTs','Flagged CPTs'],['totalClaims','Claims'],['flaggedClaims','Flagged'],['referralScore','Referral Score'],['riskLevel','Risk']].map(([f,l]) => (
                <th key={f} className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3 cursor-pointer hover:text-[#1d1d1f] whitespace-nowrap" onClick={() => toggleSort(f)}>
                  {l} {sortField === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 text-xs">
                  <td className="px-3 py-3 font-medium text-[#1d1d1f]">{p.name}</td>
                  <td className="px-3 py-3 text-[#6e6e73]">{p.specialty}</td>
                  <td className="px-3 py-3 text-[#1d1d1f]">${p.avgCharge}</td>
                  <td className="px-3 py-3 text-[#86868b]">${p.peerAvg}</td>
                  <td className="px-3 py-3"><span className={`font-bold ${p.stdDev >= 2 ? 'text-[#DC2626]' : p.stdDev >= 1 ? 'text-[#F97316]' : 'text-[#22C55E]'}`}>{p.stdDev.toFixed(1)}σ</span></td>
                  <td className="px-3 py-3 font-mono text-[10px] text-[#6e6e73]">{p.flaggedCPTs}</td>
                  <td className="px-3 py-3 text-[#1d1d1f]">{p.totalClaims.toLocaleString()}</td>
                  <td className="px-3 py-3 text-[#DC2626] font-semibold">{p.flaggedClaims}</td>
                  <td className="px-3 py-3"><span className={`font-bold ${p.referralScore >= 2 ? 'text-[#DC2626]' : 'text-[#22C55E]'}`}>{p.referralScore.toFixed(1)}</span></td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${riskColor[p.riskLevel]}`}>{p.riskLevel}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
