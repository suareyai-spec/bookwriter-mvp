import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET() {
  if (!(await requireAdmin())) return forbidden()
  const templates = await prisma.emailTemplate.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden()
  const body = await req.json()
  const template = await prisma.emailTemplate.create({
    data: {
      name: body.name,
      slug: body.slug,
      subject: body.subject,
      body: body.body,
      variables: body.variables || '[]',
    }
  })
  return NextResponse.json(template, { status: 201 })
}
