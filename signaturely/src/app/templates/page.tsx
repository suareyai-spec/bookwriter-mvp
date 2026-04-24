'use client';

import Link from 'next/link';
import { TEMPLATES, SignatureData } from '@/lib/types';
import { generateSignatureHtml } from '@/lib/generateSignatureHtml';
import { useState, useMemo } from 'react';

const categories = ['all', 'professional', 'creative', 'business'];

const sampleDataForTemplate = (templateId: string): SignatureData => {
  const samples: Record<string, Partial<SignatureData['personal']> & { colors: [string, string]; tagline?: string; cta?: string }> = {
    classic: { fullName: 'Sarah Mitchell', jobTitle: 'Marketing Director', company: 'Elevate Agency', email: 'sarah@elevate.co', phone: '+1 (305) 555-0142', website: 'https://elevate.co', colors: ['#2563eb', '#3b82f6'] },
    modern: { fullName: 'James Chen', jobTitle: 'Product Designer', company: 'Pixel Studio', email: 'james@pixelstudio.io', phone: '+1 (415) 555-0198', website: 'https://pixelstudio.io', colors: ['#0f172a', '#334155'] },
    bold: { fullName: 'Maria Rodriguez', jobTitle: 'CEO & Founder', company: 'Futura Labs', email: 'maria@futuralabs.com', phone: '+1 (212) 555-0167', website: 'https://futuralabs.com', colors: ['#7c3aed', '#a855f7'], tagline: 'Building the future, one product at a time' },
    elegant: { fullName: 'Dr. Elizabeth Ward', jobTitle: 'Senior Partner', company: 'Ward & Associates', email: 'e.ward@wardlaw.com', phone: '+1 (617) 555-0183', website: 'https://wardlaw.com', colors: ['#78350f', '#92400e'] },
    compact: { fullName: 'Alex Kim', jobTitle: 'Full Stack Developer', company: 'DevStack', email: 'alex@devstack.dev', phone: '+1 (650) 555-0129', colors: ['#059669', '#10b981'] },
    creative: { fullName: 'Luna Torres', jobTitle: 'Creative Director', company: 'Chromatic Studio', email: 'luna@chromatic.design', phone: '+1 (323) 555-0156', website: 'https://chromatic.design', colors: ['#e11d48', '#f43f5e'], tagline: 'Where color meets purpose' },
    corporate: { fullName: 'Robert Anderson', jobTitle: 'Vice President, Operations', company: 'Meridian Group', department: 'Global Operations', email: 'r.anderson@meridiangroup.com', phone: '+1 (202) 555-0171', website: 'https://meridiangroup.com', colors: ['#1e3a5f', '#2563eb'] },
    startup: { fullName: 'Priya Sharma', jobTitle: 'Co-Founder & CTO', company: 'NovaByte', email: 'priya@novabyte.io', phone: '+1 (512) 555-0194', website: 'https://novabyte.io', colors: ['#6366f1', '#8b5cf6'], cta: 'Book a Demo' },
    legal: { fullName: 'Thomas J. Blackwell, Esq.', jobTitle: 'Partner, Litigation', company: 'Blackwell & Crane LLP', email: 'tjb@blackwellcrane.com', phone: '+1 (312) 555-0148', website: 'https://blackwellcrane.com', colors: ['#1e293b', '#475569'] },
    realestate: { fullName: 'Jennifer Santos', jobTitle: 'Luxury Real Estate Specialist', company: 'Coastal Premier Properties', email: 'jennifer@coastalpremier.com', phone: '+1 (858) 555-0163', mobile: '+1 (858) 555-0177', website: 'https://coastalpremier.com', colors: ['#b45309', '#d97706'], cta: 'View My Listings' },
    medical: { fullName: 'Dr. Michael Park, MD, FACP', jobTitle: 'Internal Medicine', company: 'Bay Area Medical Group', email: 'dr.park@bayareamedical.org', phone: '+1 (408) 555-0136', website: 'https://bayareamedical.org', colors: ['#0d9488', '#14b8a6'] },
    minimal: { fullName: 'Kate Williams', jobTitle: 'Freelance Writer', email: 'kate@katewrites.com', website: 'https://katewrites.com', colors: ['#374151', '#6b7280'] },
  };

  const s = samples[templateId] || samples.classic;

  return {
    personal: {
      fullName: s.fullName || 'John Doe',
      jobTitle: s.jobTitle || 'Professional',
      company: s.company || 'Company',
      department: s.department || '',
      email: s.email || 'john@example.com',
      phone: s.phone || '',
      mobile: s.mobile || '',
      website: s.website || '',
      address: '',
    },
    images: {
      photo: '',
      logo: '',
      photoShape: 'circle',
      photoSize: 60,
      logoSize: 80,
    },
    social: [
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
      ...(templateId === 'creative' ? [{ platform: 'instagram', url: 'https://instagram.com' }, { platform: 'dribbble', url: 'https://dribbble.com' }] : []),
      ...(templateId === 'startup' ? [{ platform: 'github', url: 'https://github.com' }] : []),
      ...(templateId === 'realestate' ? [{ platform: 'instagram', url: 'https://instagram.com' }, { platform: 'facebook', url: 'https://facebook.com' }] : []),
    ],
    design: {
      template: templateId,
      primaryColor: s.colors[0],
      secondaryColor: s.colors[1],
      textColor: '#1f2937',
      fontFamily: templateId === 'elegant' ? 'Georgia' : templateId === 'modern' ? 'Helvetica' : 'Arial',
      fontSize: { name: 15, title: 12, company: 12, info: 11 },
      separator: templateId === 'minimal' ? 'dot' : templateId === 'legal' ? 'pipe' : 'pipe',
      layout: templateId === 'compact' || templateId === 'minimal' ? 'vertical' : 'horizontal',
      iconStyle: templateId === 'modern' || templateId === 'minimal' ? 'monochrome' : 'colored',
      iconSize: 'small',
      iconShape: 'circle',
    },
    addons: {
      cta: s.cta ? { enabled: true, text: s.cta, url: '#', color: s.colors[0] } : { enabled: false, text: '', url: '', color: s.colors[0] },
      banner: { enabled: false, image: '', url: '' },
      disclaimer: templateId === 'legal' ? { enabled: true, text: 'This email and any attachments are confidential and intended solely for the use of the individual to whom it is addressed.' } : { enabled: false, text: '' },
      meeting: { enabled: false, url: '', platform: 'calendly' },
      tagline: s.tagline ? { enabled: true, text: s.tagline } : { enabled: false, text: '' },
    },
  };
};

export default function TemplatesPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

  const previews = useMemo(() => {
    const map: Record<string, string> = {};
    TEMPLATES.forEach(t => {
      map[t.id] = generateSignatureHtml(sampleDataForTemplate(t.id), false);
    });
    return map;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Signature Templates</h1>
          <p className="text-gray-500 mt-2">Choose a template to get started. Each one is fully customizable in the builder.</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition capitalize ${filter === c ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition group">
              {/* Live signature preview */}
              <div className="p-6 bg-white border-b border-gray-100 min-h-[160px] flex items-start overflow-hidden">
                <div
                  className="w-full transform scale-[0.85] origin-top-left"
                  dangerouslySetInnerHTML={{ __html: previews[t.id] || '' }}
                />
              </div>

              {/* Template info + action */}
              <div className="p-4 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <p className="text-xs text-gray-500">{t.description}</p>
                  <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{t.category}</span>
                </div>
                <Link href={`/builder?template=${t.id}`}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition shadow-sm">
                  Use Template
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
