'use client';
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';

const ACCENT = '#059669';

const CATEGORIES = [
  'All', 'Core Visit', 'Preventive Care', 'Chronic Disease', 'Acute Condition',
  'Mental Health Screening', 'Developmental Screening', 'Preventive Screening',
  'Continuity of Care', 'Vaccination', 'Specialty', 'Value-Based Care',
  'Telemedicine', 'Procedure', 'SDOH', 'Administrative',
];

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    encounter: 'bg-emerald-50 text-emerald-700',
    screening: 'bg-blue-50 text-blue-700',
    procedure: 'bg-purple-50 text-purple-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-600'}`}>{type}</span>;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [preview, setPreview] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/coreiq/templates').then(r => r.json()).then(setTemplates);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: templates.length };
    templates.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, [templates]);

  const filtered = useMemo(() => {
    return templates.filter(t => {
      if (activeCategory !== 'All' && t.category !== activeCategory) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase()) && !(t.subcategory || '').toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [templates, activeCategory, search]);

  const sections = preview ? JSON.parse(preview.sections) : [];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Note Templates</h1>
          <p className="text-sm text-[#86868b] mt-1">{templates.length} templates across {CATEGORIES.length - 1} categories</p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === cat ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} style={activeCategory === cat ? { backgroundColor: ACCENT } : {}}>
              {cat} <span className="ml-1 opacity-70">{categoryCounts[cat] || 0}</span>
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(t => (
            <div key={t.id} onClick={() => setPreview(t)} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight">{t.name}</h3>
                <TypeBadge type={t.type} />
              </div>
              <p className="text-xs text-[#86868b] mb-2">{t.category}{t.subcategory ? ` · ${t.subcategory}` : ''}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {JSON.parse(t.sections).length} sections
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#86868b]">
            <p className="text-lg">No templates found</p>
            <p className="text-sm mt-1">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.name || ''} width="max-w-3xl">
        {preview && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TypeBadge type={preview.type} />
              <span className="text-xs text-[#86868b]">{preview.category}{preview.subcategory ? ` · ${preview.subcategory}` : ''}</span>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {sections.map((section: any, si: number) => (
                <div key={si} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: ACCENT }}>{si + 1}</span>
                    {section.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {section.fields.map((field: any, fi: number) => (
                      <div key={fi} className="text-xs">
                        <label className="text-[#86868b] block mb-0.5">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <div className="w-full h-12 bg-gray-50 rounded border border-gray-200" />
                        ) : field.type === 'select' ? (
                          <select className="w-full px-2 py-1 bg-gray-50 rounded border border-gray-200 text-xs" disabled>
                            <option>{field.options?.[0] || 'Select...'}</option>
                          </select>
                        ) : field.type === 'checkbox' ? (
                          <div className="flex items-center gap-1"><input type="checkbox" disabled className="rounded" /><span className="text-gray-500 text-xs">{field.label}</span></div>
                        ) : (
                          <div className="w-full h-7 bg-gray-50 rounded border border-gray-200 px-2 flex items-center text-gray-400">{field.placeholder || ''}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setPreview(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Close</button>
              <button onClick={() => { showToast('Template loaded into new encounter', 'success'); setPreview(null); }} className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: ACCENT }}>Use Template</button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
