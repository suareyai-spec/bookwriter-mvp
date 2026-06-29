'use client';
import { useState, useEffect } from 'react';

interface Conversion {
  id: string;
  userEmail: string | null;
  plan: string | null;
  amountUsd: number;
  commissionUsd: number;
  createdAt: string;
}

interface AffiliateRow {
  id: string;
  code: string;
  ownerName: string;
  ownerEmail: string;
  commissionPercent: number;
  totalClicks: number;
  totalConversions: number;
  totalEarned: number;
  payoutStatus: string;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  conversions: Conversion[];
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ code: '', ownerName: '', ownerEmail: '', commissionPercent: 20 });
  const [saving, setSaving] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/affiliates');
    const data = await res.json();
    setAffiliates(data.affiliates || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const patch = async (id: string, data: Record<string, unknown>) => {
    setSaving(id);
    await fetch(`/api/admin/affiliates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await load();
    setSaving(null);
  };

  const addAffiliate = async () => {
    setSaving('new');
    await fetch('/api/admin/affiliates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    });
    setNewForm({ code: '', ownerName: '', ownerEmail: '', commissionPercent: 20 });
    setShowAdd(false);
    await load();
    setSaving(null);
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`https://plotghost.ai?ref=${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalClicksAll = affiliates.reduce((s, a) => s + a.totalClicks, 0);
  const totalConvAll = affiliates.reduce((s, a) => s + a.totalConversions, 0);
  const totalOwed = affiliates
    .filter(a => a.payoutStatus === 'unpaid')
    .reduce((s, a) => s + a.totalEarned, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Affiliates</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Add Affiliate
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Affiliates', value: affiliates.length },
          { label: 'Total Clicks', value: totalClicksAll.toLocaleString() },
          { label: 'Total Conversions', value: totalConvAll.toLocaleString() },
          { label: 'Commissions Owed', value: `$${totalOwed.toFixed(2)}` },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-3 text-white">New Affiliate</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input
              placeholder="code (e.g. john)"
              value={newForm.code}
              onChange={e => setNewForm(p => ({ ...p, code: e.target.value }))}
              className="bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
            />
            <input
              placeholder="Name"
              value={newForm.ownerName}
              onChange={e => setNewForm(p => ({ ...p, ownerName: e.target.value }))}
              className="bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
            />
            <input
              placeholder="Email"
              value={newForm.ownerEmail}
              onChange={e => setNewForm(p => ({ ...p, ownerEmail: e.target.value }))}
              className="bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Commission %"
                value={newForm.commissionPercent}
                onChange={e => setNewForm(p => ({ ...p, commissionPercent: parseInt(e.target.value) || 20 }))}
                className="bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 w-24"
              />
              <button
                onClick={addAffiliate}
                disabled={saving === 'new'}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {saving === 'new' ? '...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Affiliates table */}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : affiliates.length === 0 ? (
        <p className="text-gray-500">No affiliates yet.</p>
      ) : (
        <div className="space-y-2">
          {affiliates.map(aff => (
            <div key={aff.id} className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(expanded === aff.id ? null : aff.id)}
              >
                {/* Code + copy */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <span className="font-mono text-blue-400 font-semibold text-sm">{aff.code}</span>
                  <button
                    onClick={e => { e.stopPropagation(); copyLink(aff.code); }}
                    className="text-xs text-gray-400 hover:text-white px-1.5 py-0.5 bg-white/[0.06] rounded transition-colors"
                  >
                    {copied === aff.code ? '✓' : 'copy'}
                  </button>
                </div>
                {/* Name/Email */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{aff.ownerName}</p>
                  <p className="text-xs text-gray-500 truncate">{aff.ownerEmail}</p>
                </div>
                {/* Commission */}
                <div className="text-center w-16 hidden sm:block">
                  <p className="text-sm text-white">{aff.commissionPercent}%</p>
                  <p className="text-xs text-gray-500">comm.</p>
                </div>
                {/* Stats */}
                <div className="text-center w-16 hidden sm:block">
                  <p className="text-sm text-white">{aff.totalClicks}</p>
                  <p className="text-xs text-gray-500">clicks</p>
                </div>
                <div className="text-center w-16 hidden sm:block">
                  <p className="text-sm text-white">{aff.totalConversions}</p>
                  <p className="text-xs text-gray-500">conv.</p>
                </div>
                <div className="text-center w-20">
                  <p className="text-sm font-medium text-green-400">${aff.totalEarned.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">earned</p>
                </div>
                {/* Payout status */}
                <select
                  value={aff.payoutStatus}
                  onClick={e => e.stopPropagation()}
                  onChange={e => patch(aff.id, { payoutStatus: e.target.value })}
                  className={`text-xs px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${
                    aff.payoutStatus === 'paid'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
                {/* Active toggle */}
                <button
                  onClick={e => { e.stopPropagation(); patch(aff.id, { isActive: !aff.isActive }); }}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    aff.isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {saving === aff.id ? '...' : aff.isActive ? 'Active' : 'Inactive'}
                </button>
                <span className="text-gray-600 text-xs">{expanded === aff.id ? '▲' : '▼'}</span>
              </div>

              {/* Expanded conversions */}
              {expanded === aff.id && (
                <div className="border-t border-white/[0.06] px-4 py-3 bg-white/[0.02]">
                  <div className="flex items-center gap-4 mb-3">
                    <p className="text-xs text-gray-400">
                      Affiliate link:{' '}
                      <span className="text-blue-400 font-mono">https://plotghost.ai?ref={aff.code}</span>
                    </p>
                    <div className="flex items-center gap-2 ml-auto">
                      <label className="text-xs text-gray-400">Commission %</label>
                      <input
                        type="number"
                        defaultValue={aff.commissionPercent}
                        min={1}
                        max={100}
                        onBlur={e => patch(aff.id, { commissionPercent: parseInt(e.target.value) })}
                        className="bg-white/[0.06] border border-white/[0.10] rounded px-2 py-1 text-xs text-white w-14 outline-none"
                      />
                    </div>
                  </div>
                  {aff.conversions.length === 0 ? (
                    <p className="text-xs text-gray-600">No conversions yet.</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="text-left pb-1">Date</th>
                          <th className="text-left pb-1">Email</th>
                          <th className="text-left pb-1">Plan</th>
                          <th className="text-right pb-1">Amount</th>
                          <th className="text-right pb-1">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aff.conversions.map(c => (
                          <tr key={c.id} className="border-t border-white/[0.04]">
                            <td className="py-1 text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td className="py-1 text-gray-300">{c.userEmail || '—'}</td>
                            <td className="py-1 text-gray-300">{c.plan || '—'}</td>
                            <td className="py-1 text-right text-white">${c.amountUsd.toFixed(2)}</td>
                            <td className="py-1 text-right text-green-400">${c.commissionUsd.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
