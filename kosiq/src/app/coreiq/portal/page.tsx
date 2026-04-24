'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';

const ACCENT = '#059669';

const EDUCATION_MATERIALS = [
  { title: 'Managing Type 2 Diabetes', category: 'Chronic Disease', description: 'Comprehensive guide on blood sugar monitoring, diet, exercise, and medication management.' },
  { title: 'Understanding Your Blood Pressure', category: 'Heart Health', description: 'How to monitor blood pressure at home, lifestyle modifications, and when to call your doctor.' },
  { title: 'Fall Prevention for Seniors', category: 'Safety', description: 'Home safety tips, exercise programs, and medication review to reduce fall risk.' },
  { title: 'Healthy Eating on Medicare', category: 'Nutrition', description: 'Affordable nutrition tips, meal planning, and dietary guidelines for older adults.' },
  { title: 'Understanding Your Lab Results', category: 'General', description: 'A guide to common lab tests, normal ranges, and what abnormal results mean.' },
  { title: 'Managing Chronic Pain', category: 'Pain Management', description: 'Non-pharmacological approaches, medication safety, and when to seek help.' },
  { title: 'Annual Wellness Visit Preparation', category: 'Preventive Care', description: 'How to prepare for your annual wellness visit and what to expect.' },
  { title: 'COVID-19 & Flu Vaccination Guide', category: 'Immunizations', description: 'Updated information on recommended vaccines for adults 65+.' },
];

export default function PatientPortalPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [tab, setTab] = useState<'messages' | 'appointments' | 'refills' | 'labs' | 'education'>('messages');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/coreiq/messages').then(r => r.json()).then(setMessages);
  }, []);

  const unreadCount = messages.filter(m => !m.read).length;

  const markRead = async (msg: any) => {
    if (!msg.read) {
      await fetch(`/api/coreiq/messages/${msg.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
    setSelectedMsg(msg);
  };

  const TABS = [
    { key: 'messages', label: 'Messages', icon: '✉️', badge: unreadCount },
    { key: 'appointments', label: 'Appointment Requests', icon: '📅' },
    { key: 'refills', label: 'Rx Refill Requests', icon: '💊' },
    { key: 'labs', label: 'Lab Results', icon: '🧪' },
    { key: 'education', label: 'Education', icon: '📚' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Patient Portal</h1>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'text-white' : 'text-[#86868b] bg-white border border-gray-100 hover:bg-[#f5f5f7]'}`} style={tab === t.key ? { background: ACCENT } : {}}>
              <span>{t.icon}</span> {t.label}
              {t.badge ? <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs">{t.badge}</span> : null}
            </button>
          ))}
        </div>

        {/* Messages Tab */}
        {tab === 'messages' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowCompose(true)} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>+ Compose</button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {messages.map(msg => (
                <div key={msg.id} onClick={() => markRead(msg)} className={`p-4 hover:bg-[#f5f5f7] cursor-pointer flex items-start gap-3 ${!msg.read ? 'bg-emerald-50/30' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!msg.read ? 'bg-emerald-500' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${!msg.read ? 'font-semibold' : 'font-medium'} text-[#1d1d1f]`}>{msg.fromName}</p>
                      <div className="flex items-center gap-2">
                        {msg.urgent && <span className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600">Urgent</span>}
                        <span className="text-xs text-[#86868b]">{new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[#1d1d1f]">{msg.subject}</p>
                    <p className="text-xs text-[#86868b] truncate">{msg.body}</p>
                    {msg.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f5f5f7] text-[#86868b]">{msg.category}</span>}
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p className="p-6 text-center text-sm text-[#86868b]">No messages</p>}
            </div>
          </div>
        )}

        {/* Appointment Requests */}
        {tab === 'appointments' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Appointment Requests</h2>
            <div className="space-y-3">
              {[
                { patient: 'Margaret Smith', type: 'Follow-up', preferred: 'Next Monday AM', reason: 'Blood pressure check', status: 'Pending' },
                { patient: 'Robert Johnson', type: 'Telehealth', preferred: 'This Friday PM', reason: 'Medication review', status: 'Pending' },
                { patient: 'Dorothy Williams', type: 'Urgent', preferred: 'ASAP', reason: 'Chest pain - new onset', status: 'Urgent' },
                { patient: 'James Brown', type: 'Annual Wellness', preferred: 'Next 2 weeks', reason: 'Annual wellness visit', status: 'Confirmed' },
                { patient: 'Helen Garcia', type: 'Follow-up', preferred: 'Tuesday/Thursday AM', reason: 'Diabetes follow-up', status: 'Pending' },
              ].map((req, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#f5f5f7]">
                  <div>
                    <p className="text-sm font-medium">{req.patient}</p>
                    <p className="text-xs text-[#86868b]">{req.type} · {req.reason}</p>
                    <p className="text-xs text-[#86868b]">Preferred: {req.preferred}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${req.status === 'Urgent' ? 'bg-red-50 text-red-700' : req.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'}`}>{req.status}</span>
                    {req.status === 'Pending' && (
                      <>
                        <button onClick={() => showToast('Appointment scheduled')} className="text-xs px-2 py-1 rounded-lg text-white" style={{ background: ACCENT }}>Schedule</button>
                        <button className="text-xs px-2 py-1 rounded-lg border border-gray-200">Decline</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rx Refill Requests */}
        {tab === 'refills' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Prescription Refill Requests</h2>
            <div className="space-y-3">
              {[
                { patient: 'Robert Johnson', medication: 'Metformin 1000mg', pharmacy: 'CVS Pharmacy', refillsLeft: 0, status: 'Pending Review' },
                { patient: 'Margaret Smith', medication: 'Lisinopril 20mg', pharmacy: 'Walgreens', refillsLeft: 2, status: 'Approved' },
                { patient: 'Charles Davis', medication: 'Atorvastatin 40mg', pharmacy: 'Walmart Pharmacy', refillsLeft: 1, status: 'Pending Review' },
                { patient: 'Betty Wilson', medication: 'Levothyroxine 75mcg', pharmacy: 'Publix Pharmacy', refillsLeft: 0, status: 'Requires Lab' },
                { patient: 'Thomas Anderson', medication: 'Warfarin 5mg', pharmacy: 'CVS Pharmacy', refillsLeft: 0, status: 'Pending Review' },
              ].map((req, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#f5f5f7]">
                  <div>
                    <p className="text-sm font-medium">{req.patient}</p>
                    <p className="text-xs text-[#86868b]">{req.medication} · {req.pharmacy}</p>
                    <p className="text-xs text-[#86868b]">Refills remaining: {req.refillsLeft}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : req.status === 'Requires Lab' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>{req.status}</span>
                    {req.status === 'Pending Review' && (
                      <>
                        <button onClick={() => showToast('Refill approved')} className="text-xs px-2 py-1 rounded-lg text-white" style={{ background: ACCENT }}>Approve</button>
                        <button className="text-xs px-2 py-1 rounded-lg border border-gray-200">Deny</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lab Results View */}
        {tab === 'labs' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Patient-Facing Lab Results</h2>
            <p className="text-sm text-[#86868b] mb-4">Results released to patients through the portal:</p>
            <div className="space-y-3">
              {[
                { patient: 'Margaret Smith', test: 'CMP', date: '03/05/2026', status: 'Released', abnormals: 1 },
                { patient: 'Robert Johnson', test: 'HbA1c', date: '03/04/2026', status: 'Released', abnormals: 1 },
                { patient: 'Dorothy Williams', test: 'CBC', date: '03/03/2026', status: 'Released', abnormals: 0 },
                { patient: 'James Brown', test: 'Lipid Panel', date: '03/02/2026', status: 'Pending Release', abnormals: 2 },
                { patient: 'Helen Garcia', test: 'TSH', date: '03/01/2026', status: 'Released', abnormals: 0 },
              ].map((lab, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#f5f5f7]">
                  <div>
                    <p className="text-sm font-medium">{lab.patient}</p>
                    <p className="text-xs text-[#86868b]">{lab.test} · {lab.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lab.abnormals > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">{lab.abnormals} abnormal</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${lab.status === 'Released' ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'}`}>{lab.status}</span>
                    {lab.status === 'Pending Release' && (
                      <button onClick={() => showToast('Results released to patient')} className="text-xs px-2 py-1 rounded-lg text-white" style={{ background: ACCENT }}>Release</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Materials */}
        {tab === 'education' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EDUCATION_MATERIALS.map((mat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{mat.category}</span>
                <h3 className="text-sm font-semibold mt-2 text-[#1d1d1f]">{mat.title}</h3>
                <p className="text-xs text-[#86868b] mt-1">{mat.description}</p>
                <button className="mt-3 text-xs font-medium" style={{ color: ACCENT }}>Send to Patient →</button>
              </div>
            ))}
          </div>
        )}

        {/* Message Detail Modal */}
        <Modal open={!!selectedMsg} onClose={() => setSelectedMsg(null)} title={selectedMsg?.subject || 'Message'} width="max-w-lg">
          {selectedMsg && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{selectedMsg.fromName} <span className="text-[#86868b]">({selectedMsg.fromRole})</span></p>
                  <p className="text-xs text-[#86868b]">To: {selectedMsg.toName} ({selectedMsg.toRole})</p>
                </div>
                <span className="text-xs text-[#86868b]">{new Date(selectedMsg.createdAt).toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#f5f5f7] text-sm whitespace-pre-wrap">{selectedMsg.body}</div>
              <button onClick={() => { setSelectedMsg(null); setShowCompose(true); }} className="px-3 py-1.5 rounded-xl text-white text-sm" style={{ background: ACCENT }}>Reply</button>
            </div>
          )}
        </Modal>

        {/* Compose Modal */}
        <Modal open={showCompose} onClose={() => setShowCompose(false)} title="Compose Message" width="max-w-lg">
          <ComposeForm onSend={async (data: any) => {
            const res = await fetch('/api/coreiq/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (res.ok) { showToast('Message sent'); setShowCompose(false); fetch('/api/coreiq/messages').then(r => r.json()).then(setMessages); }
          }} onCancel={() => setShowCompose(false)} />
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function ComposeForm({ onSend, onCancel }: { onSend: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ toName: '', subject: '', body: '', urgent: false });
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const searchPatients = async (q: string) => {
    if (q.length < 2) return;
    const res = await fetch(`/api/coreiq/patients?search=${q}&limit=10`);
    const data = await res.json();
    setPatients(data.patients || []);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-[#86868b] block mb-1">Patient</label>
        <input value={patientSearch} onChange={e => { setPatientSearch(e.target.value); searchPatients(e.target.value); }} placeholder="Search patient..." className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
        {patients.length > 0 && !selectedPatientId && (
          <div className="mt-1 border rounded-xl max-h-24 overflow-y-auto">{patients.map(p => (
            <button key={p.id} onClick={() => { setSelectedPatientId(p.id); setForm(f => ({ ...f, toName: `${p.firstName} ${p.lastName}` })); setPatientSearch(`${p.lastName}, ${p.firstName}`); }} className="w-full text-left px-3 py-1.5 hover:bg-[#f5f5f7] text-sm">{p.lastName}, {p.firstName}</button>
          ))}</div>
        )}
      </div>
      <div><label className="text-xs font-medium text-[#86868b] block mb-1">Subject</label><input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
      <div><label className="text-xs font-medium text-[#86868b] block mb-1">Message</label><textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={5} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))} /> Mark as urgent</label>
      <div className="flex gap-3">
        <button onClick={() => onSend({ ...form, fromName: 'Provider', fromRole: 'Provider', toRole: 'Patient', patientId: selectedPatientId || undefined, category: 'Clinical' })} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>Send</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-sm">Cancel</button>
      </div>
    </div>
  );
}
