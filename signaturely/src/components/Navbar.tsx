'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="8" fill="#6366f1"/>
              <path d="M8 14l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold text-gray-900">AutoSig</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/templates" className="text-sm text-gray-600 hover:text-gray-900 transition">Templates</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Pricing</Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition">Dashboard</Link>
                <Link href="/builder" className="text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition">
                  Create Signature
                </Link>
                {(session.user as any)?.isAdmin && (
                  <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 transition">Admin</Link>
                )}
                <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-700 transition">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition">Sign In</Link>
                <Link href="/auth/signup" className="text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M3 12h18M3 6h18M3 18h18"/>}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/templates" className="block py-2 text-sm text-gray-600">Templates</Link>
            <Link href="/pricing" className="block py-2 text-sm text-gray-600">Pricing</Link>
            {session ? (
              <>
                <Link href="/dashboard" className="block py-2 text-sm text-gray-600">Dashboard</Link>
                <Link href="/builder" className="block py-2 text-sm font-medium text-indigo-500">Create Signature</Link>
                <button onClick={() => signOut()} className="block py-2 text-sm text-gray-500">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block py-2 text-sm text-gray-600">Sign In</Link>
                <Link href="/auth/signup" className="block py-2 text-sm font-medium text-indigo-500">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
