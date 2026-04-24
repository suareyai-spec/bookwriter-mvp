'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DollarIcon, BookIcon, CheckIcon, ChartIcon, UsersIcon, PlusIcon, TagIcon, SendIcon } from '@/components/Icons'

// Dynamically import Recharts to avoid SSR issues
import dynamic from 'next/dynamic'
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/revenue').then(r => r.json()),
      fetch('/api/admin/students?limit=10&sortBy=createdAt&sortDir=desc').then(r => r.json()),
    ]).then(([rev, stu]) => {
      setStats(rev)
      setRecentEnrollments(stu.students || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-gray-400">Loading...</div>

  const cards = [
    { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: <DollarIcon className="w-6 h-6" />, color: 'text-primary' },
    { label: 'This Month', value: `$${(stats?.monthRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: <ChartIcon className="w-6 h-6" />, color: 'text-accent' },
    { label: 'Enrollments This Month', value: stats?.monthEnrollments || 0, icon: <BookIcon className="w-6 h-6" />, color: 'text-blue-500' },
    { label: 'Avg. Order Value', value: `$${(stats?.avgOrderValue || 0).toFixed(2)}`, icon: <DollarIcon className="w-6 h-6" />, color: 'text-green-600' },
  ]

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/students?action=enroll" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
            <PlusIcon className="w-4 h-4" /> Add Student
          </Link>
          <Link href="/admin/revenue?tab=coupons&action=create" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <TagIcon className="w-4 h-4" /> Create Coupon
          </Link>
          <Link href="/admin/emails?action=broadcast" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <SendIcon className="w-4 h-4" /> Send Announcement
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="mb-2">{c.icon}</div>
            <div className="text-2xl font-semibold">{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {stats?.monthlyRevenue && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
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

      {/* Recent Enrollments */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-semibold">Recent Students</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">Name</th>
              <th className="text-left p-4 font-medium text-gray-500">Email</th>
              <th className="text-left p-4 font-medium text-gray-500">Enrollments</th>
              <th className="text-left p-4 font-medium text-gray-500">Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentEnrollments.map((s: any) => (
              <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="p-4 font-medium">
                  <Link href={`/admin/students/${s.id}`} className="text-primary hover:underline">{s.name}</Link>
                </td>
                <td className="p-4 text-gray-500">{s.email}</td>
                <td className="p-4">{s._count?.enrollments || s.enrollments?.length || 0}</td>
                <td className="p-4 text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
