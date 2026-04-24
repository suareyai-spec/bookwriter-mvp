import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string; moduleId: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const body = await req.json()
  const mod = await prisma.module.update({
    where: { id: params.moduleId },
    data: {
      title: body.title,
      description: body.description,
      videoDuration: body.videoDuration,
      videoUrl: body.videoUrl,
      content: body.content,
      order: body.order,
    }
  })
  return NextResponse.json(mod)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; moduleId: string } }) {
  if (!(await requireAdmin())) return forbidden()
  await prisma.question.deleteMany({ where: { moduleId: params.moduleId } })
  await prisma.moduleCompletion.deleteMany({ where: { moduleId: params.moduleId } })
  await prisma.resource.deleteMany({ where: { moduleId: params.moduleId } })
  await prisma.module.delete({ where: { id: params.moduleId } })
  return NextResponse.json({ ok: true })
}
