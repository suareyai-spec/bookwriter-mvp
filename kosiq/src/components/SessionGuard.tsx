'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';

const WARNING_AT_MS = 25 * 60 * 1000; // 25 minutes
const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const lastActivity = useRef(Date.now());
  const warningTimer = useRef<NodeJS.Timeout>(null);
  const timeoutTimer = useRef<NodeJS.Timeout>(null);

  const resetTimers = useCallback(() => {
    lastActivity.current = Date.now();
    setShowWarning(false);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    warningTimer.current = setTimeout(() => setShowWarning(true), WARNING_AT_MS);
    timeoutTimer.current = setTimeout(() => {
      router.push('/auth/login?expired=1');
    }, TIMEOUT_MS);
  }, [router]);

  useEffect(() => {
    if (status === 'authenticated') resetTimers();
    return () => {
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    };
  }, [status, resetTimers]);

  // Reset on navigation
  useEffect(() => {
    if (status === 'authenticated') resetTimers();
  }, [pathname, status, resetTimers]);

  // Check for expired session from server
  useEffect(() => {
    if ((session as any)?.expired) {
      router.push('/auth/login?expired=1');
    }
  }, [session, router]);

  const handleContinue = async () => {
    // Make any API call to extend the session
    try {
      await fetch('/api/dashboard', { credentials: 'include' });
    } catch {}
    resetTimers();
  };

  if (status === 'loading' || status === 'unauthenticated') return <>{children}</>;

  return (
    <>
      {children}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#ff9f0a]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏱</span>
              </div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">Session Expiring</h3>
              <p className="text-sm text-[#86868b] mb-6">Your session expires in 5 minutes. Would you like to continue?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-[#6e6e73] hover:bg-gray-50"
                >
                  Sign Out
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 btn-primary"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
