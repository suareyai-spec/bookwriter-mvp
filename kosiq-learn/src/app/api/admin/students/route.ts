import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden()
  const url = new URL(req.url)
  const search = url.searchParams.get('search') || ''
  const status = url.searchParams.get('status') || ''
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const sortBy = url.searchParams.get('sortBy') || 'createdAt'
  const sortDir = url.searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc'

  const where: any = { role: 'student' }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ]
  }

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortDir },
      include: {
        enrollments: {
          include: { course: { select: { title: true } } }
        },
        _count: { select: { enrollments: true, certificates: true } }
      }
    }),
    prisma.user.count({ where })
  ])

  // Filter by enrollment status if provided
  let filtered = students
  if (status === 'active') {
    filtered = students.filter(s => s.enrollments.some(e => e.status === 'active'))
  } else if (status === 'completed') {
    filtered = students.filter(s => s.enrollments.some(e => e.status === 'completed'))
  }

  return NextResponse.json({ students: filtered, total, page, limit, totalPages: Math.ceil(total / limit) })
}
