import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const moduleId = params.id

  const mod = await prisma.module.findUnique({ where: { id: moduleId } })
  if (!mod) return NextResponse.json({ error: 'Module not found' }, { status: 404 })

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: mod.courseId } }
  })
  if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })

  // Get latest quiz attempt
  const latestAttempt = await prisma.quizAttempt.findFirst({
    where: { userId, moduleId, passed: true },
    orderBy: { createdAt: 'desc' }
  })

  await prisma.moduleCompletion.upsert({
    where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId } },
    update: { quizPassed: true, quizScore: latestAttempt?.score },
    create: { enrollmentId: enrollment.id, moduleId, quizPassed: true, quizScore: latestAttempt?.score }
  })

  // Update overall progress
  const totalModules = await prisma.module.count({ where: { courseId: mod.courseId } })
  const completedModules = await prisma.moduleCompletion.count({
    where: { enrollmentId: enrollment.id, quizPassed: true }
  })
  const progress = (completedModules / totalModules) * 100
  const isComplete = progress >= 100

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progress,
      status: isComplete ? 'completed' : 'active',
      completedAt: isComplete ? new Date() : null
    }
  })

  return NextResponse.json({ success: true, progress })
}
