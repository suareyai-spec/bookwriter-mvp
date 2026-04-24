import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string; moduleId: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const questions = await prisma.question.findMany({
    where: { moduleId: params.moduleId },
    orderBy: { order: 'asc' }
  })
  return NextResponse.json(questions)
}

export async function POST(req: NextRequest, { params }: { params: { id: string; moduleId: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const body = await req.json()
  const maxOrder = await prisma.question.aggregate({ where: { moduleId: params.moduleId }, _max: { order: true } })
  const q = await prisma.question.create({
    data: {
      moduleId: params.moduleId,
      text: body.text,
      options: typeof body.options === 'string' ? body.options : JSON.stringify(body.options),
      correctIndex: body.correctIndex,
      explanation: body.explanation || '',
      order: body.order ?? ((maxOrder._max.order || 0) + 1),
    }
  })
  return NextResponse.json(q, { status: 201 })
}
