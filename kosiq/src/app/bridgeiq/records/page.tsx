'use client';
import DashboardLayout from '@/components/DashboardLayout';

const importBatches = [
  { id: 'IMP-2847', source: 'Baptist Health', type: 'ADT Feed', records: 1245, status: 'Complete', date: '2026-03-01 14:00', errors: 0, duration: '2m 14s' },
  { id: 'IMP-2846', source: 'Memorial Regional', type: 'Lab Results', records: 892, status: 'Complete', date: '2026-03-01 12:00', errors: 3, duration: '1m 48s' },
  { id: 'IMP-2845', source: 'Quest Diagnostics', type: 'Lab Results', records: 2103, status: 'Complete', date: '2026-03-01 10:00', errors: 0, duration: '3m 22s' },
  { id: 'IMP-2844', source: 'CVS/Caremark', type: 'Rx Claims', records: 3847, status: 'Complete', date: '2026-03-01 08:00', errors: 12, duration: '5m 07s' },
  { id: 'IMP-2843', source: 'Simply Health', type: 'Claims Data', records: 15230, status: 'Complete', date: '2026-03-01 06:00', errors: 47, duration: '12m 33s' },
  { id: 'IMP-2842', source: 'Humana', type: 'Claims Data', records: 12890, status: 'Complete', date: '2026-03-01 06:00', errors: 31, duration: '10m 18s' },
  { id: 'IMP-2841', source: 'Apple Health', type: 'Wearable Vitals', records: 8456, status: 'Complete', date: '2026-03-01 04:00', errors: 0, duration: '4m 55s' },
  { id: 'IMP-2840', source: 'LabCorp', type: 'Lab Results', records: 1567, status: 'Failed', date: '2026-02-28 22:00', errors: 1567, duration: '0m 12s' },
];

const sourceStats = [
  { name: 'Baptist Health', today: 4521, week: 28340, format: 'HL7 v2.5', lastSync: '14 min ago' },
  { name: 'Memorial Regional', today: 3210, week: 21450, format: 'FHIR R4', lastSync: '22 min ago' },
  { name: 'Quest Diagnostics', today: 6720, week: 42100, format: 'HL7 v2.5', lastSync: '8 min ago' },
  { name: 'CVS/Caremark', today: 8930, week: 56200, format: 'NCPDP D.0', lastSync: '32 min ago' },
  { name: 'Simply Health', today: 15230, week: 98400, format: '837/835', lastSync: '4h ago' },
  { name: 'Humana', today: 12890, week: 84300, format: '837/835', lastSync: '4h ago' },
  { name: 'Apple Health', today: 24500, week: 171500, format: 'FHIR R4', lastSync: '1h ago' },
  { name: 'LabCorp', today: 0, week: 9800, format: 'HL7 v2.5', lastSync: 'Error' },
];

export default function RecordsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Record Import</h1>
        <p className="text-sm text-[#86868b] mb-8">Track and manage data ingestion from all connected sources</p>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { l: 'Records Today', v: '76,001', c: 'text-[#3B82F6]' },
            { l: 'Import Batches', v: '24', c: 'text-[#1d1d1f]' },
            { l: 'Error Rate', v: '0.12%', c: 'text-green-600' },
            { l: 'Failed Imports', v: '1', c: 'text-red-600' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-[#86868b] text-xs mb-1">{m.l}</p>
              <p className={`text-2xl font-semibold ${m.c}`}>{m.v}</p>
            </div>
          ))}
        </div>

        {/* Import Batches */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Recent Import Batches</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-[#86868b] text-xs border-b border-gray-100">
              <th className="text-left pb-3 font-medium">Batch ID</th>
              <th className="text-left pb-3 font-medium">Source</th>
              <th className="text-left pb-3 font-medium">Type</th>
              <th className="text-right pb-3 font-medium">Records</th>
              <th className="text-right pb-3 font-medium">Errors</th>
              <th className="text-left pb-3 font-medium">Duration</th>
              <th className="text-left pb-3 font-medium">Status</th>
              <th className="text-left pb-3 font-medium">Date</th>
            </tr></thead>
            <tbody>
              {importBatches.map(b => (
                <tr key={b.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 font-mono text-xs text-[#3B82F6]">{b.id}</td>
                  <td className="py-3 text-[#1d1d1f]">{b.source}</td>
                  <td className="py-3 text-[#86868b]">{b.type}</td>
                  <td className="py-3 text-right text-[#1d1d1f]">{b.records.toLocaleString()}</td>
                  <td className={`py-3 text-right ${b.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>{b.errors}</td>
                  <td className="py-3 text-[#86868b]">{b.duration}</td>
                  <td className="py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${b.status === 'Complete' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{b.status}</span>
                  </td>
                  <td className="py-3 text-[#86868b] text-xs">{b.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Source Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Source Throughput</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-[#86868b] text-xs border-b border-gray-100">
              <th className="text-left pb-3 font-medium">Source</th>
              <th className="text-right pb-3 font-medium">Today</th>
              <th className="text-right pb-3 font-medium">This Week</th>
              <th className="text-left pb-3 font-medium">Format</th>
              <th className="text-left pb-3 font-medium">Last Sync</th>
            </tr></thead>
            <tbody>
              {sourceStats.map(s => (
                <tr key={s.name} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 text-[#1d1d1f] font-medium">{s.name}</td>
                  <td className="py-3 text-right text-[#1d1d1f]">{s.today.toLocaleString()}</td>
                  <td className="py-3 text-right text-[#86868b]">{s.week.toLocaleString()}</td>
                  <td className="py-3 text-xs font-mono text-[#86868b]">{s.format}</td>
                  <td className={`py-3 text-xs ${s.lastSync === 'Error' ? 'text-red-600 font-medium' : 'text-[#86868b]'}`}>{s.lastSync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
