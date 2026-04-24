import { NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET() {
  if (!(await requireAdmin())) return forbidden()
  const logs = await prisma.emailLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  return NextResponse.json(logs)
}
