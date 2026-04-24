'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/Toast'
import Modal from '@/components/Modal'
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, PencilIcon, EyeIcon } from '@/components/Icons'

export default function CourseEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [moduleModal, setModuleModal] = useState<any>(null) // null=closed, {}=new, {id,...}=edit
  const [questionModal, setQuestionModal] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null)
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/courses/${courseId}`).then(r => r.json()),
      fetch(`/api/admin/courses/${courseId}/modules`).then(r => r.json()),
    ]).then(([c, m]) => {
      setCourse(c)
      setModules(m)
      setLoading(false)
    })
  }, [courseId])

  const saveCourse = async () => {
    setSaving(true)
    await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    })
    setSaving(false)
    toast('Course saved successfully')
  }

  const saveModule = async (data: any) => {
    if (data.id) {
      await fetch(`/api/admin/courses/${courseId}/modules/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      toast('Module updated')
    } else {
      await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      toast('Module created')
    }
    const m = await fetch(`/api/admin/courses/${courseId}/modules`).then(r => r.json())
    setModules(m)
    setModuleModal(null)
  }

  const deleteModule = async (id: string) => {
    await fetch(`/api/admin/courses/${courseId}/modules/${id}`, { method: 'DELETE' })
    setModules(prev => prev.filter(m => m.id !== id))
    setDeleteConfirm(null)
    toast('Module deleted')
  }

  const moveModule = async (id: string, dir: 'up' | 'down') => {
    const idx = modules.findIndex(m => m.id === id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= modules.length) return
    const a = modules[idx], b = modules[swapIdx]
    await Promise.all([
      fetch(`/api/admin/courses/${courseId}/modules/${a.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...a, order: b.order }) }),
      fetch(`/api/admin/courses/${courseId}/modules/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...b, order: a.order }) }),
    ])
    const m = await fetch(`/api/admin/courses/${courseId}/modules`).then(r => r.json())
    setModules(m)
  }

  const saveQuestion = async (data: any, moduleId: string) => {
    if (data.id) {
      await fetch(`/api/admin/questions/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      toast('Question updated')
    } else {
      await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      toast('Question created')
    }
    const m = await fetch(`/api/admin/courses/${courseId}/modules`).then(r => r.json())
    setModules(m)
    setQuestionModal(null)
  }

  const deleteQuestion = async (id: string) => {
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
    const m = await fetch(`/api/admin/courses/${courseId}/modules`).then(r => r.json())
    setModules(m)
    setDeleteConfirm(null)
    toast('Question deleted')
  }

  if (loading || !course) return <div className="text-gray-400">Loading...</div>

  return (
    <>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/courses" className="hover:text-primary">Courses</Link>
        <span>/</span>
        <span className="text-gray-900">{course.title}</span>
      </div>

      {/* Course Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Course Details</h2>
          <div className="flex gap-2">
            <Link href={`/courses/${course.slug}`} target="_blank" className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              <EyeIcon className="w-4 h-4" /> Preview
            </Link>
            <button onClick={saveCourse} disabled={saving} className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
            <input value={course.instructor} onChange={e => setCourse({ ...course, instructor: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={course.description} onChange={e => setCourse({ ...course, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
            <textarea value={course.longDescription || ''} onChange={e => setCourse({ ...course, longDescription: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input type="number" value={course.price} onChange={e => setCourse({ ...course, price: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
            <input type="number" step="0.5" value={course.credits} onChange={e => setCourse({ ...course, credits: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Type</label>
            <input value={course.creditType} onChange={e => setCourse({ ...course, creditType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <input value={course.specialty} onChange={e => setCourse({ ...course, specialty: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input value={course.duration} onChange={e => setCourse({ ...course, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Published</label>
            <select value={course.isPublished ? 'true' : 'false'} onChange={e => setCourse({ ...course, isPublished: e.target.value === 'true' })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Bio</label>
            <textarea value={course.instructorBio || ''} onChange={e => setCourse({ ...course, instructorBio: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Modules ({modules.length})</h2>
          <button onClick={() => setModuleModal({})} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
            <PlusIcon className="w-4 h-4" /> Add Module
          </button>
        </div>

        <div className="space-y-3">
          {modules.map((m, i) => (
            <div key={m.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-gray-50/50 cursor-pointer" onClick={() => setActiveModuleId(activeModuleId === m.id ? null : m.id)}>
                <div className="flex flex-col gap-0.5">
                  <button onClick={e => { e.stopPropagation(); moveModule(m.id, 'up') }} disabled={i === 0} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronUpIcon className="w-3 h-3" /></button>
                  <button onClick={e => { e.stopPropagation(); moveModule(m.id, 'down') }} disabled={i === modules.length - 1} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronDownIcon className="w-3 h-3" /></button>
                </div>
                <span className="text-xs text-gray-400 w-6">{m.order}</span>
                <span className="font-medium flex-1">{m.title}</span>
                <span className="text-xs text-gray-400">{m._count?.questions || m.questions?.length || 0} questions</span>
                <button onClick={e => { e.stopPropagation(); setModuleModal(m) }} className="p-1.5 hover:bg-gray-200 rounded-lg"><PencilIcon className="w-3.5 h-3.5" /></button>
                <button onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'module', id: m.id, name: m.title }) }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><TrashIcon className="w-3.5 h-3.5" /></button>
              </div>

              {activeModuleId === m.id && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Questions</h3>
                    <button onClick={() => setQuestionModal({ moduleId: m.id })} className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-white rounded-lg hover:bg-primary/90">
                      <PlusIcon className="w-3 h-3" /> Add Question
                    </button>
                  </div>
                  {(m.questions || []).map((q: any, qi: number) => (
                    <div key={q.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0 text-sm">
                      <span className="text-xs text-gray-400 mt-0.5 w-5">{qi + 1}.</span>
                      <span className="flex-1 text-gray-700 line-clamp-2">{q.text}</span>
                      <button onClick={() => setQuestionModal({ ...q, moduleId: m.id })} className="p-1 hover:bg-gray-100 rounded"><PencilIcon className="w-3 h-3" /></button>
                      <button onClick={() => setDeleteConfirm({ type: 'question', id: q.id, name: `Question ${qi + 1}` })} className="p-1 hover:bg-red-50 rounded text-red-500"><TrashIcon className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {(!m.questions || m.questions.length === 0) && <p className="text-sm text-gray-400">No questions yet.</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Module Modal */}
      <Modal open={moduleModal !== null} onClose={() => setModuleModal(null)} title={moduleModal?.id ? 'Edit Module' : 'Add Module'}>
        <ModuleForm data={moduleModal || {}} onSave={saveModule} />
      </Modal>

      {/* Question Modal */}
      <Modal open={questionModal !== null} onClose={() => setQuestionModal(null)} title={questionModal?.id ? 'Edit Question' : 'Add Question'} maxWidth="max-w-2xl">
        <QuestionForm data={questionModal || {}} onSave={(d: any) => saveQuestion(d, questionModal?.moduleId)} />
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => deleteConfirm?.type === 'module' ? deleteModule(deleteConfirm.id) : deleteQuestion(deleteConfirm.id)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </>
  )
}

function ModuleForm({ data, onSave }: { data: any; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    id: data.id || '',
    title: data.title || '',
    description: data.description || '',
    videoDuration: data.videoDuration || '60:00',
    videoUrl: data.videoUrl || '',
    content: data.content || '',
    order: data.order || 1,
  })
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video Duration</label>
          <input value={form.videoDuration} onChange={e => setForm({ ...form, videoDuration: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
          <input value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content/Notes</label>
        <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>
      <div className="flex justify-end">
        <button onClick={() => onSave(form)} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Save Module</button>
      </div>
    </div>
  )
}

function QuestionForm({ data, onSave }: { data: any; onSave: (d: any) => void }) {
  const existingOptions = data.options ? (typeof data.options === 'string' ? JSON.parse(data.options) : data.options) : ['', '', '', '']
  const [form, setForm] = useState({
    id: data.id || '',
    text: data.text || '',
    options: existingOptions as string[],
    correctIndex: data.correctIndex ?? 0,
    explanation: data.explanation || '',
    order: data.order || 1,
  })
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
        <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
        {form.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input type="radio" name="correct" checked={form.correctIndex === i} onChange={() => setForm({ ...form, correctIndex: i })} className="accent-primary" />
            <input value={opt} onChange={e => { const opts = [...form.options]; opts[i] = e.target.value; setForm({ ...form, options: opts }) }} placeholder={`Option ${i + 1}`} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
        ))}
        <p className="text-xs text-gray-400">Select the radio button next to the correct answer.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
        <textarea value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>
      <div className="flex justify-end">
        <button onClick={() => onSave({ ...form, options: form.options })} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Save Question</button>
      </div>
    </div>
  )
}
