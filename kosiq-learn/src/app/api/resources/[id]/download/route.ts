import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getResourceById } from '@/lib/resources/definitions'
import { generatePdf } from '@/lib/resources/pdf-generators'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resource = getResourceById(params.id)
  if (!resource) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
  }

  const pdfBuffer = generatePdf(params.id)
  if (!pdfBuffer) {
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${resource.filename}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
