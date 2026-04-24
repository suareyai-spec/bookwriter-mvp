'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const policies = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  title: ['HIPAA Privacy Policy', 'Information Security Policy', 'Acceptable Use Policy', 'Incident Response Plan', 'Data Retention Policy', 'Access Control Policy', 'Business Continuity Plan', 'Breach Notification Policy', 'Mobile Device Policy', 'Social Media Policy'][i],
  category: ['Privacy', 'Security', 'IT', 'Security', 'Compliance', 'Security', 'Operations', 'Privacy', 'IT', 'HR'][i],
  currentVersion: `${3 + (i % 3)}.${i % 4}`,
  lastUpdated: `2026-0${1 + (i % 3)}-${String(10 + i).padStart(2, '0')}`,
  content: [
    `## Purpose\nThis policy establishes guidelines for protecting the privacy and security of Protected Health Information (PHI) in compliance with HIPAA regulations.\n\n## Scope\nThis policy applies to all workforce members, including employees, contractors, and volunteers who have access to PHI.\n\n## Policy\n1. **Minimum Necessary Standard**: Access to PHI shall be limited to the minimum necessary to accomplish the intended purpose.\n2. **Use and Disclosure**: PHI may only be used or disclosed for treatment, payment, or healthcare operations without patient authorization.\n3. **Patient Rights**: Patients have the right to access, amend, and receive an accounting of disclosures of their PHI.\n4. **Safeguards**: Appropriate administrative, physical, and technical safeguards must be implemented to protect PHI.\n5. **Training**: All workforce members must complete HIPAA training within 30 days of hire and annually thereafter.\n\n## Enforcement\nViolations of this policy may result in disciplinary action up to and including termination of employment.`,
  ][0],
  versions: Array.from({ length: 3 + (i % 3) }, (_, j) => ({
    version: `${j + 1}.${j % 4}`,
    date: `202${4 + Math.floor(j / 2)}-${String(1 + (j * 3 % 12)).padStart(2, '0')}-${String(10 + j * 5).padStart(2, '0')}`,
    author: ['Dr. Sarah Mitchell', 'Compliance Team', 'IT Security', 'Legal Department', 'Privacy Officer'][j % 5],
    changes: ['Initial policy creation', 'Added mobile device provisions', 'Updated breach notification timelines', 'Incorporated CMS final rule changes', 'Annual review and update', 'Added telehealth provisions'][j % 6],
  })),
  acknowledgments: Array.from({ length: 20 }, (_, j) => ({
    name: ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eve Davis', 'Frank Garcia', 'Grace Miller', 'Henry Wilson', 'Iris Martinez', 'Jack Anderson', 'Kate Thompson', 'Leo White', 'Mia Harris', 'Noah Clark', 'Olivia Lewis', 'Pete Young', 'Quinn Hall', 'Rose Allen', 'Sam King', 'Tina Wright'][j],
    role: ['Nurse', 'Admin', 'IT', 'Billing', 'Physician', 'Receptionist', 'Manager', 'Tech'][j % 8],
    acknowledged: j < 14,
    acknowledgedDate: j < 14 ? `2026-0${1 + (j % 3)}-${String(5 + j).padStart(2, '0')}` : null,
    currentVersion: j < 14,
  })),
  requiresReAck: i < 3,
  relatedTraining: [
    { id: '1', title: 'HIPAA Privacy & Security' },
    { id: '3', title: 'Fire Safety' },
  ].slice(0, 1 + (i % 2)),
}));

export default function PolicyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'content' | 'versions' | 'acknowledgments'>('content');

  const policy = policies.find(p => p.id === id) || policies[0];
  const ackRate = Math.round((policy.acknowledgments.filter(a => a.acknowledged).length / policy.acknowledgments.length) * 100);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <button onClick={() => router.push('/complianceiq/policies')} className="text-sm text-[#065F46] hover:underline">← Back to Policies</button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[#1d1d1f]">{policy.title}</h1>
                {policy.requiresReAck && <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Requires Re-acknowledgment</span>}
              </div>
              <div className="flex gap-6 text-xs text-[#86868b]">
                <span>Category: <strong className="text-[#1d1d1f]">{policy.category}</strong></span>
                <span>Version: <strong className="text-[#1d1d1f]">v{policy.currentVersion}</strong></span>
                <span>Last Updated: <strong className="text-[#1d1d1f]">{policy.lastUpdated}</strong></span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#86868b]">Acknowledgment Rate</p>
              <p className={`text-2xl font-bold ${ackRate >= 90 ? 'text-green-600' : ackRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{ackRate}%</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['content', 'versions', 'acknowledgments'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${tab === t ? 'bg-[#065F46] text-white' : 'bg-white text-[#6e6e73] border border-gray-200 hover:bg-gray-50'}`}>{t === 'acknowledgments' ? `Acknowledgments (${ackRate}%)` : t}</button>
          ))}
        </div>

        {tab === 'content' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8">
            <div className="prose prose-sm max-w-none">
              {policy.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-3">{line.replace('## ', '')}</h2>;
                if (line.match(/^\d+\./)) return <p key={i} className="text-sm text-[#6e6e73] ml-4 mb-2">{line}</p>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i} className="text-sm text-[#6e6e73] mb-2">{line}</p>;
              })}
            </div>
          </div>
        )}

        {tab === 'versions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Version History</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
                <th className="pb-3 font-medium">Version</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Author</th><th className="pb-3 font-medium">Changes</th>
              </tr></thead>
              <tbody>
                {[...policy.versions].reverse().map((v, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i === 0 ? 'bg-green-50/50' : ''}`}>
                    <td className="py-3 font-medium">v{v.version} {i === 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 ml-1">Current</span>}</td>
                    <td className="py-3 text-[#86868b]">{v.date}</td>
                    <td className="py-3">{v.author}</td>
                    <td className="py-3 text-[#6e6e73]">{v.changes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'acknowledgments' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Staff Acknowledgments</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
                <th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">Role</th><th className="pb-3 font-medium">Acknowledged</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Current Version</th>
              </tr></thead>
              <tbody>
                {policy.acknowledgments.map((a, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${!a.acknowledged ? 'bg-red-50/50' : ''}`}>
                    <td className="py-3 font-medium">{a.name}</td>
                    <td className="py-3 text-[#6e6e73]">{a.role}</td>
                    <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${a.acknowledged ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.acknowledged ? 'Yes' : 'No'}</span></td>
                    <td className="py-3 text-[#86868b]">{a.acknowledgedDate || '—'}</td>
                    <td className="py-3">{a.currentVersion ? <span className="text-green-600">✓</span> : <span className="text-red-600">✕ Needs re-ack</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Related Training */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-3">Related Training Courses</h2>
          <div className="space-y-2">
            {policy.relatedTraining.map(t => (
              <button key={t.id} onClick={() => router.push(`/complianceiq/training/${t.id}`)} className="flex items-center gap-2 text-sm text-[#065F46] hover:underline">
                📚 {t.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
