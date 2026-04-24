import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const enrolled = req.nextUrl.searchParams.get('enrolled')

  if (enrolled === 'true' && session?.user) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: (session.user as any).id },
      include: { course: true }
    })
    return NextResponse.json(enrollments)
  }

  const courses = await prisma.course.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(courses)
}
