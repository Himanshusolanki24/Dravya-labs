'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    User, Heart, Activity, Bookmark, AlertTriangle, Settings,
    Sparkles, Leaf, MessageSquare, Brain, TrendingUp,
    Bell, Mail, Smartphone, Globe, ChevronRight, Edit3,
    Shield, Pill, UtensilsCrossed, Dumbbell, Star,
    BookOpen, Quote, Sun, Wind, Droplets, Flame, Plus, LogOut
} from 'lucide-react';
import { mockUserData, wellnessQuote, seasonalTips, type Allergy } from '@/lib/user-data';

import { translations } from '@/lib/translations';
import { useLanguage } from '@/context/LanguageContext';
import { useSavedItems } from '@/context/SavedItemsContext';
import { useUser } from '@/context/UserContext';

// Dynamic imports for chart components (avoid SSR issues)
const DoshaChart = dynamic(() => import('@/components/dashboard/dosha-chart'), { ssr: false });
const ProgressChart = dynamic(() => import('@/components/dashboard/progress-chart'), { ssr: false });

// Dosha colors
const DOSHA_COLORS = {
    Vata: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', fill: '#3B82F6' },
    Pitta: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', fill: '#F59E0B' },
    Kapha: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', fill: '#14B8A6' },
};

// Severity colors
const SEVERITY_COLORS = {
    mild: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Mild' },
    moderate: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Moderate' },
    severe: { bg: 'bg-red-100', text: 'text-red-700', label: 'Severe' },
};

// Status colors
const STATUS_COLORS = {
    active: { bg: 'bg-red-100', text: 'text-red-700' },
    managed: { bg: 'bg-green-100', text: 'text-green-700' },
    resolved: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

// Activity icons
const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
    chat: <MessageSquare className="size-4" />,
    leaf: <Leaf className="size-4" />,
    quiz: <Brain className="size-4" />,
    article: <BookOpen className="size-4" />,
    bookmark: <Bookmark className="size-4" />,
};

type DashboardTab = 'overview' | 'health' | 'analytics' | 'saved' | 'settings';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
    const { language, setLanguage } = useLanguage();
    const { savedItems } = useSavedItems();
    const { user: loggedInUser, logout } = useUser();
    const [privacyEnabled, setPrivacyEnabled] = useState(false); // Simulating enablement
    const [notificationsEnabled, setNotificationsEnabled] = useState(false); // Simulating enablement

    // Allergies state
    const [allergies, setAllergies] = useState<Allergy[]>(mockUserData.allergies);
    const [showAddAllergy, setShowAddAllergy] = useState(false);
    const [newAllergyName, setNewAllergyName] = useState('');
    const [newAllergySeverity, setNewAllergySeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');

    // Add allergy handler
    const handleAddAllergy = () => {
        if (newAllergyName.trim()) {
            setAllergies([...allergies, { name: newAllergyName.trim(), severity: newAllergySeverity }]);
            setNewAllergyName('');
            setNewAllergySeverity('mild');
            setShowAddAllergy(false);
        }
    };

    // Remove allergy handler
    const handleRemoveAllergy = (index: number) => {
        setAllergies(allergies.filter((_, i) => i !== index));
    };

    // Notification states
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false
    });

    const t = translations[language];
    const user = mockUserData;

    // Get display name from logged in user or fall back to mock data
    const displayName = loggedInUser?.fullName || loggedInUser?.firstName
        ? (loggedInUser.fullName || `${loggedInUser.firstName} ${loggedInUser.lastName || ''}`.trim())
        : user.profile.name;
    const displayAge = loggedInUser?.age || user.profile.age;
    const displayGender = loggedInUser?.gender || user.profile.gender;
    const displayLocation = loggedInUser?.location || user.profile.location;

    const currentHour = new Date().getHours();
    const greetingText = currentHour < 12 ? t.greeting.morning : currentHour < 17 ? t.greeting.afternoon : t.greeting.evening;

    const tabs = [
        { id: 'overview' as DashboardTab, label: t.tabs.overview, icon: <User className="size-4" /> },
        { id: 'health' as DashboardTab, label: t.tabs.health, icon: <Heart className="size-4" /> },
        { id: 'analytics' as DashboardTab, label: t.tabs.analytics, icon: <Activity className="size-4" /> },
        { id: 'saved' as DashboardTab, label: t.tabs.saved, icon: <Bookmark className="size-4" /> },
        { id: 'settings' as DashboardTab, label: t.tabs.settings, icon: <Settings className="size-4" /> },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-amber-50/30 via-green-50/20 to-teal-50/30">
            {/* Hero Header */}
            <div className="px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white safe-area-top">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                        {/* Profile Section */}
                        <div className="flex items-center gap-3 sm:gap-5">
                            <div className="relative">
                                <div className="size-16 sm:size-20 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm p-1 shadow-xl">
                                    <img
                                        src={user.profile.avatarUrl}
                                        alt={user.profile.name}
                                        className="size-full rounded-xl object-cover"
                                    />
                                </div>
                                <button className="absolute -bottom-1 -right-1 size-7 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                    <Edit3 className="size-3.5" />
                                </button>
                            </div>
                            <div>
                                <p className="text-emerald-100 text-sm font-medium">{greetingText} 🌿</p>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{displayName}</h1>
                                <p className="text-emerald-100 text-sm mt-1">
                                    {displayAge} years • {displayGender.charAt(0).toUpperCase() + displayGender.slice(1)} • {displayLocation}
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats - Horizontally scrollable on mobile */}
                        <div className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-1">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-center min-w-[85px] sm:min-w-[100px] flex-shrink-0">
                                <p className="text-3xl font-bold">{user.healthMetrics[user.healthMetrics.length - 1].overallWellness}%</p>
                                <p className="text-xs text-emerald-100">{t.hero.wellnessScore}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-center min-w-[85px] sm:min-w-[100px] flex-shrink-0">
                                <p className="text-2xl sm:text-3xl font-bold">{user.currentImbalances.length}</p>
                                <p className="text-xs text-emerald-100">{t.hero.activeImbalances}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-center min-w-[85px] sm:min-w-[100px] flex-shrink-0">
                                <p className="text-2xl sm:text-3xl font-bold">{savedItems.length}</p>
                                <p className="text-xs text-emerald-100">{t.hero.savedRemedies}</p>
                            </div>
                        </div>
                    </div>

                    {/* Wellness Quote - Hidden on very small screens */}
                    <div className="mt-4 sm:mt-6 bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 hidden sm:flex items-center gap-3">
                        <Quote className="size-5 text-emerald-200 shrink-0" />
                        <p className="text-xs sm:text-sm italic text-emerald-50">&ldquo;{wellnessQuote.text}&rdquo; — <span className="font-medium">{wellnessQuote.author}</span></p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation - Mobile optimized */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex overflow-x-auto hide-scrollbar mobile-scroll-snap">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-4 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors touch-target ${activeTab === tab.id
                                    ? 'border-emerald-500 text-emerald-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 sm:px-6 py-6 sm:py-8 safe-area-bottom">
                <div className="max-w-7xl mx-auto">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Alerts Section */}
                                {(user.currentImbalances.some(i => i.severity !== 'mild') || user.medications.some(m => m.hasInteraction)) && (
                                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 border border-red-200">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertTriangle className="size-5 text-red-600" />
                                            <h3 className="font-bold text-red-800">{t.overview.healthAlerts}</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {user.currentImbalances.filter(i => i.severity !== 'mild').map((imbalance, idx) => (
                                                <div key={idx} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-red-100">
                                                    <div className={`size-8 rounded-lg flex items-center justify-center ${DOSHA_COLORS[imbalance.dosha].bg}`}>
                                                        {imbalance.dosha === 'Vata' && <Wind className="size-4 text-blue-600" />}
                                                        {imbalance.dosha === 'Pitta' && <Flame className="size-4 text-amber-600" />}
                                                        {imbalance.dosha === 'Kapha' && <Droplets className="size-4 text-teal-600" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-800">{imbalance.dosha} Imbalance</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[imbalance.severity].bg} ${SEVERITY_COLORS[imbalance.severity].text}`}>
                                                                {SEVERITY_COLORS[imbalance.severity].label}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">{imbalance.symptoms.join(', ')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {user.medications.filter(m => m.hasInteraction).map((med, idx) => (
                                                <div key={idx} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-orange-100">
                                                    <div className="size-8 rounded-lg flex items-center justify-center bg-orange-100">
                                                        <Pill className="size-4 text-orange-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-gray-800">Medication Interaction</span>
                                                        <p className="text-sm text-gray-600 mt-1">{med.name}: {med.interactionWarning}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-4">{t.overview.quickActions}</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <Link href="/chat" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:shadow-md hover:scale-[1.02] transition-all">
                                            <div className="size-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                                <MessageSquare className="size-6" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 text-center">{t.overview.newConsultation}</span>
                                        </Link>
                                        <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md hover:scale-[1.02] transition-all">
                                            <div className="size-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                                                <Brain className="size-6" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 text-center">{t.overview.takeDoshaQuiz}</span>
                                        </button>
                                        <Link href="/ensyclopedia" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-green-50 to-lime-50 border border-green-100 hover:shadow-md hover:scale-[1.02] transition-all">
                                            <div className="size-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
                                                <Leaf className="size-6" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 text-center">{t.overview.viewRemedies}</span>
                                        </Link>
                                        <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md hover:scale-[1.02] transition-all">
                                            <div className="size-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                                                <TrendingUp className="size-6" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 text-center">{t.overview.trackProgress}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-800">{t.overview.recentActivity}</h3>
                                        <button className="text-sm text-emerald-600 font-medium hover:underline">{t.overview.viewAll}</button>
                                    </div>
                                    <div className="space-y-3">
                                        {user.recentActivity.slice(0, 4).map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                                <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    {ACTIVITY_ICONS[activity.icon]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 truncate">{activity.title}</p>
                                                    <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                                                </div>
                                                <div className="text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Dosha Constitution */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-800">{t.overview.yourPrakriti}</h3>
                                        <button className="text-sm text-emerald-600 font-medium hover:underline">{t.overview.retakeQuiz}</button>
                                    </div>
                                    <div className="flex justify-center">
                                        <DoshaChart
                                            vata={user.doshaConstitution.vata}
                                            pitta={user.doshaConstitution.pitta}
                                            kapha={user.doshaConstitution.kapha}
                                            size="medium"
                                        />
                                    </div>
                                    <p className="text-center text-sm text-gray-500 mt-4">
                                        <span className="font-semibold text-amber-600">Pitta-Vata</span> dominant constitution
                                    </p>
                                </div>

                                {/* Seasonal Tips */}
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sun className="size-5 text-orange-500" />
                                        <h3 className="font-bold text-gray-800">{t.overview.seasonalTips}</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {seasonalTips[0].tips.slice(0, 3).map((tip, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="text-orange-400 mt-1">•</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Saved Remedies Preview */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-800">{t.overview.savedRemedies}</h3>
                                        <button onClick={() => setActiveTab('saved')} className="text-sm text-emerald-600 font-medium hover:underline">{t.overview.viewAll}</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {savedItems.slice(0, 4).map((remedy) => (
                                            <Link
                                                key={remedy.id}
                                                href={`/ensyclopedia/${remedy.item_id}`}
                                                className="group relative aspect-square rounded-xl overflow-hidden"
                                            >
                                                <Image
                                                    src={remedy.image_url || '/placeholder.jpg'}
                                                    alt={remedy.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <div className="absolute bottom-2 left-2 right-2">
                                                    <p className="text-white text-sm font-medium truncate">{remedy.name}</p>
                                                </div>
                                                <div className="absolute top-2 right-2">
                                                    <Star className="size-4 text-yellow-400 fill-yellow-400" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Health Profile Tab */}
                    {activeTab === 'health' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Health Conditions */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Heart className="size-5 text-red-500" />
                                    <h3 className="font-bold text-gray-800">{t.health.conditions}</h3>
                                </div>
                                <div className="space-y-3">
                                    {user.healthConditions.map((condition, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                            <div>
                                                <p className="font-medium text-gray-800">{condition.name}</p>
                                                <p className="text-xs text-gray-500">{t.health.since} {new Date(condition.since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[condition.status].bg} ${STATUS_COLORS[condition.status].text}`}>
                                                {condition.status.charAt(0).toUpperCase() + condition.status.slice(1)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Allergies */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="size-5 text-orange-500" />
                                        <h3 className="font-bold text-gray-800">{t.health.allergies}</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowAddAllergy(!showAddAllergy)}
                                        className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                                        title={language === 'hi' ? 'एलर्जी जोड़ें' : 'Add Allergy'}
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>

                                {/* Add Allergy Form */}
                                {showAddAllergy && (
                                    <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {language === 'hi' ? 'एलर्जी का नाम' : 'Allergy Name'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newAllergyName}
                                                    onChange={(e) => setNewAllergyName(e.target.value)}
                                                    placeholder={language === 'hi' ? 'जैसे: मूंगफली, धूल...' : 'e.g., Peanuts, Dust...'}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {language === 'hi' ? 'गंभीरता' : 'Severity'}
                                                </label>
                                                <select
                                                    value={newAllergySeverity}
                                                    onChange={(e) => setNewAllergySeverity(e.target.value as 'mild' | 'moderate' | 'severe')}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                >
                                                    <option value="mild">{language === 'hi' ? 'हल्का' : 'Mild'}</option>
                                                    <option value="moderate">{language === 'hi' ? 'मध्यम' : 'Moderate'}</option>
                                                    <option value="severe">{language === 'hi' ? 'गंभीर' : 'Severe'}</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleAddAllergy}
                                                    disabled={!newAllergyName.trim()}
                                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                                >
                                                    {language === 'hi' ? 'जोड़ें' : 'Add'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowAddAllergy(false);
                                                        setNewAllergyName('');
                                                        setNewAllergySeverity('mild');
                                                    }}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                                >
                                                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {allergies.map((allergy, idx) => (
                                        <span
                                            key={idx}
                                            className={`px-4 py-2 rounded-full text-sm font-medium ${SEVERITY_COLORS[allergy.severity].bg} ${SEVERITY_COLORS[allergy.severity].text} flex items-center gap-2 group`}
                                        >
                                            {allergy.name}
                                            <span className="opacity-70">({language === 'hi' ? (allergy.severity === 'mild' ? 'हल्का' : allergy.severity === 'moderate' ? 'मध्यम' : 'गंभीर') : allergy.severity})</span>
                                            <button
                                                onClick={() => handleRemoveAllergy(idx)}
                                                className="ml-1 size-4 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
                                                title={language === 'hi' ? 'हटाएं' : 'Remove'}
                                            >
                                                <span className="text-xs leading-none">×</span>
                                            </button>
                                        </span>
                                    ))}
                                    {allergies.length === 0 && (
                                        <p className="text-gray-500 text-sm italic">
                                            {language === 'hi' ? 'कोई एलर्जी नहीं जोड़ी गई' : 'No allergies added'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Medications */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Pill className="size-5 text-purple-500" />
                                    <h3 className="font-bold text-gray-800">{t.health.medications}</h3>
                                </div>
                                <div className="space-y-3">
                                    {user.medications.map((med, idx) => (
                                        <div key={idx} className={`p-3 rounded-xl ${med.hasInteraction ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-800">{med.name}</p>
                                                {med.hasInteraction && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                        ⚠️ {t.health.interaction}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">{med.dosage} • {med.frequency}</p>
                                            {med.hasInteraction && (
                                                <p className="text-xs text-red-600 mt-1">{med.interactionWarning}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lifestyle */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Dumbbell className="size-5 text-green-500" />
                                    <h3 className="font-bold text-gray-800">{t.health.lifestyle}</h3>
                                </div>

                                {/* Activity Level */}
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">{t.health.activityLevel}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                                style={{ width: user.activityLevel === 'sedentary' ? '20%' : user.activityLevel === 'light' ? '40%' : user.activityLevel === 'moderate' ? '60%' : user.activityLevel === 'active' ? '80%' : '100%' }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 capitalize">{user.activityLevel}</span>
                                    </div>
                                </div>

                                {/* Dietary Preferences */}
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">{t.health.dietaryPreferences}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.dietaryPreferences.map((pref, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                                                <UtensilsCrossed className="size-3" />
                                                {pref}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            {/* Progress Chart */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{t.analytics.trends}</h3>
                                        <p className="text-sm text-gray-500">{t.analytics.trackProgress}</p>
                                    </div>
                                    <select className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400">
                                        <option>Last 7 days</option>
                                        <option>Last 30 days</option>
                                        <option>Last 3 months</option>
                                    </select>
                                </div>
                                <ProgressChart data={user.healthMetrics} />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Wind className="size-5 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">{t.analytics.vataBalance}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-800">{user.healthMetrics[user.healthMetrics.length - 1].vataBalance}%</p>
                                    <p className="text-xs text-green-600 mt-1">↑ 10% this week</p>
                                </div>
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                            <Flame className="size-5 text-amber-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">{t.analytics.pittaBalance}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-800">{user.healthMetrics[user.healthMetrics.length - 1].pittaBalance}%</p>
                                    <p className="text-xs text-green-600 mt-1">↑ 7% this week</p>
                                </div>
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-10 rounded-lg bg-teal-100 flex items-center justify-center">
                                            <Droplets className="size-5 text-teal-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">{t.analytics.kaphaBalance}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-800">{user.healthMetrics[user.healthMetrics.length - 1].kaphaBalance}%</p>
                                    <p className="text-xs text-green-600 mt-1">↑ 5% this week</p>
                                </div>
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                            <Sparkles className="size-5 text-emerald-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">{t.analytics.overallWellness}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-800">{user.healthMetrics[user.healthMetrics.length - 1].overallWellness}%</p>
                                    <p className="text-xs text-green-600 mt-1">↑ 10% this week</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Saved Tab */}
                    {activeTab === 'saved' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4">{t.overview.savedRemedies}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {savedItems.map((remedy) => (
                                        <Link
                                            key={remedy.id}
                                            href={`/ensyclopedia/${remedy.item_id}`}
                                            className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all"
                                        >
                                            <div className="relative aspect-square">
                                                <Image
                                                    src={remedy.image_url || '/placeholder.jpg'}
                                                    alt={remedy.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <button
                                                    className="absolute top-2 right-2 size-8 rounded-full bg-white/90 flex items-center justify-center text-yellow-500 hover:text-red-500 transition-colors"
                                                    onClick={(e) => e.preventDefault()}
                                                >
                                                    <Star className="size-4 fill-current" />
                                                </button>
                                            </div>
                                            <div className="p-3">
                                                <p className="font-medium text-gray-800">{remedy.name}</p>
                                                <p className="text-xs text-gray-500">{remedy.category}</p>
                                                <p className="text-xs text-gray-400 mt-1">Saved {new Date(remedy.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="max-w-2xl space-y-6">
                            {/* Language */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Globe className="size-5 text-blue-500" />
                                    <h3 className="font-bold text-gray-800">{t.settings.language}</h3>
                                </div>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                                >
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                </select>
                            </div>

                            {/* Notifications */}
                            <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-opacity duration-300`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Bell className="size-5 text-purple-500" />
                                        <h3 className="font-bold text-gray-800">{t.settings.notifications}</h3>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>

                                <div className={`space-y-4 ${!notificationsEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {Object.keys(notifications).map((type) => (
                                        <label key={type} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                {type === 'email' && <Mail className="size-5 text-gray-500" />}
                                                {type === 'push' && <Bell className="size-5 text-gray-500" />}
                                                {type === 'sms' && <Smartphone className="size-5 text-gray-500" />}
                                                <span className="font-medium text-gray-700">
                                                    {type === 'email' ? t.settings.emailNotifications :
                                                        type === 'push' ? t.settings.pushNotifications :
                                                            t.settings.smsNotifications}
                                                </span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifications[type as keyof typeof notifications]}
                                                onChange={() => setNotifications(prev => ({ ...prev, [type]: !prev[type as keyof typeof notifications] }))}
                                                className="size-5 rounded text-emerald-500 focus:ring-emerald-400"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Privacy & Security */}
                            <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-opacity duration-300`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="size-5 text-green-500" />
                                        <h3 className="font-bold text-gray-800">{t.settings.privacySecurity}</h3>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={privacyEnabled} onChange={() => setPrivacyEnabled(!privacyEnabled)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>
                                <div className={`space-y-3 ${!privacyEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <button
                                        onClick={() => alert('Change password functionality coming soon!')}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="font-medium text-gray-700">{t.settings.changePassword}</span>
                                        <ChevronRight className="size-5 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => alert('Data management portal coming soon!')}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="font-medium text-gray-700">{t.settings.manageData}</span>
                                        <ChevronRight className="size-5 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => alert('Your data is being prepared for download.')}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="font-medium text-gray-700">{t.settings.downloadData}</span>
                                        <ChevronRight className="size-5 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => confirm('Are you sure you want to delete your account? This action cannot be undone.')}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-red-600"
                                    >
                                        <span className="font-medium">{t.settings.deleteAccount}</span>
                                        <ChevronRight className="size-5" />
                                    </button>

                                    {/* Logout Button */}
                                    <button
                                        onClick={() => {
                                            if (confirm(language === 'hi' ? 'क्या आप वाकई लॉग आउट करना चाहते हैं?' : 'Are you sure you want to logout?')) {
                                                logout();
                                            }
                                        }}
                                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-800 hover:bg-gray-900 transition-colors text-white font-semibold mt-4"
                                    >
                                        <LogOut className="size-5" />
                                        <span>{language === 'hi' ? 'लॉग आउट' : 'Logout'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
