'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Settings, User, Globe, Bell, Shield, Moon, Sun, HelpCircle,
    Mail, Smartphone, MessageSquare, ChevronRight, LogOut, Loader2,
    Edit3, ExternalLink, Lock, Trash2, Download, FileText, Heart,
    Palette
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';

// Define section types
type SettingsSection = 'profile' | 'language' | 'notifications' | 'privacy' | 'appearance' | 'help';

export default function SettingsPage() {
    const router = useRouter();
    const { language, setLanguage } = useLanguage();
    const { user, isLoading: userLoading, isAuthenticated, logout } = useUser();

    // Settings states
    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false
    });
    const [privacyEnabled, setPrivacyEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    // Refs for section scrolling
    // Refs for section scrolling
    const profileRef = useRef<HTMLDivElement>(null);
    const languageRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const privacyRef = useRef<HTMLDivElement>(null);
    const appearanceRef = useRef<HTMLDivElement>(null);
    const helpRef = useRef<HTMLDivElement>(null);

    const sectionRefs = {
        profile: profileRef,
        language: languageRef,
        notifications: notificationsRef,
        privacy: privacyRef,
        appearance: appearanceRef,
        help: helpRef,
    };

    // Translations
    const t = {
        en: {
            pageTitle: 'Settings',
            pageSubtitle: 'Manage your preferences and account settings',
            sidebar: {
                profile: 'Profile',
                language: 'Language',
                notifications: 'Notifications',
                privacy: 'Privacy & Security',
                appearance: 'Appearance',
                help: 'Help & Support'
            },
            profile: {
                title: 'Profile',
                subtitle: 'Your personal information',
                editProfile: 'Edit Profile',
                viewProfile: 'View Profile'
            },
            language: {
                title: 'Language',
                subtitle: 'Choose your preferred language',
                english: 'English',
                hindi: 'हिंदी (Hindi)'
            },
            notifications: {
                title: 'Notifications',
                subtitle: 'Manage how you receive updates',
                email: 'Email Notifications',
                emailDesc: 'Receive wellness tips and updates via email',
                push: 'Push Notifications',
                pushDesc: 'Get real-time alerts on your device',
                sms: 'SMS Notifications',
                smsDesc: 'Receive important updates via text message'
            },
            privacy: {
                title: 'Privacy & Security',
                subtitle: 'Protect your account and data',
                changePassword: 'Change Password',
                manageData: 'Manage Data',
                downloadData: 'Download My Data',
                deleteAccount: 'Delete Account'
            },
            appearance: {
                title: 'Appearance',
                subtitle: 'Customize your app experience',
                darkMode: 'Dark Mode',
                darkModeDesc: 'Switch to dark theme'
            },
            help: {
                title: 'Help & Support',
                subtitle: 'Get assistance when you need it',
                faq: 'FAQs',
                contact: 'Contact Support',
                terms: 'Terms of Service',
                privacyPolicy: 'Privacy Policy'
            },
            account: {
                logout: 'Logout',
                logoutConfirm: 'Are you sure you want to logout?'
            }
        },
        hi: {
            pageTitle: 'सेटिंग्स',
            pageSubtitle: 'अपनी प्राथमिकताएं और खाता सेटिंग्स प्रबंधित करें',
            sidebar: {
                profile: 'प्रोफ़ाइल',
                language: 'भाषा',
                notifications: 'सूचनाएं',
                privacy: 'गोपनीयता और सुरक्षा',
                appearance: 'दिखावट',
                help: 'सहायता'
            },
            profile: {
                title: 'प्रोफ़ाइल',
                subtitle: 'आपकी व्यक्तिगत जानकारी',
                editProfile: 'प्रोफ़ाइल संपादित करें',
                viewProfile: 'प्रोफ़ाइल देखें'
            },
            language: {
                title: 'भाषा',
                subtitle: 'अपनी पसंदीदा भाषा चुनें',
                english: 'English (अंग्रेजी)',
                hindi: 'हिंदी'
            },
            notifications: {
                title: 'सूचनाएं',
                subtitle: 'अपडेट कैसे प्राप्त करें प्रबंधित करें',
                email: 'ईमेल सूचनाएं',
                emailDesc: 'ईमेल के माध्यम से स्वास्थ्य टिप्स प्राप्त करें',
                push: 'पुश सूचनाएं',
                pushDesc: 'अपने डिवाइस पर रीयल-टाइम अलर्ट प्राप्त करें',
                sms: 'SMS सूचनाएं',
                smsDesc: 'टेक्स्ट संदेश के माध्यम से महत्वपूर्ण अपडेट प्राप्त करें'
            },
            privacy: {
                title: 'गोपनीयता और सुरक्षा',
                subtitle: 'अपने खाते और डेटा की सुरक्षा करें',
                changePassword: 'पासवर्ड बदलें',
                manageData: 'डेटा प्रबंधित करें',
                downloadData: 'मेरा डेटा डाउनलोड करें',
                deleteAccount: 'खाता हटाएं'
            },
            appearance: {
                title: 'दिखावट',
                subtitle: 'अपने ऐप अनुभव को अनुकूलित करें',
                darkMode: 'डार्क मोड',
                darkModeDesc: 'डार्क थीम में बदलें'
            },
            help: {
                title: 'सहायता और समर्थन',
                subtitle: 'जब आवश्यकता हो सहायता प्राप्त करें',
                faq: 'अक्सर पूछे जाने वाले प्रश्न',
                contact: 'संपर्क सहायता',
                terms: 'सेवा की शर्तें',
                privacyPolicy: 'गोपनीयता नीति'
            },
            account: {
                logout: 'लॉग आउट',
                logoutConfirm: 'क्या आप वाकई लॉग आउट करना चाहते हैं?'
            }
        }
    };

    const text = t[language];

    // Settings navigation items for quick jump
    const settingsItems: { id: SettingsSection; icon: React.ReactNode; label: string; color: string }[] = [
        { id: 'profile', icon: <User className="size-4" />, label: text.sidebar.profile, color: 'emerald' },
        { id: 'language', icon: <Globe className="size-4" />, label: text.sidebar.language, color: 'blue' },
        { id: 'notifications', icon: <Bell className="size-4" />, label: text.sidebar.notifications, color: 'purple' },
        { id: 'privacy', icon: <Shield className="size-4" />, label: text.sidebar.privacy, color: 'green' },
        { id: 'appearance', icon: <Palette className="size-4" />, label: text.sidebar.appearance, color: 'amber' },
        { id: 'help', icon: <HelpCircle className="size-4" />, label: text.sidebar.help, color: 'rose' },
    ];

    // Redirect if not authenticated
    // useEffect(() => {
    //     if (!userLoading && !isAuthenticated) {
    //         router.push('/auth/login');
    //     }
    // }, [userLoading, isAuthenticated, router]);

    // Handle section navigation
    const handleSectionClick = (sectionId: SettingsSection) => {
        setActiveSection(sectionId);
        sectionRefs[sectionId]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Handle logout
    const handleLogout = () => {
        if (confirm(text.account.logoutConfirm)) {
            logout();
            router.push('/');
        }
    };

    // Get display name
    const displayName = user?.fullName || user?.firstName
        ? (user.fullName || `${user.firstName} ${user.lastName || ''}`.trim())
        : 'User';
    const displayEmail = user?.email || 'user@example.com';

    if (userLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="size-12 text-emerald-600 animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50">
            {/* Page Header */}
            <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                            <Settings className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{text.pageTitle}</h1>
                            <p className="text-gray-500 text-sm">{text.pageSubtitle}</p>
                        </div>
                    </div>

                    {/* Quick Navigation Pills */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {settingsItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleSectionClick(item.id)}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                    ${activeSection === item.id
                                        ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Profile Section */}
                    <div ref={profileRef} id="profile" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-6">
                        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <User className="size-5 text-emerald-600" />
                                <h2 className="font-bold text-gray-800">{text.profile.title}</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{text.profile.subtitle}</p>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 sm:size-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-base sm:text-lg">{displayName}</p>
                                        <p className="text-sm text-gray-500 break-all">{displayEmail}</p>
                                    </div>
                                </div>
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-colors font-medium w-full sm:w-auto justify-center"
                                >
                                    <Edit3 className="size-4" />
                                    <span>{text.profile.editProfile}</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Language Section */}
                    <div ref={languageRef} id="language" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-6">
                        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Globe className="size-5 text-blue-600" />
                                <h2 className="font-bold text-gray-800">{text.language.title}</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{text.language.subtitle}</p>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all font-medium ${language === 'en'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    🇺🇸 {text.language.english}
                                </button>
                                <button
                                    onClick={() => setLanguage('hi')}
                                    className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all font-medium ${language === 'hi'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    🇮🇳 {text.language.hindi}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div ref={notificationsRef} id="notifications" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-6">
                        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Bell className="size-5 text-purple-600" />
                                        <h2 className="font-bold text-gray-800">{text.notifications.title}</h2>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{text.notifications.subtitle}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationsEnabled}
                                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        </div>
                        <div className={`p-4 sm:p-6 space-y-3 sm:space-y-4 transition-opacity duration-300 ${!notificationsEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                            {/* Email */}
                            <label className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                                        <Mail className="size-5 text-purple-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-800 text-sm sm:text-base">{text.notifications.email}</p>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">{text.notifications.emailDesc}</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                                    className="size-5 rounded text-emerald-500 focus:ring-emerald-400 shrink-0 ml-2"
                                />
                            </label>
                            {/* Push */}
                            <label className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                                        <Smartphone className="size-5 text-purple-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-800 text-sm sm:text-base">{text.notifications.push}</p>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">{text.notifications.pushDesc}</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifications.push}
                                    onChange={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                                    className="size-5 rounded text-emerald-500 focus:ring-emerald-400 shrink-0 ml-2"
                                />
                            </label>
                            {/* SMS */}
                            <label className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                                        <MessageSquare className="size-5 text-purple-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-800 text-sm sm:text-base">{text.notifications.sms}</p>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">{text.notifications.smsDesc}</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifications.sms}
                                    onChange={() => setNotifications(prev => ({ ...prev, sms: !prev.sms }))}
                                    className="size-5 rounded text-emerald-500 focus:ring-emerald-400 shrink-0 ml-2"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Privacy & Security Section */}
                    <div ref={privacyRef} id="privacy" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-6">
                        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="size-5 text-green-600" />
                                        <h2 className="font-bold text-gray-800">{text.privacy.title}</h2>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{text.privacy.subtitle}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={privacyEnabled}
                                        onChange={() => setPrivacyEnabled(!privacyEnabled)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        </div>
                        <div className={`p-4 sm:p-6 space-y-3 transition-opacity duration-300 ${!privacyEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                            <button
                                onClick={() => alert(language === 'hi' ? 'पासवर्ड बदलने की सुविधा जल्द आ रही है!' : 'Change password functionality coming soon!')}
                                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Lock className="size-5 text-gray-500" />
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">{text.privacy.changePassword}</span>
                                </div>
                                <ChevronRight className="size-5 text-gray-400" />
                            </button>
                            <button
                                onClick={() => alert(language === 'hi' ? 'डेटा प्रबंधन पोर्टल जल्द आ रहा है!' : 'Data management portal coming soon!')}
                                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="size-5 text-gray-500" />
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">{text.privacy.manageData}</span>
                                </div>
                                <ChevronRight className="size-5 text-gray-400" />
                            </button>
                            <button
                                onClick={() => alert(language === 'hi' ? 'आपका डेटा डाउनलोड के लिए तैयार किया जा रहा है।' : 'Your data is being prepared for download.')}
                                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Download className="size-5 text-gray-500" />
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">{text.privacy.downloadData}</span>
                                </div>
                                <ChevronRight className="size-5 text-gray-400" />
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm(language === 'hi' ? 'क्या आप वाकई अपना खाता हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।' : 'Are you sure you want to delete your account? This action cannot be undone.')) {
                                        alert(language === 'hi' ? 'खाता हटाने का अनुरोध दर्ज किया गया।' : 'Account deletion request has been submitted.');
                                    }
                                }}
                                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-red-600"
                            >
                                <div className="flex items-center gap-3">
                                    <Trash2 className="size-5" />
                                    <span className="font-medium text-sm sm:text-base">{text.privacy.deleteAccount}</span>
                                </div>
                                <ChevronRight className="size-5" />
                            </button>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div ref={appearanceRef} id="appearance" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-6">
                        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Sun className="size-5 text-amber-600" />
                                <h2 className="font-bold text-gray-800">{text.appearance.title}</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{text.appearance.subtitle}</p>
                        </div>
                        <div className="p-4 sm:p-6">
                            <label className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                        {darkMode ? <Moon className="size-5 text-indigo-600" /> : <Sun className="size-5 text-amber-600" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm sm:text-base">{text.appearance.darkMode}</p>
                                        <p className="text-xs sm:text-sm text-gray-500">{text.appearance.darkModeDesc}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={darkMode}
                                        onChange={() => setDarkMode(!darkMode)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </label>
                        </div>
                    </div>

                    {/* Help & Support Section */}
                    <div ref={helpRef} id="help" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-6">
                        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="size-5 text-rose-500" />
                                <h2 className="font-bold text-gray-800">{text.help.title}</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{text.help.subtitle}</p>
                        </div>
                        <div className="p-4 sm:p-6 space-y-3">
                            <button className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="size-5 text-gray-500" />
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">{text.help.faq}</span>
                                </div>
                                <ExternalLink className="size-4 text-gray-400" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Heart className="size-5 text-gray-500" />
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">{text.help.contact}</span>
                                </div>
                                <ExternalLink className="size-4 text-gray-400" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <FileText className="size-5 text-gray-500" />
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">{text.help.terms}</span>
                                </div>
                                <ExternalLink className="size-4 text-gray-400" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Shield className="size-5 text-gray-500" />
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">{text.help.privacyPolicy}</span>
                                </div>
                                <ExternalLink className="size-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-2xl shadow-lg transition-all"
                    >
                        <LogOut className="size-5" />
                        <span>{text.account.logout}</span>
                    </button>

                    {/* Footer spacing */}
                    <div className="h-8" />
                </div>
            </div>
        </div>
    );
}
