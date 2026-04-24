'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';

const patients = [
  { name: 'John Adams', id: 'KSQ-01234', address: '4521 Palm Beach Blvd, Fort Myers, FL 33905', distance: '142 mi', payer: 'Simply Health', pcp: 'Dr. Martinez', riskScore: 72 },
  { name: 'Mary Thompson', id: 'KSQ-00987', address: '1820 Main St, Sarasota, FL 34236', distance: '228 mi', payer: 'Sunshine Health', pcp: 'Dr. Patel', riskScore: 65 },
  { name: 'David Wilson', id: 'KSQ-01456', address: '305 Clematis St, West Palm Beach, FL 33401', distance: '72 mi', payer: 'Humana', pcp: 'Dr. Nguyen', riskScore: 58 },
  { name: 'Susan Harris', id: 'KSQ-00765', address: '2200 Colonial Blvd, Fort Lauderdale, FL 33301', distance: '32 mi', payer: 'Simply Health', pcp: 'Dr. Rodriguez', riskScore: 81 },
  { name: 'James Clark', id: 'KSQ-01089', address: '450 S Orange Ave, Orlando, FL 32801', distance: '235 mi', payer: 'Florida Blue', pcp: 'Dr. Kim', riskScore: 44 },
  { name: 'Patricia Moore', id: 'KSQ-01567', address: '789 Okeechobee Blvd, West Palm Beach, FL 33401', distance: '70 mi', payer: 'Humana', pcp: 'Dr. Patel', riskScore: 69 },
  { name: 'Robert Garcia', id: 'KSQ-01623', address: '1100 N Federal Hwy, Boca Raton, FL 33432', distance: '48 mi', payer: 'Aetna Better Health', pcp: 'Dr. Martinez', riskScore: 55 },
  { name: 'Linda Martinez', id: 'KSQ-01701', address: '3400 Tamiami Trail, Naples, FL 34103', distance: '126 mi', payer: 'Simply Health', pcp: 'Dr. Williams', riskScore: 77 },
  { name: 'Michael Brown', id: 'KSQ-01789', address: '901 SE 17th St, Fort Lauderdale, FL 33316', distance: '29 mi', payer: 'Sunshine Health', pcp: 'Dr. Rodriguez', riskScore: 62 },
  { name: 'Barbara Anderson', id: 'KSQ-01834', address: '2500 N Military Trail, West Palm Beach, FL 33409', distance: '68 mi', payer: 'Humana', pcp: 'Dr. Nguyen', riskScore: 84 },
  { name: 'William Taylor', id: 'KSQ-01901', address: '550 S Rosemary Ave, West Palm Beach, FL 33401', distance: '71 mi', payer: 'WellCare', pcp: 'Dr. Chen', riskScore: 46 },
  { name: 'Elizabeth Thomas', id: 'KSQ-01945', address: '1600 SE 3rd Ave, Fort Lauderdale, FL 33316', distance: '31 mi', payer: 'Simply Health', pcp: 'Dr. Martinez', riskScore: 73 },
  { name: 'Richard Jackson', id: 'KSQ-02011', address: '4600 PGA Blvd, Palm Beach Gardens, FL 33418', distance: '82 mi', payer: 'Molina', pcp: 'Dr. Patel', riskScore: 51 },
  { name: 'Jennifer White', id: 'KSQ-02078', address: '100 Sylvania Pl, South Daytona, FL 32119', distance: '262 mi', payer: 'Sunshine Health', pcp: 'Dr. Kim', riskScore: 39 },
  { name: 'Charles Lee', id: 'KSQ-02134', address: '201 SE 2nd Ave, Gainesville, FL 32601', distance: '331 mi', payer: 'Florida Blue', pcp: 'Dr. Williams', riskScore: 42 },
  { name: 'Maria Hernandez', id: 'KSQ-02201', address: '720 Goodlette Rd N, Naples, FL 34102', distance: '128 mi', payer: 'Simply Health', pcp: 'Dr. Rodriguez', riskScore: 88 },
  { name: 'Joseph Robinson', id: 'KSQ-02267', address: '3501 Health Center Blvd, Bonita Springs, FL 34135', distance: '138 mi', payer: 'Humana', pcp: 'Dr. Nguyen', riskScore: 66 },
  { name: 'Margaret Walker', id: 'KSQ-02334', address: '800 Meadows Rd, Boca Raton, FL 33486', distance: '45 mi', payer: 'Aetna Better Health', pcp: 'Dr. Chen', riskScore: 71 },
  { name: 'Thomas Hall', id: 'KSQ-02401', address: '1200 S Pine Island Rd, Plantation, FL 33324', distance: '22 mi', payer: 'WellCare', pcp: 'Dr. Martinez', riskScore: 53 },
  { name: 'Dorothy Allen', id: 'KSQ-02456', address: '5601 Overseas Hwy, Marathon, FL 33050', distance: '113 mi', payer: 'Simply Health', pcp: 'Dr. Patel', riskScore: 79 },
  { name: 'Daniel Young', id: 'KSQ-02523', address: '2901 SW 149th Ave, Miramar, FL 33027', distance: '18 mi', payer: 'Sunshine Health', pcp: 'Dr. Rodriguez', riskScore: 47 },
  { name: 'Frances King', id: 'KSQ-02589', address: '1400 Centrepark Blvd, West Palm Beach, FL 33401', distance: '69 mi', payer: 'Humana', pcp: 'Dr. Kim', riskScore: 82 },
  { name: 'Paul Wright', id: 'KSQ-02645', address: '3000 N Ocean Blvd, Fort Lauderdale, FL 33308', distance: '33 mi', payer: 'Molina', pcp: 'Dr. Williams', riskScore: 56 },
  { name: 'Ruth Lopez', id: 'KSQ-02712', address: '9400 Gladiolus Dr, Fort Myers, FL 33908', distance: '139 mi', payer: 'Simply Health', pcp: 'Dr. Chen', riskScore: 74 },
  { name: 'Mark Hill', id: 'KSQ-02778', address: '1515 N Flagler Dr, West Palm Beach, FL 33401', distance: '70 mi', payer: 'Florida Blue', pcp: 'Dr. Martinez', riskScore: 63 },
  { name: 'Betty Scott', id: 'KSQ-02834', address: '400 Fairway Dr, Deerfield Beach, FL 33441', distance: '38 mi', payer: 'WellCare', pcp: 'Dr. Patel', riskScore: 68 },
  { name: 'Donald Green', id: 'KSQ-02901', address: '200 E Las Olas Blvd, Fort Lauderdale, FL 33301', distance: '30 mi', payer: 'Sunshine Health', pcp: 'Dr. Nguyen', riskScore: 59 },
  { name: 'Helen Baker', id: 'KSQ-02967', address: '3333 Hypoluxo Rd, Lake Worth, FL 33462', distance: '58 mi', payer: 'Humana', pcp: 'Dr. Rodriguez', riskScore: 85 },
  { name: 'Steven Gonzalez', id: 'KSQ-03034', address: '1701 SE Hillmoor Dr, Port St. Lucie, FL 34952', distance: '108 mi', payer: 'Simply Health', pcp: 'Dr. Kim', riskScore: 41 },
  { name: 'Sandra Nelson', id: 'KSQ-03101', address: '4443 SE Federal Hwy, Stuart, FL 34997', distance: '98 mi', payer: 'Aetna Better Health', pcp: 'Dr. Williams', riskScore: 76 },
  { name: 'Kenneth Carter', id: 'KSQ-03167', address: '801 N Atlantic Ave, Cocoa Beach, FL 32931', distance: '205 mi', payer: 'Florida Blue', pcp: 'Dr. Chen', riskScore: 38 },
  { name: 'Donna Mitchell', id: 'KSQ-03234', address: '2100 SW 27th Ave, Ocala, FL 34471', distance: '295 mi', payer: 'WellCare', pcp: 'Dr. Martinez', riskScore: 52 },
  { name: 'Edward Perez', id: 'KSQ-03301', address: '4820 US-1, Vero Beach, FL 32967', distance: '132 mi', payer: 'Simply Health', pcp: 'Dr. Patel', riskScore: 70 },
  { name: 'Carol Roberts', id: 'KSQ-03367', address: '500 S Australian Ave, West Palm Beach, FL 33401', distance: '71 mi', payer: 'Molina', pcp: 'Dr. Nguyen', riskScore: 64 },
  { name: 'George Turner', id: 'KSQ-03434', address: '150 W Flagler St, Key West, FL 33040', distance: '159 mi', payer: 'Sunshine Health', pcp: 'Dr. Rodriguez', riskScore: 87 },
  { name: 'Sharon Phillips', id: 'KSQ-03501', address: '2820 Sharer Rd, Tallahassee, FL 32312', distance: '476 mi', payer: 'Florida Blue', pcp: 'Dr. Kim', riskScore: 43 },
  { name: 'Ronald Campbell', id: 'KSQ-03567', address: '11000 University Pkwy, Pensacola, FL 32514', distance: '688 mi', payer: 'Simply Health', pcp: 'Dr. Williams', riskScore: 61 },
  { name: 'Deborah Parker', id: 'KSQ-03634', address: '1850 Boy Scout Dr, Fort Myers, FL 33907', distance: '140 mi', payer: 'Humana', pcp: 'Dr. Chen', riskScore: 75 },
];

export default function OutsideServiceAreaPage() {
  const [sortBy, setSortBy] = useState<'distance' | 'riskScore' | 'name'>('distance');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.payer.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'distance') cmp = parseInt(a.distance) - parseInt(b.distance);
    else if (sortBy === 'riskScore') cmp = a.riskScore - b.riskScore;
    else cmp = a.name.localeCompare(b.name);
    return sortDir === 'desc' ? -cmp : cmp;
  });

  function toggleSort(col: 'distance' | 'riskScore' | 'name') {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  }

  const highRisk = patients.filter(p => p.riskScore >= 70).length;
  const avgDistance = Math.round(patients.reduce((s, p) => s + parseInt(p.distance), 0) / patients.length);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Patients Outside Service Area</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-[#86868b] uppercase">Total Outside Area</p>
            <p className="text-2xl font-semibold text-[#ff3b30] mt-1">{patients.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-[#86868b] uppercase">High Risk (70+)</p>
            <p className="text-2xl font-semibold text-[#ff9500] mt-1">{highRisk}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-[#86868b] uppercase">Avg Distance</p>
            <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{avgDistance} mi</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-[#86868b] uppercase">Top Payer</p>
            <p className="text-2xl font-semibold text-[#0071e3] mt-1">Simply Health</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1d1d1f]">All Patients ({sorted.length})</h3>
            <input
              type="text"
              placeholder="Search by name, ID, payer, or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase cursor-pointer hover:text-[#1d1d1f]" onClick={() => toggleSort('name')}>Patient {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">ID</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">Address</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase cursor-pointer hover:text-[#1d1d1f]" onClick={() => toggleSort('distance')}>Distance {sortBy === 'distance' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">Payer</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">PCP</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase cursor-pointer hover:text-[#1d1d1f]" onClick={() => toggleSort('riskScore')}>Risk {sortBy === 'riskScore' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
            </tr></thead>
            <tbody>{sorted.map((p, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-[#f5f5f7]/50">
                <td className="py-2.5 px-3 font-medium text-[#1d1d1f]">{p.name}</td>
                <td className="py-2.5 px-3 text-xs text-[#86868b] font-mono">{p.id}</td>
                <td className="py-2.5 px-3 text-xs text-[#6e6e73]">{p.address}</td>
                <td className="py-2.5 px-3 font-medium text-[#ff3b30]">{p.distance}</td>
                <td className="py-2.5 px-3 text-xs">{p.payer}</td>
                <td className="py-2.5 px-3 text-xs text-[#6e6e73]">{p.pcp}</td>
                <td className="py-2.5 px-3">
                  <span className={`font-medium ${p.riskScore >= 70 ? 'text-[#ff3b30]' : p.riskScore >= 50 ? 'text-[#ff9500]' : 'text-[#34c759]'}`}>{p.riskScore}</span>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
