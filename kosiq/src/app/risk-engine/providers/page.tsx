'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import jsPDF from 'jspdf';

const providers = [
  { name: 'Dr. Elena Martinez', specialty: 'Internal Medicine', patients: 842, avgRAF: 1.24, codingRate: 94, gapsClosed: 87, revenue: '$1.2M', trend: '+3%' },
  { name: 'Dr. Wei Chen', specialty: 'Cardiology', patients: 567, avgRAF: 1.89, codingRate: 91, gapsClosed: 82, revenue: '$1.8M', trend: '+5%' },
  { name: 'Dr. Raj Patel', specialty: 'Endocrinology', patients: 423, avgRAF: 1.56, codingRate: 88, gapsClosed: 79, revenue: '$980K', trend: '+2%' },
  { name: 'Dr. Sarah Johnson', specialty: 'Pulmonology', patients: 312, avgRAF: 1.78, codingRate: 86, gapsClosed: 74, revenue: '$890K', trend: '-1%' },
  { name: 'Dr. Michael Kim', specialty: 'Family Medicine', patients: 956, avgRAF: 0.98, codingRate: 82, gapsClosed: 71, revenue: '$1.4M', trend: '+4%' },
  { name: 'Dr. Amanda Williams', specialty: 'Nephrology', patients: 289, avgRAF: 2.12, codingRate: 79, gapsClosed: 68, revenue: '$1.1M', trend: '+1%' },
  { name: 'Dr. Carlos Rodriguez', specialty: 'Internal Medicine', patients: 734, avgRAF: 1.15, codingRate: 76, gapsClosed: 64, revenue: '$1.0M', trend: '-2%' },
  { name: 'Dr. Jennifer Lee', specialty: 'Geriatrics', patients: 198, avgRAF: 2.45, codingRate: 92, gapsClosed: 89, revenue: '$780K', trend: '+7%' },
];

export default function ProvidersPage() {
  const toast = useToast();
  const handleExport = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16); doc.setTextColor(29, 29, 31);
    doc.text('Provider Risk Coding Performance', 14, 20);
    doc.setFontSize(9); doc.setTextColor(134, 134, 139);
    doc.text(`Generated ${new Date().toLocaleDateString()}`, 14, 27);
    doc.setDrawColor(245, 158, 11); doc.setLineWidth(0.5); doc.line(14, 30, 280, 30);
    let y = 38;
    doc.setFontSize(8); doc.setTextColor(134, 134, 139);
    doc.text('Provider', 14, y); doc.text('Patients', 80, y); doc.text('Open Gaps', 110, y); doc.text('Avg RAF', 145, y); doc.text('Capture Rate', 175, y);
    y += 6;
    providers.forEach(p => {
      doc.setFontSize(8); doc.setTextColor(29, 29, 31);
      doc.text(p.name, 14, y); doc.text(String(p.patients), 80, y); doc.text(String(p.openGaps), 110, y);
      doc.text(p.avgRAF.toFixed(2), 145, y); doc.text(p.captureRate, 175, y);
      y += 6;
    });
    doc.save('Provider-Risk-Report.pdf');
    toast('Provider report exported as PDF');
  };
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Provider Drill-Down</h1>
            <p className="text-sm text-[#86868b] mt-1">Provider-level risk coding performance</p>
          </div>
          <button onClick={handleExport} className="px-4 py-2 border border-gray-200 text-sm rounded-xl hover:bg-gray-50">Export Report</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7]">
                <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Provider</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Patients</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Avg RAF</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Coding Rate</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Gaps Closed</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Revenue</th>
                <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-5 py-3">Trend</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-[#1d1d1f]">{p.name}</p>
                    <p className="text-[10px] text-[#86868b]">{p.specialty}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-right text-[#6e6e73]">{p.patients}</td>
                  <td className="px-5 py-4 text-sm text-right font-medium text-[#1d1d1f]">{p.avgRAF}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 bg-[#f5f5f7] rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: `${p.codingRate}%` }} />
                      </div>
                      <span className="text-xs text-[#6e6e73]">{p.codingRate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-right text-[#6e6e73]">{p.gapsClosed}%</td>
                  <td className="px-5 py-4 text-sm text-right font-medium text-[#1d1d1f]">{p.revenue}</td>
                  <td className="px-5 py-4 text-sm text-right">
                    <span className={p.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}>{p.trend}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
