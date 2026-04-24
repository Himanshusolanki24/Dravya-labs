'use client';

import React, { useState } from 'react';
import {
    Activity, TrendingUp, Calendar, ArrowLeft, Download,
    Share2, Droplets, Flame, Wind
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { mockUserData } from '@/lib/user-data';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';

// Dynamic imports
const ProgressChart = dynamic(() => import('@/components/dashboard/progress-chart'), { ssr: false });
const RadarDoshaChart = dynamic(() => import('@/components/dashboard/radar-dosha-chart'), { ssr: false });

export default function AnalyticsPage() {
    const { language } = useLanguage();

    const user = mockUserData;
    const [timeRange, setTimeRange] = useState('month');

    // Calculate generic stats
    const currentMetrics = user.healthMetrics[user.healthMetrics.length - 1];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="size-5 text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Health Analytics</h1>
                                <p className="text-sm text-gray-500">Deep dive into your ayurvedic metrics</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="hidden sm:block px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                                <option value="year">Yearly View</option>
                            </select>
                            <button className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                <Download className="size-5" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                <Share2 className="size-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <Activity className="size-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Wellness Score</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">{currentMetrics.overallWellness}</span>
                                <span className="text-sm font-medium text-emerald-500 mb-1">/ 100</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">+2.4% from last month</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Wind className="size-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Vata Balance</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">{currentMetrics.vataBalance}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${currentMetrics.vataBalance}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <Flame className="size-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Pitta Balance</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">{currentMetrics.pittaBalance}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${currentMetrics.pittaBalance}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                                    <Droplets className="size-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Kapha Balance</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">{currentMetrics.kaphaBalance}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${currentMetrics.kaphaBalance}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Trend Analysis */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Wellness Trends</h2>
                                <p className="text-sm text-gray-500">Tracking your dosha balance over time</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors">
                                    <TrendingUp className="size-4" />
                                </button>
                                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 transition-colors">
                                    <Calendar className="size-4" />
                                </button>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ProgressChart data={user.healthMetrics} />
                        </div>
                    </div>

                    {/* Radar Analysis */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Dosha Harmony</h2>
                            <p className="text-sm text-gray-500">Current elemental balance</p>
                        </div>
                        <RadarDoshaChart
                            vata={currentMetrics.vataBalance}
                            pitta={currentMetrics.pittaBalance}
                            kapha={currentMetrics.kaphaBalance}
                        />
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs text-center text-gray-500 leading-relaxed">
                                Your <span className="font-semibold text-gray-700">Pitta-Vata</span> nature requires cooling and grounding practices.
                                Try to maintain consistency in your daily routine.
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Insights (The "Crazy" Part - Interactive Cards) */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <SparklesIcon className="size-5 text-purple-500" />
                        <h2 className="text-xl font-bold text-gray-900">AI-Powered Insights</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: 'Sleep Quality', score: '85', status: 'Excellent', color: 'purple', tip: 'Deep sleep duration has increased by 15% this week.' },
                            { title: 'Dietary Adherence', score: '62', status: 'Needs Focus', color: 'orange', tip: 'Consider reducing spicy foods to balance elevated Pitta.' },
                            { title: 'Mindfulness', score: '90', status: 'Superb', color: 'indigo', tip: 'Consistent meditation practice is showing great results.' },
                        ].map((item, idx) => (
                            <div key={idx} className={`bg-gradient-to-br from-${item.color}-50 to-white p-6 rounded-2xl border border-${item.color}-100 hover:shadow-md transition-shadow cursor-default`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className={`font-bold text-${item.color}-900`}>{item.title}</h3>
                                    <span className={`px-3 py-1 bg-white rounded-full text-xs font-bold text-${item.color}-600 shadow-sm`}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="flex items-end gap-2 mb-4">
                                    <span className={`text-4xl font-black text-${item.color}-600`}>{item.score}</span>
                                    <span className={`text-sm text-${item.color}-400 mb-1`}>/ 100</span>
                                </div>
                                <p className={`text-sm text-${item.color}-800 opacity-80`}>
                                    {item.tip}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}
