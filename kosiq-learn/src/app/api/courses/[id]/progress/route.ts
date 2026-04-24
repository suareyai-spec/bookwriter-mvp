import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const courseId = params.id

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: { moduleCompletions: true }
  })
  if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    include: { questions: { orderBy: { order: 'asc' } } }
  })

  // Parse question options from JSON
  const parsedModules = modules.map(m => ({
    ...m,
    questions: m.questions.map(q => ({
      id: q.id,
      text: q.text,
      options: JSON.parse(q.options),
      order: q.order,
    }))
  }))

  const completions: Record<string, { quizPassed: boolean; quizScore: number | null }> = {}
  enrollment.moduleCompletions.forEach(mc => {
    completions[mc.moduleId] = { quizPassed: mc.quizPassed, quizScore: mc.quizScore ? Math.round(mc.quizScore) : null }
  })

  return NextResponse.json({
    course,
    modules: parsedModules,
    completions,
    progress: enrollment.progress,
  })
}
