import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const { courseId } = await req.json()
  const enrollment = await prisma.enrollment.create({
    data: { userId: params.id, courseId, progress: 0, status: 'active' }
  })
  await prisma.course.update({ where: { id: courseId }, data: { enrollmentCount: { increment: 1 } } })
  return NextResponse.json(enrollment, { status: 201 })
}
