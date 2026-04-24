'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialConversations = [
  { id: 1, from: 'Dr. Sarah Kim', org: 'Baptist Health', to: 'Dr. Michael Patel', subject: 'Robert Williams — Post-discharge CHF follow-up', time: '2h ago', unread: true, priority: 'urgent' },
  { id: 2, from: 'Dr. Ana Reyes', org: 'Memorial Regional', to: 'Dr. JD Suarez', subject: 'Gloria Martinez — CKD Stage 4, nephrology referral needed', time: '3h ago', unread: true, priority: 'urgent' },
  { id: 3, from: 'Lab Coordinator', org: 'Quest Diagnostics', to: 'Care Team', subject: 'Critical value alert: Patricia Brown TSH 0.15', time: '5h ago', unread: false, priority: 'high' },
  { id: 4, from: 'Dr. JD Suarez', org: 'KOSIQ Care Network', to: 'Dr. Sarah Kim', subject: 'Re: Margaret Chen HbA1c trending up — insulin adjustment?', time: '6h ago', unread: false, priority: 'normal' },
  { id: 5, from: 'Care Manager Lisa', org: 'Simply Health', to: 'Dr. JD Suarez', subject: 'Prior auth approved: Helen Wilson MRI lumbar spine', time: '8h ago', unread: false, priority: 'normal' },
  { id: 6, from: 'RPM Alert', org: 'System', to: 'Dr. JD Suarez', subject: 'Dorothy Evans BP sustained >150/90 for 7 days', time: '1d ago', unread: false, priority: 'high' },
];

const priorityStyles: Record<string, string> = { urgent: 'bg-red-50 border-red-200', high: 'bg-amber-50 border-amber-200', normal: 'bg-white border-gray-100' };
const priorityBadge: Record<string, string> = { urgent: 'bg-red-100 text-red-700', high: 'bg-amber-100 text-amber-700', normal: 'bg-gray-100 text-[#86868b]' };

export default function MessagingPage() {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState(initialConversations);
  const [composeModal, setComposeModal] = useState(false);
  const [newMsg, setNewMsg] = useState({ to: '', subject: '', body: '', priority: 'normal' });

  const handleSend = () => {
    if (!newMsg.to || !newMsg.subject) return;
    setConversations(prev => [{
      id: Date.now(), from: 'Dr. JD Suarez', org: 'KOSIQ Care Network',
      to: newMsg.to, subject: newMsg.subject, time: 'Just now', unread: false, priority: newMsg.priority
    }, ...prev]);
    setComposeModal(false);
    setNewMsg({ to: '', subject: '', body: '', priority: 'normal' });
    showToast('Message sent');
  };

  const markRead = (id: number) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: false } : c));
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Provider Messaging</h1>
            <p className="text-sm text-[#86868b]">Secure HIPAA-compliant messaging</p>
          </div>
          <button onClick={() => setComposeModal(true)} className="px-4 py-2 bg-[#3B82F6] text-white text-sm rounded-xl hover:bg-[#2563EB]">New Message</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { l: 'Active Threads', v: conversations.length.toString(), c: 'text-[#3B82F6]' },
            { l: 'Unread', v: conversations.filter(c => c.unread).length.toString(), c: 'text-red-600' },
            { l: 'Avg Response', v: '18 min', c: 'text-[#1d1d1f]' },
            { l: 'Today', v: conversations.filter(c => c.time.includes('h ago') || c.time === 'Just now').length.toString(), c: 'text-green-600' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-[#86868b] text-xs mb-1">{m.l}</p>
              <p className={`text-2xl font-semibold ${m.c}`}>{m.v}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-2">
            {conversations.map(c => (
              <div key={c.id} onClick={() => markRead(c.id)} className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-shadow ${priorityStyles[c.priority]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {c.unread && <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />}
                      <span className={`text-sm ${c.unread ? 'font-semibold' : 'font-medium'} text-[#1d1d1f]`}>{c.from}</span>
                      <span className="text-[10px] text-[#86868b]">{c.org}</span>
                      <span className="text-[10px] text-[#86868b]">→ {c.to}</span>
                    </div>
                    <p className={`text-sm ${c.unread ? 'text-[#1d1d1f] font-medium' : 'text-[#86868b]'}`}>{c.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityBadge[c.priority]}`}>{c.priority}</span>
                    <span className="text-[10px] text-[#86868b]">{c.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={composeModal} onClose={() => setComposeModal(false)} title="Compose Message">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">To</label>
            <input value={newMsg.to} onChange={e => setNewMsg(p => ({ ...p, to: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Provider name" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Subject</label>
            <input value={newMsg.subject} onChange={e => setNewMsg(p => ({ ...p, subject: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Re: Patient name — topic" />
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Priority</label>
            <select value={newMsg.priority} onChange={e => setNewMsg(p => ({ ...p, priority: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#86868b] mb-1 uppercase">Message</label>
            <textarea value={newMsg.body} onChange={e => setNewMsg(p => ({ ...p, body: e.target.value }))} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setComposeModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
            <button onClick={handleSend} className="px-4 py-2 text-sm bg-[#3B82F6] text-white rounded-xl">Send</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
