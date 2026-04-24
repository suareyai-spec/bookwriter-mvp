'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ShieldIcon, CheckIcon, XIcon } from '@/components/Icons'

export default function VerifyCertificatePage() {
  const params = useParams()
  const certNum = params.certificateNumber as string
  const [cert, setCert] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/verify/${certNum}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(setCert)
      .catch(() => setError('Certificate not found'))
      .finally(() => setLoading(false))
  }, [certNum])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Verifying...</div>

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-md w-full p-8 text-center">
        <ShieldIcon className="w-16 h-16 mx-auto mb-6" />
        <h1 className="text-2xl font-semibold mb-2">Certificate Verification</h1>
        <p className="text-sm text-gray-500 mb-6">Certificate #{certNum}</p>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 text-red-600 font-medium">
              <XIcon className="w-5 h-5" /> Certificate Not Found
            </div>
            <p className="text-sm text-red-500 mt-2">This certificate number could not be verified.</p>
          </div>
        ) : cert ? (
          <>
            <div className={`rounded-xl p-4 mb-6 ${cert.status === 'active' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`flex items-center justify-center gap-2 font-semibold ${cert.status === 'active' ? 'text-green-700' : 'text-red-700'}`}>
                {cert.status === 'active' ? <><CheckIcon className="w-5 h-5" /> Valid Certificate</> : <><XIcon className="w-5 h-5" /> Revoked</>}
              </div>
            </div>
            <div className="text-left space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Student</span><span className="font-medium">{cert.studentName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Course</span><span className="font-medium">{cert.courseName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Completed</span><span className="font-medium">{new Date(cert.issuedAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Credits</span><span className="font-medium">{cert.credits} {cert.creditType}</span></div>
              {cert.revokeReason && (
                <div className="flex justify-between"><span className="text-gray-500">Reason</span><span className="font-medium text-red-600">{cert.revokeReason}</span></div>
              )}
            </div>
          </>
        ) : null}

        <p className="text-xs text-gray-400 mt-8">Pop Health Academy</p>
      </div>
    </main>
  )
}
