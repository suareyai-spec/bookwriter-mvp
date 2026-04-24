import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { ADMIN_EMAILS } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, email, password, credentials, specialty, licenseNumber } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)
  const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'student'

  const user = await prisma.user.create({
    data: { name, email, password: hashed, credentials, specialty, licenseNumber, role }
  })

  return NextResponse.json({ success: true, userId: user.id })
}
