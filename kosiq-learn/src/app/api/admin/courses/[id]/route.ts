import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { modules: { orderBy: { order: 'asc' }, include: { questions: { orderBy: { order: 'asc' } } } } }
  })
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(course)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const body = await req.json()
  const course = await prisma.course.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      longDescription: body.longDescription,
      price: body.price !== undefined ? parseFloat(body.price) : undefined,
      credits: body.credits !== undefined ? parseFloat(body.credits) : undefined,
      creditType: body.creditType,
      specialty: body.specialty,
      duration: body.duration,
      instructor: body.instructor,
      instructorBio: body.instructorBio,
      isPublished: body.isPublished,
    }
  })
  return NextResponse.json(course)
}
