import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.text()
  // In production, verify webhook signature with Stripe
  try {
    const event = JSON.parse(body)
    if (event.type === 'checkout.session.completed') {
      const { userId, courseId } = event.data.object.metadata || {}
      if (userId && courseId) {
        await prisma.enrollment.create({
          data: { userId, courseId, stripePaymentId: event.data.object.payment_intent }
        })
        await prisma.course.update({ where: { id: courseId }, data: { enrollmentCount: { increment: 1 } } })
      }
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }

  return NextResponse.json({ received: true })
}
