'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Tab = 'summary' | 'timeline' | 'notes' | 'vitals' | 'labs' | 'medications' | 'orders' | 'profile';

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('summary');
  const [summary, setSummary] = useState<{ summary?: string; generatedAt?: string; error?: string } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [noteFilter, setNoteFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ noteType: 'progress', shiftType: 'day', content: '' });
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Profile tab state
  const [profileAllergies, setProfileAllergies] = useState('');
  const [profileDiet, setProfileDiet] = useState('');
  const [profileCodeStatus, setProfileCodeStatus] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [patientImages, setPatientImages] = useState<any[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageCategory, setImageCategory] = useState('xray');
  const [imageDescription, setImageDescription] = useState('');
  const [lightboxImage, setLightboxImage] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const toggleVoice = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    let finalTranscript = newNote.content;
    recognition.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setNewNote(prev => ({ ...prev, content: finalTranscript + (interim ? ' ' + interim : '') }));
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const saveNote = async () => {
    if (!newNote.content.trim()) return;
    setSaving(true);
    const session = await fetch('/api/auth/session').then(r => r.json());
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: id,
        authorName: session?.user?.name || 'Unknown',
        authorRole: 'physician',
        noteType: newNote.noteType,
        shiftType: newNote.shiftType,
        content: newNote.content,
        department: patient?.roomNumber?.startsWith('ICU') ? 'ICU' : 'General',
      }),
    });
    setNewNote({ noteType: 'progress', shiftType: 'day', content: '' });
    setShowAddNote(false);
    setSaving(false);
    // Refresh patient data
    fetch(`/api/patients/${id}`).then(r => r.json()).then(setPatient);
  };

  useEffect(() => {
    fetch(`/api/patients/${id}`).then(r => r.json()).then((p: any) => {
      setPatient(p);
      setProfileAllergies(p.allergies || '');
      setProfileDiet(p.dietaryRestrictions || '');
      setProfileCodeStatus(p.codeStatus || '');
      setPatientImages(p.images || []);
    });
  }, [id]);

  const loadSummary = async () => {
    setSummaryLoading(true);
    const res = await fetch(`/api/patients/${id}/summary`);
    setSummary(await res.json());
    setSummaryLoading(false);
  };

  useEffect(() => { if (tab === 'summary' && !summary) loadSummary(); }, [tab]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const newMessages = [...chatMessages, { role: 'user', content: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch(`/api/patients/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';

      setChatMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              assistantMsg += data.text;
              setChatMessages([...newMessages, { role: 'assistant', content: assistantMsg }]);
            } catch {}
          }
        }
      }
    } catch {
      setChatMessages([...newMessages, { role: 'assistant', content: 'Error generating response.' }]);
    }
    setChatLoading(false);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileSaved(false);
    await fetch(`/api/patients/${id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allergies: profileAllergies, dietaryRestrictions: profileDiet, codeStatus: profileCodeStatus }),
    });
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const uploadImage = async (file: File, category: string, description: string) => {
    setImageUploading(true);
    const session = await fetch('/api/auth/session').then(r => r.json());
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', category);
    fd.append('description', description);
    fd.append('uploadedBy', session?.user?.name || 'Unknown');
    const res = await fetch(`/api/patients/${id}/images`, { method: 'POST', body: fd });
    const img = await res.json();
    setPatientImages(prev => [img, ...prev]);
    setImageUploading(false);
    setImageDescription('');
  };

  const uploadPhoto = async (file: File) => {
    setImageUploading(true);
    const session = await fetch('/api/auth/session').then(r => r.json());
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', 'photo');
    fd.append('description', 'Patient photo');
    fd.append('uploadedBy', session?.user?.name || 'Unknown');
    const res = await fetch(`/api/patients/${id}/images`, { method: 'POST', body: fd });
    const img = await res.json();
    setPatientImages(prev => [img, ...prev]);
    setImageUploading(false);
  };

  const deleteImage = async (imageId: string) => {
    await fetch(`/api/patients/${id}/images/${imageId}`, { method: 'DELETE' });
    setPatientImages(prev => prev.filter(i => i.id !== imageId));
    if (lightboxImage?.id === imageId) setLightboxImage(null);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadImage(file, imageCategory, imageDescription);
  };

  const patientPhoto = patientImages.find((i: any) => i.category === 'photo');
  const medicalImages = patientImages.filter((i: any) => i.category !== 'photo');

  const categoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      xray: 'bg-blue-100 text-blue-700', mri: 'bg-purple-100 text-purple-700',
      ct: 'bg-orange-100 text-orange-700', ultrasound: 'bg-teal-100 text-teal-700',
      lab_report: 'bg-green-100 text-green-700', other: 'bg-gray-100 text-gray-600',
      photo: 'bg-pink-100 text-pink-700',
    };
    const labels: Record<string, string> = {
      xray: 'X-Ray', mri: 'MRI', ct: 'CT Scan', ultrasound: 'Ultrasound',
      lab_report: 'Lab Report', other: 'Other', photo: 'Photo',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[cat] || colors.other}`}>{labels[cat] || cat}</span>;
  };

  if (!patient) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>;

  const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / 31557600000);
  const vitalsData = [...(patient.vitals || [])].reverse().map((v: any) => ({
    time: new Date(v.recordedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    HR: v.heartRate, SBP: v.bloodPressureSys, DBP: v.bloodPressureDia, SpO2: v.oxygenSat, RR: v.respiratoryRate, Temp: v.temperature,
  }));

  const filteredNotes = (patient.notes || []).filter((n: any) => {
    if (noteFilter && n.noteType !== noteFilter) return false;
    if (shiftFilter && n.shiftType !== shiftFilter) return false;
    return true;
  });

  const labsByPanel: Record<string, any[]> = {};
  (patient.labResults || []).forEach((l: any) => {
    const panel = l.testName.includes('WBC') || l.testName.includes('Hgb') || l.testName.includes('Hct') || l.testName.includes('Plt') ? 'CBC'
      : l.testName.includes('Na') || l.testName.includes('K') || l.testName.includes('Cl') || l.testName.includes('CO2') || l.testName.includes('BUN') || l.testName.includes('Cr') || l.testName.includes('Glucose') ? 'BMP'
      : l.testName.includes('Troponin') || l.testName.includes('BNP') ? 'Cardiac'
      : l.testName.includes('INR') || l.testName.includes('PT') || l.testName.includes('PTT') ? 'Coagulation'
      : 'Other';
    if (!labsByPanel[panel]) labsByPanel[panel] = [];
    labsByPanel[panel].push(l);
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'summary', label: '🤖 AI Summary' },
    { key: 'timeline', label: '📅 Timeline' },
    { key: 'notes', label: '📝 Notes' },
    { key: 'vitals', label: '💓 Vitals' },
    { key: 'labs', label: '🔬 Labs' },
    { key: 'medications', label: '💊 Medications' },
    { key: 'orders', label: '📋 Orders' },
    { key: 'profile', label: '👤 Profile' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark">{patient.firstName} {patient.lastName}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <span>MRN: <span className="font-mono">{patient.mrn}</span></span>
              <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} ({age}y)</span>
              <span>{patient.gender}</span>
              <span>Room: {patient.roomNumber}-{patient.bedNumber}</span>
            </div>
          </div>
          <div className="flex gap-3">
            {patient.codeStatus && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${patient.codeStatus === 'Full Code' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {patient.codeStatus}
              </span>
            )}
            {patient.allergies && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 animate-pulse-critical">
                ⚠️ {patient.allergies}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* AI Summary Tab */}
          {tab === 'summary' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-dark">AI Shift Summary</h2>
                <button onClick={loadSummary} disabled={summaryLoading}
                  className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 disabled:opacity-50">
                  {summaryLoading ? 'Generating...' : '🔄 Refresh'}
                </button>
              </div>
              {summaryLoading ? (
                <div className="flex items-center gap-3 py-10 justify-center text-gray-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand" />
                  <span>AI is analyzing the chart...</span>
                </div>
              ) : summary?.summary ? (
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: summary.summary.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/⚠️/g, '<span class="text-red-600">⚠️</span>') }} />
                  <p className="text-xs text-gray-400 mt-4">Generated: {summary.generatedAt ? new Date(summary.generatedAt).toLocaleString() : 'N/A'}</p>
                </div>
              ) : summary?.error ? (
                <p className="text-red-500 text-sm">Failed to generate summary. Please try again.</p>
              ) : null}

              {/* Active Problems */}
              <div className="mt-6">
                <h3 className="text-md font-semibold text-dark mb-3">Active Problems</h3>
                <div className="space-y-2">
                  {patient.problems.filter((p: any) => p.status === 'active').map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-dark">{p.name}</p>
                        {p.icdCode && <p className="text-xs text-gray-400">{p.icdCode}</p>}
                      </div>
                      {p.notes && <p className="text-xs text-gray-500 max-w-xs truncate">{p.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Numbers */}
              {patient.vitals?.[0] && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-dark mb-3">Key Numbers (Latest)</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { label: 'HR', value: patient.vitals[0].heartRate, unit: 'bpm' },
                      { label: 'BP', value: `${patient.vitals[0].bloodPressureSys}/${patient.vitals[0].bloodPressureDia}`, unit: 'mmHg' },
                      { label: 'SpO2', value: patient.vitals[0].oxygenSat, unit: '%' },
                      { label: 'RR', value: patient.vitals[0].respiratoryRate, unit: '/min' },
                      { label: 'Temp', value: patient.vitals[0].temperature, unit: '°F' },
                      { label: 'Pain', value: patient.vitals[0].painLevel, unit: '/10' },
                    ].map(v => (
                      <div key={v.label} className="bg-surface rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">{v.label}</p>
                        <p className="text-lg font-bold text-dark">{v.value}</p>
                        <p className="text-xs text-gray-400">{v.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {tab === 'timeline' && (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {[...patient.notes.map((n: any) => ({ ...n, _type: 'note', _time: n.createdAt })),
                ...patient.labResults.map((l: any) => ({ ...l, _type: 'lab', _time: l.resultAt })),
                ...patient.orders.map((o: any) => ({ ...o, _type: 'order', _time: o.orderedAt })),
              ].sort((a, b) => new Date(b._time).getTime() - new Date(a._time).getTime()).map((item: any, i) => (
                <div key={i} className="flex gap-4 p-3 bg-surface rounded-lg">
                  <span className="text-lg">{item._type === 'note' ? '📝' : item._type === 'lab' ? '🔬' : '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">{item._type}</span>
                      <span className="text-xs text-gray-400">{new Date(item._time).toLocaleString()}</span>
                    </div>
                    {item._type === 'note' && <p className="text-sm text-gray-700 mt-1 line-clamp-3">{item.content}</p>}
                    {item._type === 'lab' && (
                      <p className={`text-sm mt-1 ${item.flag === 'critical' ? 'text-red-600 font-bold' : item.flag === 'high' || item.flag === 'low' ? 'text-amber-600' : 'text-gray-700'}`}>
                        {item.testName}: {item.value} {item.unit} {item.flag === 'critical' ? '⚠️ CRITICAL' : ''}
                      </p>
                    )}
                    {item._type === 'order' && <p className="text-sm text-gray-700 mt-1">{item.orderType}: {item.description} ({item.status})</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes Tab */}
          {tab === 'notes' && (
            <div>
              {/* Add Note Button + Form */}
              <div className="mb-4">
                {!showAddNote ? (
                  <button onClick={() => setShowAddNote(true)}
                    className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 flex items-center gap-2">
                    <span className="text-lg">+</span> Add Note
                  </button>
                ) : (
                  <div className="border border-brand/30 rounded-lg p-4 bg-brand/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-dark text-sm">New Chart Note</h3>
                      <button onClick={() => { setShowAddNote(false); setRecording(false); recognitionRef.current?.stop(); }}
                        className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
                    </div>
                    <div className="flex gap-3">
                      <select value={newNote.noteType} onChange={(e) => setNewNote(prev => ({ ...prev, noteType: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white">
                        {['progress', 'nursing', 'consult', 'procedure', 'discharge', 'handoff', 'social_work'].map(t =>
                          <option key={t} value={t}>{t.replace('_', ' ')}</option>
                        )}
                      </select>
                      <select value={newNote.shiftType} onChange={(e) => setNewNote(prev => ({ ...prev, shiftType: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white">
                        {['day', 'night', 'evening'].map(s => <option key={s} value={s}>{s} shift</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <textarea value={newNote.content} onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Type your note or click the microphone to dictate..."
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/20 resize-none bg-white" />
                      {voiceSupported && (
                        <button onClick={toggleVoice}
                          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                            recording
                              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-brand/10 hover:text-brand'
                          }`}
                          title={recording ? 'Stop recording' : 'Start voice dictation'}>
                          🎙️
                        </button>
                      )}
                    </div>
                    {recording && (
                      <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Recording — speak clearly, click mic to stop
                      </p>
                    )}
                    <div className="flex justify-end gap-2">
                      <button onClick={saveNote} disabled={saving || !newNote.content.trim()}
                        className="px-5 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Note'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mb-4">
                <select value={noteFilter} onChange={(e) => setNoteFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none">
                  <option value="">All Types</option>
                  {['progress', 'nursing', 'consult', 'procedure', 'discharge', 'handoff', 'social_work'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none">
                  <option value="">All Shifts</option>
                  {['day', 'night', 'evening'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredNotes.map((n: any) => (
                  <div key={n.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-dark">{n.authorName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{n.authorRole}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand">{n.noteType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{n.shiftType} shift</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vitals Tab */}
          {tab === 'vitals' && (
            <div>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {[
                  { key: 'HR', label: 'Heart Rate (bpm)', color: '#ef4444' },
                  { key: 'SpO2', label: 'SpO2 (%)', color: '#3b82f6' },
                  { key: 'SBP', label: 'Systolic BP (mmHg)', color: '#8b5cf6' },
                  { key: 'RR', label: 'Respiratory Rate', color: '#10b981' },
                ].map(chart => (
                  <div key={chart.key} className="bg-surface rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">{chart.label}</h3>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={vitalsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Time', 'Temp', 'HR', 'BP', 'RR', 'SpO2', 'Pain', 'By'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {patient.vitals.map((v: any) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-500">{new Date(v.recordedAt).toLocaleString()}</td>
                        <td className="px-3 py-2">{v.temperature}°F</td>
                        <td className="px-3 py-2">{v.heartRate}</td>
                        <td className="px-3 py-2">{v.bloodPressureSys}/{v.bloodPressureDia}</td>
                        <td className="px-3 py-2">{v.respiratoryRate}</td>
                        <td className="px-3 py-2">{v.oxygenSat}%</td>
                        <td className="px-3 py-2">{v.painLevel}/10</td>
                        <td className="px-3 py-2 text-xs text-gray-400">{v.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Labs Tab */}
          {tab === 'labs' && (
            <div className="space-y-6">
              {Object.entries(labsByPanel).map(([panel, labs]) => (
                <div key={panel}>
                  <h3 className="text-md font-semibold text-dark mb-3">{panel}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Test', 'Value', 'Unit', 'Normal Range', 'Flag', 'Collected', 'Result'].map(h => (
                            <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {labs.map((l: any) => (
                          <tr key={l.id} className={`hover:bg-gray-50 ${l.flag === 'critical' ? 'bg-red-50' : l.flag === 'high' || l.flag === 'low' ? 'bg-amber-50' : ''}`}>
                            <td className="px-3 py-2 font-medium">{l.testName}</td>
                            <td className={`px-3 py-2 font-bold ${l.flag === 'critical' ? 'text-red-600 animate-pulse-critical' : l.flag === 'high' || l.flag === 'low' ? 'text-amber-600' : ''}`}>
                              {l.value}
                            </td>
                            <td className="px-3 py-2 text-gray-500">{l.unit}</td>
                            <td className="px-3 py-2 text-gray-400">{l.normalRange}</td>
                            <td className="px-3 py-2">
                              {l.flag && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  l.flag === 'critical' ? 'bg-red-100 text-red-700' : l.flag === 'high' ? 'bg-amber-100 text-amber-700' : l.flag === 'low' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>{l.flag}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-400">{new Date(l.collectedAt).toLocaleString()}</td>
                            <td className="px-3 py-2 text-xs text-gray-400">{new Date(l.resultAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Medications Tab */}
          {tab === 'medications' && (
            <div>
              <h3 className="text-md font-semibold text-dark mb-3">Active Medications</h3>
              <div className="space-y-2 mb-6">
                {patient.medications.filter((m: any) => m.status === 'active').map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-dark">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.dosage} | {m.route} | {m.frequency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Ordered by {m.orderedBy}</p>
                      <p className="text-xs text-gray-400">{new Date(m.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              {patient.medications.some((m: any) => m.status === 'discontinued') && (
                <>
                  <h3 className="text-md font-semibold text-gray-400 mb-3">Discontinued</h3>
                  <div className="space-y-2">
                    {patient.medications.filter((m: any) => m.status === 'discontinued').map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60">
                        <div>
                          <p className="text-sm font-medium text-gray-500 line-through">{m.name}</p>
                          <p className="text-xs text-gray-400">{m.dosage} | {m.route} | {m.frequency}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Type', 'Description', 'Status', 'Priority', 'Ordered By', 'Date'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patient.orders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 capitalize">{o.orderType}</td>
                      <td className="px-3 py-2">{o.description}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          o.status === 'pending' ? 'bg-amber-100 text-amber-700' : o.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>{o.status}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          o.priority === 'stat' ? 'bg-red-100 text-red-700' : o.priority === 'urgent' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>{o.priority}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">{o.orderedBy}</td>
                      <td className="px-3 py-2 text-xs text-gray-400">{new Date(o.orderedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="space-y-6">
              {/* Patient Photo */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-brand/20 overflow-hidden flex items-center justify-center mb-3">
                  {patientPhoto ? (
                    <img src={patientPhoto.filepath} alt="Patient" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-gray-300">👤</span>
                  )}
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
                <button onClick={() => photoInputRef.current?.click()} disabled={imageUploading}
                  className="px-4 py-1.5 text-sm font-medium text-brand border border-brand/30 rounded-lg hover:bg-brand/5 disabled:opacity-50">
                  {imageUploading ? 'Uploading...' : patientPhoto ? 'Change Photo' : 'Upload Photo'}
                </button>
              </div>

              {/* Patient Information */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h3 className="text-md font-semibold text-dark">Patient Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Allergies</label>
                    <input value={profileAllergies} onChange={(e) => setProfileAllergies(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/20 bg-white"
                      placeholder="e.g. Penicillin, Sulfa" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Dietary Restrictions</label>
                    <select value={profileDiet} onChange={(e) => setProfileDiet(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/20 bg-white">
                      <option value="">Select...</option>
                      {['Regular', 'NPO', 'Clear Liquids', 'Full Liquids', 'Mechanical Soft', 'Pureed', 'Low Sodium', 'Diabetic', 'Renal', 'Cardiac', 'Gluten Free', 'Kosher', 'Halal', 'Vegetarian', 'Other'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Code Status</label>
                    <select value={profileCodeStatus} onChange={(e) => setProfileCodeStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/20 bg-white">
                      <option value="">Select...</option>
                      {['Full Code', 'DNR', 'DNI', 'DNR/DNI'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={saveProfile} disabled={profileSaving}
                    className="px-5 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 disabled:opacity-50">
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {profileSaved && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
                </div>
              </div>

              {/* Medical Images & Scans */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h3 className="text-md font-semibold text-dark">Medical Images & Scans</h3>

                {/* Upload area */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleImageDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    dragOver ? 'border-brand bg-brand/10' : 'border-gray-300 bg-brand/5 hover:border-brand/50'
                  }`}>
                  <p className="text-sm text-gray-500 mb-3">Drag & drop an image here, or click to browse</p>
                  <div className="flex flex-wrap gap-3 justify-center items-end mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                      <select value={imageCategory} onChange={(e) => setImageCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white">
                        <option value="xray">X-Ray</option>
                        <option value="mri">MRI</option>
                        <option value="ct">CT Scan</option>
                        <option value="ultrasound">Ultrasound</option>
                        <option value="lab_report">Lab Report</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                      <input value={imageDescription} onChange={(e) => setImageDescription(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white"
                        placeholder="e.g. Chest X-Ray AP" />
                    </div>
                    <div>
                      <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, imageCategory, imageDescription); }} />
                      <button onClick={() => imageInputRef.current?.click()} disabled={imageUploading}
                        className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 disabled:opacity-50">
                        {imageUploading ? 'Uploading...' : 'Browse & Upload'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image grid */}
                {medicalImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {medicalImages.map((img: any) => (
                      <div key={img.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden group">
                        <div className="relative cursor-pointer h-40 bg-gray-100" onClick={() => setLightboxImage(img)}>
                          <img src={img.filepath} alt={img.description || img.filename} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-2xl transition-opacity">🔍</span>
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            {categoryBadge(img.category)}
                            <button onClick={() => deleteImage(img.id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button>
                          </div>
                          {img.description && <p className="text-xs text-gray-600 truncate">{img.description}</p>}
                          <p className="text-xs text-gray-400">{new Date(img.uploadedAt).toLocaleDateString()} · {img.uploadedBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">No medical images uploaded yet.</p>
                )}
              </div>

              {/* Lightbox */}
              {lightboxImage && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setLightboxImage(null)}>
                  <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                    <img src={lightboxImage.filepath} alt={lightboxImage.description || ''} className="max-w-full max-h-[80vh] rounded-lg" />
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        {categoryBadge(lightboxImage.category)}
                        <span className="ml-2 text-sm text-white">{lightboxImage.description}</span>
                      </div>
                      <button onClick={() => setLightboxImage(null)} className="text-white text-lg hover:text-gray-300">✕</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Widget */}
      <button onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand text-white rounded-full shadow-lg hover:bg-brand/90 flex items-center justify-center text-xl z-50">
        💬
      </button>
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-dark text-sm">ChartIQ Assistant</h3>
              <p className="text-xs text-gray-400">Ask about {patient.firstName}&apos;s chart</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <p className="text-sm text-gray-400 text-center mt-10">Ask any question about this patient&apos;s chart...</p>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  m.role === 'user' ? 'bg-brand text-white' : 'bg-surface text-dark'
                }`}>
                  {m.content || <span className="animate-pulse">...</span>}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Ask about labs, vitals, meds..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/20" />
              <button onClick={sendChat} disabled={chatLoading}
                className="px-3 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 disabled:opacity-50">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
