'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import SessionGuard from './SessionGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
      <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (status === 'unauthenticated') return null;

  return (
    <SessionGuard>
      <div className="min-h-screen bg-[#f5f5f7]">
        <Sidebar />
        <main className="ml-60 p-8 min-h-screen">{children}</main>
      </div>
    </SessionGuard>
  );
}
