import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  await prisma.quizAttempt.deleteMany({ where: { userId: params.id } })
  return NextResponse.json({ ok: true })
}
