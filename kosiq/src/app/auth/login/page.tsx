'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError('Invalid credentials');
    else router.push('/dashboard');
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/10 transition-all text-[#1d1d1f] placeholder-[#86868b]";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f5f5f7]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.svg" alt="KOSIQ" width={140} height={32} className="h-8 w-auto" />
          </Link>
          <p className="text-[11px] text-[#86868b] tracking-widest uppercase font-medium mb-4">AI Medical Economics Platform</p>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Welcome back</h1>
          <p className="text-sm text-[#86868b] mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          {error && <div className="text-[#ff3b30] text-sm text-center bg-[#ff3b30]/5 rounded-xl p-3 font-medium">{error}</div>}
          <div>
            <label className="block text-xs text-[#86868b] mb-2 uppercase tracking-wider font-medium">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-2 uppercase tracking-wider font-medium">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-[#86868b]">
            Don&apos;t have an account? <Link href="/auth/signup" className="text-[#0071e3] hover:underline font-medium">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
