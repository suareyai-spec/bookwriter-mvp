import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const { courseId } = await req.json()
  await prisma.enrollment.updateMany({
    where: { userId: params.id, courseId },
    data: { status: 'completed', progress: 100, completedAt: new Date() }
  })
  return NextResponse.json({ ok: true })
}
