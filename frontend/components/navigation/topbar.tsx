'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Stethoscope, Plus } from 'lucide-react';

interface TopbarProps {
    showSearch?: boolean;
    showNewChat?: boolean;
}

export default function Topbar({
    showSearch = true,
    showNewChat = true
}: TopbarProps) {
    return (
        <header className="h-14 shrink-0 bg-gradient-to-r from-[#f0fdf4] to-[#f0f9ff] flex items-center justify-between z-40 relative px-4 border-b border-slate-200/80 shadow-sm text-slate-800">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="size-9 text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 transition-all rounded-lg" />

                {/* Search Bar - Left Aligned */}
                {showSearch && (
                    <div className="hidden md:flex items-center bg-white/80 border border-slate-200 hover:border-emerald-500/30 focus-within:border-emerald-500/40 focus-within:bg-white rounded-full px-4 py-1.5 transition-all duration-300 shadow-sm group">
                        <Search className="size-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                            type="text"
                            className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium text-slate-800 w-[200px] lg:w-[280px] placeholder:text-slate-400 p-0 ml-3 h-auto leading-none"
                            placeholder='Try searching "insights"'
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* Find Doctor Icon */}
                <Link
                    href="/doctor"
                    className="flex items-center justify-center size-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-emerald-600 shadow-sm transition-all active:scale-95"
                    title="Find Doctor"
                >
                    <Stethoscope className="size-4" />
                </Link>

                {/* New Chat Circular Button */}
                {showNewChat && (
                    <Link
                        href="/chat"
                        className="flex items-center justify-center size-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                        title="New Chat"
                    >
                        <Plus className="size-5" />
                    </Link>
                )}
            </div>
        </header>
    );
}
