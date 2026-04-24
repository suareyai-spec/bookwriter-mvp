import { NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET() {
  if (!(await requireAdmin())) return forbidden()

  const transactions = await prisma.transaction.findMany({ where: { status: 'paid' } })
  const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthTx = transactions.filter(t => t.createdAt >= startOfMonth)
  const monthRevenue = thisMonthTx.reduce((s, t) => s + t.amount, 0)

  const totalEnrollments = await prisma.enrollment.count()
  const monthEnrollments = await prisma.enrollment.count({ where: { createdAt: { gte: startOfMonth } } })
  const totalCompletions = await prisma.enrollment.count({ where: { status: 'completed' } })
  const completionRate = totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0
  const avgOrderValue = transactions.length > 0 ? totalRevenue / transactions.length : 0

  // Monthly revenue for last 12 months
  const monthlyRevenue = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const amt = transactions.filter(t => t.createdAt >= d && t.createdAt < end).reduce((s, t) => s + t.amount, 0)
    monthlyRevenue.push({ month: d.toLocaleString('default', { month: 'short', year: '2-digit' }), revenue: amt })
  }

  return NextResponse.json({
    totalRevenue, monthRevenue, totalEnrollments, monthEnrollments,
    totalCompletions, completionRate, avgOrderValue, monthlyRevenue
  })
}
