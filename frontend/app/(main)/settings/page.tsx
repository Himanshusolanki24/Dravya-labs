"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { Loader2 } from 'lucide-react';

type SettingsSection = 'profile' | 'language' | 'notifications' | 'privacy' | 'appearance' | 'help';
type NotifState = { inApp: boolean; email: boolean };

const MultiToggle = ({ state, onChange }: { state: NotifState, onChange: (s: NotifState) => void }) => {
    const isNone = !state.inApp && !state.email;
    return (
        <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
            <button
                onClick={() => onChange({ inApp: false, email: false })}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${isNone ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
                None
            </button>
            <button
                onClick={() => onChange({ ...state, inApp: !state.inApp })}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${state.inApp ? 'bg-[#007200] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
                In App
            </button>
            <button
                onClick={() => onChange({ ...state, email: !state.email })}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${state.email ? 'bg-[#007200] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
                Email
            </button>
        </div>
    );
};

export default function SettingsPage() {
    const router = useRouter();
    const { language, setLanguage } = useLanguage();
    const { user, isLoading: userLoading, logout } = useUser();

    const [activeSection, setActiveSection] = useState<SettingsSection>('notifications');

    // Notifications State
    const [globalNotifEnabled, setGlobalNotifEnabled] = useState(true);
    const [notifications, setNotifications] = useState({
        consultationNewMessage: { inApp: true, email: true },
        consultationStatus: { inApp: true, email: false },
        wellnessDaily: { inApp: false, email: false },
        wellnessMedication: { inApp: true, email: false },
        accountSecurity: { inApp: true, email: true },
        accountSubscription: { inApp: false, email: true },
    });

    const [darkMode, setDarkMode] = useState(false);

    if (userLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="size-12 text-[#007200] animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'language', label: 'Language' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'privacy', label: 'Privacy & Security' },
        { id: 'appearance', label: 'Appearance' },
        { id: 'help', label: 'Help & Support' }
    ];

    return (
        <div className="h-full flex flex-col bg-[#F8F9FA] overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 bg-white border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
                
                {/* Tabs */}
                <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id as SettingsSection)}
                            className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                                activeSection === tab.id
                                    ? 'text-[#007200]'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                            {activeSection === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007200] rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
                    
                    {activeSection === 'profile' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                            <p className="text-gray-500 text-sm mb-8">Manage your personal information and preferences.</p>
                            
                            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                                <div className="size-20 rounded-full bg-[#007200]/10 flex items-center justify-center text-[#007200] text-2xl font-bold">
                                    {(user?.fullName || user?.firstName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">{user?.fullName || user?.firstName || 'Guest User'}</p>
                                    <p className="text-gray-500 text-sm mb-3">{user?.email || 'guest@example.com'}</p>
                                    <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'language' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Language Preferences</h2>
                            <p className="text-gray-500 text-sm mb-8">Choose your preferred language for the platform.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                                        language === 'en' ? 'border-[#007200] bg-[#007200]/10' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <p className={`font-semibold ${language === 'en' ? 'text-[#007200]' : 'text-gray-700'}`}>English</p>
                                    <p className="text-sm text-gray-500 mt-1">US English</p>
                                </button>
                                <button
                                    onClick={() => setLanguage('hi')}
                                    className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                                        language === 'hi' ? 'border-[#007200] bg-[#007200]/10' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <p className={`font-semibold ${language === 'hi' ? 'text-[#007200]' : 'text-gray-700'}`}>हिंदी</p>
                                    <p className="text-sm text-gray-500 mt-1">Hindi</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div>
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Notification Setup</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-600">Set to Default</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={globalNotifEnabled}
                                            onChange={() => setGlobalNotifEnabled(!globalNotifEnabled)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007200]"></div>
                                    </label>
                                </div>
                            </div>

                            <div className={`space-y-8 ${!globalNotifEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                {/* Category 1 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-50 pb-6">
                                    <div className="col-span-1">
                                        <h3 className="font-bold text-gray-900 mb-1">Consultation Updates</h3>
                                        <p className="text-xs text-gray-400">Receive notifications for new messages and status changes</p>
                                    </div>
                                    <div className="col-span-2 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">New message from expert</span>
                                            <MultiToggle
                                                state={notifications.consultationNewMessage}
                                                onChange={(s) => setNotifications(p => ({ ...p, consultationNewMessage: s }))}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Consultation status update</span>
                                            <MultiToggle
                                                state={notifications.consultationStatus}
                                                onChange={(s) => setNotifications(p => ({ ...p, consultationStatus: s }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Category 2 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-50 pb-6">
                                    <div className="col-span-1">
                                        <h3 className="font-bold text-gray-900 mb-1">Wellness Reminders</h3>
                                        <p className="text-xs text-gray-400">Notifications for daily routines and medication</p>
                                    </div>
                                    <div className="col-span-2 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Daily routine (Dinacharya)</span>
                                            <MultiToggle
                                                state={notifications.wellnessDaily}
                                                onChange={(s) => setNotifications(p => ({ ...p, wellnessDaily: s }))}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Herbal medication alerts</span>
                                            <MultiToggle
                                                state={notifications.wellnessMedication}
                                                onChange={(s) => setNotifications(p => ({ ...p, wellnessMedication: s }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Category 3 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="col-span-1">
                                        <h3 className="font-bold text-gray-900 mb-1">Account Notifications</h3>
                                        <p className="text-xs text-gray-400">Notifications for security and billing</p>
                                    </div>
                                    <div className="col-span-2 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Security alerts</span>
                                            <MultiToggle
                                                state={notifications.accountSecurity}
                                                onChange={(s) => setNotifications(p => ({ ...p, accountSecurity: s }))}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Subscription updates</span>
                                            <MultiToggle
                                                state={notifications.accountSubscription}
                                                onChange={(s) => setNotifications(p => ({ ...p, accountSubscription: s }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'privacy' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy & Security</h2>
                            <p className="text-gray-500 text-sm mb-8">Manage your password and data sharing preferences.</p>
                            <div className="space-y-4">
                                <button className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                                    <h3 className="font-medium text-gray-900">Change Password</h3>
                                    <p className="text-xs text-gray-500 mt-1">Update your account password</p>
                                </button>
                                <button className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                                    <h3 className="font-medium text-gray-900">Download Data</h3>
                                    <p className="text-xs text-gray-500 mt-1">Request a copy of your personal data</p>
                                </button>
                                <button className="w-full text-left p-4 rounded-xl border border-red-100 hover:bg-red-50 transition-colors mt-8">
                                    <h3 className="font-medium text-red-600">Delete Account</h3>
                                    <p className="text-xs text-red-400 mt-1">Permanently delete your account and all data</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>
                            <p className="text-gray-500 text-sm mb-8">Customize the look and feel of the application.</p>
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                                <div>
                                    <h3 className="font-medium text-gray-900">Dark Mode</h3>
                                    <p className="text-xs text-gray-500 mt-1">Switch to dark theme</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={darkMode}
                                        onChange={() => setDarkMode(!darkMode)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7e69ff]"></div>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeSection === 'help' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Help & Support</h2>
                            <p className="text-gray-500 text-sm mb-8">Get help with using the platform.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-gray-200 hover:border-[#007200] hover:bg-[#007200]/10 transition-colors cursor-pointer">
                                    <h3 className="font-medium text-gray-900">FAQ</h3>
                                    <p className="text-xs text-gray-500 mt-1">Find answers to common questions</p>
                                </div>
                                <div className="p-4 rounded-xl border border-gray-200 hover:border-[#007200] hover:bg-[#007200]/10 transition-colors cursor-pointer">
                                    <h3 className="font-medium text-gray-900">Contact Support</h3>
                                    <p className="text-xs text-gray-500 mt-1">Get in touch with our team</p>
                                </div>
                                <div className="p-4 rounded-xl border border-gray-200 hover:border-[#007200] hover:bg-[#007200]/10 transition-colors cursor-pointer">
                                    <h3 className="font-medium text-gray-900">Terms of Service</h3>
                                </div>
                                <div className="p-4 rounded-xl border border-gray-200 hover:border-[#007200] hover:bg-[#007200]/10 transition-colors cursor-pointer">
                                    <h3 className="font-medium text-gray-900">Privacy Policy</h3>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
