'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/Toast';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const toast = useToast();

  const [name, setName] = useState(session?.user?.name || '');
  const [saving, setSaving] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [tab, setTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    riskAlerts: true,
    qualityReminders: true,
    weeklyDigest: true,
    patientUpdates: false,
    systemUpdates: true,
  });

  const [appearance, setAppearance] = useState({
    sidebarCompact: false,
    showChartAnimations: true,
    defaultDateRange: '30d',
    tablePageSize: '25',
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) toast('Profile updated');
      else toast('Failed to update profile', 'error');
    } catch { toast('Failed to update profile', 'error'); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) { toast('Fill in all password fields', 'error'); return; }
    if (newPw !== confirmPw) { toast('Passwords do not match', 'error'); return; }
    if (newPw.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setChangingPw(true);
    try {
      const res = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) { toast('Password changed'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
      else { const d = await res.json(); toast(d.error || 'Failed to change password', 'error'); }
    } catch { toast('Failed to change password', 'error'); }
    setChangingPw(false);
  };

  const handleSaveNotifications = () => {
    toast('Notification preferences saved');
  };

  const handleSaveAppearance = () => {
    toast('Appearance settings saved');
  };

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'security', label: 'Security' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'appearance', label: 'Appearance' },
  ] as const;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">Settings</h1>
          <p className="text-sm text-[#86868b] mt-1">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#f5f5f7] rounded-xl p-1 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${tab === t.key ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#86868b] block mb-1">Email Address</label>
                  <input value={session?.user?.email || ''} disabled className="w-full px-3 py-2.5 bg-[#f5f5f7] rounded-lg text-sm text-[#86868b] outline-none cursor-not-allowed" />
                  <p className="text-[10px] text-[#86868b] mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#86868b] block mb-1">Display Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full px-3 py-2.5 bg-[#f5f5f7] rounded-lg text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-[#0071e3]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#86868b] block mb-1">Role</label>
                  <input value="Administrator" disabled className="w-full px-3 py-2.5 bg-[#f5f5f7] rounded-lg text-sm text-[#86868b] outline-none cursor-not-allowed" />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={handleSaveProfile} disabled={saving} className="px-5 py-2 bg-[#0071e3] text-white text-sm font-medium rounded-xl hover:bg-[#0077ED] disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-2">Account Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-[#f5f5f7] rounded-xl p-4">
                  <p className="text-[10px] text-[#86868b] mb-1">Account Created</p>
                  <p className="text-sm font-medium text-[#1d1d1f]">February 2026</p>
                </div>
                <div className="bg-[#f5f5f7] rounded-xl p-4">
                  <p className="text-[10px] text-[#86868b] mb-1">Last Login</p>
                  <p className="text-sm font-medium text-[#1d1d1f]">Today</p>
                </div>
                <div className="bg-[#f5f5f7] rounded-xl p-4">
                  <p className="text-[10px] text-[#86868b] mb-1">Account Type</p>
                  <p className="text-sm font-medium text-[#1d1d1f]">Super Admin</p>
                </div>
                <div className="bg-[#f5f5f7] rounded-xl p-4">
                  <p className="text-[10px] text-[#86868b] mb-1">Products Access</p>
                  <p className="text-sm font-medium text-[#1d1d1f]">All Products (11)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#86868b] block mb-1">Current Password</label>
                  <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full px-3 py-2.5 bg-[#f5f5f7] rounded-lg text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-[#0071e3]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#86868b] block mb-1">New Password</label>
                  <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full px-3 py-2.5 bg-[#f5f5f7] rounded-lg text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-[#0071e3]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#86868b] block mb-1">Confirm New Password</label>
                  <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full px-3 py-2.5 bg-[#f5f5f7] rounded-lg text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-[#0071e3]/30" />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={handleChangePassword} disabled={changingPw} className="px-5 py-2 bg-[#0071e3] text-white text-sm font-medium rounded-xl hover:bg-[#0077ED] disabled:opacity-50">
                  {changingPw ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-2">Sessions</h3>
              <p className="text-xs text-[#86868b] mb-4">Manage your active sessions</p>
              <div className="bg-[#f5f5f7] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1d1d1f]">Current Session</p>
                  <p className="text-[10px] text-[#86868b]">Active now</p>
                </div>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] rounded-full">Active</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
              <h3 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h3>
              <p className="text-xs text-[#86868b] mb-4">Permanently delete your account and all associated data</p>
              <button onClick={() => toast('Contact support@kosiq.ai to delete your account', 'error')} className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-xl hover:bg-red-100">
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === 'notifications' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive critical alerts via email' },
                { key: 'riskAlerts', label: 'Risk Score Alerts', desc: 'Notify when patient risk scores change significantly' },
                { key: 'qualityReminders', label: 'Quality Measure Reminders', desc: 'HEDIS gap closure deadline reminders' },
                { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of key metrics every Monday' },
                { key: 'patientUpdates', label: 'Patient Status Updates', desc: 'Real-time patient admission/discharge alerts' },
                { key: 'systemUpdates', label: 'System Updates', desc: 'Platform maintenance and feature announcements' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#1d1d1f]">{n.label}</p>
                    <p className="text-[10px] text-[#86868b]">{n.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !(prev as any)[n.key] }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${(notifications as any)[n.key] ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${(notifications as any)[n.key] ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handleSaveNotifications} className="px-5 py-2 bg-[#0071e3] text-white text-sm font-medium rounded-xl hover:bg-[#0077ED]">
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {tab === 'appearance' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Appearance & Display</h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1d1d1f]">Compact Sidebar</p>
                  <p className="text-[10px] text-[#86868b]">Use icon-only sidebar for more screen space</p>
                </div>
                <button
                  onClick={() => setAppearance(prev => ({ ...prev, sidebarCompact: !prev.sidebarCompact }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${appearance.sidebarCompact ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${appearance.sidebarCompact ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1d1d1f]">Chart Animations</p>
                  <p className="text-[10px] text-[#86868b]">Animate charts on page load</p>
                </div>
                <button
                  onClick={() => setAppearance(prev => ({ ...prev, showChartAnimations: !prev.showChartAnimations }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${appearance.showChartAnimations ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${appearance.showChartAnimations ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
              <div>
                <label className="text-sm font-medium text-[#1d1d1f] block mb-1">Default Date Range</label>
                <select value={appearance.defaultDateRange} onChange={e => setAppearance(prev => ({ ...prev, defaultDateRange: e.target.value }))} className="px-3 py-2.5 bg-[#f5f5f7] rounded-lg text-sm outline-none w-48">
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="12m">Last 12 Months</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#1d1d1f] block mb-1">Table Page Size</label>
                <select value={appearance.tablePageSize} onChange={e => setAppearance(prev => ({ ...prev, tablePageSize: e.target.value }))} className="px-3 py-2.5 bg-[#f5f5f7] rounded-lg text-sm outline-none w-48">
                  <option value="10">10 rows</option>
                  <option value="25">25 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handleSaveAppearance} className="px-5 py-2 bg-[#0071e3] text-white text-sm font-medium rounded-xl hover:bg-[#0077ED]">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
