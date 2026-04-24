'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TEMPLATES } from '@/lib/types';
import { SignaturePreview } from '@/components/SignaturePreview';
import { generateSignatureHtml } from '@/lib/generateSignatureHtml';
import type { SignatureData } from '@/lib/types';

const aiFeatures = [
  { title: 'AI Signature Generator', desc: 'Describe yourself in one sentence. AI creates a complete, branded signature with colors, layout, and content matched to your industry.', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z' },
  { title: 'Photo Enhancement', desc: 'Upload any photo and fine-tune it with brightness, contrast, and saturation sliders for a polished, professional look.', icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z' },
  { title: 'AI Banner Creator', desc: 'Describe your promotion or event — AI designs a stunning email banner with perfect colors and copy.', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z' },
  { title: 'AI Brand Matching', desc: 'Upload your company logo and AI automatically detects brand colors to apply throughout your signature.', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { title: 'AI Copywriting', desc: 'Get AI-generated taglines and CTAs tailored to your role and industry that actually convert.', icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' },
  { title: 'AI Optimization Score', desc: 'Real-time signature scoring with smart suggestions to maximize engagement and professional impact.', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
];

const features = [
  { title: 'Real-Time Preview', desc: 'See your signature update instantly as you customize every detail. Toggle dark mode and mobile views.', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { title: '12 Professional Templates', desc: 'Curated designs for every industry — from corporate to creative, minimal to bold.', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { title: 'Works Everywhere', desc: 'One-click install guides for Gmail, Outlook, Apple Mail, and Yahoo Mail.', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { title: '16 Social Platforms', desc: 'Add LinkedIn, Twitter, GitHub, Instagram, and 12 more with beautiful icon styles.', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { title: 'CTA Buttons & Banners', desc: 'Drive action with custom buttons, promotional banners, taglines, and meeting scheduler links.', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122' },
  { title: 'Full Brand Control', desc: 'Custom colors, fonts, logos, photo shapes, legal disclaimers, and more — total control.', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
];

// Sample signature data for before/after demo
const sampleBeforeText = `John Smith
Marketing Director
Acme Corp
john@acme.com | (555) 123-4567
www.acme.com`;

const sampleSignatureData: SignatureData = {
  personal: { fullName: 'John Smith', jobTitle: 'Marketing Director', company: 'Acme Corp', department: 'Growth', email: 'john@acme.com', phone: '(555) 123-4567', mobile: '', website: 'https://acme.com', address: '' },
  images: { photo: '', logo: '', photoSize: 80, logoSize: 100, photoShape: 'circle' },
  social: [{ platform: 'linkedin', url: 'https://linkedin.com/in/johnsmith' }, { platform: 'twitter', url: 'https://twitter.com/johnsmith' }],
  design: { template: 'modern', primaryColor: '#4F46E5', secondaryColor: '#7C3AED', textColor: '#1F2937', fontFamily: 'Inter', fontSize: { name: 16, title: 13, company: 13, info: 12 }, separator: 'pipe', layout: 'horizontal', iconStyle: 'colored', iconSize: 'medium', iconShape: 'rounded' },
  addons: { cta: { enabled: true, text: 'Book a Call', url: 'https://calendly.com/john', color: '#4F46E5' }, banner: { enabled: false, image: '', url: '' }, tagline: { enabled: true, text: 'Helping brands grow 10x through data-driven marketing' }, disclaimer: { enabled: false, text: '' }, meeting: { enabled: false, url: '', platform: 'calendly' } },
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<SignatureData | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setGeneratedData(null);
    try {
      const res = await fetch('/api/ai/generate-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error('Failed to generate');
      const data = await res.json();
      setGeneratedData(data);
    } catch {
      setError('Failed to generate. Please try again.');
    }
    setLoading(false);
  };

  const copyGeneratedSignature = () => {
    if (!generatedData) return;
    const html = generateSignatureHtml(generatedData, true);
    const blob = new Blob([html], { type: 'text/html' });
    navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]).then(() => {
      // success
    }).catch(() => {
      navigator.clipboard.writeText(html);
    });
  };

  return (
    <div className="bg-white">
      {/* Hero with Inline Generator */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-medium text-indigo-600 mb-6">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
              Powered by AI
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
              Professional Email Signatures in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Seconds</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              Describe who you are in one sentence. AutoSig&apos;s AI creates a complete, branded signature instantly.
            </p>
          </div>

          {/* Inline AI Generator */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
                    placeholder="e.g., I'm a senior product designer at a fintech startup in NYC"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
                      Generate My Signature
                    </>
                  )}
                </button>
              </div>
              {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

              {/* Generated Preview */}
              {generatedData && (
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <div className="bg-gray-50 rounded-xl p-5">
                    <SignaturePreview data={generatedData} showBranding={true} />
                  </div>
                  <div className="mt-4 flex gap-3 justify-center">
                    <Link href="/builder" className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 rounded-xl transition-all hover:shadow-lg">
                      Customize in Builder
                    </Link>
                    <button onClick={copyGeneratedSignature} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                      Copy Signature
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">Free — no signup required</p>
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Before &amp; After</h2>
            <p className="mt-4 text-gray-600">See the difference a professional signature makes.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <div className="text-xs font-medium text-red-500 uppercase tracking-wider mb-3">Before — plain text</div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{sampleBeforeText}</pre>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-green-600 uppercase tracking-wider mb-3">After — AutoSig</div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 overflow-auto">
                <SignaturePreview data={sampleSignatureData} showBranding={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 border border-violet-100 rounded-full text-xs font-medium text-violet-600 mb-4">
              AI-Powered
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Six AI features that do the work for you</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Stop spending hours on email signatures. Let AI handle the design, copywriting, and optimization.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiFeatures.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon}/></svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need for perfect signatures</h2>
            <p className="mt-4 text-gray-600">Powerful features wrapped in a simple, beautiful interface.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon}/></svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Showcase with Real Previews */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Templates for every profession</h2>
            <p className="mt-4 text-gray-600">Choose from {TEMPLATES.length} professionally designed templates.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((t) => (
              <Link key={t.id} href={`/builder?template=${t.id}`} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-300 group">
                <div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-400 group-hover:text-indigo-500 transition-colors">{t.name}</span>
                </div>
                <div className="font-medium text-sm text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-500">{t.description}</div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/templates" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition">
              View all templates
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to upgrade your email?</h2>
          <p className="mt-4 text-gray-600">Create a professional signature in seconds — completely free.</p>
          <Link href="/builder" className="inline-flex items-center justify-center mt-8 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl active:scale-[0.98]">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            Open the Builder — Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#6366f1"/><path d="M8 14l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="font-bold text-gray-900">AutoSig</span>
              </div>
              <p className="text-sm text-gray-500">AI-powered professional email signatures.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Product</h4>
              <div className="space-y-2">
                <Link href="/builder" className="block text-sm text-gray-500 hover:text-gray-700 transition">AI Signature Builder</Link>
                <Link href="/templates" className="block text-sm text-gray-500 hover:text-gray-700 transition">Templates</Link>
                <Link href="/pricing" className="block text-sm text-gray-500 hover:text-gray-700 transition">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Support</h4>
              <div className="space-y-2">
                <span className="block text-sm text-gray-500">Installation Guide</span>
                <span className="block text-sm text-gray-500">FAQ</span>
                <span className="block text-sm text-gray-500">Contact</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Legal</h4>
              <div className="space-y-2">
                <span className="block text-sm text-gray-500">Privacy Policy</span>
                <span className="block text-sm text-gray-500">Terms of Service</span>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} AutoSig. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
