import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const { reason } = await req.json()
  const cert = await prisma.certificate.update({
    where: { id: params.id },
    data: { status: 'revoked', revokedAt: new Date(), revokeReason: reason || 'Revoked by admin' }
  })
  return NextResponse.json(cert)
}
