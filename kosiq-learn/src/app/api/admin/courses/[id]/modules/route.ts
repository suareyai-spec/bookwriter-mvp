import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const modules = await prisma.module.findMany({
    where: { courseId: params.id },
    orderBy: { order: 'asc' },
    include: { questions: { orderBy: { order: 'asc' } }, _count: { select: { questions: true, completions: true } } }
  })
  return NextResponse.json(modules)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const body = await req.json()
  const maxOrder = await prisma.module.aggregate({ where: { courseId: params.id }, _max: { order: true } })
  const mod = await prisma.module.create({
    data: {
      courseId: params.id,
      title: body.title,
      description: body.description || '',
      videoDuration: body.videoDuration || '0:00',
      videoUrl: body.videoUrl || null,
      content: body.content || null,
      order: body.order ?? ((maxOrder._max.order || 0) + 1),
    }
  })
  return NextResponse.json(mod, { status: 201 })
}
