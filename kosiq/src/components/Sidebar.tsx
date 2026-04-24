'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getProductFromPath, Product, ProductNav } from '@/lib/products';
import ProductSwitcher from './ProductSwitcher';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  const product = getProductFromPath(pathname);
  const accent = product.accent;

  useEffect(() => {
    product.nav.forEach(n => {
      if (n.children && (pathname === n.href || pathname.startsWith(n.href + '/'))) {
        setExpanded(prev => ({ ...prev, [n.href]: true }));
      }
    });
  }, [pathname, product]);

  const filteredNav = search
    ? product.nav.filter(n =>
        n.label.toLowerCase().includes(search.toLowerCase()) ||
        n.children?.some(c => c.label.toLowerCase().includes(search.toLowerCase()))
      )
    : product.nav;

  const toggleExpand = (href: string) => {
    setExpanded(prev => ({ ...prev, [href]: !prev[href] }));
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white/80 backdrop-blur-xl border-r border-gray-200/60 flex flex-col z-50">
      {/* Product Switcher */}
      <div className="p-3 border-b border-gray-100">
        <ProductSwitcher current={product} />
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#f5f5f7] rounded-lg border-none outline-none text-[#1d1d1f] placeholder:text-[#86868b] focus:ring-1 focus:ring-[#0071e3]/30"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {filteredNav.map(n => {
          const active = pathname === n.href || (n.children ? pathname.startsWith(n.href + '/') : pathname.startsWith(n.href + '/'));
          const hasChildren = n.children && n.children.length > 0;
          const isExpanded = expanded[n.href];

          return (
            <div key={n.href}>
              <div className="flex items-center">
                <Link
                  href={hasChildren ? '#' : n.href}
                  onClick={hasChildren ? (e) => { e.preventDefault(); toggleExpand(n.href); } : undefined}
                  className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    active
                      ? 'font-medium'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-gray-50'
                  }`}
                  style={active ? { backgroundColor: accent + '15', color: accent } : undefined}
                >
                  <span className="text-[10px] font-bold w-5 text-center tracking-tight">{n.icon}</span>
                  <span className="flex-1">{n.label}</span>
                  {hasChildren && (
                    <span className={`text-[10px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
                  )}
                </Link>
              </div>
              {hasChildren && isExpanded && (
                <div className="ml-8 mt-0.5 space-y-0.5">
                  {n.children!.map(child => {
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-1.5 rounded-md text-xs transition-all ${
                          childActive
                            ? 'font-medium'
                            : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-gray-50'
                        }`}
                        style={childActive ? { color: accent, backgroundColor: accent + '08' } : undefined}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Patient 360 Link */}
      <div className="px-3 pb-2">
        <Link
          href="/patient360/search"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            pathname.startsWith('/patient360')
              ? 'text-white shadow-sm'
              : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-gray-50'
          }`}
          style={pathname.startsWith('/patient360') ? { backgroundColor: '#0071e3' } : {}}
        >
          <span className="text-sm">🔍</span>
          Patient 360°
        </Link>
      </div>

      {/* Logo + User section */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2 px-2 mb-3">
          <img src="/logo.svg" alt="KOSIQ" className="h-5" />
        </div>
        <div className="px-2 py-1 mb-1">
          <p className="text-xs font-medium text-[#1d1d1f] truncate">{session?.user?.name || 'User'}</p>
          <p className="text-[10px] text-[#86868b] truncate">{session?.user?.email}</p>
        </div>
        <div className="flex gap-1">
          <Link href="/settings"
            className="flex-1 text-center text-xs text-[#6e6e73] hover:text-[#1d1d1f] px-2 py-1.5 transition-colors rounded-lg hover:bg-gray-50">
            Settings
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="flex-1 text-center text-xs text-[#6e6e73] hover:text-[#1d1d1f] px-2 py-1.5 transition-colors rounded-lg hover:bg-gray-50">
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
