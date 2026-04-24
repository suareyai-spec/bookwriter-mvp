import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { jsPDF } from 'jspdf'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json([])

  const list = req.nextUrl.searchParams.get('list')
  if (list === 'true') {
    const certs = await prisma.certificate.findMany({ where: { userId: (session.user as any).id } })
    return NextResponse.json(certs)
  }
  return NextResponse.json([])
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()
  const userId = (session.user as any).id

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } }
  })
  if (!enrollment || enrollment.status !== 'completed') {
    return NextResponse.json({ error: 'Course not completed' }, { status: 400 })
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!course || !user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check for existing certificate or create new one
  let cert = await prisma.certificate.findFirst({ where: { userId, courseId } })
  if (!cert) {
    const certNumber = `PHA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    cert = await prisma.certificate.create({
      data: { userId, courseId, certificateNumber: certNumber }
    })
  }

  // Generate PDF
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  // Outer border - navy
  doc.setDrawColor(27, 54, 93) // #1B365D
  doc.setLineWidth(3)
  doc.rect(8, 8, w - 16, h - 16)
  // Inner border - gold
  doc.setDrawColor(197, 150, 12) // #C5960C
  doc.setLineWidth(1)
  doc.rect(13, 13, w - 26, h - 26)
  // Corner accents - gold
  doc.setDrawColor(197, 150, 12)
  doc.setLineWidth(0.5)
  doc.rect(16, 16, w - 32, h - 32)

  // PHA Seal (circle with text)
  const sealX = w / 2
  const sealY = 38
  doc.setDrawColor(27, 54, 93)
  doc.setLineWidth(1.5)
  doc.circle(sealX, sealY, 12)
  doc.setDrawColor(197, 150, 12)
  doc.setLineWidth(0.8)
  doc.circle(sealX, sealY, 10)
  doc.setFontSize(10)
  doc.setTextColor(27, 54, 93)
  doc.text('PHA', sealX, sealY + 1, { align: 'center' })
  doc.setFontSize(5)
  doc.setTextColor(197, 150, 12)
  doc.text('Est. 2026', sealX, sealY + 5, { align: 'center' })

  // Institution name
  doc.setFontSize(11)
  doc.setTextColor(27, 54, 93)
  doc.text('AMERICAN INSTITUTE OF CLINICAL EDUCATION', w / 2, 58, { align: 'center' })

  // Tagline
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text('Advancing Clinical Excellence Through Education', w / 2, 63, { align: 'center' })

  // Decorative gold line
  doc.setDrawColor(197, 150, 12)
  doc.setLineWidth(0.8)
  doc.line(w / 2 - 50, 67, w / 2 + 50, 67)

  // Certificate title
  doc.setFontSize(26)
  doc.setTextColor(27, 54, 93)
  doc.text('Certificate of Completion', w / 2, 80, { align: 'center' })

  // This certifies
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text('This is to certify that', w / 2, 92, { align: 'center' })

  // Student name
  doc.setFontSize(22)
  doc.setTextColor(27, 54, 93)
  doc.text(user.name, w / 2, 105, { align: 'center' })

  // Credentials
  if (user.credentials) {
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text(user.credentials, w / 2, 112, { align: 'center' })
  }

  // Course completion text
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text('has successfully completed the following accredited course:', w / 2, 122, { align: 'center' })

  // Course title
  doc.setFontSize(16)
  doc.setTextColor(197, 150, 12)
  doc.text(course.title, w / 2, 134, { align: 'center' })

  // Credits info
  doc.setFontSize(11)
  doc.setTextColor(60, 60, 60)
  doc.text(`${course.credits} ${course.creditType}`, w / 2, 142, { align: 'center' })

  // Date and instructor
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  const completionDate = enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Left: Date
  doc.setDrawColor(27, 54, 93)
  doc.setLineWidth(0.3)
  doc.line(w / 2 - 90, 155, w / 2 - 30, 155)
  doc.text('Date of Completion', w / 2 - 60, 160, { align: 'center' })
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  doc.text(completionDate, w / 2 - 60, 167, { align: 'center' })

  // Right: Instructor
  doc.setDrawColor(27, 54, 93)
  doc.line(w / 2 + 30, 155, w / 2 + 90, 155)
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Course Director', w / 2 + 60, 160, { align: 'center' })
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  doc.text(course.instructor, w / 2 + 60, 167, { align: 'center' })

  // Certificate number and accreditation
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text(`Certificate Number: ${cert.certificateNumber}`, w / 2, 180, { align: 'center' })
  doc.text('Pop Health Academy is accredited to provide continuing medical education credits.', w / 2, 185, { align: 'center' })
  doc.text('This activity has been planned and implemented in accordance with the accreditation requirements of PHA.', w / 2, 189, { align: 'center' })

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificate-${cert.certificateNumber}.pdf"`,
    },
  })
}
