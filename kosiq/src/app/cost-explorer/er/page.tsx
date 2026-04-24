'use client';
import DashboardLayout from '@/components/DashboardLayout';

const erCategories = [
  { cat: 'Primary Care Treatable', visits: 456, cost: '$1.8M', preventable: true },
  { cat: 'Chronic Disease Related', visits: 389, cost: '$2.3M', preventable: true },
  { cat: 'Mental Health Crisis', visits: 189, cost: '$945K', preventable: true },
  { cat: 'Trauma', visits: 123, cost: '$1.5M', preventable: false },
  { cat: 'Other', visits: 77, cost: '$462K', preventable: false },
];

export default function ERPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Preventable ER Analysis</h1>
        <p className="text-sm text-[#86868b] mb-8">ER visit patterns & avoidable costs</p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ label: 'Total ER Visits', value: '1,234' }, { label: 'Preventable', value: '1,034 (83.8%)' }, { label: 'Avoidable Cost', value: '$5.1M' }].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-[#86868b] text-xs mb-1">{m.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{m.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {erCategories.map(e => (
            <div key={e.cat} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              <span className={`w-2 h-2 rounded-full ${e.preventable ? 'bg-red-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-[#1d1d1f] flex-1">{e.cat}</span>
              <span className="text-sm text-[#EF4444] font-medium">{e.visits} visits</span>
              <span className="text-sm text-[#1d1d1f] font-medium w-20 text-right">{e.cost}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
