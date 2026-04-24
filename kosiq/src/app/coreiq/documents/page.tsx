'use client';
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';

const ACCENT = '#059669';
const TABS = ['All Documents', 'Fax Inbox', 'Fax Outbox', 'Patient Documents', 'Transcriptions', 'Scanned Documents', 'Lab Results', 'Referrals'];
const TAB_TYPE_MAP: Record<string, string | null> = {
  'All Documents': null, 'Fax Inbox': 'fax-in', 'Fax Outbox': 'fax-out',
  'Patient Documents': 'patient-doc', 'Transcriptions': 'transcription',
  'Scanned Documents': 'scanned', 'Lab Results': 'lab-result', 'Referrals': 'referral',
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700', reviewed: 'bg-blue-50 text-blue-700', signed: 'bg-emerald-50 text-emerald-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

function TypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    'fax-in': '📠', 'fax-out': '📤', 'patient-doc': '📋', transcription: '🎙️', scanned: '🖨️', 'lab-result': '🧪', referral: '🔗',
  };
  return <span className="text-sm">{icons[type] || '📄'}</span>;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All Documents');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/coreiq/documents').then(r => r.json()).then(setDocs);
  }, []);

  const providers = useMemo(() => [...new Set(docs.map(d => d.provider).filter(Boolean))], [docs]);

  const filtered = useMemo(() => {
    return docs.filter(d => {
      const typeFilter = TAB_TYPE_MAP[activeTab];
      if (typeFilter && d.type !== typeFilter) return false;
      if (filterStatus && d.status !== filterStatus) return false;
      if (filterProvider && d.provider !== filterProvider) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!d.title.toLowerCase().includes(q) && !(d.patientName || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [docs, activeTab, search, filterStatus, filterProvider]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
            <p className="text-sm text-[#86868b] mt-1">{docs.length} documents</p>
          </div>
          <button onClick={() => setShowUpload(true)} className="px-4 py-2 text-sm text-white rounded-xl" style={{ backgroundColor: ACCENT }}>
            + Upload Document
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`} style={activeTab === tab ? { backgroundColor: ACCENT } : {}}>
              {tab}
              <span className="ml-1 opacity-70">
                {docs.filter(d => { const t = TAB_TYPE_MAP[tab]; return t ? d.type === t : true; }).length}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 max-w-xs px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="signed">Signed</option>
          </select>
          <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
            <option value="">All Providers</option>
            {providers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Split view */}
        <div className="flex gap-4">
          {/* Document list */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f5f5f7]">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Title</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Patient</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Provider</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#86868b]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map(d => (
                  <tr key={d.id} onClick={() => setSelected(d)} className={`border-b border-gray-50 hover:bg-emerald-50/30 cursor-pointer transition-colors ${selected?.id === d.id ? 'bg-emerald-50/50' : ''}`}>
                    <td className="px-4 py-2.5"><TypeIcon type={d.type} /></td>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-900 max-w-[200px] truncate">{d.title}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{d.patientName || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{d.provider || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Preview panel */}
          {selected && (
            <div className="w-96 bg-white rounded-xl border border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">{selected.title}</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-[#86868b]">Type</span><span className="text-gray-900 capitalize">{selected.type.replace('-', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-[#86868b]">Patient</span><span className="text-gray-900">{selected.patientName || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#86868b]">Provider</span><span className="text-gray-900">{selected.provider || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#86868b]">Source</span><span className="text-gray-900">{selected.source || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#86868b]">Status</span><StatusBadge status={selected.status} /></div>
                <div className="flex justify-between"><span className="text-[#86868b]">Date</span><span className="text-gray-900">{new Date(selected.createdAt).toLocaleString()}</span></div>
              </div>
              <div className="mt-4 p-3 bg-[#f5f5f7] rounded-lg text-xs text-gray-600 max-h-48 overflow-y-auto">
                {selected.content || 'No content available'}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => showToast('Document marked as reviewed', 'success')} className="flex-1 px-3 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: ACCENT }}>Mark Reviewed</button>
                <button onClick={() => showToast('Document signed', 'success')} className="flex-1 px-3 py-1.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100">Sign</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Document">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#86868b] mb-1 block">Document Type</label>
            <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
              <option>Fax Inbound</option><option>Patient Document</option><option>Scanned Document</option><option>Lab Result</option><option>Referral</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#86868b] mb-1 block">Title</label>
            <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Document title" />
          </div>
          <div>
            <label className="text-xs text-[#86868b] mb-1 block">Patient (optional)</label>
            <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Search patient..." />
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <p className="text-sm text-[#86868b]">Drag and drop files here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PDF, TIFF, JPG, PNG up to 25MB</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowUpload(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={() => { showToast('Document uploaded', 'success'); setShowUpload(false); }} className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: ACCENT }}>Upload</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
