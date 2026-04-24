'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/Toast'
import Modal from '@/components/Modal'
import { SearchIcon, PlusIcon, DownloadIcon } from '@/components/Icons'

export default function AdminStudentsPage() {
  const { toast } = useToast()
  const [students, setStudents] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [enrollModal, setEnrollModal] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [enrollForm, setEnrollForm] = useState({ email: '', courseId: '' })

  const fetchStudents = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search, status: statusFilter })
    fetch(`/api/admin/students?${params}`).then(r => r.json()).then(d => {
      setStudents(d.students || [])
      setTotal(d.total || 0)
      setTotalPages(d.totalPages || 1)
      setLoading(false)
    })
  }

  useEffect(() => { fetchStudents() }, [page, statusFilter])
  useEffect(() => {
    fetch('/api/admin/courses').then(r => r.json()).then(setCourses)
  }, [])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchStudents() }

  const handleExport = () => {
    window.open('/api/admin/students/export', '_blank')
    toast('Exporting CSV...')
  }

  const handleEnroll = async () => {
    if (!enrollForm.email || !enrollForm.courseId) { toast('Fill all fields', 'error'); return }
    // Find or note that user needs to exist
    const allStudents = await fetch('/api/admin/students?limit=1000').then(r => r.json())
    const user = allStudents.students?.find((s: any) => s.email === enrollForm.email)
    if (!user) { toast('User not found. They must register first.', 'error'); return }
    const res = await fetch(`/api/admin/students/${user.id}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: enrollForm.courseId })
    })
    if (res.ok) {
      toast('Student enrolled successfully')
      setEnrollModal(false)
      setEnrollForm({ email: '', courseId: '' })
      fetchStudents()
    } else {
      const err = await res.json()
      toast(err.error || 'Enrollment failed', 'error')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <DownloadIcon className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setEnrollModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
            <PlusIcon className="w-4 h-4" /> Manual Enroll
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
        </form>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">Name</th>
              <th className="text-left p-4 font-medium text-gray-500">Email</th>
              <th className="text-left p-4 font-medium text-gray-500">Credentials</th>
              <th className="text-left p-4 font-medium text-gray-500">Course</th>
              <th className="text-left p-4 font-medium text-gray-500">Progress</th>
              <th className="text-left p-4 font-medium text-gray-500">Status</th>
              <th className="text-left p-4 font-medium text-gray-500">Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s: any) => {
              const enrollment = s.enrollments?.[0]
              return (
                <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 font-medium">
                    <Link href={`/admin/students/${s.id}`} className="text-primary hover:underline">{s.name}</Link>
                  </td>
                  <td className="p-4 text-gray-500">{s.email}</td>
                  <td className="p-4">{s.credentials || '-'}</td>
                  <td className="p-4 text-sm">{enrollment?.course?.title || '-'}</td>
                  <td className="p-4">
                    {enrollment ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${enrollment.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{enrollment.progress}%</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-4">
                    {enrollment ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        enrollment.status === 'completed' ? 'bg-green-50 text-green-600' :
                        enrollment.status === 'revoked' ? 'bg-red-50 text-red-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>{enrollment.status}</span>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{enrollment ? new Date(enrollment.createdAt).toLocaleDateString() : new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{total} students total</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-30">Previous</button>
          <span className="px-3 py-1">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-30">Next</button>
        </div>
      </div>

      {/* Enroll Modal */}
      <Modal open={enrollModal} onClose={() => setEnrollModal(false)} title="Manual Enrollment">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
            <input value={enrollForm.email} onChange={e => setEnrollForm({ ...enrollForm, email: e.target.value })} placeholder="student@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select value={enrollForm.courseId} onChange={e => setEnrollForm({ ...enrollForm, courseId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Select course...</option>
              {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="flex justify-end">
            <button onClick={handleEnroll} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Enroll Student</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
