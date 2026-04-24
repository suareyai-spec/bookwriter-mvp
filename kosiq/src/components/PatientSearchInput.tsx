'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

export interface PatientResult {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  mrn: string;
  insurance: string;
  source: string;
}

interface Props {
  onSelect: (patient: PatientResult) => void;
  placeholder?: string;
  value?: string;
  className?: string;
  /** When true, acts as a filter (doesn't clear on blur, doesn't require selection) */
  filterMode?: boolean;
  onInputChange?: (value: string) => void;
}

export default function PatientSearchInput({ onSelect, placeholder = 'Search patient...', value: controlledValue, className, filterMode, onInputChange }: Props) {
  const [query, setQuery] = useState(controlledValue || '');
  const [results, setResults] = useState<PatientResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selected, setSelected] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (controlledValue !== undefined) setQuery(controlledValue);
  }, [controlledValue]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(q.trim())}`);
      const data: PatientResult[] = await res.json();
      setResults(data);
      setOpen(true);
      setActiveIndex(-1);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    setSelected(false);
    onInputChange?.(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 200);
  };

  const handleSelect = (p: PatientResult) => {
    setQuery(`${p.lastName}, ${p.firstName}`);
    setSelected(true);
    setOpen(false);
    setResults([]);
    onSelect(p);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); handleSelect(results[activeIndex]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatDob = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className || ''}`}>
      <input
        value={query}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (results.length > 0 && !selected) setOpen(true); }}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
      />
      {selected && !filterMode && (
        <p className="text-xs text-emerald-600 mt-1">✓ Patient selected</p>
      )}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-72 overflow-y-auto animate-in fade-in duration-150">
          {loading && <div className="px-4 py-3 text-sm text-[#86868b]">Searching...</div>}
          {!loading && results.length === 0 && <div className="px-4 py-3 text-sm text-[#86868b]">No patients found</div>}
          {results.map((p, i) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 text-sm transition-colors ${
                i === activeIndex ? 'bg-blue-50' : 'hover:bg-[#f5f5f7]'
              } ${i === 0 ? 'rounded-t-xl' : ''} ${i === results.length - 1 ? 'rounded-b-xl' : ''}`}
            >
              <span className="font-medium text-[#1d1d1f] truncate">
                {p.lastName}, {p.firstName}
              </span>
              <span className="text-xs text-[#86868b] whitespace-nowrap flex-shrink-0">
                {formatDob(p.dob)} · {p.gender} · {p.mrn} {p.insurance ? `· ${p.insurance}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
