import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, ADMIN_EMAILS } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const courseId = params.id

  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } }
  })
  if (existing) return NextResponse.json({ success: true, message: 'Already enrolled' })

  // Admin gets free access
  if (ADMIN_EMAILS.includes(session.user.email!)) {
    await prisma.enrollment.create({ data: { userId, courseId } })
    await prisma.course.update({ where: { id: courseId }, data: { enrollmentCount: { increment: 1 } } })
    return NextResponse.json({ success: true })
  }

  // For non-admin, would create Stripe checkout
  // For now, create a placeholder checkout URL
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: course.title },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/learn/${courseId}?enrolled=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/courses/${course.slug}`,
      metadata: { userId, courseId },
    })
    return NextResponse.json({ checkoutUrl: checkoutSession.url })
  } catch {
    // If Stripe not configured, enroll for free (dev mode)
    await prisma.enrollment.create({ data: { userId, courseId } })
    await prisma.course.update({ where: { id: courseId }, data: { enrollmentCount: { increment: 1 } } })
    return NextResponse.json({ success: true })
  }
}
