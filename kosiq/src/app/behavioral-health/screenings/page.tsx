'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

const initialScreenings = [
  { id: 1, p: 'Sarah Mitchell', t: 'PHQ-9', s: 18, sv: 'Mod. Severe', pr: 'Dr. Adams' },
  { id: 2, p: 'Mark Thompson', t: 'GAD-7', s: 21, sv: 'Severe', pr: 'Dr. Rivera' },
  { id: 3, p: 'Lisa Chen', t: 'PHQ-9', s: 8, sv: 'Mild', pr: 'Dr. Adams' },
  { id: 4, p: 'Tom Baker', t: 'PHQ-9', s: 14, sv: 'Moderate', pr: 'Dr. Park' },
  { id: 5, p: 'Amy Rodriguez', t: 'GAD-7', s: 11, sv: 'Moderate', pr: 'Dr. Rivera' },
  { id: 6, p: 'David Clark', t: 'PHQ-9', s: 22, sv: 'Severe', pr: 'Dr. Rivera' },
  { id: 7, p: 'Nancy White', t: 'AUDIT-C', s: 8, sv: 'At-risk', pr: 'Dr. Park' },
];

const phq9Questions = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself',
  'Trouble concentrating',
  'Moving or speaking slowly / being fidgety',
  'Thoughts of self-harm',
];

const gad7Questions = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it\'s hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid something awful might happen',
];

function getSeverity(type: string, score: number): string {
  if (type === 'PHQ-9') {
    if (score >= 20) return 'Severe';
    if (score >= 15) return 'Mod. Severe';
    if (score >= 10) return 'Moderate';
    if (score >= 5) return 'Mild';
    return 'None';
  }
  if (type === 'GAD-7') {
    if (score >= 15) return 'Severe';
    if (score >= 10) return 'Moderate';
    if (score >= 5) return 'Mild';
    return 'None';
  }
  return score >= 4 ? 'At-risk' : 'Low risk';
}

export default function ScreeningsPage() {
  const { showToast } = useToast();
  const [screenings, setScreenings] = useState(initialScreenings);
  const [formModal, setFormModal] = useState(false);
  const [formType, setFormType] = useState<'PHQ-9' | 'GAD-7'>('PHQ-9');
  const [formPatient, setFormPatient] = useState('');
  const [formProvider, setFormProvider] = useState('Dr. Adams');
  const [answers, setAnswers] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  const openForm = (type: 'PHQ-9' | 'GAD-7') => {
    setFormType(type);
    const qs = type === 'PHQ-9' ? phq9Questions : gad7Questions;
    setAnswers(new Array(qs.length).fill(0));
    setFormPatient('');
    setFormModal(true);
  };

  const totalScore = answers.reduce((a, b) => a + b, 0);
  const questions = formType === 'PHQ-9' ? phq9Questions : gad7Questions;

  const submitForm = () => {
    if (!formPatient) return;
    const sv = getSeverity(formType, totalScore);
    setScreenings(prev => [{ id: Date.now(), p: formPatient, t: formType, s: totalScore, sv, pr: formProvider }, ...prev]);
    setFormModal(false);
    showToast(`${formType} screening completed — Score: ${totalScore} (${sv})`);
  };

  const filtered = search ? screenings.filter(r => r.p.toLowerCase().includes(search.toLowerCase())) : screenings;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Mental Health Screenings</h1>
            <p className="text-sm text-[#86868b]">PHQ-9, GAD-7, AUDIT-C integration</p>
          </div>
          <div className="flex gap-2">
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm w-48" />
            <button onClick={() => openForm('PHQ-9')} className="px-4 py-2 bg-[#A855F7] text-white text-sm rounded-xl hover:bg-[#9333EA]">+ PHQ-9</button>
            <button onClick={() => openForm('GAD-7')} className="px-4 py-2 bg-[#A855F7]/80 text-white text-sm rounded-xl hover:bg-[#9333EA]">+ GAD-7</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Patient</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Type</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Score</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Severity</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Provider</th>
            </tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm font-medium text-[#1d1d1f]">{r.p}</td>
                  <td className="px-5 py-3 text-center"><span className="px-2 py-0.5 bg-[#A855F7]/10 text-[#A855F7] text-[10px] rounded-full">{r.t}</span></td>
                  <td className="px-5 py-3 text-center"><span className={`text-sm font-bold ${r.s >= 20 ? 'text-red-600' : r.s >= 15 ? 'text-orange-500' : r.s >= 10 ? 'text-yellow-600' : 'text-green-600'}`}>{r.s}</span></td>
                  <td className="px-5 py-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full ${r.sv === 'Severe' ? 'bg-red-50 text-red-600' : r.sv === 'Mod. Severe' ? 'bg-orange-50 text-orange-600' : r.sv === 'Moderate' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>{r.sv}</span></td>
                  <td className="px-5 py-3 text-xs text-[#6e6e73]">{r.pr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={formModal} onClose={() => setFormModal(false)} title={`${formType} Screening Form`} width="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#86868b] mb-1 uppercase">Patient</label>
              <input value={formPatient} onChange={e => setFormPatient(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Patient name" />
            </div>
            <div>
              <label className="block text-xs text-[#86868b] mb-1 uppercase">Provider</label>
              <select value={formProvider} onChange={e => setFormProvider(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                {['Dr. Adams', 'Dr. Rivera', 'Dr. Park'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-[#86868b]">Over the last 2 weeks, how often have you been bothered by:</p>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs text-[#1d1d1f] flex-1">{i + 1}. {q}</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map(v => (
                    <button key={v} onClick={() => { const n = [...answers]; n[i] = v; setAnswers(n); }}
                      className={`w-8 h-8 rounded-lg text-xs font-medium ${answers[i] === v ? 'bg-[#A855F7] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#A855F7]/10'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <span className="text-lg font-bold text-[#A855F7]">Score: {totalScore}</span>
              <span className="ml-2 text-sm text-[#86868b]">— {getSeverity(formType, totalScore)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setFormModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">Cancel</button>
              <button onClick={submitForm} className="px-4 py-2 text-sm bg-[#A855F7] text-white rounded-xl">Submit Screening</button>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
