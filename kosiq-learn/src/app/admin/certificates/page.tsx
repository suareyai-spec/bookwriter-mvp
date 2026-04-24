'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'
import Modal from '@/components/Modal'
import { SearchIcon, ExternalLinkIcon } from '@/components/Icons'

export default function AdminCertificatesPage() {
  const { toast } = useToast()
  const [certs, setCerts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [revokeModal, setRevokeModal] = useState<any>(null)
  const [revokeReason, setRevokeReason] = useState('')

  const fetchCerts = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    fetch(`/api/admin/certificates?${params}`).then(r => r.json()).then(c => { setCerts(c); setLoading(false) })
  }

  useEffect(() => { fetchCerts() }, [statusFilter])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchCerts() }

  const handleRevoke = async () => {
    if (!revokeModal) return
    await fetch(`/api/admin/certificates/${revokeModal.id}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: revokeReason })
    })
    toast('Certificate revoked')
    setRevokeModal(null)
    setRevokeReason('')
    fetchCerts()
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Certificates</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by certificate number or student name..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
        </form>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">Certificate #</th>
              <th className="text-left p-4 font-medium text-gray-500">Student</th>
              <th className="text-left p-4 font-medium text-gray-500">Course</th>
              <th className="text-left p-4 font-medium text-gray-500">Issued</th>
              <th className="text-left p-4 font-medium text-gray-500">Status</th>
              <th className="text-left p-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((c: any) => (
              <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="p-4 font-mono text-primary">
                  <a href={`/verify/${c.certificateNumber}`} target="_blank" className="hover:underline flex items-center gap-1">
                    {c.certificateNumber} <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </td>
                <td className="p-4">{c.user?.name}</td>
                <td className="p-4">{c.courseName}</td>
                <td className="p-4 text-gray-400">{new Date(c.issuedAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    c.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>{c.status}</span>
                </td>
                <td className="p-4">
                  {c.status === 'active' && (
                    <button onClick={() => setRevokeModal(c)} className="text-xs text-red-600 hover:underline">Revoke</button>
                  )}
                </td>
              </tr>
            ))}
            {certs.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">No certificates found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={revokeModal !== null} onClose={() => setRevokeModal(null)} title="Revoke Certificate">
        {revokeModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Revoke certificate <strong>{revokeModal.certificateNumber}</strong> for {revokeModal.user?.name}?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea value={revokeReason} onChange={e => setRevokeReason(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Enter reason..." />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRevokeModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleRevoke} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Revoke</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
