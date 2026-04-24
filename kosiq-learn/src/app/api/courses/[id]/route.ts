import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  // Try by slug first, then by id
  let course = await prisma.course.findUnique({
    where: { slug: params.id },
    include: { modules: { orderBy: { order: 'asc' }, include: { questions: { select: { id: true } } } } }
  })
  if (!course) {
    course = await prisma.course.findUnique({
      where: { id: params.id },
      include: { modules: { orderBy: { order: 'asc' }, include: { questions: { select: { id: true } } } } }
    })
  }
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let enrolled = false
  if (session?.user) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: (session.user as any).id, courseId: course.id } }
    })
    enrolled = !!enrollment
  }

  return NextResponse.json({ course, enrolled })
}
