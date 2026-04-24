import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const moduleId = params.id
  const { answers } = await req.json() // { questionId: selectedIndex }

  const questions = await prisma.question.findMany({ where: { moduleId } })
  if (questions.length === 0) return NextResponse.json({ error: 'No questions found' }, { status: 404 })

  let correctCount = 0
  const correct: Record<string, { correctIndex: number; explanation: string }> = {}

  questions.forEach(q => {
    correct[q.id] = { correctIndex: q.correctIndex, explanation: q.explanation }
    if (answers[q.id] === q.correctIndex) correctCount++
  })

  const score = (correctCount / questions.length) * 100
  const passed = score >= 80

  await prisma.quizAttempt.create({
    data: { userId, moduleId, score, passed, answers: JSON.stringify(answers) }
  })

  return NextResponse.json({ score, passed, correct })
}
