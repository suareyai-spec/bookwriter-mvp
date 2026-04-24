import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const body = await req.json()
  const coupon = await prisma.coupon.update({
    where: { id: params.id },
    data: {
      code: body.code?.toUpperCase(),
      discountType: body.discountType,
      discountValue: body.discountValue !== undefined ? parseFloat(body.discountValue) : undefined,
      maxUses: body.maxUses !== undefined ? (body.maxUses ? parseInt(body.maxUses) : null) : undefined,
      expiresAt: body.expiresAt !== undefined ? (body.expiresAt ? new Date(body.expiresAt) : null) : undefined,
      isActive: body.isActive,
    }
  })
  return NextResponse.json(coupon)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  await prisma.coupon.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
