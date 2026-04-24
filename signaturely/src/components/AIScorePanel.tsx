'use client';

import { useState } from 'react';
import { SignatureData } from '@/lib/types';

interface Tip {
  label: string;
  points: number;
  met: boolean;
}

function calculateScore(data: SignatureData): { score: number; tips: Tip[] } {
  const tips: Tip[] = [];

  const hasPhoto = !!data.images.photo;
  tips.push({ label: hasPhoto ? 'Professional headshot added' : 'Add a professional headshot — signatures with photos get 32% more replies', points: 15, met: hasPhoto });

  const hasLogo = !!data.images.logo;
  tips.push({ label: hasLogo ? 'Company logo added' : 'Add your company logo for brand recognition', points: 10, met: hasLogo });

  const hasSocial = data.social.filter(s => s.url).length > 0;
  tips.push({ label: hasSocial ? 'Social links added' : 'Add social links — LinkedIn is expected in most industries', points: 10, met: hasSocial });

  const hasCta = data.addons.cta.enabled && !!data.addons.cta.text;
  tips.push({ label: hasCta ? 'CTA button active' : 'Add a CTA button to drive action', points: 10, met: hasCta });

  const hasTagline = data.addons.tagline.enabled && !!data.addons.tagline.text;
  tips.push({ label: hasTagline ? 'Tagline set' : 'Add a tagline to show your value proposition', points: 10, met: hasTagline });

  const hasBanner = data.addons.banner.enabled;
  tips.push({ label: hasBanner ? 'Banner active' : 'Add a banner to promote offers or events', points: 5, met: hasBanner });

  const contactFields = [data.personal.fullName, data.personal.email, data.personal.phone || data.personal.mobile, data.personal.jobTitle, data.personal.company];
  const filledContact = contactFields.filter(Boolean).length;
  const allContact = filledContact >= 4;
  tips.push({ label: allContact ? 'Contact info complete' : `Fill in more contact details (${filledContact}/5 key fields)`, points: 15, met: allContact });

  const hasMeeting = data.addons.meeting.enabled && !!data.addons.meeting.url;
  tips.push({ label: hasMeeting ? 'Meeting scheduler linked' : 'Add a meeting scheduler link for easy booking', points: 5, met: hasMeeting });

  // Color contrast check (simplified)
  const hexToLum = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };
  let goodContrast = true;
  try {
    const textLum = hexToLum(data.design.textColor);
    goodContrast = textLum < 0.5; // Dark text on white bg
  } catch { goodContrast = true; }
  tips.push({ label: goodContrast ? 'Good color contrast' : 'Your color scheme has low contrast — readability may suffer', points: 10, met: goodContrast });

  const notDefault = data.design.template !== 'classic';
  tips.push({ label: notDefault ? 'Custom template selected' : 'Try a different template for a unique look', points: 10, met: notDefault });

  const score = tips.reduce((sum, t) => sum + (t.met ? t.points : 0), 0);
  return { score, tips };
}

export function AIScorePanel({ data }: { data: SignatureData }) {
  const [expanded, setExpanded] = useState(false);
  const { score, tips } = calculateScore(data);

  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-sm transition-transform hover:scale-105"
        style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #e5e7eb ${score * 3.6}deg)` }}
        title="AI Signature Score"
      >
        <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 text-xs font-bold">
          {score}
        </span>
      </button>

      {expanded && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-5 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Signature Score</h3>
              <p className="text-xs text-gray-500">Optimize for better results</p>
            </div>
            <div className="text-2xl font-bold" style={{ color }}>{score}<span className="text-sm text-gray-400">/100</span></div>
          </div>
          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                {tip.met ? (
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                ) : (
                  <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                )}
                <span className={`text-xs ${tip.met ? 'text-gray-500' : 'text-gray-700'}`}>
                  {tip.label}
                  {!tip.met && <span className="text-indigo-500 ml-1">+{tip.points}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
