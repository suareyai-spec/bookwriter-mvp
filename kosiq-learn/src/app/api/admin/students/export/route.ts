import { NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET() {
  if (!(await requireAdmin())) return forbidden()
  const students = await prisma.user.findMany({
    where: { role: 'student' },
    include: { enrollments: { include: { course: { select: { title: true } } } } }
  })

  const header = 'Name,Email,Credentials,Course,Progress,Status,Enrollment Date,Completion Date'
  const rows = students.flatMap(s =>
    s.enrollments.length > 0
      ? s.enrollments.map(e =>
          [s.name, s.email, s.credentials || '', e.course.title, `${e.progress}%`, e.status, e.createdAt.toISOString(), e.completedAt?.toISOString() || ''].join(',')
        )
      : [[s.name, s.email, s.credentials || '', '', '', '', s.createdAt.toISOString(), ''].join(',')]
  )

  const csv = [header, ...rows].join('\n')
  return new NextResponse(csv, {
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="students.csv"' }
  })
}
