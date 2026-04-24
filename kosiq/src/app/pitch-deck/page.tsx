'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PitchDeckPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/pitch-deck')
        .then(res => {
          if (res.ok) return res.text();
          throw new Error('Unauthorized');
        })
        .then(setHtml)
        .catch(() => router.push('/auth/login'));
    }
  }, [session, router]);

  if (status === 'loading' || !html) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fff' }}>
        <p style={{ color: '#86868b', fontSize: 16 }}>Loading presentation...</p>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      style={{ width: '100vw', height: '100vh', border: 'none', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
      title="KOSIQ Investor Pitch Deck"
    />
  );
}
