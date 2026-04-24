'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'
import Modal from '@/components/Modal'
import { DollarIcon, ChartIcon, BookIcon, PlusIcon, TagIcon, ExternalLinkIcon } from '@/components/Icons'
import dynamic from 'next/dynamic'

const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

export default function AdminRevenuePage() {
  const { toast } = useToast()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refundModal, setRefundModal] = useState<any>(null)
  const [couponModal, setCouponModal] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/revenue').then(r => r.json()),
      fetch('/api/admin/transactions').then(r => r.json()),
      fetch('/api/admin/coupons').then(r => r.json()),
    ]).then(([s, t, c]) => {
      setStats(s)
      setTransactions(t.transactions || [])
      setCoupons(c)
      setLoading(false)
    })
  }, [])

  const handleRefund = async () => {
    if (!refundModal) return
    await fetch(`/api/admin/transactions/${refundModal.id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: refundModal.amount })
    })
    toast('Refund recorded')
    setRefundModal(null)
    const t = await fetch('/api/admin/transactions').then(r => r.json())
    setTransactions(t.transactions || [])
  }

  const saveCoupon = async (data: any) => {
    if (data.id) {
      await fetch(`/api/admin/coupons/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      toast('Coupon updated')
    } else {
      await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      toast('Coupon created')
    }
    const c = await fetch('/api/admin/coupons').then(r => r.json())
    setCoupons(c)
    setCouponModal(null)
  }

  const deleteCoupon = async (id: string) => {
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    setCoupons(prev => prev.filter(c => c.id !== id))
    toast('Coupon deleted')
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  const tabs = ['overview', 'transactions', 'coupons']

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Revenue</h1>
      </div>

      <div className="flex gap-2 mb-8">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: <DollarIcon className="w-6 h-6" /> },
              { label: 'This Month', value: `$${(stats.monthRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: <ChartIcon className="w-6 h-6" /> },
              { label: 'Enrollments This Month', value: stats.monthEnrollments || 0, icon: <BookIcon className="w-6 h-6" /> },
              { label: 'Avg. Order Value', value: `$${(stats.avgOrderValue || 0).toFixed(2)}`, icon: <DollarIcon className="w-6 h-6" /> },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="mb-2">{c.icon}</div>
                <div className="text-2xl font-semibold">{c.value}</div>
                <div className="text-sm text-gray-500">{c.label}</div>
              </div>
            ))}
          </div>

          {stats.monthlyRevenue && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Revenue (Last 12 Months)</h2>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={stats.monthlyRevenue}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#1B365D" strokeWidth={2} dot={{ fill: '#C5960C' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="text-left p-4 font-medium text-gray-500">Date</th>
                <th className="text-left p-4 font-medium text-gray-500">Student</th>
                <th className="text-left p-4 font-medium text-gray-500">Course</th>
                <th className="text-left p-4 font-medium text-gray-500">Amount</th>
                <th className="text-left p-4 font-medium text-gray-500">Status</th>
                <th className="text-left p-4 font-medium text-gray-500">Stripe ID</th>
                <th className="text-left p-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any) => (
                <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">{t.user?.name || '-'}<br /><span className="text-gray-400 text-xs">{t.user?.email}</span></td>
                  <td className="p-4">{t.course?.title || '-'}</td>
                  <td className="p-4 font-medium">${t.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      t.status === 'paid' ? 'bg-green-50 text-green-600' :
                      t.status === 'refunded' ? 'bg-red-50 text-red-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>{t.status}</span>
                  </td>
                  <td className="p-4">
                    {t.stripePaymentId ? (
                      <a href={`https://dashboard.stripe.com/payments/${t.stripePaymentId}`} target="_blank" rel="noreferrer" className="text-primary text-xs hover:underline flex items-center gap-1">
                        {t.stripePaymentId.slice(0, 12)}... <ExternalLinkIcon className="w-3 h-3" />
                      </a>
                    ) : '-'}
                  </td>
                  <td className="p-4">
                    {t.status === 'paid' && (
                      <button onClick={() => setRefundModal(t)} className="text-xs text-red-600 hover:underline">Refund</button>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'coupons' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setCouponModal({})} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
              <PlusIcon className="w-4 h-4" /> Create Coupon
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-500">Code</th>
                  <th className="text-left p-4 font-medium text-gray-500">Discount</th>
                  <th className="text-left p-4 font-medium text-gray-500">Uses</th>
                  <th className="text-left p-4 font-medium text-gray-500">Expires</th>
                  <th className="text-left p-4 font-medium text-gray-500">Status</th>
                  <th className="text-left p-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c: any) => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4 font-mono font-medium">{c.code}</td>
                    <td className="p-4">{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}</td>
                    <td className="p-4">{c.currentUses}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                    <td className="p-4 text-gray-400">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => setCouponModal(c)} className="text-xs text-primary hover:underline">Edit</button>
                      <button onClick={() => deleteCoupon(c.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Refund Modal */}
      <Modal open={refundModal !== null} onClose={() => setRefundModal(null)} title="Issue Refund">
        {refundModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Refund ${refundModal.amount?.toFixed(2)} to {refundModal.user?.name}?</p>
            <p className="text-xs text-gray-400">This will record the refund locally. Actual Stripe refund processing will be connected later.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRefundModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleRefund} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Confirm Refund</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Coupon Modal */}
      <Modal open={couponModal !== null} onClose={() => setCouponModal(null)} title={couponModal?.id ? 'Edit Coupon' : 'Create Coupon'}>
        {couponModal !== null && <CouponForm data={couponModal} onSave={saveCoupon} />}
      </Modal>
    </>
  )
}

function CouponForm({ data, onSave }: { data: any; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    id: data.id || '',
    code: data.code || '',
    discountType: data.discountType || 'percentage',
    discountValue: data.discountValue || '',
    maxUses: data.maxUses || '',
    expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString().split('T')[0] : '',
    isActive: data.isActive ?? true,
  })
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
        <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" placeholder="WELCOME20" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed ($)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
          <input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (blank = unlimited)</label>
          <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expires</label>
          <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-primary" />
        <label className="text-sm text-gray-700">Active</label>
      </div>
      <div className="flex justify-end">
        <button onClick={() => onSave(form)} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Save Coupon</button>
      </div>
    </div>
  )
}
