import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden()
  const url = new URL(req.url)
  const search = url.searchParams.get('search') || ''
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = 20

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  // Enrich with user and course data
  const userIds = Array.from(new Set(transactions.map(t => t.userId)))
  const courseIds = Array.from(new Set(transactions.map(t => t.courseId)))
  const [users, courses] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } }),
    prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, title: true } }),
  ])

  const enriched = transactions.map(t => ({
    ...t,
    user: users.find(u => u.id === t.userId),
    course: courses.find(c => c.id === t.courseId),
  }))

  let filtered = enriched
  if (search) {
    const s = search.toLowerCase()
    filtered = enriched.filter(t =>
      t.user?.name?.toLowerCase().includes(s) ||
      t.user?.email?.toLowerCase().includes(s) ||
      t.stripePaymentId?.toLowerCase().includes(s)
    )
  }

  const total = await prisma.transaction.count()
  return NextResponse.json({ transactions: filtered, total, page, limit, totalPages: Math.ceil(total / limit) })
}
