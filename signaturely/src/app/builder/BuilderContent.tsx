'use client';

import React, { useState, useCallback, useEffect, memo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { SignatureData, defaultSignatureData, TEMPLATES, SOCIAL_PLATFORMS, FONT_FAMILIES } from '@/lib/types';
import { SignaturePreview } from '@/components/SignaturePreview';
import { generateSignatureHtml } from '@/lib/generateSignatureHtml';
import { AIGenerateSection } from '@/components/AIGenerateSection';
import { AIScorePanel } from '@/components/AIScorePanel';
import { AIBannerCreator, AIBannerData } from '@/components/AIBannerCreator';
import { AITaglineSuggestions } from '@/components/AITaglineSuggestions';
import { extractColors, ExtractedColor } from '@/lib/color-extractor';

type Tab = 'personal' | 'images' | 'social' | 'design' | 'addons';

// Memoized InputField defined OUTSIDE the main component to prevent re-creation
const InputField = memo(({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" />
  </div>
));
InputField.displayName = 'InputField';

export function BuilderContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const templateParam = searchParams.get('template');

  const [data, setData] = useState<SignatureData>(() => {
    const d = { ...defaultSignatureData };
    if (templateParam) d.design = { ...d.design, template: templateParam };
    return d;
  });
  const [tab, setTab] = useState<Tab>('personal');
  const [sigName, setSigName] = useState('My Signature');
  const [saving, setSaving] = useState(false);
  const [darkPreview, setDarkPreview] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [photoFilters, setPhotoFilters] = useState({ brightness: 1, contrast: 1, saturation: 1, backgroundBlur: 0 });

  useEffect(() => {
    if (editId && session) {
      fetch(`/api/signatures/${editId}`).then(r => r.json()).then(sig => {
        if (sig.data) {
          setData(JSON.parse(sig.data));
          setSigName(sig.name);
        }
      }).catch(() => {});
    }
  }, [editId, session]);

  // Proper immutable update without JSON.parse/stringify
  const update = useCallback((path: string, value: any) => {
    setData(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const handleImageUpload = async (field: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const { url } = await res.json();
      update(field, url);
    };
    input.click();
  };

  const handleSave = async () => {
    if (!session) { router.push('/auth/login'); return; }
    setSaving(true);
    try {
      const url = editId ? `/api/signatures/${editId}` : '/api/signatures';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sigName, template: data.design.template, data: JSON.stringify(data) }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to save');
      } else {
        toast.success('Signature saved!');
        setShowInstall(true);
      }
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const copyHtml = () => {
    const html = generateSignatureHtml(data, (session?.user as any)?.plan === 'free');
    navigator.clipboard.writeText(html);
    toast.success('HTML copied to clipboard!');
  };

  const copyRichHtml = () => {
    const html = generateSignatureHtml(data, (session?.user as any)?.plan === 'free');
    const blob = new Blob([html], { type: 'text/html' });
    navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]).then(() => {
      toast.success('Rich signature copied!');
    }).catch(() => {
      navigator.clipboard.writeText(html);
      toast.success('HTML copied (fallback)');
    });
  };

  const addSocial = useCallback((platform: string) => {
    setData(prev => ({
      ...prev,
      social: [...prev.social, { platform, url: '' }],
    }));
  }, []);

  const removeSocial = useCallback((index: number) => {
    setData(prev => ({ ...prev, social: prev.social.filter((_, i) => i !== index) }));
  }, []);

  const updateSocial = useCallback((index: number, url: string) => {
    setData(prev => {
      const social = [...prev.social];
      social[index] = { ...social[index], url };
      return { ...prev, social };
    });
  }, []);

  const handleAIGenerated = useCallback((aiData: SignatureData) => {
    setData(aiData);
    toast.success('AI signature generated! Customize it below.');
  }, []);

  const handleBannerCreated = useCallback((banner: AIBannerData) => {
    setData(prev => ({
      ...prev,
      addons: {
        ...prev.addons,
        banner: { ...prev.addons.banner, enabled: true, image: '', url: banner.url || '' },
      },
      _aiBanner: banner,
    } as SignatureData & { _aiBanner: AIBannerData }));
    toast.success('AI banner created!');
  }, []);

  const handleExtractColors = async () => {
    if (!data.images.logo) return;
    try {
      const colors = await extractColors(data.images.logo);
      setExtractedColors(colors);
      if (colors.length > 0) toast.success(`Extracted ${colors.length} brand colors!`);
    } catch { toast.error('Could not extract colors from logo'); }
  };

  const applyPhotoEnhance = () => {
    setPhotoFilters({ brightness: 1.05, contrast: 1.1, saturation: 1.05, backgroundBlur: 0 });
    toast.success('Photo enhanced!');
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'personal', label: 'Personal Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'images', label: 'Photo & Logo', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'social', label: 'Social Links', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { id: 'design', label: 'Design', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { id: 'addons', label: 'Add-ons', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <input value={sigName} onChange={(e) => setSigName(e.target.value)}
            className="text-xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none px-1 py-0.5 transition" />
          <div className="flex items-center gap-3">
            <button onClick={copyRichHtml} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Copy Signature
            </button>
            <button onClick={copyHtml} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Copy HTML
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Signature'}
            </button>
          </div>
        </div>

        <AIGenerateSection onGenerated={handleAIGenerated} />

        <div className="grid lg:grid-cols-[1fr,420px] gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition border-b-2 ${tab === t.id ? 'text-indigo-600 border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={t.icon}/></svg>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6 max-h-[calc(100vh-220px)] overflow-y-auto scroll-smooth">
              {tab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Full Name" value={data.personal.fullName} onChange={(v) => update('personal.fullName', v)} placeholder="John Doe" />
                    <InputField label="Job Title" value={data.personal.jobTitle} onChange={(v) => update('personal.jobTitle', v)} placeholder="Software Engineer" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Company" value={data.personal.company} onChange={(v) => update('personal.company', v)} placeholder="Acme Corp" />
                    <InputField label="Department" value={data.personal.department} onChange={(v) => update('personal.department', v)} placeholder="Engineering" />
                  </div>
                  <InputField label="Email" type="email" value={data.personal.email} onChange={(v) => update('personal.email', v)} placeholder="john@acmecorp.com" />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Phone" value={data.personal.phone} onChange={(v) => update('personal.phone', v)} placeholder="+1 (555) 123-4567" />
                    <InputField label="Mobile" value={data.personal.mobile} onChange={(v) => update('personal.mobile', v)} placeholder="+1 (555) 987-6543" />
                  </div>
                  <InputField label="Website" value={data.personal.website} onChange={(v) => update('personal.website', v)} placeholder="https://acmecorp.com" />
                  <InputField label="Address" value={data.personal.address} onChange={(v) => update('personal.address', v)} placeholder="123 Main St, San Francisco, CA" />
                </div>
              )}

              {tab === 'images' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      {data.images.photo ? (
                        <img src={data.images.photo} className="w-16 h-16 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        </div>
                      )}
                      <button onClick={() => handleImageUpload('images.photo')} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">Upload Photo</button>
                      {data.images.photo && (
                        <>
                          <button onClick={applyPhotoEnhance} className="px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg hover:from-indigo-600 hover:to-violet-600 transition flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
                            Quick Enhance
                          </button>
                          <button onClick={() => update('images.photo', '')} className="text-sm text-red-500 hover:text-red-600 transition">Remove</button>
                        </>
                      )}
                    </div>
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="text-xs text-gray-500">Shape</label>
                        <div className="flex gap-2 mt-1">
                          {(['square', 'rounded', 'circle'] as const).map(s => (
                            <button key={s} onClick={() => update('images.photoShape', s)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${data.images.photoShape === s ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Size: {data.images.photoSize}px</label>
                        <input type="range" min="40" max="150" value={data.images.photoSize} onChange={(e) => update('images.photoSize', Number(e.target.value))} className="w-full mt-1 accent-indigo-500" />
                      </div>
                    </div>
                    {data.images.photo && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs font-medium text-gray-600 mb-2 block">Photo Enhancement Sliders</label>
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] text-gray-400">Brightness: {photoFilters.brightness.toFixed(2)}</label>
                            <input type="range" min="0.5" max="1.5" step="0.05" value={photoFilters.brightness} onChange={(e) => setPhotoFilters(f => ({ ...f, brightness: Number(e.target.value) }))} className="w-full accent-indigo-500" />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Contrast: {photoFilters.contrast.toFixed(2)}</label>
                            <input type="range" min="0.5" max="1.5" step="0.05" value={photoFilters.contrast} onChange={(e) => setPhotoFilters(f => ({ ...f, contrast: Number(e.target.value) }))} className="w-full accent-indigo-500" />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Saturation: {photoFilters.saturation.toFixed(2)}</label>
                            <input type="range" min="0.5" max="1.5" step="0.05" value={photoFilters.saturation} onChange={(e) => setPhotoFilters(f => ({ ...f, saturation: Number(e.target.value) }))} className="w-full accent-indigo-500" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <hr className="border-gray-100" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
                    <div className="flex items-center gap-4">
                      {data.images.logo ? (
                        <img src={data.images.logo} className="h-10 object-contain" alt="" />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"/></svg>
                        </div>
                      )}
                      <button onClick={() => handleImageUpload('images.logo')} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">Upload Logo</button>
                      {data.images.logo && (
                        <>
                          <button onClick={handleExtractColors} className="px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg hover:from-indigo-600 hover:to-violet-600 transition flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
                            Extract Brand Colors
                          </button>
                          <button onClick={() => update('images.logo', '')} className="text-sm text-red-500 hover:text-red-600 transition">Remove</button>
                        </>
                      )}
                    </div>
                    {extractedColors.length > 0 && (
                      <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                        <p className="text-xs font-medium text-indigo-700 mb-2">Detected brand colors — click to apply:</p>
                        <div className="flex gap-2">
                          {extractedColors.map((c, i) => (
                            <button key={i} onClick={() => { update('design.primaryColor', c.hex); if (extractedColors[i + 1]) update('design.secondaryColor', extractedColors[i + 1].hex); }}
                              className="w-8 h-8 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition" style={{ backgroundColor: c.hex }} title={c.hex} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-3">
                      <label className="text-xs text-gray-500">Size: {data.images.logoSize}px</label>
                      <input type="range" min="40" max="200" value={data.images.logoSize} onChange={(e) => update('images.logoSize', Number(e.target.value))} className="w-full mt-1 accent-indigo-500" />
                    </div>
                  </div>
                </div>
              )}

              {tab === 'social' && (
                <div className="space-y-4">
                  {data.social.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 w-20 capitalize">{s.platform}</span>
                      <input value={s.url} onChange={(e) => updateSocial(i, e.target.value)} placeholder={`https://${s.platform}.com/...`}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                      <button onClick={() => removeSocial(i)} className="text-red-400 hover:text-red-500 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Add Social Link</label>
                    <div className="flex flex-wrap gap-2">
                      {SOCIAL_PLATFORMS.filter(p => !data.social.find(s => s.platform === p)).map(p => (
                        <button key={p} onClick={() => addSocial(p)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg capitalize transition">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Icon Style</label>
                      <div className="flex gap-2 mt-1">
                        {(['colored', 'monochrome', 'outline'] as const).map(s => (
                          <button key={s} onClick={() => update('design.iconStyle', s)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${data.design.iconStyle === s ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600'}`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Icon Size</label>
                      <div className="flex gap-2 mt-1">
                        {(['small', 'medium', 'large'] as const).map(s => (
                          <button key={s} onClick={() => update('design.iconSize', s)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${data.design.iconSize === s ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600'}`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Icon Shape</label>
                      <div className="flex gap-2 mt-1">
                        {(['square', 'rounded', 'circle'] as const).map(s => (
                          <button key={s} onClick={() => update('design.iconShape', s)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${data.design.iconShape === s ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600'}`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'design' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Template</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => update('design.template', t.id)}
                          className={`p-3 text-left rounded-lg border transition ${data.design.template === t.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <div className="text-xs font-medium text-gray-900">{t.name}</div>
                          <div className="text-[10px] text-gray-500">{t.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <hr className="border-gray-100" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Colors</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: 'primaryColor', label: 'Primary' },
                        { key: 'secondaryColor', label: 'Secondary' },
                        { key: 'textColor', label: 'Text' },
                      ].map(c => (
                        <div key={c.key}>
                          <label className="text-xs text-gray-500">{c.label}</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input type="color" value={(data.design as any)[c.key]} onChange={(e) => update(`design.${c.key}`, e.target.value)} />
                            <input value={(data.design as any)[c.key]} onChange={(e) => update(`design.${c.key}`, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-200 rounded text-xs transition" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Font Family</label>
                    <select value={data.design.fontFamily} onChange={(e) => update('design.fontFamily', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition">
                      {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Font Sizes</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['name', 'title', 'company', 'info'] as const).map(k => (
                        <div key={k}>
                          <label className="text-[10px] text-gray-400 capitalize">{k}: {data.design.fontSize[k]}px</label>
                          <input type="range" min="10" max="24" value={data.design.fontSize[k]}
                            onChange={(e) => update(`design.fontSize.${k}`, Number(e.target.value))}
                            className="w-full accent-indigo-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Separator</label>
                      <div className="flex gap-2 mt-1">
                        {(['pipe', 'dot', 'line', 'none'] as const).map(s => (
                          <button key={s} onClick={() => update('design.separator', s)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${data.design.separator === s ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600'}`}>
                            {s === 'pipe' ? '|' : s === 'dot' ? '·' : s === 'line' ? '—' : 'None'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Layout</label>
                      <div className="flex gap-2 mt-1">
                        {(['horizontal', 'vertical'] as const).map(s => (
                          <button key={s} onClick={() => update('design.layout', s)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${data.design.layout === s ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600'}`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'addons' && (
                <div className="space-y-6">
                  {/* CTA */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">CTA Button</label>
                      <button onClick={() => update('addons.cta.enabled', !data.addons.cta.enabled)}
                        className={`w-10 h-6 rounded-full transition ${data.addons.cta.enabled ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${data.addons.cta.enabled ? 'translate-x-4' : ''}`}></div>
                      </button>
                    </div>
                    {data.addons.cta.enabled && (
                      <div className="space-y-3 pl-1">
                        <InputField label="Button Text" value={data.addons.cta.text} onChange={(v) => update('addons.cta.text', v)} placeholder="Book a Meeting" />
                        <AITaglineSuggestions type="cta" context={{ name: data.personal.fullName, title: data.personal.jobTitle, company: data.personal.company }} onSelect={(v) => update('addons.cta.text', v)} />
                        <InputField label="Button URL" value={data.addons.cta.url} onChange={(v) => update('addons.cta.url', v)} placeholder="https://calendly.com/..." />
                        <div>
                          <label className="text-xs text-gray-500">Button Color</label>
                          <input type="color" value={data.addons.cta.color} onChange={(e) => update('addons.cta.color', e.target.value)} className="block mt-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  <hr className="border-gray-100" />
                  {/* Banner */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">Banner Image</label>
                      <button onClick={() => update('addons.banner.enabled', !data.addons.banner.enabled)}
                        className={`w-10 h-6 rounded-full transition ${data.addons.banner.enabled ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${data.addons.banner.enabled ? 'translate-x-4' : ''}`}></div>
                      </button>
                    </div>
                    {data.addons.banner.enabled && (
                      <div className="space-y-3 pl-1">
                        <button onClick={() => handleImageUpload('addons.banner.image')} className="px-4 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">Upload Banner</button>
                        <InputField label="Click-through URL" value={data.addons.banner.url} onChange={(v) => update('addons.banner.url', v)} placeholder="https://..." />
                        <div className="border-t border-gray-100 pt-3">
                          <label className="text-xs font-medium text-gray-500 mb-2 block">Or create with AI</label>
                          <AIBannerCreator onBannerCreated={handleBannerCreated} />
                        </div>
                      </div>
                    )}
                  </div>
                  <hr className="border-gray-100" />
                  {/* Tagline */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">Tagline / Quote</label>
                      <button onClick={() => update('addons.tagline.enabled', !data.addons.tagline.enabled)}
                        className={`w-10 h-6 rounded-full transition ${data.addons.tagline.enabled ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${data.addons.tagline.enabled ? 'translate-x-4' : ''}`}></div>
                      </button>
                    </div>
                    {data.addons.tagline.enabled && (
                      <div className="space-y-2 pl-1">
                        <InputField label="Tagline" value={data.addons.tagline.text} onChange={(v) => update('addons.tagline.text', v)} placeholder="Innovation starts here." />
                        <AITaglineSuggestions type="tagline" context={{ name: data.personal.fullName, title: data.personal.jobTitle, company: data.personal.company }} onSelect={(v) => update('addons.tagline.text', v)} />
                      </div>
                    )}
                  </div>
                  <hr className="border-gray-100" />
                  {/* Disclaimer */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">Legal Disclaimer</label>
                      <button onClick={() => update('addons.disclaimer.enabled', !data.addons.disclaimer.enabled)}
                        className={`w-10 h-6 rounded-full transition ${data.addons.disclaimer.enabled ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${data.addons.disclaimer.enabled ? 'translate-x-4' : ''}`}></div>
                      </button>
                    </div>
                    {data.addons.disclaimer.enabled && (
                      <div className="pl-1">
                        <label className="text-xs text-gray-500 mb-1 block">Disclaimer Text</label>
                        <textarea value={data.addons.disclaimer.text} onChange={(e) => update('addons.disclaimer.text', e.target.value)}
                          rows={3} placeholder="This email and any attachments are confidential..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                      </div>
                    )}
                  </div>
                  <hr className="border-gray-100" />
                  {/* Meeting */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">Meeting Scheduler</label>
                      <button onClick={() => update('addons.meeting.enabled', !data.addons.meeting.enabled)}
                        className={`w-10 h-6 rounded-full transition ${data.addons.meeting.enabled ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${data.addons.meeting.enabled ? 'translate-x-4' : ''}`}></div>
                      </button>
                    </div>
                    {data.addons.meeting.enabled && (
                      <InputField label="Scheduler URL" value={data.addons.meeting.url} onChange={(v) => update('addons.meeting.url', v)} placeholder="https://calendly.com/..." />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel + AI Score */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Preview</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMobilePreview(!mobilePreview)}
                    className={`p-1.5 rounded-lg transition ${mobilePreview ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`} title="Mobile preview">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/></svg>
                  </button>
                  <button onClick={() => setDarkPreview(!darkPreview)}
                    className={`p-1.5 rounded-lg transition ${darkPreview ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-600'}`} title="Dark background">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>
                  </button>
                </div>
              </div>
              <div className={`rounded-xl p-4 transition-colors ${darkPreview ? 'bg-gray-800' : 'bg-gray-50'} ${mobilePreview ? 'max-w-[320px] mx-auto' : ''}`}>
                <div className="overflow-auto">
                  <SignaturePreview data={data} showBranding={(session?.user as any)?.plan === 'free' || !session} />
                </div>
              </div>
            </div>

            <AIScorePanel data={data} />

            {showInstall && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Install Your Signature</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Gmail</h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Click &ldquo;Copy Signature&rdquo; above</li>
                      <li>Open Gmail Settings &rarr; See all settings</li>
                      <li>Scroll to &ldquo;Signature&rdquo; section</li>
                      <li>Create new or edit existing</li>
                      <li>Paste (Ctrl/Cmd + V)</li>
                      <li>Save Changes</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Outlook</h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Click &ldquo;Copy Signature&rdquo; above</li>
                      <li>File &rarr; Options &rarr; Mail &rarr; Signatures</li>
                      <li>New or Edit &rarr; Paste</li>
                      <li>OK</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Apple Mail</h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Click &ldquo;Copy Signature&rdquo; above</li>
                      <li>Mail &rarr; Preferences &rarr; Signatures</li>
                      <li>Click + to add new</li>
                      <li>Paste into the edit area</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Yahoo Mail</h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Click &ldquo;Copy HTML&rdquo; above</li>
                      <li>Settings &rarr; More Settings &rarr; Writing email</li>
                      <li>Paste HTML into signature field</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
