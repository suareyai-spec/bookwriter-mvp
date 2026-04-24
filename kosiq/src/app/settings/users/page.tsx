'use client';
import { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings/users').then(r => {
      if (!r.ok) throw new Error('Forbidden');
      return r.json();
    }).then(setUsers).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071e3]" /></div>;
  if (error) return <div className="max-w-3xl mx-auto py-20 text-center text-red-500">{error === 'Forbidden' ? 'Access denied. Superadmin only.' : error}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#1d1d1f]">All Users</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Email', 'Name', 'System Role', 'Organization', 'Org Role', 'Product Access', 'Last Login'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => {
              const membership = u.orgMemberships?.[0];
              let productNames: string[] = [];
              if (u.systemRole === 'superadmin') {
                productNames = ['All Products'];
              } else if (membership?.productAccess) {
                try { productNames = JSON.parse(membership.productAccess); } catch {}
              }
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.systemRole === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.systemRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.organization?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{membership?.role || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {productNames.map(p => (
                        <span key={p} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
