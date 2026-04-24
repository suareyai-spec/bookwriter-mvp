import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  await prisma.enrollment.updateMany({
    where: { userId: params.id },
    data: { status: 'revoked' }
  })
  return NextResponse.json({ ok: true })
}
