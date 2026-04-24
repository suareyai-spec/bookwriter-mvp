'use client';

import { useState } from 'react';

export interface AIBannerData {
  headline: string;
  subtext: string;
  ctaText: string;
  url: string;
  bgColor: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  style: string;
}

interface Props {
  onBannerCreated: (banner: AIBannerData) => void;
}

export function AIBannerCreator({ onBannerCreated }: Props) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<AIBannerData | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPreview(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
          placeholder="e.g., Open house this Saturday at 123 Main St, Miami"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          disabled={loading}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg hover:from-indigo-600 hover:to-violet-600 transition disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
          )}
          Create with AI
        </button>
      </div>

      {preview && (
        <div>
          <div
            className="rounded-lg p-4 text-center"
            style={{ background: preview.bgGradient || preview.bgColor, color: preview.textColor }}
          >
            <div className="font-bold text-lg">{preview.headline}</div>
            {preview.subtext && <div className="text-sm opacity-90 mt-1">{preview.subtext}</div>}
            {preview.ctaText && (
              <div
                className="inline-block mt-2 px-4 py-1.5 rounded text-sm font-semibold"
                style={{ backgroundColor: preview.accentColor, color: '#ffffff' }}
              >
                {preview.ctaText}
              </div>
            )}
          </div>
          <button
            onClick={() => onBannerCreated(preview)}
            className="mt-2 w-full py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
          >
            Use This Banner
          </button>
        </div>
      )}
    </div>
  );
}
