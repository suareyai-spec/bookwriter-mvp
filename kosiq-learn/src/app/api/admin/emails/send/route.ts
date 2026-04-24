import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden()
  const { audience, subject, body, templateId } = await req.json()

  let recipients: string[] = []
  if (audience === 'all') {
    const users = await prisma.user.findMany({ where: { role: 'student' }, select: { email: true } })
    recipients = users.map(u => u.email)
  } else if (audience === 'enrolled') {
    const enrollments = await prisma.enrollment.findMany({ where: { status: 'active' }, include: { user: { select: { email: true } } } })
    recipients = Array.from(new Set(enrollments.map(e => e.user.email)))
  } else if (audience === 'completed') {
    const enrollments = await prisma.enrollment.findMany({ where: { status: 'completed' }, include: { user: { select: { email: true } } } })
    recipients = Array.from(new Set(enrollments.map(e => e.user.email)))
  } else if (audience) {
    recipients = [audience] // specific email
  }

  // Log emails (placeholder - actual sending via Klaviyo later)
  const logs = await Promise.all(
    recipients.map(r =>
      prisma.emailLog.create({
        data: { templateId, recipient: r, subject, status: 'pending' }
      })
    )
  )

  return NextResponse.json({ sent: logs.length, recipients: recipients.length })
}
