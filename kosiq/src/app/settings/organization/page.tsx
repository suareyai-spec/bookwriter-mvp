'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { products } from '@/lib/products';

const BUNDLES: Record<string, { label: string; products: string[] }> = {
  provider: { label: 'Provider Bundle', products: ['pophealth', 'chartiq', 'quality', 'care-management', 'rpm', 'cliniq', 'behavioral-health'] },
  payer: { label: 'Payer Bundle', products: ['risk-engine', 'cost-explorer', 'payer-analytics', 'pophealth', 'bridgeiq'] },
  enterprise: { label: 'Enterprise Bundle', products: products.map(p => p.id) },
};

interface Member {
  id: string;
  role: string;
  productAccess: string;
  user: { id: string; email: string; name: string | null; systemRole: string };
}

export default function OrganizationPage() {
  const { data: session } = useSession();
  const [org, setOrg] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteProducts, setInviteProducts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Create org state
  const [createMode, setCreateMode] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState<string>('provider');

  const load = async () => {
    const res = await fetch('/api/settings/organization');
    const data = await res.json();
    setOrg(data.org);
    setMembers(data.members || []);
    setLoading(false);
    if (!data.org) setCreateMode(true);
  };

  useEffect(() => { load(); }, []);

  const flash = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const createOrg = async () => {
    if (!newOrgName.trim()) return;
    setSaving(true);
    const bundleProducts = BUNDLES[newOrgType]?.products || [];
    const res = await fetch('/api/settings/organization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create-org', orgName: newOrgName, orgType: newOrgType, productAccess: bundleProducts }),
    });
    if (res.ok) { flash('Organization created!'); setCreateMode(false); load(); }
    setSaving(false);
  };

  const invite = async () => {
    if (!inviteEmail.trim()) return;
    setSaving(true);
    const res = await fetch('/api/settings/organization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'invite', email: inviteEmail, role: inviteRole, productAccess: inviteProducts }),
    });
    const data = await res.json();
    if (res.ok) { flash('Member invited!'); setInviteEmail(''); setInviteProducts([]); load(); }
    else flash(data.error || 'Failed to invite');
    setSaving(false);
  };

  const updateMember = async (memberId: string, role?: string, productAccess?: string[]) => {
    await fetch('/api/settings/organization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-member', memberId, role, productAccess }),
    });
    load();
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Remove this member?')) return;
    await fetch('/api/settings/organization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', memberId }),
    });
    flash('Member removed');
    load();
  };

  const toggleProduct = (memberId: string, currentAccess: string, productId: string) => {
    const current = JSON.parse(currentAccess || '[]') as string[];
    const updated = current.includes(productId) ? current.filter(p => p !== productId) : [...current, productId];
    updateMember(memberId, undefined, updated);
  };

  const toggleInviteProduct = (productId: string) => {
    setInviteProducts(prev => prev.includes(productId) ? prev.filter(p => p !== productId) : [...prev, productId]);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071e3]" /></div>;

  if (createMode && !org) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Create Organization</h1>
        {message && <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">{message}</div>}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input value={newOrgName} onChange={e => setNewOrgName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. South Florida Health Partners" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(BUNDLES).map(([key, bundle]) => (
                <button key={key} onClick={() => setNewOrgType(key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${newOrgType === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="font-semibold text-sm capitalize">{key}</div>
                  <div className="text-xs text-gray-500 mt-1">{bundle.products.length} products</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Included Products</label>
            <div className="flex flex-wrap gap-2">
              {products.map(p => {
                const included = BUNDLES[newOrgType]?.products.includes(p.id);
                return (
                  <span key={p.id} className={`px-3 py-1 rounded-full text-xs font-medium ${included ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                    {p.icon} {p.name}
                  </span>
                );
              })}
            </div>
          </div>
          <button onClick={createOrg} disabled={saving || !newOrgName.trim()}
            className="px-6 py-2.5 bg-[#0071e3] text-white rounded-lg text-sm font-medium hover:bg-[#0077ED] disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#1d1d1f]">Organization Settings</h1>
      {message && <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">{message}</div>}

      {/* Org Details */}
      {org && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Organization Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-xs text-gray-500">Name</span><p className="font-medium">{org.name}</p></div>
            <div><span className="text-xs text-gray-500">Type</span><p className="font-medium capitalize">{org.type || 'N/A'}</p></div>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Members ({members.length})</h2>
        <div className="space-y-4">
          {members.map(m => {
            const access = JSON.parse(m.productAccess || '[]') as string[];
            const isSuperadmin = m.user.systemRole === 'superadmin';
            return (
              <div key={m.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-medium text-[#1d1d1f]">{m.user.name || m.user.email}</span>
                    <span className="text-xs text-gray-500 ml-2">{m.user.email}</span>
                    {isSuperadmin && <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Superadmin</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={m.role} onChange={e => updateMember(m.id, e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none">
                      {['owner', 'admin', 'member', 'viewer'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button onClick={() => removeMember(m.id)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                  </div>
                </div>
                {!isSuperadmin && (
                  <div className="flex flex-wrap gap-2">
                    {products.map(p => (
                      <button key={p.id} onClick={() => toggleProduct(m.id, m.productAccess, p.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${access.includes(p.id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                        {p.icon} {p.name}
                      </button>
                    ))}
                  </div>
                )}
                {isSuperadmin && <p className="text-xs text-purple-500">Full access to all products</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Invite Member</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none">
              {['owner', 'admin', 'member', 'viewer'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Product Access</label>
            <div className="flex flex-wrap gap-2">
              {products.map(p => (
                <button key={p.id} onClick={() => toggleInviteProduct(p.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${inviteProducts.includes(p.id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
          </div>
          <button onClick={invite} disabled={saving || !inviteEmail.trim()}
            className="px-6 py-2 bg-[#0071e3] text-white rounded-lg text-sm font-medium hover:bg-[#0077ED] disabled:opacity-50">
            {saving ? 'Inviting...' : 'Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
