'use client';
import { useState } from 'react';

export default function AffiliatePage() {
  const [form, setForm] = useState({ name: '', email: '', code: '', website: '', audience: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [assignedCode, setAssignedCode] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/affiliate/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setAssignedCode(data.code);
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">Application Received!</h1>
          <p className="text-gray-400 mb-6">
            We&apos;ll review your application and activate your affiliate link within 24–48 hours.
            You&apos;ll receive an email at {form.email} once you&apos;re approved.
          </p>
          <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-400 mb-1">Your future affiliate link</p>
            <p className="font-mono text-blue-400 text-sm break-all">https://plotghost.ai?ref={assignedCode}</p>
          </div>
          <p className="text-xs text-gray-600">Save this link — it&apos;ll be active once approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-6">
            <span>💸</span>
            <span>Earn 20% per referral</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Become a{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PlotGhost Partner
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Share PlotGhost with your audience and earn 20% commission on every subscription you drive.
            No cap, no expiry.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: '🔗', title: 'Get your link', desc: 'A unique URL just for you' },
            { icon: '📣', title: 'Share it', desc: 'With your audience anywhere' },
            { icon: '💰', title: 'Earn 20%', desc: 'On every paid conversion' },
          ].map(s => (
            <div key={s.title} className="text-center bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="font-semibold text-sm mb-1">{s.title}</p>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Sign-up form */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-6">Apply to Partner</h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Your Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500/50 text-white placeholder-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email Address *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500/50 text-white placeholder-gray-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Preferred Code (optional)</label>
                <div className="flex items-center gap-0">
                  <span className="bg-white/[0.04] border border-r-0 border-white/[0.10] rounded-l-lg px-3 py-2.5 text-xs text-gray-500">?ref=</span>
                  <input
                    value={form.code}
                    onChange={e => setForm(p => ({ ...p, code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
                    placeholder="yourname"
                    className="flex-1 bg-white/[0.06] border border-white/[0.10] rounded-r-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500/50 text-white placeholder-gray-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Website / Social (optional)</label>
                <input
                  value={form.website}
                  onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://yoursite.com"
                  className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500/50 text-white placeholder-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Tell us about your audience (optional)</label>
              <textarea
                value={form.audience}
                onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}
                placeholder="E.g. 50k YouTube subscribers interested in self-publishing and writing..."
                rows={3}
                className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500/50 resize-none text-white placeholder-gray-600"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Apply to Partner Program →'}
            </button>
            <p className="text-center text-xs text-gray-600">
              Applications reviewed within 24–48 hours. No spam, ever.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
