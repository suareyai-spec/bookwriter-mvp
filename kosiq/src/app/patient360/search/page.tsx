'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function Patient360SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/coreiq/patients?search=${encodeURIComponent(query)}&limit=20`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : data.data || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Patient 360°</h1>
          <p className="text-sm text-[#86868b] mt-2">Search for a patient to see their complete cross-product profile</p>
        </div>

        <div className="flex gap-3 mb-8">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search by name, MRN, or ID..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#0071e3]/30"
          />
          <button onClick={search} disabled={loading} className="px-6 py-3 rounded-xl bg-[#0071e3] text-white text-sm font-medium disabled:opacity-50">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {results.map((p: any) => (
              <button
                key={p.id}
                onClick={() => router.push(`/patient360/${p.id}`)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#f5f5f7] transition-colors text-left border-b border-gray-50 last:border-0"
              >
                <div className="w-10 h-10 rounded-xl bg-[#059669] flex items-center justify-center text-white text-sm font-bold">
                  {p.firstName?.[0]}{p.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1d1d1f]">{p.lastName}, {p.firstName}</p>
                  <p className="text-xs text-[#86868b]">MRN: {p.mrn} · {p.gender} · DOB: {new Date(p.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <span className="text-xs text-[#0071e3] font-medium">View 360° →</span>
              </button>
            ))}
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm text-[#86868b]">No patients found matching &quot;{query}&quot;</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
