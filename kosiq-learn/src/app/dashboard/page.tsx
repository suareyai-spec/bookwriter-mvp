'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpenIcon, CheckIcon, MedalIcon, CertificateIcon, BookIcon } from '@/components/Icons'
import Link from 'next/link'

interface EnrolledCourse {
  id: string; courseId: string; progress: number; status: string;
  course: { title: string; slug: string; instructor: string; credits: number; creditType: string; duration: string }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/courses?enrolled=true').then(r => r.json()),
        fetch('/api/certificates/generate?list=true').then(r => r.json()),
      ]).then(([e, c]) => { setEnrollments(e); setCertificates(c); setLoading(false) })
    }
  }, [status, router])

  if (status === 'loading' || loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  const active = enrollments.filter(e => e.status === 'active')
  const completed = enrollments.filter(e => e.status === 'completed')
  const totalCredits = completed.reduce((sum, e) => sum + e.course.credits, 0)
  const userName = session?.user?.name || 'there'
  const userCredentials = (session?.user as any)?.credentials || ''

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-b from-surface to-white pt-12 pb-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}{userCredentials ? `, ${userCredentials}` : ''}
          </h1>
          <p className="text-gray-500">Your learning dashboard</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Active Courses', value: active.length, icon: <BookOpenIcon className="w-6 h-6" /> },
            { label: 'Completed', value: completed.length, icon: <CheckIcon className="w-6 h-6 text-green-500" /> },
            { label: 'Credits Earned', value: totalCredits, icon: <MedalIcon className="w-6 h-6" /> },
            { label: 'Certificates', value: certificates.length, icon: <CertificateIcon className="w-6 h-6" /> },
          ].map(s => (
            <div key={s.label} className="bg-surface rounded-2xl p-6 border border-gray-100">
              <div className="mb-3">{s.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active Courses */}
        {active.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Continue Learning</h2>
            <div className="space-y-4">
              {active.map(e => (
                <Link key={e.id} href={`/learn/${e.courseId}`}
                  className="block bg-white rounded-2xl p-6 md:p-8 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all hover:-translate-y-0.5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{e.course.title}</h3>
                      <p className="text-sm text-gray-400">{e.course.instructor} · {e.course.credits} {e.course.creditType}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{Math.round(e.progress)}%</p>
                        <p className="text-xs text-gray-400">completed</p>
                      </div>
                      <div className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap">
                        Continue →
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${e.progress}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed + Certificates */}
        {completed.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Completed Courses</h2>
            <div className="space-y-4">
              {completed.map(e => (
                <div key={e.id} className="bg-white rounded-2xl p-6 md:p-8 border-2 border-accent/20 bg-gradient-to-r from-accent/[0.02] to-transparent">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-500 text-lg">✓</span>
                        <h3 className="text-lg font-semibold text-gray-900">{e.course.title}</h3>
                      </div>
                      <p className="text-sm text-gray-400 ml-7">{e.course.credits} {e.course.creditType} · Completed</p>
                    </div>
                    <button onClick={async () => {
                      const res = await fetch('/api/certificates/generate', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ courseId: e.courseId })
                      })
                      const blob = await res.blob()
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a'); a.href = url; a.download = 'PHA-Certificate.pdf'; a.click()
                    }} className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent/90 transition whitespace-nowrap">
                      Download Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CME Credit Summary */}
        {totalCredits > 0 && (
          <div className="bg-surface rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">CME Credit Summary</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                <MedalIcon className="w-10 h-10" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{totalCredits}</p>
                <p className="text-sm text-gray-400">AMA PRA Category 1 Credits™ earned</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {active.length === 0 && completed.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4"><BookIcon className="w-12 h-12 mx-auto" /></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-400 mb-6">Start your continuing medical education journey today.</p>
            <Link href="/courses/value-based-care-essentials" className="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:bg-accent/90 transition">
              Explore Our Program
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
