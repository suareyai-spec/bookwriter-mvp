'use client';

import React from 'react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent';
  color?: 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'yellow';
  icon?: React.ReactNode;
  status?: 'coming-soon' | 'no-data';
  onClick?: () => void;
}

const COLOR_MAP: Record<string, { border: string; text: string; bg: string }> = {
  red:    { border: '#ff3b30', text: '#ff3b30', bg: 'rgba(255,59,48,0.06)' },
  blue:   { border: '#0071e3', text: '#0071e3', bg: 'rgba(0,113,227,0.06)' },
  green:  { border: '#34c759', text: '#34c759', bg: 'rgba(52,199,89,0.06)' },
  orange: { border: '#ff9f0a', text: '#ff9f0a', bg: 'rgba(255,159,10,0.06)' },
  yellow: { border: '#ffcc00', text: '#b8860b', bg: 'rgba(255,204,0,0.08)' },
  purple: { border: '#af52de', text: '#af52de', bg: 'rgba(175,82,222,0.06)' },
};

function fmt(v: number, format?: string): string {
  if (format === 'currency') {
    if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toLocaleString()}`;
  }
  if (format === 'percent') return `${v.toFixed(1)}%`;
  return v.toLocaleString();
}

export default function MetricCard({ title, value, previousValue, format, color = 'blue', icon, status, onClick }: MetricCardProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  if (status === 'coming-soon') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden" style={{ borderLeft: `3px solid #86868b` }}>
        {icon && <div className="text-lg mb-2 text-[#86868b]">{icon}</div>}
        <p className="text-xs text-[#86868b] font-medium mb-2">{title}</p>
        <p className="text-lg font-semibold text-[#86868b] italic">Coming Soon</p>
      </div>
    );
  }

  if (status === 'no-data') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden" style={{ borderLeft: `3px solid ${c.border}` }}>
        {icon && <div className="text-lg mb-2" style={{ color: c.text }}>{icon}</div>}
        <p className="text-xs text-[#86868b] font-medium mb-2">{title}</p>
        <p className="text-lg font-semibold" style={{ color: c.text }}>No Data</p>
      </div>
    );
  }

  const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[$,%]/g, ''));
  const displayValue = typeof value === 'string' ? value : fmt(value, format);

  let diff: number | null = null;
  let changePct: number | null = null;
  if (previousValue !== undefined && !isNaN(numValue)) {
    diff = numValue - previousValue;
    changePct = previousValue !== 0 ? ((diff / previousValue) * 100) : null;
  }

  const arrow = diff !== null ? (diff >= 0 ? '▲' : '▼') : '';
  const diffColor = diff !== null ? (diff > 0 ? (color === 'red' ? '#ff3b30' : '#34c759') : (color === 'red' ? '#34c759' : '#ff3b30')) : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all relative overflow-hidden${onClick ? ' cursor-pointer' : ''}`}
      style={{ borderLeft: `3px solid ${c.border}` }}
    >
      <div className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: c.bg, color: c.text }}>
        {icon || '●'}
      </div>
      <p className="text-xs text-[#86868b] font-medium uppercase tracking-wider mb-3 pr-10">{title}</p>
      <p className="text-2xl font-bold tracking-tight" style={{ color: c.text }}>{displayValue}</p>
      {previousValue !== undefined && (
        <div className="flex items-center gap-3 mt-2 text-[10px] text-[#86868b]">
          <span>Previous: {fmt(previousValue, format)}</span>
          {diff !== null && (
            <span style={{ color: diffColor }}>
              {arrow} {fmt(Math.abs(diff), format)}
            </span>
          )}
          {changePct !== null && (
            <span style={{ color: diffColor }}>
              {arrow} {Math.abs(changePct).toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
