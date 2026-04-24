import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
  if (!coupon.isActive) return NextResponse.json({ error: 'Coupon is inactive' }, { status: 400 })
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })

  return NextResponse.json({
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  })
}
