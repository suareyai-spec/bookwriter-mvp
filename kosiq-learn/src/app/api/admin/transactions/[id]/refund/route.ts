import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const { amount } = await req.json()
  const tx = await prisma.transaction.update({
    where: { id: params.id },
    data: {
      status: 'refunded',
      refundedAt: new Date(),
      refundAmount: amount,
    }
  })
  return NextResponse.json(tx)
}
