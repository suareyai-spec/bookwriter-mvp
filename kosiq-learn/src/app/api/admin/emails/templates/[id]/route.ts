import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, forbidden } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()
  const body = await req.json()
  const template = await prisma.emailTemplate.update({
    where: { id: params.id },
    data: {
      name: body.name,
      subject: body.subject,
      body: body.body,
      variables: body.variables,
    }
  })
  return NextResponse.json(template)
}
