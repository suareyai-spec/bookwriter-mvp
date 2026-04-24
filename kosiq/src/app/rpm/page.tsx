'use client';
import DashboardLayout from '@/components/DashboardLayout';
import PatientDrillDown from '@/components/PatientDrillDown';
import { useState } from 'react';

const devices = [
  { patient: 'Maria Garcia', device: 'Blood Glucose Monitor', reading: '142 mg/dL', time: '10 min ago', status: 'normal', adherence: 94 },
  { patient: 'James Wilson', device: 'BP Monitor', reading: '148/92 mmHg', time: '25 min ago', status: 'elevated', adherence: 87 },
  { patient: 'Robert Johnson', device: 'Pulse Oximeter', reading: '91% SpO2', time: '1 hr ago', status: 'alert', adherence: 78 },
  { patient: 'Patricia Brown', device: 'Smart Scale', reading: '198.4 lbs', time: '6 hrs ago', status: 'normal', adherence: 92 },
  { patient: 'David Martinez', device: 'Glucose Monitor', reading: '234 mg/dL', time: '30 min ago', status: 'alert', adherence: 81 },
  { patient: 'William Jackson', device: 'Pulse Oximeter', reading: '88% SpO2', time: '45 min ago', status: 'critical', adherence: 72 },
];

export default function RPMDashboard() {
  const [drillDown, setDrillDown] = useState<{label: string; count: number} | null>(null);
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Remote Patient Monitoring</h1>
        <p className="text-sm text-[#86868b] mb-8">Real-time device data & vitals tracking</p>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Active Patients', value: '892', clickCount: 892 },
            { label: 'Connected Devices', value: '1,456' },
            { label: 'Readings Today', value: '4,231' },
            { label: 'Avg Adherence', value: '86%' },
            { label: 'RPM Revenue', value: '$89.2K' },
          ].map((m: any, i: number) => (
            <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100${m.clickCount ? ' cursor-pointer' : ''}`} onClick={() => m.clickCount && setDrillDown({ label: m.label, count: m.clickCount })}>
              <p className="text-[#86868b] text-xs mb-1">{m.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{m.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100"><h3 className="text-sm font-semibold text-[#1d1d1f]">Live Device Feed</h3></div>
          <table className="w-full">
            <thead><tr className="bg-[#f5f5f7]">
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Patient</th>
              <th className="text-left text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Device</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Reading</th>
              <th className="text-center text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Status</th>
              <th className="text-right text-[10px] font-semibold text-[#86868b] uppercase px-4 py-3">Adherence</th>
            </tr></thead>
            <tbody>
              {devices.map((d, i) => (
                <tr key={i} className={'border-b border-gray-50 hover:bg-gray-50/50 ' + (d.status === 'critical' ? 'bg-red-50/30' : '')}>
                  <td className="px-4 py-3 text-sm font-medium text-[#1d1d1f]">{d.patient}</td>
                  <td className="px-4 py-3 text-xs text-[#6e6e73]">{d.device}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono font-medium text-[#1d1d1f]">{d.reading}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={'px-2 py-0.5 text-[10px] rounded-full font-medium ' + (
                      d.status === 'critical' ? 'bg-red-100 text-red-600' :
                      d.status === 'alert' ? 'bg-orange-100 text-orange-600' :
                      d.status === 'elevated' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    )}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-right text-[#6e6e73]">{d.adherence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PatientDrillDown open={drillDown !== null} onClose={() => setDrillDown(null)} label={drillDown?.label || ''} count={drillDown?.count || 0} accent="#06B6D4" />
    </DashboardLayout>
  );
}
