'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';

export default function ChartIQHandoffPage() {
  const [handoff, setHandoff] = useState<{ handoff: string; generatedAt: string; patientCount: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState('');

  const generate = async () => {
    setLoading(true);
    const params = department ? `?department=${department}` : '';
    const res = await fetch(`/api/chartiq/handoff${params}`);
    setHandoff(await res.json());
    setLoading(false);
  };

  return (
    <DashboardLayout>
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#1d1d1f]">Shift Handoff</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none">
              <option value="">All Departments</option>
              {['ICU', 'Med-Surg', 'Cardiac', 'Neuro', 'Oncology', 'Orthopedics'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={loading}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 disabled:opacity-50">
            {loading ? 'Generating SBAR Handoff...' : '🔄 Generate Handoff Report'}
          </button>
          {handoff && (
            <button onClick={() => window.print()}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              🖨️ Print
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl p-12 shadow-sm flex items-center justify-center gap-3 text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" />
          <span>AI is generating SBAR handoff summaries for all patients...</span>
        </div>
      )}

      {handoff?.handoff && (
        <div className="bg-white rounded-xl p-6 shadow-sm print:shadow-none">
          <div className="flex items-center justify-between mb-4 print:mb-2">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">SBAR Handoff Report — {handoff.patientCount} Patients</h2>
            <span className="text-xs text-gray-400">Generated: {new Date(handoff.generatedAt).toLocaleString()}</span>
          </div>
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{
              __html: handoff.handoff
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/⚠️(.*?)(<br>|$)/g, '<span class="text-red-600 font-bold">⚠️$1</span>$2')
            }} />
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}