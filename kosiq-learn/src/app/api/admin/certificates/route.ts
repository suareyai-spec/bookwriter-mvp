import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden()
  const url = new URL(req.url)
  const search = url.searchParams.get('search') || ''
  const status = url.searchParams.get('status') || ''

  const certs = await prisma.certificate.findMany({
    orderBy: { issuedAt: 'desc' },
    include: { user: { select: { name: true, email: true } } }
  })

  // Get course titles
  const courseIds = Array.from(new Set(certs.map(c => c.courseId)))
  const courses = await prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, title: true } })

  let results = certs.map(c => ({
    ...c,
    courseName: courses.find(co => co.id === c.courseId)?.title || 'Unknown'
  }))

  if (search) {
    const s = search.toLowerCase()
    results = results.filter(c =>
      c.certificateNumber.toLowerCase().includes(s) ||
      c.user.name.toLowerCase().includes(s)
    )
  }
  if (status) results = results.filter(c => c.status === status)

  return NextResponse.json(results)
}
