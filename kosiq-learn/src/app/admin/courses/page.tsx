'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PencilIcon, EyeIcon } from '@/components/Icons'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/courses').then(r => r.json()).then(c => { setCourses(c); setLoading(false) })
  }, [])

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">Course</th>
              <th className="text-left p-4 font-medium text-gray-500">Price</th>
              <th className="text-left p-4 font-medium text-gray-500">Enrollments</th>
              <th className="text-left p-4 font-medium text-gray-500">Credits</th>
              <th className="text-left p-4 font-medium text-gray-500">Status</th>
              <th className="text-left p-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c: any) => (
              <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="p-4 font-medium">{c.title}</td>
                <td className="p-4">${c.price.toLocaleString()}</td>
                <td className="p-4">{c.enrollmentCount}</td>
                <td className="p-4">{c.credits} {c.creditType}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {c.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <Link href={`/admin/courses/${c.id}`} className="p-2 rounded-lg hover:bg-gray-100 transition" title="Edit">
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  <Link href={`/courses/${c.slug}`} className="p-2 rounded-lg hover:bg-gray-100 transition" title="Preview" target="_blank">
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
