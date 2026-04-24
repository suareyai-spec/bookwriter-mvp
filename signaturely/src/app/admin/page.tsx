'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Stats {
  totalUsers: number;
  totalSignatures: number;
  proUsers: number;
  recentUsers: { id: string; name: string | null; email: string; plan: string; createdAt: string }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated') {
      if (!(session?.user as any)?.isAdmin) { router.push('/dashboard'); return; }
      fetch('/api/admin/stats').then(r => r.json()).then(setStats);
    }
  }, [status, session, router]);

  if (!stats) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Signatures Created', value: stats.totalSignatures, color: 'bg-violet-50 text-violet-600' },
    { label: 'Pro Subscribers', value: stats.proUsers, color: 'bg-green-50 text-green-600' },
    { label: 'Est. MRR', value: `$${stats.proUsers * 5}`, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {cards.map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">{c.label}</div>
              <div className={`text-2xl font-bold ${c.color.split(' ')[1]}`}>{c.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Users</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentUsers.map(u => (
                <tr key={u.id} className="text-sm">
                  <td className="px-5 py-3 text-gray-900">{u.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${u.plan === 'pro' ? 'bg-indigo-50 text-indigo-600' : u.plan === 'teams' ? 'bg-violet-50 text-violet-600' : 'bg-gray-100 text-gray-600'}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
