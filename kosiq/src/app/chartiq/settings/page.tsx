'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useSession } from 'next-auth/react';

export default function ChartIQSettingsPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout>
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#1d1d1f]">ChartIQ Settings</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" defaultValue={session?.user?.name || ''} disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" defaultValue={session?.user?.email || ''} disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Notification Preferences</h2>
        <div className="space-y-3">
          {['Critical lab alerts', 'New order notifications', 'Shift handoff reminders', 'Patient status changes'].map(pref => (
            <label key={pref} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-500 rounded border-gray-300 focus:ring-teal-500" />
              <span className="text-sm text-gray-700">{pref}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}