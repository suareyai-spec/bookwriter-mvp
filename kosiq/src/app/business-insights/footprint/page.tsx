'use client';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import map component (Leaflet requires window)
const FootprintMap = dynamic(() => import('./FootprintMap'), { ssr: false, loading: () => <div className="h-[540px] bg-[#f5f5f7] rounded-xl animate-pulse flex items-center justify-center text-sm text-[#86868b]">Loading map...</div> });

interface Location {
  name: string;
  address: string;
  type: string;
  patients: number;
  lat: number;
  lng: number;
  demographics: {
    population: string;
    medicare: string;
    medicaid: string;
    seniorPct: string;
    latinoPct: string;
    medianAge: string;
    medianIncome: string;
    topConditions: string[];
    avgRiskScore: number;
    pmpm: string;
  };
}

const locations: Location[] = [
  {
    name: 'KOSIQ Primary Care - Coral Gables',
    address: '2100 Ponce De Leon Blvd, Suite 301, Coral Gables, FL 33134',
    type: 'Primary Care', patients: 280, lat: 25.7490, lng: -80.2564,
    demographics: { population: '51,443', medicare: '8,200', medicaid: '4,100', seniorPct: '18.4%', latinoPct: '54.2%', medianAge: '43', medianIncome: '$78,400', topConditions: ['Hypertension', 'Diabetes Type 2', 'Hyperlipidemia', 'Osteoarthritis'], avgRiskScore: 62, pmpm: '$1,420' }
  },
  {
    name: 'KOSIQ Primary Care - Aventura',
    address: '20801 Biscayne Blvd, Suite 403, Aventura, FL 33180',
    type: 'Primary Care', patients: 250, lat: 25.9565, lng: -80.1392,
    demographics: { population: '40,242', medicare: '12,100', medicaid: '2,800', seniorPct: '31.2%', latinoPct: '28.7%', medianAge: '52', medianIncome: '$62,500', topConditions: ['CHF', 'COPD', 'Diabetes Type 2', 'CKD Stage 3'], avgRiskScore: 74, pmpm: '$1,890' }
  },
  {
    name: 'KOSIQ Primary Care - Kendall',
    address: '8950 SW 87th Ave, Suite 200, Miami, FL 33176',
    type: 'Primary Care', patients: 230, lat: 25.6867, lng: -80.3390,
    demographics: { population: '78,912', medicare: '11,400', medicaid: '8,200', seniorPct: '16.8%', latinoPct: '72.1%', medianAge: '39', medianIncome: '$56,200', topConditions: ['Diabetes Type 2', 'Hypertension', 'Obesity', 'Asthma'], avgRiskScore: 58, pmpm: '$1,340' }
  },
  {
    name: 'KOSIQ Primary Care - Hialeah',
    address: '1450 W 49th St, Suite 120, Hialeah, FL 33012',
    type: 'Primary Care', patients: 210, lat: 25.8576, lng: -80.2781,
    demographics: { population: '233,394', medicare: '38,200', medicaid: '42,100', seniorPct: '17.6%', latinoPct: '96.3%', medianAge: '41', medianIncome: '$38,200', topConditions: ['Diabetes Type 2', 'Hypertension', 'Obesity', 'Depression'], avgRiskScore: 67, pmpm: '$1,580' }
  },
  {
    name: 'KOSIQ Primary Care - Doral',
    address: '8200 NW 41st St, Suite 300, Doral, FL 33166',
    type: 'Primary Care', patients: 190, lat: 25.8195, lng: -80.3553,
    demographics: { population: '80,675', medicare: '6,800', medicaid: '5,400', seniorPct: '10.2%', latinoPct: '80.4%', medianAge: '36', medianIncome: '$68,100', topConditions: ['Hypertension', 'Hyperlipidemia', 'Anxiety', 'Diabetes Type 2'], avgRiskScore: 48, pmpm: '$1,180' }
  },
  {
    name: 'KOSIQ Specialty Center - Brickell',
    address: '1221 Brickell Ave, Suite 900, Miami, FL 33131',
    type: 'Specialty', patients: 170, lat: 25.7617, lng: -80.1918,
    demographics: { population: '36,800', medicare: '3,200', medicaid: '2,100', seniorPct: '8.4%', latinoPct: '62.8%', medianAge: '35', medianIncome: '$92,300', topConditions: ['Cardiology referrals', 'Endocrinology', 'Nephrology', 'Pulmonology'], avgRiskScore: 71, pmpm: '$2,240' }
  },
  {
    name: 'KOSIQ Specialty Center - Miami Beach',
    address: '4302 Alton Rd, Suite 420, Miami Beach, FL 33140',
    type: 'Specialty', patients: 160, lat: 25.8149, lng: -80.1415,
    demographics: { population: '82,890', medicare: '14,600', medicaid: '6,200', seniorPct: '19.8%', latinoPct: '48.6%', medianAge: '44', medianIncome: '$55,800', topConditions: ['Cardiology', 'Dermatology', 'Orthopedics', 'Mental Health'], avgRiskScore: 68, pmpm: '$2,080' }
  },
  {
    name: 'KOSIQ Urgent Care - Homestead',
    address: '28505 S Dixie Hwy, Suite 105, Homestead, FL 33033',
    type: 'Urgent Care', patients: 190, lat: 25.4687, lng: -80.4776,
    demographics: { population: '84,750', medicare: '8,900', medicaid: '18,200', seniorPct: '11.2%', latinoPct: '68.4%', medianAge: '32', medianIncome: '$42,100', topConditions: ['ER diversions', 'Acute respiratory', 'Minor injuries', 'Uncontrolled diabetes'], avgRiskScore: 55, pmpm: '$1,260' }
  },
  {
    name: 'KOSIQ Pediatrics - Pembroke Pines',
    address: '501 N Flamingo Rd, Suite 210, Pembroke Pines, FL 33028',
    type: 'Pediatrics', patients: 160, lat: 26.0128, lng: -80.3416,
    demographics: { population: '171,178', medicare: '22,400', medicaid: '14,800', seniorPct: '14.6%', latinoPct: '32.4%', medianAge: '40', medianIncome: '$62,800', topConditions: ['Asthma (pediatric)', 'Well-child visits', 'ADHD', 'Childhood obesity'], avgRiskScore: 32, pmpm: '$680' }
  },
  {
    name: 'KOSIQ Geriatrics - Hollywood',
    address: '3501 Johnson St, Suite 150, Hollywood, FL 33021',
    type: 'Geriatrics', patients: 160, lat: 26.0112, lng: -80.1495,
    demographics: { population: '154,823', medicare: '32,100', medicaid: '12,400', seniorPct: '22.8%', latinoPct: '38.2%', medianAge: '46', medianIncome: '$48,600', topConditions: ['CHF', 'COPD', 'Dementia', 'Falls/Fractures'], avgRiskScore: 78, pmpm: '$2,180' }
  },
];

const countyDemographics = [
  { label: 'Total Population', value: '2,737,725' },
  { label: 'Medicare Population', value: '412,500' },
  { label: 'Medicaid Population', value: '385,200' },
  { label: 'Coverage Rate', value: '89.2%' },
  { label: 'Senior Population (65+)', value: '415,893' },
  { label: 'Median Age', value: '41' },
  { label: 'Median Income', value: '$60,901' },
  { label: 'Latino Population', value: '731,947' },
];

const typeColors: Record<string, string> = {
  'Primary Care': '#0071e3',
  'Specialty': '#7c3aed',
  'Urgent Care': '#ea580c',
  'Pediatrics': '#16a34a',
  'Geriatrics': '#ca8a04',
};

export default function BusinessFootprintPage() {
  const [selected, setSelected] = useState<Location | null>(null);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Business Footprint</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Interactive Map */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1d1d1f]">South Florida Coverage Area</h3>
                <p className="text-xs text-[#86868b]">Click locations to view demographics</p>
              </div>
              <div className="flex gap-3">
                {Object.entries(typeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] text-[#86868b]">{type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[540px]">
              <FootprintMap locations={locations} typeColors={typeColors} onSelect={setSelected} selected={selected} />
            </div>
          </div>

          {/* Sidebar - Location Details or County Demographics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {selected ? (
              <>
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${typeColors[selected.type]}15`, color: typeColors[selected.type] }}>{selected.type}</span>
                    <button onClick={() => setSelected(null)} className="text-[10px] text-[#86868b] hover:text-[#1d1d1f]">Back to overview</button>
                  </div>
                  <h3 className="text-sm font-semibold text-[#1d1d1f] mt-2">{selected.name}</h3>
                  <p className="text-[11px] text-[#86868b] mt-0.5">{selected.address}</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#f5f5f7] rounded-xl p-3">
                      <div className="text-[10px] text-[#86868b]">Active Patients</div>
                      <div className="text-lg font-semibold text-[#1d1d1f]">{selected.patients}</div>
                    </div>
                    <div className="bg-[#f5f5f7] rounded-xl p-3">
                      <div className="text-[10px] text-[#86868b]">Avg Risk Score</div>
                      <div className="text-lg font-semibold" style={{ color: selected.demographics.avgRiskScore >= 70 ? '#dc2626' : selected.demographics.avgRiskScore >= 50 ? '#ea580c' : '#16a34a' }}>{selected.demographics.avgRiskScore}</div>
                    </div>
                    <div className="bg-[#f5f5f7] rounded-xl p-3">
                      <div className="text-[10px] text-[#86868b]">PMPM</div>
                      <div className="text-lg font-semibold text-[#1d1d1f]">{selected.demographics.pmpm}</div>
                    </div>
                    <div className="bg-[#f5f5f7] rounded-xl p-3">
                      <div className="text-[10px] text-[#86868b]">Area Population</div>
                      <div className="text-lg font-semibold text-[#1d1d1f]">{selected.demographics.population}</div>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-[#1d1d1f] mb-2">Area Demographics</h4>
                  <div className="space-y-2 mb-4">
                    {[
                      { label: 'Medicare', value: selected.demographics.medicare },
                      { label: 'Medicaid', value: selected.demographics.medicaid },
                      { label: 'Senior %', value: selected.demographics.seniorPct },
                      { label: 'Latino %', value: selected.demographics.latinoPct },
                      { label: 'Median Age', value: selected.demographics.medianAge },
                      { label: 'Median Income', value: selected.demographics.medianIncome },
                    ].map((d, i) => (
                      <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-[11px] text-[#6e6e73]">{d.label}</span>
                        <span className="text-[11px] font-semibold text-[#1d1d1f]">{d.value}</span>
                      </div>
                    ))}
                  </div>

                  <h4 className="text-xs font-semibold text-[#1d1d1f] mb-2">Top Conditions</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.demographics.topConditions.map((c, i) => (
                      <span key={i} className="px-2 py-1 bg-[#f5f5f7] rounded-lg text-[10px] text-[#6e6e73]">{c}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-[#1d1d1f]">County Overview</h3>
                  <p className="text-xs text-[#86868b]">Miami-Dade County, FL</p>
                </div>
                <div className="p-4 space-y-3">
                  {countyDemographics.map((d, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-xs text-[#6e6e73]">{d.label}</span>
                      <span className="text-xs font-semibold text-[#1d1d1f]">{d.value}</span>
                    </div>
                  ))}
                  <div className="pt-3">
                    <h4 className="text-xs font-semibold text-[#1d1d1f] mb-3">Locations by Type</h4>
                    {Object.entries(typeColors).map(([type, color]) => {
                      const count = locations.filter(l => l.type === type).length;
                      const totalPatients = locations.filter(l => l.type === type).reduce((s, l) => s + l.patients, 0);
                      return (
                        <div key={type} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs text-[#6e6e73]">{type}</span>
                          </div>
                          <span className="text-xs font-semibold text-[#1d1d1f]">{count} locations / {totalPatients} patients</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Locations Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Practice Locations</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Location', 'Address', 'Type', 'Patients', 'Avg Risk', 'PMPM'].map(h => (
                <th key={h} className="text-left py-3 px-3 text-xs font-medium text-[#86868b] uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>{locations.map((l, i) => (
              <tr key={i} className={`border-b border-gray-50 hover:bg-[#f5f5f7]/50 cursor-pointer transition-colors ${selected?.name === l.name ? 'bg-blue-50/50' : ''}`} onClick={() => setSelected(l)}>
                <td className="py-2.5 px-3 font-medium text-[#1d1d1f]">{l.name}</td>
                <td className="py-2.5 px-3 text-xs text-[#86868b]">{l.address}</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${typeColors[l.type]}15`, color: typeColors[l.type] }}>{l.type}</span></td>
                <td className="py-2.5 px-3 font-medium">{l.patients}</td>
                <td className="py-2.5 px-3"><span className={`font-medium ${l.demographics.avgRiskScore >= 70 ? 'text-red-600' : l.demographics.avgRiskScore >= 50 ? 'text-orange-600' : 'text-green-600'}`}>{l.demographics.avgRiskScore}</span></td>
                <td className="py-2.5 px-3 font-medium">{l.demographics.pmpm}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
