import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // Stripe checkout is handled in the enroll route
  return NextResponse.json({ error: 'Use /api/courses/[id]/enroll instead' }, { status: 400 })
}
