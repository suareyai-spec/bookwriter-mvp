'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-[#ff3b30]/10 text-[#ff3b30]',
  cmo: 'bg-[#af52de]/10 text-[#af52de]',
  analyst: 'bg-[#0071e3]/10 text-[#0071e3]',
  viewer: 'bg-gray-100 text-[#86868b]',
};

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'viewer', password: '' });
  const [saving, setSaving] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then(r => r.json())
      .then(s => setCurrentRole(s?.user?.role || ''));
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users', { credentials: 'include' })
      .then(r => { if (r.status === 401) { window.location.href = '/auth/login?expired=1'; return null; } return r.json(); })
      .then(d => { if (d) { setUsers(d.users || []); setLoading(false); } });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
        credentials: 'include',
      });
      if (res.status === 401) { window.location.href = '/auth/login?expired=1'; return; }
      if (res.ok) { setShowAdd(false); setAddForm({ name: '', email: '', role: 'viewer', password: '' }); fetchUsers(); }
    } catch {} finally { setSaving(false); }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
        credentials: 'include',
      });
      if (res.status === 401) { window.location.href = '/auth/login?expired=1'; return; }
      if (res.ok) { fetchUsers(); setEditingRole(null); }
    } catch {}
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/20 text-[#1d1d1f]";

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">User Management</h1>
          <p className="text-base text-[#86868b] mt-1">{users.length} users in organization</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary">+ Add User</button>
      </div>

      {/* Add User Form */}
      {showAdd && (
        <div className="glass-card p-7 mb-6">
          <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider mb-5">New User</h3>
          <form onSubmit={handleAddUser} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#86868b] mb-2 uppercase tracking-wider font-medium">Name</label>
              <input type="text" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-[#86868b] mb-2 uppercase tracking-wider font-medium">Email</label>
              <input type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-[#86868b] mb-2 uppercase tracking-wider font-medium">Role</label>
              <select value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })} className={inputClass}>
                <option value="viewer">Viewer</option>
                <option value="analyst">Analyst</option>
                <option value="cmo">CMO</option>
                {currentRole === 'admin' && <option value="admin">Admin</option>}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#86868b] mb-2 uppercase tracking-wider font-medium">Password</label>
              <input type="password" value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} required minLength={8} className={inputClass} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Creating...' : 'Create User'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-[#6e6e73] hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Last Login</th><th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="font-medium text-[#1d1d1f]">{u.name || '—'}</td>
                    <td className="font-mono text-xs text-[#424245]">{u.email}</td>
                    <td>
                      {currentRole === 'admin' && editingRole === u.id ? (
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          onBlur={() => setEditingRole(null)}
                          autoFocus
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                        >
                          <option value="viewer">viewer</option>
                          <option value="analyst">analyst</option>
                          <option value="cmo">cmo</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[u.role] || ROLE_COLORS.viewer} ${currentRole === 'admin' ? 'cursor-pointer' : ''}`}
                          onClick={() => currentRole === 'admin' && setEditingRole(u.id)}
                        >
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-[#86868b]">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}</td>
                    <td className="text-xs text-[#86868b]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
