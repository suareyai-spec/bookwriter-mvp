'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Logo } from './Logo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/patients', label: 'Patients', icon: '🏥' },
  { href: '/handoff', label: 'Handoff', icon: '🔄' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-200 shrink-0`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && <Logo size="sm" />}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-gray-600 text-sm">
          {collapsed ? '→' : '←'}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        {!collapsed && session?.user && (
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{(session.user as any).role}</p>
          </div>
        )}
        <button onClick={() => signOut({ callbackUrl: '/' })} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
          {collapsed ? '🚪' : 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
