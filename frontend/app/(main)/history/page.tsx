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
            {/* Header Section */}
            <div className="bg-[#057A55] text-white py-8 px-6 lg:px-10 overflow-hidden relative shadow-lg rounded-b-3xl shrink-0">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
                
                <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-emerald-800/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
                            <Clock className="size-6 text-emerald-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                                Consultation History
                            </h1>
                            <p className="text-sm text-emerald-100/80 mt-0.5">
                                View and manage your past Ayurvedic health consultations
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4">
                        <div className="bg-emerald-800/30 border border-emerald-700/50 backdrop-blur-md rounded-2xl px-5 py-2 text-center min-w-[100px] shadow-sm">
                            <p className="text-2xl font-bold text-white">{totalSessions}</p>
                            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mt-0.5">Total Sessions</p>
                        </div>
                        <div className="bg-emerald-800/30 border border-emerald-700/50 backdrop-blur-md rounded-2xl px-5 py-2 text-center min-w-[100px] shadow-sm">
                            <p className="text-2xl font-bold text-white">{thisWeekCount}</p>
                            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mt-0.5">This Week</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="sticky top-0 z-40 pb-4 mt-6">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search consultations..."
                                className="w-full pl-12 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-emerald-500/20 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/10 transition-colors shadow-sm"
                            >
                                <Filter className="size-4" />
                                <span className="font-medium text-sm">Filters</span>
                            </button>

                            <button
                                onClick={clearSearch}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 text-red-500 hover:text-red-600 transition-colors bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-red-50"
                            >
                                <Trash2 className="size-4" />
                                <span className="font-medium text-sm">Clear</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 py-4">
                <div className="max-w-6xl mx-auto">
                    {filteredConsultations.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 text-center shadow-sm border border-white/50">
                            <div className="size-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                                <Search className="size-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">No consultations found</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
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
                                        <Calendar className="size-5 text-slate-500" />
                                        <h2 className="text-lg font-semibold text-slate-800">
                                            This Week <span className="text-slate-400 font-normal">({groupedConsultations.thisWeek.length})</span>
                                        </h2>
                                    </div>
                                    <div className="flex flex-col gap-3">
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
                                        <Calendar className="size-5 text-slate-500" />
                                        <h2 className="text-lg font-semibold text-slate-800">
                                            This Month <span className="text-slate-400 font-normal">({groupedConsultations.thisMonth.length})</span>
                                        </h2>
                                    </div>
                                    <div className="flex flex-col gap-3">
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
                                        <Calendar className="size-5 text-slate-500" />
                                        <h2 className="text-lg font-semibold text-slate-800">
                                            Older <span className="text-slate-400 font-normal">({groupedConsultations.older.length})</span>
                                        </h2>
                                    </div>
                                    <div className="flex flex-col gap-3">
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

function ConsultationCard({ consultation }: { consultation: typeof consultationsData[0] }) {
    const severityStyle = severityColors[consultation.severity] || severityColors.mild;
    const doshaStyle = doshaColors[consultation.dosha] || doshaColors.Vata;

    return (
        <div className="bg-white/80 rounded-3xl p-5 shadow-sm border border-white/60 hover:shadow-md hover:shadow-emerald-100/30 transition-all duration-200 group flex flex-col md:flex-row md:items-center gap-5 cursor-pointer hover:bg-white hover:scale-[1.005]">
            {/* Header / Icon */}
            <div className="flex items-start gap-4 md:w-1/4 shrink-0">
                <div className="size-12 rounded-2xl bg-emerald-100/50 flex items-center justify-center shrink-0">
                    <MessageSquare className="size-5 text-emerald-600" />
                </div>
                <div className="flex flex-col justify-center h-12">
                    <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight line-clamp-1">
                        {consultation.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                        <Clock className="size-3" />
                        {consultation.timeAgo}
                    </p>
                </div>
            </div>

            {/* Description & Symptoms */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-sm text-slate-600 mb-1.5 truncate">
                    {consultation.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                    <span className="font-medium text-slate-400">Symptoms:</span>
                    <span className="truncate">{consultation.symptoms.join(', ')}</span>
                </div>
            </div>

            {/* Badges & Actions */}
            <div className="flex items-center gap-3 shrink-0 md:justify-end mt-2 md:mt-0">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${severityStyle.bg} ${severityStyle.text}`}>
                    {consultation.severity}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${doshaStyle.bg} ${doshaStyle.text}`}>
                    {consultation.dosha}
                </span>
                
                <Link
                    href={`/chat`}
                    className="ml-2 size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                >
                    <ChevronRight className="size-5" />
                </Link>
            </div>
        </div>
    );
}
