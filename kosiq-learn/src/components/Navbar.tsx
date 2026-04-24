'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = session?.user?.role === 'admin'

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tight">PHA</span>
            </div>
            <span className="text-gray-900 text-sm font-semibold tracking-tight hidden sm:block">Pop Health Academy</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/courses" className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">Courses</Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">Dashboard</Link>
                {isAdmin && <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">Admin</Link>}
                <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">Sign Out</button>
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">Sign In</Link>
                <Link href="/auth/signup" className="text-sm bg-primary text-white px-5 py-2 rounded-full font-semibold hover:bg-primary/90 transition">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/courses" className="block text-sm text-gray-600 font-medium py-2" onClick={() => setMobileOpen(false)}>Courses</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="block text-sm text-gray-600 font-medium py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              {isAdmin && <Link href="/admin" className="block text-sm text-gray-600 font-medium py-2" onClick={() => setMobileOpen(false)}>Admin</Link>}
              <button onClick={() => signOut()} className="block text-sm text-gray-600 font-medium py-2">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block text-sm text-gray-600 font-medium py-2" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/auth/signup" className="block text-sm bg-primary text-white text-center py-3 rounded-xl font-semibold" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
