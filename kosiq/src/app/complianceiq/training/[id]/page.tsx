'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Modal from '@/components/Modal';

const departments = ['Nursing', 'Administration', 'IT', 'Billing', 'Clinical', 'Front Desk'];
const roles = ['Nurse', 'Admin Assistant', 'IT Specialist', 'Billing Coordinator', 'Physician', 'Receptionist', 'Manager', 'Technician'];
const completionStatuses = ['Completed', 'In Progress', 'Not Started'] as const;

const courses = Array.from({ length: 10 }, (_, i) => {
  const staff = Array.from({ length: 15 + i }, (_, j) => {
    const status = completionStatuses[j < (8 + i) ? 0 : j < (11 + i) ? 1 : 2];
    return {
      name: ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eve Davis', 'Frank Garcia', 'Grace Miller', 'Henry Wilson', 'Iris Martinez', 'Jack Anderson', 'Kate Thompson', 'Leo White', 'Mia Harris', 'Noah Clark', 'Olivia Lewis', 'Pete Young', 'Quinn Hall', 'Rose Allen', 'Sam King', 'Tina Wright', 'Uma Scott', 'Vic Adams', 'Wendy Baker', 'Xander Nelson', 'Yara Green'][j % 25],
      role: roles[j % 8],
      department: departments[j % 6],
      status,
      completionDate: status === 'Completed' ? `2026-0${1 + (j % 3)}-${String(5 + j).padStart(2, '0')}` : null,
      score: status === 'Completed' ? 72 + Math.round(Math.random() * 28) : null,
    };
  });
  return {
    id: String(i + 1),
    title: ['HIPAA Privacy & Security', 'Infection Control', 'Fire Safety', 'Workplace Violence Prevention', 'Blood-borne Pathogens', 'Cultural Competency', 'Emergency Preparedness', 'Patient Rights', 'Fraud, Waste & Abuse', 'Anti-Kickback Statute'][i],
    category: ['Compliance', 'Clinical', 'Safety', 'Safety', 'Clinical', 'HR', 'Safety', 'Compliance', 'Compliance', 'Legal'][i],
    requiredBy: `2026-0${3 + (i % 4)}-${String(15 + (i % 15)).padStart(2, '0')}`,
    status: i < 3 ? 'Active' : i < 7 ? 'Upcoming' : 'Completed',
    staff,
    totalStaff: staff.length,
    completed: staff.filter(s => s.status === 'Completed').length,
    inProgress: staff.filter(s => s.status === 'In Progress').length,
    notStarted: staff.filter(s => s.status === 'Not Started').length,
  };
});

export default function TrainingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [certModal, setCertModal] = useState(false);
  const [certName, setCertName] = useState('');

  const course = courses.find(c => c.id === id) || courses[0];
  const completionRate = Math.round((course.completed / course.totalStaff) * 100);

  const deptStats = departments.map(d => {
    const deptStaff = course.staff.filter(s => s.department === d);
    const completed = deptStaff.filter(s => s.status === 'Completed').length;
    return { department: d, total: deptStaff.length, completed, rate: deptStaff.length > 0 ? Math.round((completed / deptStaff.length) * 100) : 0 };
  }).filter(d => d.total > 0);

  const isOverdue = new Date(course.requiredBy) < new Date('2026-03-12');

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <button onClick={() => router.push('/complianceiq/training')} className="text-sm text-[#065F46] hover:underline">← Back to Training</button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[#1d1d1f]">{course.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.status === 'Active' ? 'bg-green-100 text-green-700' : course.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{course.status}</span>
              </div>
              <div className="flex gap-6 text-xs text-[#86868b]">
                <span>Category: <strong className="text-[#1d1d1f]">{course.category}</strong></span>
                <span>Required by: <strong className={isOverdue ? 'text-red-600' : 'text-[#1d1d1f]'}>{course.requiredBy}</strong></span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#86868b]">Completion Rate</p>
              <p className={`text-3xl font-bold ${completionRate >= 90 ? 'text-green-600' : completionRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{completionRate}%</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Staff', value: course.totalStaff, color: 'text-[#1d1d1f]' },
            { label: 'Completed', value: course.completed, color: 'text-green-600' },
            { label: 'In Progress', value: course.inProgress, color: 'text-yellow-600' },
            { label: 'Not Started', value: course.notStarted, color: 'text-red-600' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
              <p className="text-xs text-[#86868b] mb-1">{m.label}</p>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Department Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Progress by Department</h2>
          <div className="space-y-3">
            {deptStats.map(d => (
              <div key={d.department} className="flex items-center gap-4">
                <span className="text-sm font-medium w-28">{d.department}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${d.rate}%`, backgroundColor: d.rate >= 90 ? '#16a34a' : d.rate >= 70 ? '#f59e0b' : '#dc2626' }} />
                </div>
                <span className="text-sm font-medium w-16 text-right">{d.rate}%</span>
                <span className="text-xs text-[#86868b] w-20 text-right">{d.completed}/{d.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Staff Completion</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#86868b] text-xs border-b border-gray-100">
              <th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">Role</th><th className="pb-3 font-medium">Department</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Completed</th><th className="pb-3 font-medium">Score</th><th className="pb-3 font-medium"></th>
            </tr></thead>
            <tbody>
              {course.staff.map((s, i) => (
                <tr key={i} className={`border-b border-gray-50 ${s.status === 'Not Started' && isOverdue ? 'bg-red-50/50' : 'hover:bg-gray-50/50'}`}>
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3 text-[#6e6e73]">{s.role}</td>
                  <td className="py-3 text-[#6e6e73]">{s.department}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'Completed' ? 'bg-green-100 text-green-700' : s.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {s.status}{s.status === 'Not Started' && isOverdue ? ' ⚠' : ''}
                    </span>
                  </td>
                  <td className="py-3 text-[#86868b]">{s.completionDate || '—'}</td>
                  <td className="py-3">{s.score ? `${s.score}%` : '—'}</td>
                  <td className="py-3">
                    {s.status === 'Completed' && (
                      <button onClick={() => { setCertName(s.name); setCertModal(true); }} className="text-xs text-[#065F46] hover:underline">Certificate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={certModal} onClose={() => setCertModal(false)} title="Training Certificate">
          <div className="text-center p-6 border-2 border-[#065F46] rounded-xl">
            <p className="text-xs text-[#86868b] uppercase tracking-wider mb-2">Certificate of Completion</p>
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-1">{certName}</h3>
            <p className="text-sm text-[#6e6e73] mb-4">has successfully completed</p>
            <h4 className="text-lg font-semibold text-[#065F46] mb-4">{course.title}</h4>
            <p className="text-xs text-[#86868b]">KOSIQ Health System • {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setCertModal(false)} className="px-4 py-2 text-sm text-[#6e6e73]">Close</button>
            <button onClick={() => { setCertModal(false); showToast('Certificate downloaded', 'success'); }} className="px-4 py-2 text-sm bg-[#065F46] text-white rounded-lg">Download PDF</button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
