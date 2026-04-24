'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'
import Modal from '@/components/Modal'
import { PencilIcon, EyeIcon, SendIcon } from '@/components/Icons'

export default function AdminEmailsPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState('templates')
  const [templates, setTemplates] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState<any>(null)
  const [previewModal, setPreviewModal] = useState<any>(null)
  const [broadcastModal, setBroadcastModal] = useState(false)
  const [broadcast, setBroadcast] = useState({ audience: 'all', subject: '', body: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/emails/templates').then(r => r.json()),
      fetch('/api/admin/emails/log').then(r => r.json()),
    ]).then(([t, l]) => { setTemplates(t); setLogs(l); setLoading(false) })
  }, [])

  const saveTemplate = async () => {
    if (!editModal) return
    await fetch(`/api/admin/emails/templates/${editModal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editModal)
    })
    toast('Template saved')
    const t = await fetch('/api/admin/emails/templates').then(r => r.json())
    setTemplates(t)
    setEditModal(null)
  }

  const sendBroadcast = async () => {
    if (!broadcast.subject || !broadcast.body) { toast('Subject and body required', 'error'); return }
    const res = await fetch('/api/admin/emails/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(broadcast)
    })
    const data = await res.json()
    toast(`Broadcast queued for ${data.recipients} recipients`)
    setBroadcastModal(false)
    setBroadcast({ audience: 'all', subject: '', body: '' })
    const l = await fetch('/api/admin/emails/log').then(r => r.json())
    setLogs(l)
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  const tabs = ['templates', 'broadcast', 'history']

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Email Management</h1>
        <button onClick={() => setBroadcastModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
          <SendIcon className="w-4 h-4" /> Send Broadcast
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'templates' && (
        <div className="space-y-4">
          {templates.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{t.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setPreviewModal(t)} className="p-2 rounded-lg hover:bg-gray-100" title="Preview">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditModal({ ...t })} className="p-2 rounded-lg hover:bg-gray-100" title="Edit">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">Subject: {t.subject}</p>
              <div className="flex flex-wrap gap-1">
                {JSON.parse(t.variables || '[]').map((v: string) => (
                  <span key={v} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 font-mono">{v}</span>
                ))}
              </div>
            </div>
          ))}
          {templates.length === 0 && <p className="text-gray-400 text-center py-8">No templates yet. Run seed to populate.</p>}
        </div>
      )}

      {tab === 'broadcast' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Compose Broadcast</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
              <select value={broadcast.audience} onChange={e => setBroadcast({ ...broadcast, audience: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="all">All Students</option>
                <option value="enrolled">Enrolled (Active)</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input value={broadcast.subject} onChange={e => setBroadcast({ ...broadcast, subject: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body (HTML)</label>
              <textarea value={broadcast.body} onChange={e => setBroadcast({ ...broadcast, body: e.target.value })} rows={8} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
            </div>
            <button onClick={sendBroadcast} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Send Now (Placeholder)</button>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="text-left p-4 font-medium text-gray-500">Date</th>
                <th className="text-left p-4 font-medium text-gray-500">Recipient</th>
                <th className="text-left p-4 font-medium text-gray-500">Subject</th>
                <th className="text-left p-4 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l: any) => (
                <tr key={l.id} className="border-t border-gray-50">
                  <td className="p-4 text-gray-400">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="p-4">{l.recipient}</td>
                  <td className="p-4">{l.subject}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      l.status === 'sent' ? 'bg-green-50 text-green-600' :
                      l.status === 'failed' ? 'bg-red-50 text-red-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>{l.status}</span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No emails sent yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Template Modal */}
      <Modal open={editModal !== null} onClose={() => setEditModal(null)} title="Edit Email Template" maxWidth="max-w-2xl">
        {editModal && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={editModal.name} onChange={e => setEditModal({ ...editModal, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input value={editModal.subject} onChange={e => setEditModal({ ...editModal, subject: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body (HTML)</label>
              <textarea value={editModal.body} onChange={e => setEditModal({ ...editModal, body: e.target.value })} rows={12} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variables (JSON array)</label>
              <input value={editModal.variables} onChange={e => setEditModal({ ...editModal, variables: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
              <button onClick={saveTemplate} className="px-4 py-2 text-sm bg-primary text-white rounded-lg">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal open={previewModal !== null} onClose={() => setPreviewModal(null)} title="Template Preview" maxWidth="max-w-2xl">
        {previewModal && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Subject: <strong>{previewModal.subject}</strong></p>
            <div className="border border-gray-200 rounded-lg p-4 text-sm" dangerouslySetInnerHTML={{
              __html: previewModal.body
                .replace(/\{\{studentName\}\}/g, 'Dr. Jane Smith')
                .replace(/\{\{courseName\}\}/g, 'Value-Based Care Essentials')
                .replace(/\{\{certificateNumber\}\}/g, 'PHA-ABC123')
                .replace(/\{\{moduleName\}\}/g, 'Introduction to VBC')
                .replace(/\{\{score\}\}/g, '90')
            }} />
            <p className="text-xs text-gray-400 mt-2">Variables replaced with sample data for preview.</p>
          </div>
        )}
      </Modal>

      {/* Broadcast Modal */}
      <Modal open={broadcastModal} onClose={() => setBroadcastModal(false)} title="Send Broadcast">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
            <select value={broadcast.audience} onChange={e => setBroadcast({ ...broadcast, audience: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="all">All Students</option>
              <option value="enrolled">Enrolled (Active)</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input value={broadcast.subject} onChange={e => setBroadcast({ ...broadcast, subject: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea value={broadcast.body} onChange={e => setBroadcast({ ...broadcast, body: e.target.value })} rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setBroadcastModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
            <button onClick={sendBroadcast} className="px-4 py-2 text-sm bg-primary text-white rounded-lg">Send</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
