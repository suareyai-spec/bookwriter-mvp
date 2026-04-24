'use client';
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';

const ACCENT = '#059669';
const FOLDERS = ['inbox', 'outbox', 'deleted'];
const CATEGORIES = ['All', 'clinical', 'rx-refill', 'lab-result', 'appointment', 'general'];

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    urgent: 'bg-red-50 text-red-700', high: 'bg-orange-50 text-orange-700', normal: 'bg-gray-50 text-gray-600', low: 'bg-blue-50 text-blue-600',
  };
  return priority !== 'normal' ? <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[priority]}`}>{priority}</span> : null;
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    clinical: 'bg-emerald-50 text-emerald-700', 'rx-refill': 'bg-purple-50 text-purple-700', 'lab-result': 'bg-blue-50 text-blue-700',
    appointment: 'bg-yellow-50 text-yellow-700', general: 'bg-gray-50 text-gray-600',
  };
  const labels: Record<string, string> = { clinical: 'Clinical', 'rx-refill': 'Rx Refill', 'lab-result': 'Lab Result', appointment: 'Appointment', general: 'General' };
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[category]}`}>{labels[category]}</span>;
}

export default function MessagingPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [showCompose, setShowCompose] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/coreiq/messaging').then(r => r.json()).then(setMessages);
  }, []);

  const unreadCount = useMemo(() => messages.filter(m => m.folder === 'inbox' && !m.isRead).length, [messages]);

  const filtered = useMemo(() => {
    return messages.filter(m => {
      if (m.folder !== activeFolder) return false;
      if (activeCategory !== 'All' && m.category !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!m.subject.toLowerCase().includes(q) && !m.fromName.toLowerCase().includes(q) && !m.toName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [messages, activeFolder, activeCategory, search]);

  const markRead = async (msg: any) => {
    if (!msg.isRead) {
      await fetch('/api/coreiq/messaging', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, isRead: true }),
      });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    }
    setSelected(msg);
  };

  const deleteMessage = async (id: string) => {
    await fetch('/api/coreiq/messaging', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, folder: 'deleted' }),
    });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, folder: 'deleted' } : m));
    setSelected(null);
    showToast('Message deleted', 'info');
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
            <p className="text-sm text-[#86868b] mt-1">{unreadCount} unread messages</p>
          </div>
          <button onClick={() => setShowCompose(true)} className="px-4 py-2 text-sm text-white rounded-xl" style={{ backgroundColor: ACCENT }}>
            + Compose
          </button>
        </div>

        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0">
            {FOLDERS.map(folder => (
              <button key={folder} onClick={() => { setActiveFolder(folder); setSelected(null); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 capitalize flex justify-between items-center ${activeFolder === folder ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                {folder}
                {folder === 'inbox' && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: ACCENT }}>{unreadCount}</span>
                )}
              </button>
            ))}
            <hr className="my-3" />
            <div className="text-xs text-[#86868b] mb-2 px-3">Categories</div>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs mb-0.5 capitalize ${activeCategory === cat ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                {cat === 'All' ? 'All' : cat.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Message list */}
          <div className="flex-1 flex gap-4">
            <div className={`${selected ? 'w-1/2' : 'w-full'} bg-white rounded-xl border border-gray-200 overflow-hidden`}>
              <div className="p-3 border-b border-gray-100">
                <input type="text" placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="divide-y divide-gray-50 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filtered.map(m => (
                  <div key={m.id} onClick={() => markRead(m)} className={`px-4 py-3 cursor-pointer hover:bg-emerald-50/30 transition-colors ${selected?.id === m.id ? 'bg-emerald-50/50' : ''} ${!m.isRead ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${!m.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'} truncate`}>
                        {activeFolder === 'outbox' ? `To: ${m.toName}` : m.fromName}
                      </span>
                      <div className="flex items-center gap-1">
                        <PriorityBadge priority={m.priority} />
                        <span className="text-[10px] text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={`text-xs ${!m.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'} truncate`}>{m.subject}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CategoryBadge category={m.category} />
                      {m.patientName && <span className="text-[10px] text-[#86868b]">· {m.patientName}</span>}
                      {!m.isRead && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT }} />}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <div className="p-8 text-center text-sm text-[#86868b]">No messages</div>}
              </div>
            </div>

            {/* Reading pane */}
            {selected && (
              <div className="w-1/2 bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">{selected.subject}</h3>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
                </div>
                <div className="text-xs text-[#86868b] space-y-1 mb-4">
                  <div>From: <span className="text-gray-900">{selected.fromName}</span></div>
                  <div>To: <span className="text-gray-900">{selected.toName}</span></div>
                  <div>Date: <span className="text-gray-900">{new Date(selected.createdAt).toLocaleString()}</span></div>
                  {selected.patientName && <div>Patient: <span className="text-gray-900">{selected.patientName}</span></div>}
                  <div className="flex gap-1"><CategoryBadge category={selected.category} /><PriorityBadge priority={selected.priority} /></div>
                </div>
                <div className="flex-1 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-[#f5f5f7] rounded-lg p-3 overflow-y-auto">
                  {selected.body}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => showToast('Reply sent', 'success')} className="px-3 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: ACCENT }}>Reply</button>
                  <button onClick={() => showToast('Forwarded', 'success')} className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Forward</button>
                  <button onClick={() => deleteMessage(selected.id)} className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 ml-auto">Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      <Modal open={showCompose} onClose={() => setShowCompose(false)} title="Compose Message" width="max-w-lg">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#86868b] mb-1 block">To</label>
            <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Search provider or staff..." />
          </div>
          <div>
            <label className="text-xs text-[#86868b] mb-1 block">Patient (optional)</label>
            <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Search patient..." />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-[#86868b] mb-1 block">Category</label>
              <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
                <option>Clinical</option><option>Rx Refill</option><option>Lab Result</option><option>Appointment</option><option>General</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-[#86868b] mb-1 block">Priority</label>
              <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
                <option>Normal</option><option>Urgent</option><option>High</option><option>Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#86868b] mb-1 block">Subject</label>
            <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Subject" />
          </div>
          <div>
            <label className="text-xs text-[#86868b] mb-1 block">Message</label>
            <textarea rows={6} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none" placeholder="Type your message..." />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCompose(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={() => { showToast('Message sent', 'success'); setShowCompose(false); }} className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: ACCENT }}>Send</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
