import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../context/UIContext';
import { Save, User, Bell, Shield, Mail, Globe, Moon, Database } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Mock settings state
  const [settings, setSettings] = useState({
    notifications: true,
    weeklyReports: false,
    publicProfile: true,
    language: 'English (US)',
    theme: 'light',
    dataSharing: false
  });

  const handleSave = () => {
    setIsSaving(true);
    // Mock save delay
    setTimeout(() => {
      setIsSaving(false);
      showToast('Settings saved successfully!');
    }, 800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-10 fade-in">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Platform Settings</h1>
        <p className="text-textSecondary mt-2">Manage your account preferences and system configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-3 flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-textSecondary hover:bg-gray-50'}`}
            >
              <User size={18} className={activeTab === 'profile' ? 'text-primary-600' : ''} /> Profile Details
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activeTab === 'notifications' ? 'bg-primary-50 text-primary-700' : 'text-textSecondary hover:bg-gray-50'}`}
            >
              <Bell size={18} className={activeTab === 'notifications' ? 'text-primary-600' : ''} /> Notifications
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activeTab === 'security' ? 'bg-primary-50 text-primary-700' : 'text-textSecondary hover:bg-gray-50'}`}
            >
              <Shield size={18} className={activeTab === 'security' ? 'text-primary-600' : ''} /> Security & System
            </button>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-surface rounded-3xl shadow-sm border border-border overflow-hidden">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-8 fade-in">
              <h2 className="text-xl font-bold text-textPrimary mb-6">Profile Details</h2>
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
                <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-4xl font-black outline outline-4 outline-white shadow-md">
                  {user?.name?.[0] || 'A'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user?.name}</h3>
                  <p className="text-textSecondary">{user?.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 font-bold text-xs uppercase tracking-wider rounded-lg border border-purple-200">
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-textSecondary mb-2">Full Name</label>
                  <input type="text" readOnly value={user?.name || ''} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-border text-textMuted cursor-not-allowed" />
                  <p className="text-xs text-textMuted mt-1">Name changes must be requested via IT Support.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-textSecondary mb-2">Email Address</label>
                  <input type="email" readOnly value={user?.email || ''} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-border text-textMuted cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-8 fade-in">
              <h2 className="text-xl font-bold text-textPrimary mb-6 flex items-center gap-2">
                <Bell className="text-primary-500" /> Notification Preferences
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm"><Mail className="text-primary-500" /></div>
                    <div>
                      <h4 className="font-bold text-textPrimary">Email Alerts</h4>
                      <p className="text-sm text-textSecondary">Receive daily digest of new platform activity.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({...settings, notifications: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm"><Database className="text-primary-500" /></div>
                    <div>
                      <h4 className="font-bold text-textPrimary">Weekly Reports</h4>
                      <p className="text-sm text-textSecondary">Receive a generated PDF summarizing system health.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.weeklyReports} onChange={(e) => setSettings({...settings, weeklyReports: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-8 fade-in">
              <h2 className="text-xl font-bold text-textPrimary mb-6 flex items-center gap-2">
                <Shield className="text-primary-500" /> Platform Security
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div className="flex gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm"><Shield className="text-red-500" /></div>
                    <div>
                      <h4 className="font-bold text-red-900">Maintenance Mode</h4>
                      <p className="text-sm text-red-700">Lock the platform from all non-admin users.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-red-100 text-red-700 font-bold text-sm rounded-xl hover:bg-red-200 transition-colors">
                    Enable
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm"><Globe className="text-primary-500" /></div>
                    <div>
                      <h4 className="font-bold text-textPrimary">Data Telemetry</h4>
                      <p className="text-sm text-textSecondary">Share anonymous usage data with developers.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.dataSharing} onChange={(e) => setSettings({...settings, dataSharing: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Area */}
          <div className="p-5 border-t border-border bg-gray-50/50 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow-md shadow-primary-600/20 hover:bg-primary-700 transition-all disabled:opacity-70"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
