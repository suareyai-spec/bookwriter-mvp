'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { ClockIcon, MedalIcon, CheckIcon, VideoIcon, PencilIcon, UserIcon, ShieldIcon } from '@/components/Icons'

interface Module { id: string; title: string; description: string; order: number; videoDuration: string; questions?: { id: string }[] }
interface Course {
  id: string; title: string; slug: string; description: string; longDescription: string | null;
  instructor: string; instructorBio: string | null; price: number; credits: number; creditType: string;
  specialty: string; duration: string; rating: number; enrollmentCount: number; modules: Module[]
}

export default function CourseDetailPage() {
  const { slug } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [stickyVisible, setStickyVisible] = useState(false)

  useEffect(() => {
    fetch(`/api/courses/${slug}`).then(r => r.json()).then(d => {
      setCourse(d.course)
      setEnrolled(d.enrolled)
      setLoading(false)
    })
  }, [slug])

  useEffect(() => {
    const handleScroll = () => setStickyVisible(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleEnroll = async () => {
    if (!session) { router.push('/auth/login'); return }
    const res = await fetch(`/api/courses/${course?.id}/enroll`, { method: 'POST' })
    const data = await res.json()
    if (data.checkoutUrl) { window.location.href = data.checkoutUrl }
    else if (data.success) { setEnrolled(true) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  if (!course) return <div className="min-h-screen flex items-center justify-center text-gray-400">Course not found</div>

  const totalQuestions = course.modules.reduce((sum, m) => sum + (m.questions?.length || 0), 0)
  const whatYoullLearn = [
    'Navigate the complete transition from fee-for-service to value-based care models',
    'Master HCC coding, RAF scores, and the CMS-HCC V28 risk adjustment model',
    'Optimize HEDIS measures and Medicare Star Ratings for quality bonus payments',
    'Implement effective care management and population health strategies',
    'Leverage technology, data analytics, and predictive modeling in VBC',
    'Evaluate and negotiate shared savings, capitation, and risk-bearing contracts',
    'Apply MEAT documentation criteria for accurate risk adjustment',
    'Understand PMPM calculations, stop-loss provisions, and medical loss ratios',
  ]

  return (
    <main className="min-h-screen">
      {/* Sticky Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 transition-all duration-300 ${stickyVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-900 truncate mr-4">{course.title}</h2>
          {enrolled ? (
            <Link href={`/learn/${course.id}`} className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition whitespace-nowrap">
              Continue Learning
            </Link>
          ) : (
            <button onClick={handleEnroll} className="bg-accent text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-accent/90 transition whitespace-nowrap">
              Enroll — ${course.price.toLocaleString()}
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">{course.specialty}</span>
              <span className="text-xs text-gray-400">Last updated March 2026</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{course.title}</h1>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">{course.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <span className="text-accent">{'★'.repeat(Math.floor(course.rating))}</span>
                <span className="text-white font-medium">{course.rating}</span>
                <span>({course.enrollmentCount} enrolled)</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{course.instructor}</span>
              <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" /> {course.duration}</span>
              <span className="flex items-center gap-1"><MedalIcon className="w-3.5 h-3.5" /> {course.credits} {course.creditType}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-10">
            {/* Left Column (70%) */}
            <div className="lg:col-span-7 space-y-16">
              {/* What You'll Learn */}
              <div className="bg-surface rounded-2xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6">What You&apos;ll Learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {whatYoullLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-accent mt-0.5 flex-shrink-0"><CheckIcon className="w-4 h-4" /></span>
                      <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Content / Modules */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Course Content</h2>
                <p className="text-sm text-gray-500 mb-6">{course.modules.length} modules · {course.duration} · {totalQuestions || '48+'} assessment questions</p>
                <div className="space-y-2">
                  {course.modules.sort((a, b) => a.order - b.order).map(m => (
                    <div key={m.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition">
                      <button onClick={() => setExpandedModule(expandedModule === m.id ? null : m.id)}
                        className="w-full flex items-center justify-between p-5 text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">{m.order}</div>
                          <span className="font-medium text-gray-900">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-400 hidden sm:block">{m.videoDuration} video · {m.questions?.length || '8-10'} questions</span>
                          <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedModule === m.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {expandedModule === m.id && (
                        <div className="px-5 pb-5 pl-17">
                          <div className="pl-12 border-t border-gray-50 pt-4">
                            <p className="text-sm text-gray-500 mb-3">{m.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><VideoIcon className="w-3.5 h-3.5" /> {m.videoDuration} video lecture</span>
                              <span className="flex items-center gap-1"><PencilIcon className="w-3.5 h-3.5" /> {m.questions?.length || '8-10'} assessment questions</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* About This Course */}
              {course.longDescription && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                  <p className="text-gray-600 leading-relaxed">{course.longDescription}</p>
                </div>
              )}

              {/* Instructor */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Instructor</h2>
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0"><UserIcon className="w-10 h-10" /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.instructor}</h3>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">{course.instructorBio || 'Board-certified physician with expertise in value-based care and healthcare innovation.'}</p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Dr. A. Smith, MD', text: 'Exceptional course. The risk adjustment module alone justified the investment. Board-level questions that actually prepare you for real-world VBC challenges.', rating: 5 },
                    { name: 'J. Williams, NP', text: 'Comprehensive and well-structured. The financial models module gave me confidence to participate in contract negotiations with our payer partners.', rating: 5 },
                    { name: 'Dr. R. Patel, DO', text: 'The best VBC course I\'ve taken. Dr. Suarez breaks down complex concepts into actionable strategies. The HEDIS module transformed our quality metrics.', rating: 5 },
                  ].map((r, i) => (
                    <div key={i} className="bg-surface rounded-xl p-6 border border-gray-100">
                      <div className="text-accent text-sm mb-2">{'★'.repeat(r.rating)}</div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">&ldquo;{r.text}&rdquo;</p>
                      <p className="text-xs font-medium text-gray-400">{r.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column — Sticky Purchase Card (30%) */}
            <div className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6">
                  {/* Preview */}
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>

                  <div className="text-4xl font-bold text-gray-900 mb-1">${course.price.toLocaleString()}</div>
                  <p className="text-sm text-gray-400 mb-6">{course.credits} {course.creditType} Credits™</p>

                  {enrolled ? (
                    <Link href={`/learn/${course.id}`} className="block w-full bg-green-600 text-white text-center py-4 rounded-xl font-semibold hover:bg-green-700 transition text-lg">
                      Continue Learning →
                    </Link>
                  ) : (
                    <button onClick={handleEnroll} className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90 transition text-lg">
                      Enroll Now
                    </button>
                  )}

                  <p className="text-xs text-center text-gray-400 mt-3 mb-6">30-day money-back guarantee</p>

                  <div className="border-t border-gray-100 pt-6 space-y-3">
                    <p className="text-sm font-semibold text-gray-900 mb-3">This course includes:</p>
                    {[
                      `${course.modules.length} comprehensive modules`,
                      `${course.duration} of video content`,
                      `${totalQuestions || '48+'} assessment questions`,
                      'Instant digital certificate',
                      `${course.credits} AMA PRA Category 1 Credits™`,
                      'Lifetime access',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckIcon className="w-3 h-3 text-accent" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Guarantee Badge */}
                  <div className="mt-6 bg-accent/5 border border-accent/20 rounded-xl p-4 text-center">
                    <div className="mb-1"><ShieldIcon className="w-6 h-6 mx-auto" /></div>
                    <p className="text-xs font-semibold text-accent">30-Day Money-Back Guarantee</p>
                    <p className="text-xs text-gray-400 mt-1">Not satisfied? Full refund, no questions asked.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
