import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET() {
  if (!(await requireAdmin())) return forbidden()
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(coupons)
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden()
  const body = await req.json()
  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.toUpperCase(),
      discountType: body.discountType,
      discountValue: parseFloat(body.discountValue),
      maxUses: body.maxUses ? parseInt(body.maxUses) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: body.isActive ?? true,
    }
  })
  return NextResponse.json(coupon, { status: 201 })
}
