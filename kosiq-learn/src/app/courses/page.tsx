'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { BuildingIcon, ClockIcon, BookIcon } from '@/components/Icons'

interface Course {
  id: string; title: string; slug: string; description: string; instructor: string;
  price: number; credits: number; creditType: string; specialty: string; duration: string;
  rating: number; enrollmentCount: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(d => { setCourses(d); setLoading(false) })
  }, [])

  const flagship = courses.find(c => c.slug === 'value-based-care-essentials')
  const others = courses.filter(c => c.slug !== 'value-based-care-essentials')

  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-b from-surface to-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Programs</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Premium continuing medical education designed by board-certified physicians</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading courses...</div>
          ) : (
            <>
              {/* Flagship Course — Large Featured Card */}
              {flagship && (
                <div className="mb-16">
                  <Link href={`/courses/${flagship.slug}`} className="block group">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden hover:shadow-2xl transition-all">
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="aspect-[4/3] lg:aspect-auto bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 flex items-center justify-center p-12">
                          <div className="text-center">
                            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                              <BuildingIcon className="w-12 h-12" />
                            </div>
                            <p className="text-sm font-medium text-primary/60 tracking-widest uppercase">Flagship Course</p>
                          </div>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">{flagship.credits} {flagship.creditType}</span>
                            <span className="text-xs font-semibold text-primary bg-primary/5 px-3 py-1 rounded-full">{flagship.specialty}</span>
                          </div>
                          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-primary transition">{flagship.title}</h2>
                          <p className="text-gray-500 mb-6 leading-relaxed">{flagship.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                            <span>{flagship.instructor}</span>
                            <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" /> {flagship.duration}</span>
                            <span className="text-accent">{'★'.repeat(Math.floor(flagship.rating))} {flagship.rating}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold text-gray-900">${flagship.price.toLocaleString()}</div>
                            <span className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold group-hover:bg-primary/90 transition">
                              View Course →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Coming Soon Courses */}
              {others.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                  <p className="text-gray-400 mb-8">More courses are in development</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {others.map(course => (
                      <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden opacity-60">
                        <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                          <BookIcon className="w-10 h-10 opacity-50" />
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{course.specialty}</span>
                            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Coming Soon</span>
                          </div>
                          <h3 className="font-semibold text-gray-600 mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{course.description}</p>
                          <p className="text-sm text-gray-400">{course.instructor}</p>
                          <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-gray-400">{course.credits} credits · {course.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
