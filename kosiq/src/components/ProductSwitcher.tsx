'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { products, Product } from '@/lib/products';

const SUPERADMIN_EMAILS = ['suarey@gmail.com', 'suareyai@gmail.com'];

export default function ProductSwitcher({ current, accessibleProducts }: { current: Product; accessibleProducts?: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const isSuperadmin = session?.user?.email && SUPERADMIN_EMAILS.includes(session.user.email);
  const filteredProducts = isSuperadmin || !accessibleProducts
    ? products
    : products.filter(p => accessibleProducts.includes(p.id));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (p: Product) => {
    setOpen(false);
    if (p.external) {
      window.open(p.external, '_blank');
      return;
    }
    if (p.id === 'pophealth') {
      router.push('/dashboard');
    } else {
      router.push('/' + p.id);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
      >
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
          style={{ backgroundColor: current.accent + '18' }}
        >
          {current.icon}
        </span>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-semibold text-[#1d1d1f] truncate">{current.name}</div>
          <div className="text-[10px] text-[#86868b] truncate">{current.description}</div>
        </div>
        <svg className={`w-4 h-4 text-[#86868b] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200/60 overflow-hidden z-[100] max-h-[70vh] overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-100">
            <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Products</span>
          </div>
          {filteredProducts.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                p.id === current.id ? 'bg-gray-50' : ''
              }`}
            >
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0"
                style={{ backgroundColor: p.accent + '18' }}
              >
                {p.icon}
              </span>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-[#1d1d1f] truncate flex items-center gap-1.5">
                  {p.name}
                  {p.external && <span className="text-[10px] text-[#86868b]">↗</span>}
                </div>
                <div className="text-[10px] text-[#86868b] truncate">{p.description}</div>
              </div>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.accent }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
