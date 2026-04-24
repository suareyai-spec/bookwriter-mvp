'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CheckIcon, LockIcon, GraduationCapIcon, CelebrationIcon, BookIcon, FolderIcon } from '@/components/Icons'
import Link from 'next/link'

interface Question { id: string; text: string; options: string[]; order: number }
interface Module { id: string; title: string; description: string; order: number; videoDuration: string; content: string | null; questions: Question[] }
interface CompletionMap { [moduleId: string]: { quizPassed: boolean; quizScore: number | null } }

type Tab = 'overview' | 'quiz' | 'resources' | 'notes'

export default function LearnPage() {
  const { courseId } = useParams()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [completions, setCompletions] = useState<CompletionMap>({})
  const [activeModule, setActiveModule] = useState<Module | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [videoWatched, setVideoWatched] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Quiz state — one question at a time
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [quizResults, setQuizResults] = useState<{ questionId: string; selected: number; correct: number; isCorrect: boolean; explanation: string }[]>([])
  const [quizComplete, setQuizComplete] = useState(false)
  const [quizStartTime, setQuizStartTime] = useState<number>(0)

  // Notes
  const [notes, setNotes] = useState('')

  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (status === 'authenticated') {
      fetch(`/api/courses/${courseId}/progress`).then(r => r.json()).then(data => {
        if (data.error) { router.push('/courses'); return }
        setCourse(data.course)
        setModules(data.modules)
        setCompletions(data.completions)
        setProgress(data.progress)
        setActiveModule(data.modules[0] || null)
        setLoading(false)
      })
    }
  }, [status, courseId, router])

  // Load notes from localStorage
  useEffect(() => {
    if (activeModule) {
      const saved = localStorage.getItem(`aice-notes-${activeModule.id}`)
      setNotes(saved || '')
    }
  }, [activeModule])

  const saveNotes = (val: string) => {
    setNotes(val)
    if (activeModule) localStorage.setItem(`aice-notes-${activeModule.id}`, val)
  }

  const isModuleLocked = (mod: Module): boolean => {
    if (mod.order === 1) return false
    const prevModule = modules.find(m => m.order === mod.order - 1)
    if (!prevModule) return false
    return !completions[prevModule.id]?.quizPassed
  }

  const switchModule = (mod: Module) => {
    if (isModuleLocked(mod)) return
    setActiveModule(mod)
    setActiveTab('overview')
    setVideoWatched(!!completions[mod.id]?.quizPassed)
    resetQuiz()
    setMobileSidebarOpen(false)
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswerSubmitted(false)
    setQuizResults([])
    setQuizComplete(false)
    setQuizStartTime(0)
  }

  const startQuiz = () => {
    setActiveTab('quiz')
    resetQuiz()
    setQuizStartTime(Date.now())
  }

  const handleSubmitAnswer = async () => {
    if (!activeModule || selectedAnswer === null) return
    const q = activeModule.questions.sort((a, b) => a.order - b.order)[currentQuestionIndex]

    // Submit single question to get correct answer
    const res = await fetch(`/api/modules/${activeModule.id}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: { [q.id]: selectedAnswer } })
    })
    const data = await res.json()
    const correctInfo = data.correct[q.id]

    const result = {
      questionId: q.id,
      selected: selectedAnswer,
      correct: correctInfo.correctIndex,
      isCorrect: selectedAnswer === correctInfo.correctIndex,
      explanation: correctInfo.explanation,
    }

    setQuizResults(prev => [...prev, result])
    setAnswerSubmitted(true)
  }

  const handleNextQuestion = async () => {
    const questions = activeModule!.questions.sort((a, b) => a.order - b.order)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setAnswerSubmitted(false)
    } else {
      // Quiz complete — check pass/fail
      setQuizComplete(true)
      const correctCount = [...quizResults].filter(r => r.isCorrect).length
      const score = (correctCount / questions.length) * 100
      const passed = score >= 80

      if (passed) {
        await fetch(`/api/modules/${activeModule!.id}/complete`, { method: 'POST' })
        setCompletions(prev => ({ ...prev, [activeModule!.id]: { quizPassed: true, quizScore: Math.round(score) } }))
        const newCompletionCount = Object.keys(completions).filter(k => completions[k]?.quizPassed).length + (completions[activeModule!.id] ? 0 : 1)
        setProgress((newCompletionCount / modules.length) * 100)
      }
    }
  }

  const goToNextModule = () => {
    if (!activeModule) return
    const idx = modules.findIndex(m => m.id === activeModule.id)
    if (idx < modules.length - 1) {
      switchModule(modules[idx + 1])
    }
  }

  const allComplete = modules.length > 0 && modules.every(m => completions[m.id]?.quizPassed)

  const handleDownloadCertificate = async () => {
    const res = await fetch('/api/certificates/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId })
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'PHA-Certificate.pdf'; a.click()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 bg-white">Loading...</div>
  if (!course) return <div className="min-h-screen flex items-center justify-center text-gray-400 bg-white">Not enrolled</div>

  const sortedQuestions = activeModule?.questions.sort((a, b) => a.order - b.order) || []
  const currentQuestion = sortedQuestions[currentQuestionIndex]
  const quizScore = quizResults.length > 0 ? (quizResults.filter(r => r.isCorrect).length / sortedQuestions.length) * 100 : 0
  const quizPassed = quizScore >= 80
  const timeTaken = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : 0

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Top Progress Bar */}
      <div className="h-1 bg-gray-100 fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Dark Header */}
      <header className="bg-gray-900 text-white h-14 flex items-center px-4 justify-between flex-shrink-0 mt-1">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="md:hidden p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:block p-1 hover:bg-white/10 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">← Dashboard</Link>
          <span className="text-sm font-medium truncate max-w-xs">{course.title}</span>
        </div>
        <div className="text-sm text-gray-400">{Math.round(progress)}% complete</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} hidden md:block border-r border-gray-100 bg-surface overflow-y-auto overflow-x-hidden transition-all duration-300 flex-shrink-0`}>
          <div className="p-4 min-w-[320px]">
            <h2 className="font-semibold text-sm text-gray-900 mb-1">Course Content</h2>
            <p className="text-xs text-gray-400 mb-4">{Math.round(progress)}% complete</p>
          </div>
          <div className="space-y-1 px-2 pb-4 min-w-[320px]">
            {modules.map(m => {
              const isComplete = completions[m.id]?.quizPassed
              const isActive = activeModule?.id === m.id
              const locked = isModuleLocked(m)
              return (
                <button key={m.id} onClick={() => switchModule(m)}
                  disabled={locked}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm transition ${
                    locked ? 'opacity-40 cursor-not-allowed' :
                    isActive ? 'bg-white shadow-sm border border-gray-100' : 'hover:bg-white/70'
                  }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 font-medium ${
                    isComplete ? 'bg-green-500 text-white' :
                    locked ? 'bg-gray-200 text-gray-400' :
                    isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isComplete ? <CheckIcon className="w-3.5 h-3.5 text-white" /> : locked ? <LockIcon className="w-3.5 h-3.5" /> : m.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`truncate ${isActive ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{m.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.videoDuration} · {m.questions.length} questions</p>
                  </div>
                </button>
              )
            })}
          </div>
          {allComplete && (
            <div className="p-4 border-t border-gray-200 min-w-[320px]">
              <button onClick={handleDownloadCertificate} className="w-full bg-accent text-white py-3 rounded-xl text-sm font-semibold hover:bg-accent/90 transition">
                <GraduationCapIcon className="w-4 h-4 inline-block mr-1" /> Download Certificate
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-80 bg-surface overflow-y-auto shadow-xl">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-sm">Course Content</h2>
                  <button onClick={() => setMobileSidebarOpen(false)} className="p-1">✕</button>
                </div>
              </div>
              <div className="space-y-1 px-2 pb-4">
                {modules.map(m => {
                  const isComplete = completions[m.id]?.quizPassed
                  const isActive = activeModule?.id === m.id
                  const locked = isModuleLocked(m)
                  return (
                    <button key={m.id} onClick={() => switchModule(m)} disabled={locked}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm transition ${
                        locked ? 'opacity-40 cursor-not-allowed' :
                        isActive ? 'bg-white shadow-sm' : 'hover:bg-white/70'
                      }`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 font-medium ${
                        isComplete ? 'bg-green-500 text-white' : locked ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isComplete ? <CheckIcon className="w-3.5 h-3.5 text-white" /> : locked ? <LockIcon className="w-3.5 h-3.5" /> : m.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{m.title}</p>
                        <p className="text-xs text-gray-400">{m.videoDuration} · {m.questions.length} questions</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {activeModule && (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
              {/* Video Player Placeholder */}
              <div className="aspect-video bg-gray-900 rounded-2xl flex flex-col items-center justify-center mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mb-3 hover:bg-white/20 transition cursor-pointer"
                    onClick={() => setVideoWatched(true)}>
                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <p className="text-white/80 text-sm font-medium">{activeModule.videoDuration}</p>
                  <p className="text-white/40 text-xs mt-1">Click to mark as watched</p>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-white text-xs font-medium">{activeModule.videoDuration}</div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-8 border-b border-gray-100 overflow-x-auto">
                {(['overview', 'quiz', 'resources', 'notes'] as Tab[]).map(tab => (
                  <button key={tab} onClick={() => {
                    if (tab === 'quiz' && !videoWatched && !completions[activeModule.id]?.quizPassed) return
                    setActiveTab(tab)
                    if (tab === 'quiz' && !quizStartTime) setQuizStartTime(Date.now())
                  }}
                    className={`px-5 py-3 text-sm font-medium capitalize whitespace-nowrap transition border-b-2 ${
                      activeTab === tab ? 'border-primary text-primary' :
                      tab === 'quiz' && !videoWatched && !completions[activeModule.id]?.quizPassed ? 'border-transparent text-gray-300 cursor-not-allowed' :
                      'border-transparent text-gray-400 hover:text-gray-600'
                    }`}>
                    {tab}
                    {tab === 'quiz' && !videoWatched && !completions[activeModule.id]?.quizPassed && <LockIcon className="w-3.5 h-3.5 inline-block ml-1 text-gray-300" />}
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold mb-3">{activeModule.title}</h2>
                  <p className="text-gray-500 leading-relaxed mb-6">{activeModule.description}</p>
                  {activeModule.content && <p className="text-gray-600 leading-relaxed mb-8">{activeModule.content}</p>}

                  <div className="bg-surface rounded-2xl p-6 border border-gray-100 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Key Learning Objectives</h3>
                    <ul className="space-y-2">
                      {activeModule.description.split(',').map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-accent mt-0.5">•</span>
                          <span>{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {completions[activeModule.id]?.quizPassed ? (
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-green-600 text-sm font-medium bg-green-50 px-4 py-2 rounded-full">✓ Module completed — Score: {completions[activeModule.id].quizScore}%</span>
                      {activeModule.order < modules.length && (
                        <button onClick={goToNextModule} className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition">
                          Next Module →
                        </button>
                      )}
                    </div>
                  ) : videoWatched ? (
                    <button onClick={startQuiz} className="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:bg-accent/90 transition">
                      Take the Quiz →
                    </button>
                  ) : (
                    <p className="text-sm text-gray-400">Watch the video above to unlock the quiz.</p>
                  )}
                </div>
              )}

              {/* Quiz Tab — One question at a time */}
              {activeTab === 'quiz' && (
                <div>
                  {!quizComplete ? (
                    currentQuestion && (
                      <div>
                        {/* Progress */}
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-sm font-medium text-gray-500">Question {currentQuestionIndex + 1} of {sortedQuestions.length}</span>
                          <span className="text-sm text-gray-400">Score: {quizResults.filter(r => r.isCorrect).length}/{quizResults.length}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
                          <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${((currentQuestionIndex) / sortedQuestions.length) * 100}%` }} />
                        </div>

                        {/* Question */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">{currentQuestion.text}</h3>

                        {/* Options as cards */}
                        <div className="space-y-3 mb-8">
                          {currentQuestion.options.map((opt, oi) => {
                            let cardClass = 'bg-white border-2 border-gray-100 hover:border-gray-200 cursor-pointer'
                            if (answerSubmitted) {
                              const result = quizResults[quizResults.length - 1]
                              if (result) {
                                if (oi === result.correct) cardClass = 'bg-green-50 border-2 border-green-500'
                                else if (oi === result.selected && !result.isCorrect) cardClass = 'bg-red-50 border-2 border-red-400'
                                else cardClass = 'bg-white border-2 border-gray-100 opacity-50'
                              }
                            } else if (selectedAnswer === oi) {
                              cardClass = 'bg-accent/5 border-2 border-accent shadow-sm'
                            }
                            return (
                              <button key={oi} onClick={() => !answerSubmitted && setSelectedAnswer(oi)}
                                disabled={answerSubmitted}
                                className={`w-full text-left p-4 rounded-xl text-sm transition-all ${cardClass}`}>
                                <div className="flex items-start gap-3">
                                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                    selectedAnswer === oi && !answerSubmitted ? 'bg-accent text-white' :
                                    answerSubmitted && oi === quizResults[quizResults.length - 1]?.correct ? 'bg-green-500 text-white' :
                                    answerSubmitted && oi === quizResults[quizResults.length - 1]?.selected && !quizResults[quizResults.length - 1]?.isCorrect ? 'bg-red-400 text-white' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>{String.fromCharCode(65 + oi)}</span>
                                  <span className="leading-relaxed">{opt}</span>
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        {/* Explanation after submit */}
                        {answerSubmitted && quizResults[quizResults.length - 1] && (
                          <div className={`p-4 rounded-xl mb-6 ${quizResults[quizResults.length - 1].isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <p className={`text-sm font-semibold mb-1 ${quizResults[quizResults.length - 1].isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {quizResults[quizResults.length - 1].isCorrect ? '✓ Correct!' : '✕ Incorrect'}
                            </p>
                            <p className="text-sm text-gray-600 leading-relaxed">{quizResults[quizResults.length - 1].explanation}</p>
                          </div>
                        )}

                        {/* Action button */}
                        {!answerSubmitted ? (
                          <button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}
                            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed">
                            Submit Answer
                          </button>
                        ) : (
                          <button onClick={handleNextQuestion}
                            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition">
                            {currentQuestionIndex < sortedQuestions.length - 1 ? 'Next Question →' : 'See Results'}
                          </button>
                        )}
                      </div>
                    )
                  ) : (
                    /* Results Page */
                    <div className="text-center py-8">
                      <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${quizPassed ? 'bg-green-50' : 'bg-red-50'}`}>
                        {quizPassed ? <CelebrationIcon className="w-10 h-10 text-green-500" /> : <BookIcon className="w-10 h-10" />}
                      </div>
                      <div className={`text-5xl font-bold mb-2 ${quizPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.round(quizScore)}%
                      </div>
                      <p className={`text-lg font-medium mb-2 ${quizPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {quizPassed ? 'Passed!' : 'Not Passed — 80% Required'}
                      </p>
                      <p className="text-sm text-gray-400 mb-8">
                        {quizResults.filter(r => r.isCorrect).length}/{sortedQuestions.length} correct · {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
                      </p>

                      {/* Question breakdown */}
                      <div className="max-w-md mx-auto mb-8">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {quizResults.map((r, i) => (
                            <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${r.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>

                      {quizPassed ? (
                        <div className="space-y-3">
                          {activeModule!.order < modules.length ? (
                            <button onClick={goToNextModule} className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition">
                              Continue to Next Module →
                            </button>
                          ) : allComplete ? (
                            <button onClick={handleDownloadCertificate} className="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:bg-accent/90 transition">
                              <GraduationCapIcon className="w-4 h-4 inline-block mr-1" /> Download Your Certificate
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        <button onClick={() => { resetQuiz(); setQuizStartTime(Date.now()) }}
                          className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition">
                          Retake Quiz
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Resources</h2>
                  <ResourcesList moduleOrder={activeModule?.order || 1} allComplete={progress >= 100} />
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Personal Notes</h2>
                  <p className="text-sm text-gray-400 mb-4">Your notes are saved locally to this browser.</p>
                  <textarea
                    value={notes}
                    onChange={e => saveNotes(e.target.value)}
                    placeholder="Type your notes here..."
                    className="w-full h-64 p-4 rounded-2xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
                  />
                </div>
              )}

              {/* All Complete Celebration */}
              {allComplete && activeTab === 'overview' && (
                <div className="mt-12 bg-gradient-to-r from-accent/5 to-primary/5 rounded-2xl p-8 text-center border border-accent/20">
                  <div className="mb-4"><GraduationCapIcon className="w-12 h-12 mx-auto" /></div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h3>
                  <p className="text-gray-500 mb-6">You have completed all modules and earned {course.credits} AMA PRA Category 1 Credits™.</p>
                  <button onClick={handleDownloadCertificate} className="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:bg-accent/90 transition">
                    Download Your Certificate
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

// Resource definitions inline to avoid server/client module issues
const RESOURCE_DATA: { id: string; moduleOrder: number; title: string; description: string; filename: string; order: number }[] = [
  { id: 'res-01', moduleOrder: 1, title: 'VBC vs Fee-for-Service Comparison Guide', description: 'Side-by-side comparison of reimbursement models, incentive structures, quality focus, risk sharing, and documentation requirements.', filename: 'vbc-vs-ffs-comparison-guide.pdf', order: 1 },
  { id: 'res-02', moduleOrder: 1, title: 'MACRA/MIPS Quick Reference Guide', description: 'MIPS categories, weights, scoring thresholds, payment adjustments, and reporting timeline at a glance.', filename: 'macra-mips-quick-reference.pdf', order: 2 },
  { id: 'res-03', moduleOrder: 1, title: 'APM Participation Decision Tree', description: 'Flowchart-style guide to assess APM readiness including revenue thresholds and risk tolerance.', filename: 'apm-decision-tree.pdf', order: 3 },
  { id: 'res-04', moduleOrder: 2, title: 'Top 50 HCC Codes Reference Card', description: 'HCC categories, RAF weights, common ICD-10 codes, and documentation tips for the most impactful conditions.', filename: 'top-50-hcc-codes.pdf', order: 1 },
  { id: 'res-05', moduleOrder: 2, title: 'MEAT Documentation Checklist', description: 'Monitor, Evaluate, Assess, Treat framework checklist with examples of qualifying and non-qualifying documentation.', filename: 'meat-documentation-checklist.pdf', order: 2 },
  { id: 'res-06', moduleOrder: 2, title: 'CMS-HCC V28 Changes Summary', description: 'Key changes from V24 to V28 including dropped/new HCCs, RAF weight changes, and revenue impact analysis.', filename: 'cms-hcc-v28-changes.pdf', order: 3 },
  { id: 'res-07', moduleOrder: 2, title: 'Risk Adjustment Audit Template', description: 'Pre-audit checklist, chart review worksheet, documentation gaps tracker, and remediation action plan.', filename: 'risk-adjustment-audit-template.pdf', order: 4 },
  { id: 'res-08', moduleOrder: 3, title: 'HEDIS Measures Master Reference', description: 'Key primary care HEDIS measures with numerator/denominator criteria, data sources, and gap closure tips.', filename: 'hedis-measures-master-reference.pdf', order: 1 },
  { id: 'res-09', moduleOrder: 3, title: 'Star Rating Calculation Worksheet', description: 'How Stars are calculated, measure weights, cut points, CAI, and quality bonus payment thresholds.', filename: 'star-rating-worksheet.pdf', order: 2 },
  { id: 'res-10', moduleOrder: 3, title: 'Quality Gap Closure Tracking Template', description: 'Patient-level tracking layout with outreach dates, closure status, and summary dashboard section.', filename: 'quality-gap-tracking-template.pdf', order: 3 },
  { id: 'res-11', moduleOrder: 4, title: 'CCM/TCM Billing Code Reference', description: 'CPT codes for Chronic Care Management and Transitional Care Management with requirements and reimbursement rates.', filename: 'ccm-tcm-billing-reference.pdf', order: 1 },
  { id: 'res-12', moduleOrder: 4, title: 'Comprehensive Care Plan Template', description: 'Complete care plan template with problem list, SMART goals, interventions, and patient agreement section.', filename: 'comprehensive-care-plan.pdf', order: 2 },
  { id: 'res-13', moduleOrder: 4, title: 'SDOH Screening Tool', description: 'Validated screening questions for food insecurity, housing, transportation, financial strain, and social isolation.', filename: 'sdoh-screening-tool.pdf', order: 3 },
  { id: 'res-14', moduleOrder: 4, title: 'Patient Outreach Script Templates', description: 'Phone scripts for AWV scheduling, care gap closure, medication adherence, and post-discharge follow-up.', filename: 'patient-outreach-scripts.pdf', order: 4 },
  { id: 'res-15', moduleOrder: 5, title: 'Health IT Vendor Evaluation Checklist', description: 'Evaluation criteria for interoperability, analytics, CDS, patient engagement, and pricing models.', filename: 'health-it-vendor-checklist.pdf', order: 1 },
  { id: 'res-16', moduleOrder: 5, title: 'Data Governance Policy Template', description: 'Complete policy template covering data stewardship, quality standards, PHI handling, and audit procedures.', filename: 'data-governance-policy.pdf', order: 2 },
  { id: 'res-17', moduleOrder: 5, title: 'Telehealth Workflow Setup Guide', description: 'Technology requirements, scheduling workflow, billing codes, consent template, and QA checklist.', filename: 'telehealth-workflow-guide.pdf', order: 3 },
  { id: 'res-18', moduleOrder: 6, title: 'PMPM Calculator Guide', description: 'Step-by-step PMPM calculation with medical expense categories, pharmacy costs, and trend factor adjustments.', filename: 'pmpm-calculator-guide.pdf', order: 1 },
  { id: 'res-19', moduleOrder: 6, title: 'Shared Savings Contract Term Sheet Template', description: 'Key contract terms including benchmark methodology, quality gates, sharing percentages, and sample language.', filename: 'shared-savings-term-sheet.pdf', order: 2 },
  { id: 'res-20', moduleOrder: 6, title: 'Payer Negotiation Preparation Checklist', description: 'Pre-negotiation data gathering, SWOT analysis, negotiation priorities, and counter-offer strategies.', filename: 'payer-negotiation-checklist.pdf', order: 3 },
  { id: 'res-21', moduleOrder: 6, title: 'Total Cost of Care Benchmarking Worksheet', description: 'TCOC calculation methodology, benchmark sources, service category breakdown, and variance analysis.', filename: 'tcoc-benchmarking-worksheet.pdf', order: 4 },
  { id: 'res-22', moduleOrder: 0, title: 'Complete VBC Implementation Toolkit', description: 'Combined highlights from all modules: executive summary, 90-day action plan, key metrics dashboard, and resource directory.', filename: 'vbc-implementation-toolkit.pdf', order: 1 },
]

function ResourcesList({ moduleOrder, allComplete }: { moduleOrder: number; allComplete: boolean }) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const resources = RESOURCE_DATA.filter(r => r.moduleOrder === moduleOrder).sort((a, b) => a.order - b.order)
  const bonusResource = RESOURCE_DATA.find(r => r.moduleOrder === 0)

  const handleDownload = async (id: string, filename: string) => {
    setDownloading(id)
    try {
      const res = await fetch(`/api/resources/${id}/download`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Download error:', e)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-3">
      {resources.length === 0 && (
        <div className="bg-surface rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-gray-500 text-sm">No resources available for this module.</p>
        </div>
      )}
      {resources.map(r => (
        <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4 hover:border-[#0F1E4B]/20 transition group">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /><path fillRule="evenodd" d="M8 11a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3A.5.5 0 018 11zm0 2a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3A.5.5 0 018 13z" clipRule="evenodd" fill="white" /></svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 group-hover:text-[#0F1E4B] transition">{r.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.description}</p>
          </div>
          <button
            onClick={() => handleDownload(r.id, r.filename)}
            disabled={downloading === r.id}
            className="flex-shrink-0 bg-[#0F1E4B] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#0F1E4B]/90 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {downloading === r.id ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            )}
            Download PDF
          </button>
        </div>
      ))}
      {allComplete && bonusResource && (
        <div className="mt-6">
          <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#0F1E4B]/5 rounded-xl border border-[#D4AF37]/30 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🏆</span>
              <h3 className="font-bold text-[#0F1E4B]">Course Completion Bonus</h3>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900">{bonusResource.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{bonusResource.description}</p>
              </div>
              <button
                onClick={() => handleDownload(bonusResource.id, bonusResource.filename)}
                disabled={downloading === bonusResource.id}
                className="flex-shrink-0 bg-[#D4AF37] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#D4AF37]/90 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {downloading === bonusResource.id ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                )}
                Download Toolkit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
