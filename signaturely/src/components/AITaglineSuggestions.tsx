'use client';

import { useState } from 'react';

interface Props {
  type: 'tagline' | 'cta';
  context: { name?: string; title?: string; company?: string };
  onSelect: (value: string) => void;
}

export function AITaglineSuggestions({ type, context, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-taglines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...context, type }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition disabled:opacity-50"
      >
        {loading ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
        )}
        AI Suggest
      </button>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => { onSelect(s); setSuggestions([]); }}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition text-gray-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
