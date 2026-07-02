'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Clock, Search, Filter, Trash2, MessageSquare,
    ChevronRight, Calendar, X
} from 'lucide-react';

// Hardcoded current user
const currentUser = {
    id: "user-001",
    email: "student@dravyalabs.com",
    name: "Demo Student"
};

// Hardcoded consultation history data
const consultationsData = [
    {
        id: 1,
        userId: "user-001",
        title: "Digestive Issues Consultation",
        date: "2026-01-28T10:30:00",
        timeAgo: "2 days ago",
        description: "Discussed bloating and irregular digestion patterns. Recommended Triphala and dietary modifications.",
        symptoms: ["Bloating", "gas", "irregular bowel movements"],
        severity: "moderate",
        dosha: "Vata"
    },
    {
        id: 2,
        userId: "user-001",
        title: "Sleep & Stress Management",
        date: "2026-01-25T14:00:00",
        timeAgo: "5 days ago",
        description: "Addressed insomnia and anxiety symptoms. Suggested Ashwagandha and evening relaxation routine.",
        symptoms: ["Insomnia", "anxiety", "restlessness"],
        severity: "moderate",
        dosha: "Vata-pitta"
    },
    {
        id: 3,
        userId: "user-001",
        title: "Skin & Hair Health",
        date: "2026-01-23T11:00:00",
        timeAgo: "1 week ago",
        description: "Consulted about dry skin and hair fall. Recommended Brahmi oil and hydrating herbs.",
        symptoms: ["Dry skin", "hair fall", "brittle nails"],
        severity: "mild",
        dosha: "Vata"
    },
    {
        id: 4,
        userId: "user-001",
        title: "Joint Pain & Inflammation",
        date: "2026-01-16T09:00:00",
        timeAgo: "2 weeks ago",
        description: "Discussed chronic joint stiffness. Suggested Guggulu and anti-inflammatory diet.",
        symptoms: ["Joint pain", "morning stiffness", "swelling"],
        severity: "moderate",
        dosha: "Vata-kapha"
    },
    {
        id: 5,
        userId: "user-001",
        title: "Energy & Fatigue Issues",
        date: "2026-01-09T15:30:00",
        timeAgo: "3 weeks ago",
        description: "Addressed chronic fatigue and low energy. Recommended Shilajit and lifestyle changes.",
        symptoms: ["Fatigue", "low energy", "brain fog"],
        severity: "mild",
        dosha: "Kapha"
    }
];

// Severity badge colors
const severityColors: Record<string, { bg: string; text: string }> = {
    mild: { bg: 'bg-green-100', text: 'text-green-700' },
    moderate: { bg: 'bg-orange-100', text: 'text-orange-700' },
    severe: { bg: 'bg-red-100', text: 'text-red-700' }
};

// Dosha badge colors
const doshaColors: Record<string, { bg: string; text: string }> = {
    'Vata': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Pitta': { bg: 'bg-amber-100', text: 'text-amber-700' },
    'Kapha': { bg: 'bg-teal-100', text: 'text-teal-700' },
    'Vata-pitta': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'Vata-kapha': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    'Pitta-kapha': { bg: 'bg-orange-100', text: 'text-orange-700' }
};

export default function HistoryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Filter consultations based on search
    const filteredConsultations = useMemo(() => {
        const userConsultations = consultationsData.filter(c => c.userId === currentUser.id);

        if (!searchQuery.trim()) return userConsultations;

        const query = searchQuery.toLowerCase();
        return userConsultations.filter(c =>
            c.title.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query) ||
            c.symptoms.some(s => s.toLowerCase().includes(query)) ||
            c.dosha.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    // Group consultations by time period
    const groupedConsultations = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const thisWeek = filteredConsultations.filter(c => new Date(c.date) >= oneWeekAgo);
        const thisMonth = filteredConsultations.filter(c => {
            const date = new Date(c.date);
            return date < oneWeekAgo && date >= oneMonthAgo;
        });
        const older = filteredConsultations.filter(c => new Date(c.date) < oneMonthAgo);

        return { thisWeek, thisMonth, older };
    }, [filteredConsultations]);

    // Stats
    const totalSessions = consultationsData.filter(c => c.userId === currentUser.id).length;
    const thisWeekCount = groupedConsultations.thisWeek.length;

    const clearSearch = () => setSearchQuery('');

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-amber-50/30 via-green-50/20 to-teal-50/30">
            {/* Header */}
            <div className="px-6 py-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Clock className="size-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold">Consultation History</h1>
                                <p className="text-emerald-100 text-sm mt-1">
                                    View and manage your past Ayurvedic health consultations
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden sm:flex gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-center min-w-[100px]">
                                <p className="text-3xl font-bold">{totalSessions}</p>
                                <p className="text-xs text-emerald-100">Total Sessions</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-center min-w-[100px]">
                                <p className="text-3xl font-bold">{thisWeekCount}</p>
                                <p className="text-xs text-emerald-100">This Week</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search consultations..."
                                className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter Buttons */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <Filter className="size-4" />
                            <span>Filters</span>
                        </button>

                        <button
                            onClick={clearSearch}
                            className="flex items-center gap-2 px-4 py-3 text-red-500 hover:text-red-600 transition-colors"
                        >
                            <Trash2 className="size-4" />
                            <span>Clear All</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    {filteredConsultations.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                            <div className="size-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                                <Search className="size-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No consultations found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                {searchQuery
                                    ? `No consultations match "${searchQuery}". Try a different search term.`
                                    : "You haven't had any consultations yet. Start a chat to begin!"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* This Week Section */}
                            {groupedConsultations.thisWeek.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar className="size-5 text-gray-500" />
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            This Week <span className="text-gray-400 font-normal">({groupedConsultations.thisWeek.length})</span>
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {groupedConsultations.thisWeek.map((consultation) => (
                                            <ConsultationCard key={consultation.id} consultation={consultation} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* This Month Section */}
                            {groupedConsultations.thisMonth.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar className="size-5 text-gray-500" />
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            This Month <span className="text-gray-400 font-normal">({groupedConsultations.thisMonth.length})</span>
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupedConsultations.thisMonth.map((consultation) => (
                                            <ConsultationCard key={consultation.id} consultation={consultation} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Older Section */}
                            {groupedConsultations.older.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar className="size-5 text-gray-500" />
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            Older <span className="text-gray-400 font-normal">({groupedConsultations.older.length})</span>
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupedConsultations.older.map((consultation) => (
                                            <ConsultationCard key={consultation.id} consultation={consultation} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Consultation Card Component
function ConsultationCard({ consultation }: { consultation: typeof consultationsData[0] }) {
    const severityStyle = severityColors[consultation.severity] || severityColors.mild;
    const doshaStyle = doshaColors[consultation.dosha] || doshaColors.Vata;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.01] transition-all duration-200 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                        <MessageSquare className="size-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                            {consultation.title}
                        </h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="size-3" />
                            {consultation.timeAgo}
                        </p>
                    </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 className="size-4" />
                </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {consultation.description}
            </p>

            {/* Symptoms */}
            <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Symptoms:</p>
                <p className="text-sm text-gray-700">
                    {consultation.symptoms.join(', ')}
                </p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityStyle.bg} ${severityStyle.text}`}>
                    ◉ {consultation.severity.charAt(0).toUpperCase() + consultation.severity.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${doshaStyle.bg} ${doshaStyle.text}`}>
                    ✦ {consultation.dosha}
                </span>
            </div>

            {/* View Link */}
            <Link
                href={`/chat`}
                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
                View Full Consultation
                <ChevronRight className="size-4" />
            </Link>
        </div>
    );
}
