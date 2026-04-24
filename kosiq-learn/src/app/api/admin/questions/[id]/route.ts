import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const body = await req.json()
  const q = await prisma.question.update({
    where: { id: params.id },
    data: {
      text: body.text,
      options: typeof body.options === 'string' ? body.options : JSON.stringify(body.options),
      correctIndex: body.correctIndex,
      explanation: body.explanation,
      order: body.order,
    }
  })
  return NextResponse.json(q)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  await prisma.question.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
