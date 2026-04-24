"use client";

import { useEffect, useState } from "react";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", percentOff: "", amountOff: "", duration: "once",
    durationInMonths: "", maxRedemptions: "", redeemBy: "", code: "",
  });

  const fetchCoupons = () => {
    setLoading(true);
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => {
        setCoupons(d.coupons || []);
        setPromoCodes(d.promoCodes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const createCoupon = async () => {
    setCreating(true);
    const body: any = { name: form.name, duration: form.duration };
    if (form.percentOff) body.percentOff = parseFloat(form.percentOff);
    if (form.amountOff) body.amountOff = parseFloat(form.amountOff);
    if (form.durationInMonths) body.durationInMonths = parseInt(form.durationInMonths);
    if (form.maxRedemptions) body.maxRedemptions = parseInt(form.maxRedemptions);
    if (form.redeemBy) body.redeemBy = form.redeemBy;
    if (form.code) body.code = form.code;

    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setCreating(false);
    setShowForm(false);
    setForm({ name: "", percentOff: "", amountOff: "", duration: "once", durationInMonths: "", maxRedemptions: "", redeemBy: "", code: "" });
    fetchCoupons();
  };

  const deactivate = async (couponId: string, promoCodeId?: string) => {
    if (!confirm("Deactivate this coupon?")) return;
    await fetch("/api/admin/coupons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponId, promoCodeId }),
    });
    fetchCoupons();
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); };

  const inputClass = "bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 w-full";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg px-4 py-2 text-sm hover:bg-blue-500/20 transition-colors">
          {showForm ? "Cancel" : "Create Coupon"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold">New Coupon</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-500 text-xs block mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Summer Sale" />
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">Promo Code (optional)</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className={inputClass} placeholder="SUMMER2025" />
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">Percent Off</label>
              <input type="number" value={form.percentOff} onChange={(e) => setForm({ ...form, percentOff: e.target.value, amountOff: "" })} className={inputClass} placeholder="25" />
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">Amount Off ($)</label>
              <input type="number" value={form.amountOff} onChange={(e) => setForm({ ...form, amountOff: e.target.value, percentOff: "" })} className={inputClass} placeholder="50" />
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">Duration</label>
              <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass}>
                <option value="once">Once</option>
                <option value="repeating">Repeating</option>
                <option value="forever">Forever</option>
              </select>
            </div>
            {form.duration === "repeating" && (
              <div>
                <label className="text-gray-500 text-xs block mb-1">Duration (months)</label>
                <input type="number" value={form.durationInMonths} onChange={(e) => setForm({ ...form, durationInMonths: e.target.value })} className={inputClass} placeholder="3" />
              </div>
            )}
            <div>
              <label className="text-gray-500 text-xs block mb-1">Max Redemptions</label>
              <input type="number" value={form.maxRedemptions} onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })} className={inputClass} placeholder="100" />
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">Expires</label>
              <input type="date" value={form.redeemBy} onChange={(e) => setForm({ ...form, redeemBy: e.target.value })} className={inputClass} />
            </div>
          </div>
          <button onClick={createCoupon} disabled={creating || !form.name || (!form.percentOff && !form.amountOff)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50 transition-colors">
            {creating ? "Creating..." : "Create Coupon"}
          </button>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Discount</th>
                  <th className="text-left p-3">Duration</th>
                  <th className="text-left p-3">Redeemed</th>
                  <th className="text-left p-3">Expires</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-3 text-white">{c.name || c.id}</td>
                    <td className="p-3 text-green-400">{c.percentOff ? `${c.percentOff}%` : `$${c.amountOff}`}</td>
                    <td className="p-3 text-gray-400">{c.duration}{c.durationInMonths ? ` (${c.durationInMonths}mo)` : ""}</td>
                    <td className="p-3 text-gray-400">{c.timesRedeemed}{c.maxRedemptions ? `/${c.maxRedemptions}` : ""}</td>
                    <td className="p-3 text-gray-500 text-xs">{c.redeemBy ? new Date(c.redeemBy).toLocaleDateString() : "Never"}</td>
                    <td className="p-3"><span className={`text-xs ${c.valid ? "text-green-400" : "text-red-400"}`}>{c.valid ? "Active" : "Inactive"}</span></td>
                    <td className="p-3 flex gap-2">
                      {c.valid && (
                        <button onClick={() => deactivate(c.id)} className="text-xs text-red-400 hover:text-red-300">Deactivate</button>
                      )}
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500">No coupons found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Promo Codes */}
      {promoCodes.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]"><h3 className="text-white font-semibold">Promotion Codes</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Code</th>
                  <th className="text-left p-3">Redeemed</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.04]">
                    <td className="p-3 text-white font-mono">{p.code}</td>
                    <td className="p-3 text-gray-400">{p.timesRedeemed}{p.maxRedemptions ? `/${p.maxRedemptions}` : ""}</td>
                    <td className="p-3"><span className={`text-xs ${p.active ? "text-green-400" : "text-red-400"}`}>{p.active ? "Active" : "Inactive"}</span></td>
                    <td className="p-3">
                      <button onClick={() => copyCode(p.code)} className="text-xs text-blue-400 hover:text-blue-300 mr-2">Copy</button>
                      {p.active && <button onClick={() => deactivate(p.couponId, p.id)} className="text-xs text-red-400 hover:text-red-300">Deactivate</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
