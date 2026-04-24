'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/Toast'
import Modal from '@/components/Modal'
import { RefreshIcon, AlertIcon } from '@/components/Icons'

export default function StudentDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)

  const fetchStudent = () => {
    fetch(`/api/admin/students/${params.id}`).then(r => r.json()).then(s => { setStudent(s); setLoading(false) })
  }

  useEffect(() => { fetchStudent() }, [params.id])

  const resetQuiz = async () => {
    await fetch(`/api/admin/students/${params.id}/reset-quiz`, { method: 'POST' })
    toast('Quiz attempts reset')
    setConfirmAction(null)
    fetchStudent()
  }

  const revokeAccess = async () => {
    await fetch(`/api/admin/students/${params.id}/revoke`, { method: 'POST' })
    toast('Access revoked')
    setConfirmAction(null)
    fetchStudent()
  }

  const markComplete = async (courseId: string) => {
    await fetch(`/api/admin/students/${params.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId })
    })
    toast('Marked as complete')
    setConfirmAction(null)
    fetchStudent()
  }

  if (loading || !student) return <div className="text-gray-400">Loading...</div>

  return (
    <>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/students" className="hover:text-primary">Students</Link>
        <span>/</span>
        <span className="text-gray-900">{student.name}</span>
      </div>

      {/* Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-gray-500">Name:</span> <span className="font-medium ml-2">{student.name}</span></div>
            <div><span className="text-gray-500">Email:</span> <span className="font-medium ml-2">{student.email}</span></div>
            <div><span className="text-gray-500">Credentials:</span> <span className="font-medium ml-2">{student.credentials || '-'}</span></div>
            <div><span className="text-gray-500">Specialty:</span> <span className="font-medium ml-2">{student.specialty || '-'}</span></div>
            <div><span className="text-gray-500">License:</span> <span className="font-medium ml-2">{student.licenseNumber || '-'}</span></div>
            <div><span className="text-gray-500">Joined:</span> <span className="font-medium ml-2">{new Date(student.createdAt).toLocaleDateString()}</span></div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Actions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setConfirmAction('reset')} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <RefreshIcon className="w-4 h-4" /> Reset Quiz Attempts
            </button>
            <button onClick={() => setConfirmAction('revoke')} className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2">
              <AlertIcon className="w-4 h-4" /> Revoke Access
            </button>
            {student.enrollments?.map((e: any) => e.status !== 'completed' && (
              <button key={e.id} onClick={() => markComplete(e.courseId)} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                Mark Complete
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enrollments */}
      {student.enrollments?.map((e: any) => (
        <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{e.course?.title}</h2>
          <div className="flex items-center gap-6 mb-4 text-sm">
            <span>Progress: <strong>{e.progress}%</strong></span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              e.status === 'completed' ? 'bg-green-50 text-green-600' :
              e.status === 'revoked' ? 'bg-red-50 text-red-600' :
              'bg-blue-50 text-blue-600'
            }`}>{e.status}</span>
            <span className="text-gray-400">Enrolled: {new Date(e.createdAt).toLocaleDateString()}</span>
            {e.completedAt && <span className="text-gray-400">Completed: {new Date(e.completedAt).toLocaleDateString()}</span>}
          </div>

          {/* Module completions */}
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="text-left p-3 font-medium text-gray-500">Module</th>
                <th className="text-left p-3 font-medium text-gray-500">Quiz Score</th>
                <th className="text-left p-3 font-medium text-gray-500">Passed</th>
                <th className="text-left p-3 font-medium text-gray-500">Completed</th>
              </tr>
            </thead>
            <tbody>
              {e.moduleCompletions?.map((mc: any) => (
                <tr key={mc.id} className="border-t border-gray-50">
                  <td className="p-3">{mc.module?.title}</td>
                  <td className="p-3">{mc.quizScore !== null ? `${mc.quizScore}%` : '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${mc.quizPassed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {mc.quizPassed ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{new Date(mc.completedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Quiz Attempt History */}
      {student.quizAttempts?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Quiz Attempt History</h2>
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="text-left p-3 font-medium text-gray-500">Date</th>
                <th className="text-left p-3 font-medium text-gray-500">Score</th>
                <th className="text-left p-3 font-medium text-gray-500">Result</th>
              </tr>
            </thead>
            <tbody>
              {student.quizAttempts.map((a: any) => (
                <tr key={a.id} className="border-t border-gray-50">
                  <td className="p-3 text-gray-400">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="p-3">{a.score}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${a.passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {a.passed ? 'Pass' : 'Fail'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Certificates */}
      {student.certificates?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Certificates</h2>
          {student.certificates.map((c: any) => (
            <div key={c.id} className="flex items-center gap-4 text-sm">
              <span className="font-mono text-primary">{c.certificateNumber}</span>
              <span className="text-gray-400">{new Date(c.issuedAt).toLocaleDateString()}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {c.status || 'active'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal open={confirmAction !== null} onClose={() => setConfirmAction(null)} title="Confirm Action">
        <p className="text-sm text-gray-600 mb-4">
          {confirmAction === 'reset' && 'Reset all quiz attempts for this student? This cannot be undone.'}
          {confirmAction === 'revoke' && 'Revoke this student\'s access to all courses?'}
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
          <button onClick={() => confirmAction === 'reset' ? resetQuiz() : revokeAccess()} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Confirm</button>
        </div>
      </Modal>
    </>
  )
}
