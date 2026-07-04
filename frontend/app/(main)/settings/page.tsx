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
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/50 shadow-inner">
            <button
                onClick={() => onChange({ inApp: false, email: false })}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${isNone ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'}`}
            >
                None
            </button>
            <button
                onClick={() => onChange({ ...state, inApp: !state.inApp })}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${state.inApp ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'}`}
            >
                In App
            </button>
            <button
                onClick={() => onChange({ ...state, email: !state.email })}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${state.email ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'}`}
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
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-amber-50/30 via-green-50/20 to-teal-50/30 min-h-screen">
                <div className="text-center">
                    <Loader2 className="size-12 text-emerald-600 animate-spin mx-auto" />
                    <p className="mt-4 text-slate-600 font-semibold">Loading...</p>
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
        <div className="h-full flex flex-col bg-gradient-to-br from-amber-50/30 via-green-50/20 to-teal-50/30 overflow-hidden">
            {/* Header Section */}
            <div className="bg-[#057A55] text-white pt-8 px-6 lg:px-10 overflow-hidden relative shadow-lg rounded-b-3xl shrink-0">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
                
                <div className="max-w-4xl mx-auto relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Settings</h1>
                    
                    {/* Tabs */}
                    <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id as SettingsSection)}
                                className={`pb-4 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                                    activeSection === tab.id
                                        ? 'text-white'
                                        : 'text-emerald-100/70 hover:text-white'
                                }`}
                            >
                                {tab.label}
                                {activeSection === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-300 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-6 sm:p-8 min-h-[600px] mt-6">
                    
                    {activeSection === 'profile' && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-850 mb-6">Profile Settings</h2>
                            <p className="text-slate-500 text-sm mb-8 font-medium">Manage your personal information and preferences.</p>
                            
                            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                                <div className="size-20 rounded-full bg-emerald-100/50 border border-emerald-500/10 flex items-center justify-center text-emerald-700 text-2xl font-bold shadow-sm">
                                    {(user?.fullName || user?.firstName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-lg">{user?.fullName || user?.firstName || 'Guest User'}</p>
                                    <p className="text-slate-500 text-sm mb-3 font-medium">{user?.email || 'guest@example.com'}</p>
                                    <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors shadow-sm">
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'language' && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-850 mb-6">Language Preferences</h2>
                            <p className="text-slate-500 text-sm mb-8 font-medium">Choose your preferred language for the platform.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`flex-1 p-5 rounded-2xl border-2 text-left transition-all shadow-sm ${
                                        language === 'en' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-200 bg-white/50 hover:border-slate-300'
                                    }`}
                                >
                                    <p className={`font-bold ${language === 'en' ? 'text-emerald-700' : 'text-slate-700'}`}>English</p>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">US English</p>
                                </button>
                                <button
                                    onClick={() => setLanguage('hi')}
                                    className={`flex-1 p-5 rounded-2xl border-2 text-left transition-all shadow-sm ${
                                        language === 'hi' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-200 bg-white/50 hover:border-slate-300'
                                    }`}
                                >
                                    <p className={`font-bold ${language === 'hi' ? 'text-emerald-700' : 'text-slate-700'}`}>हिंदी</p>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">Hindi</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div>
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-850">Notification Setup</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-slate-650">Set to Default</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={globalNotifEnabled}
                                            onChange={() => setGlobalNotifEnabled(!globalNotifEnabled)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>
                            </div>

                            <div className={`space-y-8 ${!globalNotifEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                {/* Category 1 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-6">
                                    <div className="col-span-1">
                                        <h3 className="font-bold text-slate-800 mb-1">Consultation Updates</h3>
                                        <p className="text-xs text-slate-400 font-medium">Receive notifications for new messages and status changes</p>
                                    </div>
                                    <div className="col-span-2 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">New message from expert</span>
                                            <MultiToggle
                                                state={notifications.consultationNewMessage}
                                                onChange={(s) => setNotifications(p => ({ ...p, consultationNewMessage: s }))}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Consultation status update</span>
                                            <MultiToggle
                                                state={notifications.consultationStatus}
                                                onChange={(s) => setNotifications(p => ({ ...p, consultationStatus: s }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Category 2 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-6">
                                    <div className="col-span-1">
                                        <h3 className="font-bold text-slate-800 mb-1">Wellness Reminders</h3>
                                        <p className="text-xs text-slate-400 font-medium">Notifications for daily routines and medication</p>
                                    </div>
                                    <div className="col-span-2 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Daily routine (Dinacharya)</span>
                                            <MultiToggle
                                                state={notifications.wellnessDaily}
                                                onChange={(s) => setNotifications(p => ({ ...p, wellnessDaily: s }))}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Herbal medication alerts</span>
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
                                        <h3 className="font-bold text-slate-800 mb-1">Account Notifications</h3>
                                        <p className="text-xs text-slate-400 font-medium">Notifications for security and billing</p>
                                    </div>
                                    <div className="col-span-2 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Security alerts</span>
                                            <MultiToggle
                                                state={notifications.accountSecurity}
                                                onChange={(s) => setNotifications(p => ({ ...p, accountSecurity: s }))}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Subscription updates</span>
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
                            <h2 className="text-xl font-bold text-slate-850 mb-6">Privacy & Security</h2>
                            <p className="text-slate-500 text-sm mb-8 font-medium">Manage your password and data sharing preferences.</p>
                            <div className="space-y-4">
                                <button className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white transition-colors shadow-sm">
                                    <h3 className="font-bold text-slate-800">Change Password</h3>
                                    <p className="text-xs text-slate-550 mt-1 font-medium">Update your account password</p>
                                </button>
                                <button className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white transition-colors shadow-sm">
                                    <h3 className="font-bold text-slate-800">Download Data</h3>
                                    <p className="text-xs text-slate-550 mt-1 font-medium">Request a copy of your personal data</p>
                                </button>
                                <button className="w-full text-left p-4 rounded-xl border border-red-100 hover:bg-red-50/50 transition-colors mt-8 shadow-sm">
                                    <h3 className="font-bold text-red-600">Delete Account</h3>
                                    <p className="text-xs text-red-400 mt-1 font-medium">Permanently delete your account and all data</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-850 mb-6">Appearance</h2>
                            <p className="text-slate-500 text-sm mb-8 font-medium">Customize the look and feel of the application.</p>
                            <div className="flex items-center justify-between p-4 border border-slate-200 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm">
                                <div>
                                    <h3 className="font-bold text-slate-800">Dark Mode</h3>
                                    <p className="text-xs text-slate-550 mt-1 font-medium">Switch to dark theme</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={darkMode}
                                        onChange={() => setDarkMode(!darkMode)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeSection === 'help' && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-850 mb-6">Help & Support</h2>
                            <p className="text-slate-500 text-sm mb-8 font-medium">Get help with using the platform.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer shadow-sm">
                                    <h3 className="font-bold text-slate-800">FAQ</h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">Find answers to common questions</p>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer shadow-sm">
                                    <h3 className="font-bold text-slate-800">Contact Support</h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">Get in touch with our team</p>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer shadow-sm">
                                    <h3 className="font-bold text-slate-800">Terms of Service</h3>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer shadow-sm">
                                    <h3 className="font-bold text-slate-800">Privacy Policy</h3>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
