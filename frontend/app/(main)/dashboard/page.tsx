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
    BookOpen, Quote, Sun, Wind, Droplets, Flame, Plus, LogOut,
    ShieldAlert, ArrowRight, ChevronLeft, Utensils
} from 'lucide-react';
import { mockUserData, wellnessQuote, seasonalTips, type Allergy } from '@/lib/user-data';
import { Skeleton } from '@/components/ui/skeleton-loader';

import { translations } from '@/lib/translations';
import { useLanguage } from '@/context/LanguageContext';
import { useSavedItems } from '@/context/SavedItemsContext';
import { useUser } from '@/context/UserContext';

// Dynamic imports for chart components (avoid SSR issues)
const DoshaChart = dynamic(() => import('@/components/dashboard/dosha-chart'), { 
    ssr: false,
    loading: () => <Skeleton className="h-[250px] w-full rounded-2xl" />
});

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

export default function DashboardPage() {
    const { language } = useLanguage();
    const { user: loggedInUser } = useUser();
    const { savedItems } = useSavedItems();

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



    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-amber-50/30 via-green-50/20 to-teal-50/30">
            {/* Hero Header */}
            <div className="bg-[#057A55] text-white py-8 px-6 lg:px-10 overflow-hidden relative shadow-lg rounded-b-3xl">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                    
                    {/* Stats Container - Flex Row with Dividers */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 sm:gap-8 lg:gap-12 w-full md:w-auto">
                        
                        {/* Wellness Score */}
                        <div className="flex items-center gap-5">
                            {/* Circular Gauge SVG */}
                            <div className="relative size-24 shrink-0 flex items-center justify-center rounded-full bg-emerald-800/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                <svg className="size-full rotate-[-90deg] absolute inset-0" viewBox="0 0 100 100">
                                    {/* Background track */}
                                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                                    {/* Progress track */}
                                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="#34D399" strokeWidth="6" strokeDasharray="283" strokeDashoffset={283 - (283 * user.healthMetrics[user.healthMetrics.length - 1].overallWellness) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                </svg>
                                <span className="text-2xl font-bold z-10">{user.healthMetrics[user.healthMetrics.length - 1].overallWellness}%</span>
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-emerald-100/90 text-xs font-medium tracking-wide uppercase mb-1">{t.hero.wellnessScore || 'Wellness Score'}</span>
                                <span className="text-xl font-semibold mb-0.5">Good</span>
                                <span className="text-xs text-emerald-100/80 mb-2">Keep it up!</span>
                                <span className="inline-flex items-center text-[10px] font-medium bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded-full">↑ 8% vs last month</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px bg-white/20"></div>

                        {/* Active Imbalances */}
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 mb-1.5 text-emerald-100/90 text-xs font-medium tracking-wide uppercase">
                                <Activity className="size-3.5" />
                                <span>{t.hero.activeImbalances || 'Active Imbalances'}</span>
                            </div>
                            <span className="text-3xl font-bold mb-1">{user.currentImbalances.length}</span>
                            <div className="flex flex-col gap-0.5 text-xs text-emerald-100/80">
                                {user.currentImbalances.slice(0,2).map((imb, i) => (
                                    <span key={i}>{imb.dosha} ({SEVERITY_COLORS[imb.severity].label})</span>
                                ))}
                            </div>
                            <Link href="#health-alerts" className="text-xs font-medium mt-2 hover:text-white transition-colors flex items-center gap-1">
                                View Details <ChevronRight className="size-3" />
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px bg-white/20"></div>

                        {/* Chat Summary */}
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 mb-1.5 text-emerald-100/90 text-xs font-medium tracking-wide uppercase">
                                <MessageSquare className="size-3.5" />
                                <span>Chat Summary</span>
                            </div>
                            <span className="text-3xl font-bold mb-1">24</span>
                            <div className="flex flex-col gap-0.5 text-xs text-emerald-100/80">
                                <span>Conversations</span>
                                <span>This Month</span>
                            </div>
                            <Link href="/chat" className="text-xs font-medium mt-2 hover:text-white transition-colors flex items-center gap-1">
                                View History <ChevronRight className="size-3" />
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px bg-white/20"></div>

                        {/* Saved Remedies */}
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 mb-1.5 text-emerald-100/90 text-xs font-medium tracking-wide uppercase">
                                <Bookmark className="size-3.5" />
                                <span>{t.hero.savedRemedies || 'Saved Remedies'}</span>
                            </div>
                            <span className="text-3xl font-bold mb-1">{savedItems.length}</span>
                            <div className="flex flex-col gap-0.5 text-xs text-emerald-100/80">
                                <span>Remedies</span>
                                <span>In Your Library</span>
                            </div>
                            <Link href="#saved" className="text-xs font-medium mt-2 hover:text-white transition-colors flex items-center gap-1">
                                View Library <ChevronRight className="size-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Side Quote & Illustration */}
                    <div className="hidden xl:flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-5 max-w-[400px] gap-4 border border-white/10">
                        <Quote className="size-8 text-emerald-300/50 shrink-0 self-start" />
                        <div>
                            <p className="text-sm font-medium leading-relaxed italic mb-3">
                                &ldquo;{wellnessQuote.text}&rdquo;
                            </p>
                            <p className="text-xs text-emerald-200">— {wellnessQuote.author}</p>
                        </div>
                        {/* Custom SVG Illustration for Mortar and Pestle */}
                        <div className="shrink-0 relative size-20 drop-shadow-2xl opacity-90">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-200/90" fill="currentColor">
                                <path d="M20,60 Q50,90 80,60 Q80,50 50,50 Q20,50 20,60" fill="#E1C699" />
                                <path d="M25,60 Q50,85 75,60" fill="none" stroke="#C8A97E" strokeWidth="4" />
                                {/* Pestle */}
                                <path d="M65,20 L55,55 L45,55 L35,20 C35,15 65,15 65,20" fill="#8B7355" />
                                <path d="M60,20 L55,50" stroke="#705C44" strokeWidth="3" />
                                {/* Leaves */}
                                <path d="M50,45 Q70,30 80,45 Q65,60 50,45" fill="#34D399" />
                                <path d="M45,40 Q25,20 20,35 Q35,50 45,40" fill="#10B981" />
                            </svg>
                        </div>
                    </div>

                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 sm:px-6 py-8 safe-area-bottom bg-[#F8F9FA]">
                <div className="max-w-7xl mx-auto space-y-5">
                    
                    {/* Top Row: Health Alerts & Prakriti */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        
                        {/* Left Column (Alerts & Quick Actions) */}
                        <div className="lg:col-span-2 space-y-5">
                            
                            {/* Health Overview */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <Activity className="size-6 text-emerald-600" />
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">Health Overview</h3>
                                        <p className="text-sm text-gray-500">Your body's signals at a glance</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                    {/* Card 1: Pitta */}
                                    <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-44">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                                <Flame className="size-5 text-orange-500" />
                                            </div>
                                            <span className="text-gray-900 font-bold">Pitta</span>
                                        </div>
                                        <div className="mt-4">
                                            <h4 className="text-orange-500 font-bold text-lg leading-tight">Moderate</h4>
                                            <p className="text-sm text-gray-500">Needs Balance</p>
                                        </div>
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="flex-1 bg-orange-50 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-orange-500 h-full rounded-full" style={{ width: '40%' }}></div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-600 w-8 text-right shrink-0">40%</span>
                                        </div>
                                    </div>
                                    {/* Card 2: Vata */}
                                    <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-44">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Wind className="size-5 text-blue-500" />
                                            </div>
                                            <span className="text-gray-900 font-bold">Vata</span>
                                        </div>
                                        <div className="mt-4">
                                            <h4 className="text-blue-500 font-bold text-lg leading-tight">Balanced</h4>
                                            <p className="text-sm text-gray-500">Good</p>
                                        </div>
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="flex-1 bg-blue-50 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-blue-500 h-full rounded-full" style={{ width: '35%' }}></div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-600 w-8 text-right shrink-0">35%</span>
                                        </div>
                                    </div>
                                    {/* Card 3: Kapha */}
                                    <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-44">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                <Leaf className="size-5 text-emerald-600" />
                                            </div>
                                            <span className="text-gray-900 font-bold">Kapha</span>
                                        </div>
                                        <div className="mt-4">
                                            <h4 className="text-emerald-600 font-bold text-lg leading-tight">Mild</h4>
                                            <p className="text-sm text-gray-500">Slightly Elevated</p>
                                        </div>
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="flex-1 bg-emerald-50 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '25%' }}></div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-600 w-8 text-right shrink-0">25%</span>
                                        </div>
                                    </div>
                                    {/* Card 4: Agni */}
                                    <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-44">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                                <Flame className="size-5 text-purple-500" />
                                            </div>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-gray-900 font-bold">Agni</span>
                                                <span className="text-xs text-gray-500 font-medium">(Digestive Fire)</span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h4 className="text-purple-600 font-bold text-lg leading-tight">Good</h4>
                                            <p className="text-sm text-gray-500">Strong</p>
                                        </div>
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="flex-1 bg-purple-50 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-purple-500 h-full rounded-full" style={{ width: '80%' }}></div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-600 w-8 text-right shrink-0">80%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Health Alerts Component */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <ShieldAlert className="size-7 text-red-500 stroke-[1.5]" />
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Health Alerts</h3>
                                        <p className="text-sm text-gray-500">Important insights for your wellbeing</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 max-h-[320px] overflow-y-auto glass-scrollbar pr-2 -mr-2">
                                    {/* Alert 1 */}
                                    <div className="flex items-center justify-between bg-orange-50/50 rounded-2xl p-5 border border-orange-100 transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className="size-10 rounded-full bg-orange-100/80 flex items-center justify-center shrink-0">
                                                <AlertTriangle className="size-5 text-orange-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-semibold text-gray-900 text-base">Pitta Imbalance Detected</h4>
                                                    <span className="text-[10px] font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Moderate</span>
                                                </div>
                                                <p className="text-sm text-gray-500">You may be experiencing acid reflux, skin irritation, or irritability.</p>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0">
                                            View Remedies <ArrowRight className="size-4" />
                                        </button>
                                    </div>
                                    
                                    {/* Alert 2 */}
                                    <div className="flex items-center justify-between bg-amber-50/50 rounded-2xl p-5 border border-amber-100 transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className="size-10 rounded-full bg-amber-100/80 flex items-center justify-center shrink-0">
                                                <AlertTriangle className="size-5 text-amber-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-base mb-1">Medication Interaction</h4>
                                                <p className="text-sm text-gray-500">Amlodipine may interact with Licorice (Yashtimadhu).</p>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0">
                                            Learn More <ArrowRight className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions Component */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-0">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-slate-900 text-lg">Quick Actions</h3>
                                    <div className="flex items-center gap-2">
                                        <button className="size-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors border border-gray-100">
                                            <ChevronLeft className="size-4" />
                                        </button>
                                        <button className="size-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors border border-gray-100">
                                            <ChevronRight className="size-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 glass-scrollbar">
                                    {/* Action 1 */}
                                    <div className="flex-none w-[230px] flex items-center gap-3 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 cursor-pointer hover:shadow-sm transition-all">
                                        <div className="size-11 rounded-xl bg-emerald-100/80 flex items-center justify-center shrink-0">
                                            <div className="size-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                                                <MessageSquare className="size-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Start New Chat</h4>
                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">Ask your health question</p>
                                        </div>
                                    </div>
                                    {/* Action 2 */}
                                    <div className="flex-none w-[230px] flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer hover:shadow-sm transition-all">
                                        <div className="size-11 rounded-xl bg-orange-100/80 flex items-center justify-center shrink-0 text-orange-500">
                                            <Activity className="size-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Dosha Analysis</h4>
                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">Check your imbalance</p>
                                        </div>
                                    </div>
                                    {/* Action 3 */}
                                    <div className="flex-none w-[230px] flex items-center gap-3 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 cursor-pointer hover:shadow-sm transition-all">
                                        <div className="size-11 rounded-xl bg-green-100/80 flex items-center justify-center shrink-0 text-green-600">
                                            <Utensils className="size-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Diet Planner</h4>
                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">Personalized diet plan</p>
                                        </div>
                                    </div>
                                    {/* Action 4 */}
                                    <div className="flex-none w-[230px] flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-rose-50/70 cursor-pointer hover:shadow-sm transition-all">
                                        <div className="size-11 rounded-xl bg-rose-100/80 flex items-center justify-center shrink-0 text-rose-500">
                                            <Bookmark className="size-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Save Remedy</h4>
                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">Add to your library</p>
                                        </div>
                                    </div>
                                    {/* Action 5 */}
                                    <div className="flex-none w-[230px] flex items-center gap-3 p-4 rounded-2xl border border-violet-100 bg-violet-50/70 cursor-pointer hover:shadow-sm transition-all">
                                        <div className="size-11 rounded-xl bg-violet-100/80 flex items-center justify-center shrink-0 text-violet-600">
                                            <TrendingUp className="size-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Track Progress</h4>
                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">View health trends</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Current Medications */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-5">
                                    <Pill className="size-5 text-purple-500" />
                                    <h3 className="font-bold text-slate-800 text-lg">Current Medications</h3>
                                </div>
                                <div className="space-y-3 max-h-[250px] overflow-y-auto glass-scrollbar pr-2 -mr-2">
                                    {user.medications.map((med, idx) => (
                                        <div key={idx} className={`p-4 rounded-xl ${med.hasInteraction ? 'bg-red-50/50 border border-red-100' : 'bg-slate-50'}`}>
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="font-semibold text-slate-800">{med.name}</p>
                                                {med.hasInteraction && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-100 text-red-700">
                                                        <AlertTriangle className="size-3 text-orange-500" /> Interaction
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500">{med.dosage} • {med.frequency}</p>
                                            {med.hasInteraction && (
                                                <p className="text-xs font-medium text-red-600 mt-2">Avoid with {med.interactionWarning.replace('may interact with ', '').replace('Ashwagandha ', '')}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>



                        </div>

                        {/* Right Column (Your Prakriti & Health Panels) */}
                        <div className="lg:col-span-1 space-y-5">
                            
                            {/* Daily Wellness Tip */}
                            <div className="bg-[#EEF9F0] rounded-2xl p-6 shadow-sm flex items-center justify-between">
                                <div className="pr-4 max-w-[75%]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Quote className="size-6 text-[#007200] fill-[#007200]" />
                                        <h3 className="font-bold text-[#007200] text-lg">Daily Wellness Tip</h3>
                                    </div>
                                    <p className="text-[#59786A] text-[15px] leading-relaxed font-medium">
                                        Drink warm water with a few drops of lemon in the morning to boost digestion.
                                    </p>
                                </div>
                                <div className="shrink-0 size-24 rounded-full bg-[#E1F3E7] flex items-center justify-center">
                                     <Leaf className="size-10 text-[#007200] fill-[#007200]/20" />
                                </div>
                            </div>

                            {/* Your Prakriti Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-gray-800 text-lg">Your Prakriti</h3>
                                    <button className="text-xs text-gray-400 hover:text-emerald-600 font-medium transition-colors">Retake Quiz</button>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">Current mind-body constitution based on your latest assessment.</p>
                                
                                <div className="flex justify-center w-full">
                                    <DoshaChart
                                        vata={user.doshaConstitution.vata}
                                        pitta={user.doshaConstitution.pitta}
                                        kapha={user.doshaConstitution.kapha}
                                        size="medium"
                                    />
                                </div>
                            </div>
                                                      {/* Health Conditions */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-5">
                                    <Heart className="size-5 text-red-500" />
                                    <h3 className="font-bold text-slate-800 text-lg">Health Conditions</h3>
                                </div>
                                <div className="space-y-3 max-h-[250px] overflow-y-auto glass-scrollbar pr-2 -mr-2">
                                    {user.healthConditions.map((condition, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                                            <div>
                                                <p className="font-semibold text-slate-800">{condition.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{t.health.since} {new Date(condition.since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${condition.status === 'managed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {condition.status.charAt(0).toUpperCase() + condition.status.slice(1)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                                                      {/* Allergies */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="size-5 text-orange-500" />
                                        <h3 className="font-bold text-slate-800 text-lg">Allergies</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowAddAllergy(!showAddAllergy)}
                                        className="size-7 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-600 flex items-center justify-center transition-colors"
                                        title={language === 'hi' ? 'एलर्जी जोड़ें' : 'Add Allergy'}
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>

                                {/* Add Allergy Form */}
                                {showAddAllergy && (
                                    <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-gray-100">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                    {language === 'hi' ? 'एलर्जी का नाम' : 'Allergy Name'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newAllergyName}
                                                    onChange={(e) => setNewAllergyName(e.target.value)}
                                                    placeholder={language === 'hi' ? 'जैसे: मूंगफली, धूल...' : 'e.g., Peanuts, Dust...'}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                    {language === 'hi' ? 'गंभीरता' : 'Severity'}
                                                </label>
                                                <select
                                                    value={newAllergySeverity}
                                                    onChange={(e) => setNewAllergySeverity(e.target.value as 'mild' | 'moderate' | 'severe')}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                                >
                                                    <option value="mild">{language === 'hi' ? 'हल्का' : 'Mild'}</option>
                                                    <option value="moderate">{language === 'hi' ? 'मध्यम' : 'Moderate'}</option>
                                                    <option value="severe">{language === 'hi' ? 'गंभीर' : 'Severe'}</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={handleAddAllergy}
                                                    disabled={!newAllergyName.trim()}
                                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium text-sm"
                                                >
                                                    {language === 'hi' ? 'जोड़ें' : 'Add'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowAddAllergy(false);
                                                        setNewAllergyName('');
                                                        setNewAllergySeverity('mild');
                                                    }}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                                                >
                                                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {allergies.map((allergy, idx) => {
                                        const isSevere = allergy.severity === 'severe';
                                        const isModerate = allergy.severity === 'moderate';
                                        
                                        let bgClass = '';
                                        let textClass = '';
                                        let mutedTextClass = '';
                                        
                                        if (isSevere) {
                                            bgClass = 'bg-red-100/70';
                                            textClass = 'text-red-800';
                                            mutedTextClass = 'text-red-600/80';
                                        } else if (isModerate) {
                                            bgClass = 'bg-orange-100/70';
                                            textClass = 'text-orange-800';
                                            mutedTextClass = 'text-orange-600/80';
                                        } else {
                                            bgClass = 'bg-amber-100/70';
                                            textClass = 'text-amber-800';
                                            mutedTextClass = 'text-amber-600/80';
                                        }

                                        return (
                                            <span
                                                key={idx}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium ${bgClass} ${textClass} flex items-center gap-1.5 group`}
                                            >
                                                {allergy.name}
                                                <span className={`${mutedTextClass} font-normal text-xs`}>
                                                    ({language === 'hi' ? (allergy.severity === 'mild' ? 'हल्का' : allergy.severity === 'moderate' ? 'मध्यम' : 'गंभीर') : allergy.severity})
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveAllergy(idx)}
                                                    className="ml-0.5 size-4 rounded-full bg-black/5 hover:bg-black/15 flex items-center justify-center transition-colors"
                                                    title={language === 'hi' ? 'हटाएं' : 'Remove'}
                                                >
                                                    <span className="text-[10px] leading-none opacity-60 hover:opacity-100">×</span>
                                                </button>
                                            </span>
                                        );
                                    })}
                                    {allergies.length === 0 && (
                                        <p className="text-slate-500 text-sm italic">
                                            {language === 'hi' ? 'कोई एलर्जी नहीं जोड़ी गई' : 'No allergies added'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Lifestyle */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-5">
                                    <Dumbbell className="size-5 text-emerald-500" />
                                    <h3 className="font-bold text-slate-800 text-lg">Lifestyle</h3>
                                </div>

                                {/* Activity Level */}
                                <div className="mb-4 bg-slate-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-slate-800">Activity Level</p>
                                        <span className="text-xs font-bold text-emerald-600 capitalize bg-emerald-100/50 px-2.5 py-1 rounded-md">{user.activityLevel}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-slate-200/60 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                style={{ width: user.activityLevel === 'sedentary' ? '20%' : user.activityLevel === 'light' ? '40%' : user.activityLevel === 'moderate' ? '60%' : user.activityLevel === 'active' ? '80%' : '100%' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dietary Preferences */}
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-slate-800 mb-3">Dietary Preferences</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.dietaryPreferences.map((pref, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium shadow-sm">
                                                <UtensilsCrossed className="size-3.5 text-emerald-500" />
                                                {pref}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
