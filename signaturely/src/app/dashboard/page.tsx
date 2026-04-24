'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { SignaturePreview } from '@/components/SignaturePreview';
import { defaultSignatureData, SignatureData } from '@/lib/types';

interface Sig {
  id: string;
  name: string;
  template: string;
  data: string;
  isDefault: boolean;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [signatures, setSignatures] = useState<Sig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated') {
      fetch('/api/signatures').then(r => r.json()).then(d => { setSignatures(d); setLoading(false); });
    }
  }, [status, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this signature?')) return;
    await fetch(`/api/signatures/${id}`, { method: 'DELETE' });
    setSignatures(prev => prev.filter(s => s.id !== id));
    toast.success('Deleted');
  };

  const handleDuplicate = async (sig: Sig) => {
    const res = await fetch('/api/signatures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `${sig.name} (Copy)`, template: sig.template, data: sig.data }),
    });
    if (res.ok) {
      const newSig = await res.json();
      setSignatures(prev => [newSig, ...prev]);
      toast.success('Duplicated!');
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed');
    }
  };

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/signatures/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    });
    setSignatures(prev => prev.map(s => ({ ...s, isDefault: s.id === id })));
    toast.success('Set as default');
  };

  const parseData = (dataStr: string): SignatureData => {
    try { return JSON.parse(dataStr); } catch { return defaultSignatureData; }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Signatures</h1>
            <p className="text-sm text-gray-500 mt-1">
              {signatures.length} signature{signatures.length !== 1 ? 's' : ''} &middot; {(session?.user as any)?.plan === 'free' ? 'Free plan' : 'Pro plan'}
            </p>
          </div>
          <Link href="/builder" className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition">
            New Signature
          </Link>
        </div>

        {signatures.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No signatures yet</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first professional email signature.</p>
            <Link href="/builder" className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition">
              Create Signature
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {signatures.map(sig => {
              const sigData = parseData(sig.data);
              return (
                <div key={sig.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5 bg-gray-50 border-b border-gray-100 overflow-auto">
                    <SignaturePreview data={sigData} showBranding={false} />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{sig.name}</h3>
                        <p className="text-xs text-gray-500">Template: {sig.template} {sig.isDefault && <span className="text-indigo-500 font-medium ml-1">Default</span>}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/builder?edit=${sig.id}`} className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">Edit</Link>
                      <button onClick={() => handleDuplicate(sig)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition">Duplicate</button>
                      {!sig.isDefault && (
                        <button onClick={() => handleSetDefault(sig.id)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition">Set Default</button>
                      )}
                      <button onClick={() => handleDelete(sig.id)} className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition ml-auto">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
