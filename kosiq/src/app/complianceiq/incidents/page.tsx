'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState, useMemo } from 'react';

const incidentTypes = ['Privacy Breach', 'Security Incident', 'Clinical Error', 'Patient Complaint', 'Workplace Safety', 'Documentation Error', 'Medication Error', 'Policy Violation'] as const;
const severityLevels = ['Critical', 'High', 'Medium', 'Low'] as const;
const incidentStatuses = ['Open', 'Under Investigation', 'Corrective Action', 'Resolved', 'Closed'] as const;

type IncidentNote = { text: string; date: string; author: string };

type Incident = {
  id: string;
  type: string;
  severity: string;
  description: string;
  reportedBy: string;
  reportedDate: string;
  status: string;
  correctiveAction: string;
  resolvedDate: string | null;
  notes: IncidentNote[];
};

const initialIncidents: Incident[] = Array.from({ length: 45 }, (_, i) => ({
  id: `INC-2026-${String(100 + i).padStart(4, '0')}`,
  type: incidentTypes[i % incidentTypes.length],
  severity: severityLevels[i % severityLevels.length],
  description: [
    'Unauthorized access to patient records by terminated employee',
    'Phishing email opened by staff member — no data compromised',
    'Incorrect medication dosage administered — patient stable',
    'Patient complaint regarding billing error and lack of explanation',
    'Slip and fall in hallway — wet floor sign not posted',
    'Missing consent form for procedure — discovered post-op',
    'Wrong patient chart pulled for lab results review',
    'Staff member shared login credentials with colleague',
  ][i % 8],
  reportedBy: ['Sarah Mitchell', 'James Rodriguez', 'Emily Chen', 'Marcus Johnson', 'Lisa Park', 'Dr. Maria Santos'][i % 6],
  reportedDate: `2026-${String(1 + (i % 3)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
  status: incidentStatuses[i % incidentStatuses.length],
  correctiveAction: i % 5 >= 2 ? 'Staff re-training, policy update, enhanced monitoring' : '',
  resolvedDate: i % 5 >= 3 ? `2026-03-${String(1 + (i % 10)).padStart(2, '0')}` : null,
  notes: [],
}));

const sevColor: Record<string, string> = { Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Medium: 'bg-yellow-100 text-yellow-700', Low: 'bg-green-100 text-green-700' };
const statusColor: Record<string, string> = { Open: 'bg-blue-100 text-blue-700', 'Under Investigation': 'bg-purple-100 text-purple-700', 'Corrective Action': 'bg-yellow-100 text-yellow-700', Resolved: 'bg-green-100 text-green-700', Closed: 'bg-gray-100 text-gray-600' };

export default function IncidentsPage() {
  const { showToast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSev, setFilterSev] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Incident | null>(null);
  const [nextId, setNextId] = useState(200);

  // Report Incident modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<string>(incidentTypes[0]);
  const [reportSeverity, setReportSeverity] = useState<string>(severityLevels[2]);
  const [reportDescription, setReportDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('');

  // Detail modal: notes
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('');

  // Detail modal: status update
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const filtered = useMemo(() => incidents.filter(inc =>
    (!search || inc.id.toLowerCase().includes(search.toLowerCase()) || inc.description.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || inc.type === filterType) &&
    (!filterSev || inc.severity === filterSev) &&
    (!filterStatus || inc.status === filterStatus)
  ), [search, filterType, filterSev, filterStatus, incidents]);

  const handleReportSubmit = () => {
    if (!reportDescription.trim()) {
      showToast('Description is required');
      return;
    }
    const newIncident: Incident = {
      id: `INC-2026-${String(nextId).padStart(4, '0')}`,
      type: reportType,
      severity: reportSeverity,
      description: reportDescription.trim(),
      reportedBy: reportedBy.trim() || 'Anonymous',
      reportedDate: new Date().toISOString().slice(0, 10),
      status: 'Open',
      correctiveAction: '',
      resolvedDate: null,
      notes: [],
    };
    setIncidents(prev => [newIncident, ...prev]);
    setNextId(prev => prev + 1);
    setShowReportModal(false);
    setReportType(incidentTypes[0]);
    setReportSeverity(severityLevels[2]);
    setReportDescription('');
    setReportedBy('');
    showToast(`Incident ${newIncident.id} reported successfully`);
  };

  const handleAddNote = () => {
    if (!selected || !noteText.trim()) return;
    const note: IncidentNote = {
      text: noteText.trim(),
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      author: noteAuthor.trim() || 'Anonymous',
    };
    setIncidents(prev => prev.map(inc =>
      inc.id === selected.id ? { ...inc, notes: [...inc.notes, note] } : inc
    ));
    setSelected(prev => prev ? { ...prev, notes: [...prev.notes, note] } : prev);
    setNoteText('');
    setNoteAuthor('');
    setShowNoteInput(false);
    showToast('Note added successfully');
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (!selected) return;
    const resolvedDate = (newStatus === 'Resolved' || newStatus === 'Closed')
      ? new Date().toISOString().slice(0, 10)
      : selected.resolvedDate;
    setIncidents(prev => prev.map(inc =>
      inc.id === selected.id ? { ...inc, status: newStatus, resolvedDate } : inc
    ));
    setSelected(prev => prev ? { ...prev, status: newStatus, resolvedDate } : prev);
    setShowStatusDropdown(false);
    showToast(`Status updated to "${newStatus}"`);
  };

  const handleCloseDetail = () => {
    setSelected(null);
    setShowNoteInput(false);
    setShowStatusDropdown(false);
    setNoteText('');
    setNoteAuthor('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-semibold text-[#1d1d1f]">Incident Management</h1><p className="text-sm text-[#86868b]">Incident reporting, tracking & corrective actions</p></div>
          <button onClick={() => setShowReportModal(true)} className="px-4 py-2 bg-[#DC2626] text-white text-sm rounded-lg hover:bg-[#B91C1C] transition-colors">+ Report Incident</button>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <input placeholder="Search incidents..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-72" />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Types</option>{incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterSev} onChange={e => setFilterSev(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Severities</option>{severityLevels.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Statuses</option>{incidentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="text-xs text-[#86868b] self-center ml-auto">{filtered.length} incidents</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">ID</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Type</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Severity</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Description</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Reported By</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Date</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-3 py-3">Status</th>
            </tr></thead>
            <tbody>
              {filtered.slice(0, 30).map((inc, i) => (
                <tr key={inc.id} className="border-t border-gray-50 hover:bg-[#f5f5f7]/50 cursor-pointer text-xs" onClick={() => { setSelected(inc); setShowNoteInput(false); setShowStatusDropdown(false); }}>
                  <td className="px-3 py-3 font-mono text-[#065F46]">{inc.id}</td>
                  <td className="px-3 py-3 text-[#1d1d1f]">{inc.type}</td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sevColor[inc.severity]}`}>{inc.severity}</span></td>
                  <td className="px-3 py-3 text-[#6e6e73] max-w-[250px] truncate">{inc.description}</td>
                  <td className="px-3 py-3 text-[#1d1d1f]">{inc.reportedBy}</td>
                  <td className="px-3 py-3 text-[#86868b]">{inc.reportedDate}</td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[inc.status]}`}>{inc.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Report Incident Modal */}
        <Modal open={showReportModal} onClose={() => setShowReportModal(false)} title="Report New Incident" width="max-w-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1">Type</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1">Severity</label>
              <select value={reportSeverity} onChange={e => setReportSeverity(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                {severityLevels.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1">Description *</label>
              <textarea value={reportDescription} onChange={e => setReportDescription(e.target.value)} placeholder="Describe the incident in detail..." rows={4} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1">Reported By</label>
              <input value={reportedBy} onChange={e => setReportedBy(e.target.value)} placeholder="Your name" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1">Date</label>
              <input value={new Date().toISOString().slice(0, 10)} disabled className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-[#86868b]" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleReportSubmit} className="px-4 py-2 bg-[#DC2626] text-white text-sm rounded-lg hover:bg-[#B91C1C] transition-colors">Submit Report</button>
              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </Modal>

        {/* Incident Detail Modal */}
        <Modal open={!!selected} onClose={handleCloseDetail} title={`Incident ${selected?.id || ''}`} width="max-w-2xl">
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#86868b]">Type</p><p className="text-sm font-medium">{selected.type}</p></div>
                <div><p className="text-xs text-[#86868b]">Severity</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sevColor[selected.severity]}`}>{selected.severity}</span></div>
                <div className="col-span-2"><p className="text-xs text-[#86868b]">Description</p><p className="text-sm">{selected.description}</p></div>
                <div><p className="text-xs text-[#86868b]">Reported By</p><p className="text-sm">{selected.reportedBy}</p></div>
                <div><p className="text-xs text-[#86868b]">Date</p><p className="text-sm">{selected.reportedDate}</p></div>
                <div><p className="text-xs text-[#86868b]">Status</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[selected.status]}`}>{selected.status}</span></div>
                {selected.resolvedDate && <div><p className="text-xs text-[#86868b]">Resolved Date</p><p className="text-sm">{selected.resolvedDate}</p></div>}
                {selected.correctiveAction && <div className="col-span-2"><p className="text-xs text-[#86868b]">Corrective Action</p><p className="text-sm">{selected.correctiveAction}</p></div>}
              </div>

              {/* Investigation Notes */}
              {selected.notes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#86868b] uppercase mb-2">Investigation Notes</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selected.notes.map((note, idx) => (
                      <div key={idx} className="bg-[#f5f5f7] rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-[#065F46]">{note.author}</span>
                          <span className="text-[10px] text-[#86868b]">{note.date}</span>
                        </div>
                        <p className="text-xs text-[#1d1d1f]">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Note Input */}
              {showNoteInput && (
                <div className="bg-[#f5f5f7] rounded-lg p-3 space-y-2">
                  <input value={noteAuthor} onChange={e => setNoteAuthor(e.target.value)} placeholder="Your name" className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white" />
                  <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Write your investigation note..." rows={3} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white resize-none" />
                  <div className="flex gap-2">
                    <button onClick={handleAddNote} className="px-3 py-1.5 bg-[#065F46] text-white text-xs rounded-lg hover:bg-[#064E3B] transition-colors">Save Note</button>
                    <button onClick={() => { setShowNoteInput(false); setNoteText(''); setNoteAuthor(''); }} className="px-3 py-1.5 bg-gray-200 text-xs rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              {/* Status Dropdown */}
              {showStatusDropdown && (
                <div className="bg-[#f5f5f7] rounded-lg p-3">
                  <p className="text-xs font-medium text-[#86868b] mb-2">Select New Status</p>
                  <div className="flex flex-wrap gap-2">
                    {incidentStatuses.map(s => (
                      <button key={s} onClick={() => handleStatusUpdate(s)} disabled={s === selected.status} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${s === selected.status ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-200 hover:bg-[#065F46] hover:text-white'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowNoteInput(false); }} className="px-4 py-2 bg-[#065F46] text-white text-sm rounded-lg hover:bg-[#064E3B] transition-colors">
                  {showStatusDropdown ? 'Hide Status Options' : 'Update Status'}
                </button>
                <button onClick={() => { setShowNoteInput(!showNoteInput); setShowStatusDropdown(false); }} className="px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                  {showNoteInput ? 'Cancel Note' : 'Add Notes'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
