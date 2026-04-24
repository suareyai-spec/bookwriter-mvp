import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { certificateNumber: string } }) {
  const cert = await prisma.certificate.findUnique({
    where: { certificateNumber: params.certificateNumber },
    include: { user: { select: { name: true } } }
  })
  if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const course = await prisma.course.findUnique({ where: { id: cert.courseId }, select: { title: true, credits: true, creditType: true } })

  return NextResponse.json({
    certificateNumber: cert.certificateNumber,
    studentName: cert.user.name,
    courseName: course?.title || 'Unknown',
    credits: course?.credits || 0,
    creditType: course?.creditType || '',
    issuedAt: cert.issuedAt,
    status: cert.status,
    revokeReason: cert.revokeReason,
  })
}
