'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { LayoutIcon, BookIcon, UsersIcon, DollarIcon, CertificateIcon, MailIcon, SettingsIcon } from '@/components/Icons'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutIcon },
  { href: '/admin/courses', label: 'Courses', icon: BookIcon },
  { href: '/admin/students', label: 'Students', icon: UsersIcon },
  { href: '/admin/revenue', label: 'Revenue', icon: DollarIcon },
  { href: '/admin/certificates', label: 'Certificates', icon: CertificateIcon },
  { href: '/admin/emails', label: 'Emails', icon: MailIcon },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/dashboard')
  }, [status, session, router])

  if (status !== 'authenticated' || (session?.user as any)?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col min-h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-100">
          <Link href="/admin" className="text-lg font-semibold text-primary">PHA Admin</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? '' : ''}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-400">{session?.user?.email}</div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
