'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function AffiliateTracker() {
  const params = useSearchParams();
  useEffect(() => {
    const ref = params.get('ref');
    if (!ref) return;
    fetch('/api/affiliate/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: ref }),
    }).catch(() => {});
  }, [params]);
  return null;
}
