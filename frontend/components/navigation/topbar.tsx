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
        <header className="h-14 shrink-0 bg-transparent flex items-center justify-between z-40 relative pb-2">
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle */}
                <SidebarTrigger className="text-white/70 hover:text-white" />

                {/* Search Bar - Left Aligned */}
                {showSearch && (
                    <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
                        <Search className="size-4 text-gray-400" />
                        <input
                            type="text"
                            className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium text-gray-800 w-[200px] lg:w-[280px] placeholder:text-gray-400 p-0 ml-3 h-auto leading-none"
                            placeholder='Try searching "insights"'
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* Find Doctor Icon */}
                <Link
                    href="/doctor"
                    className="flex items-center justify-center size-10 rounded-full bg-white shadow-sm hover:shadow-md transition-all active:scale-95"
                    title="Find Doctor"
                >
                    <div className="size-[28px] rounded-full bg-gradient-to-tr from-emerald-300 to-teal-400 flex items-center justify-center shadow-inner">
                        <Stethoscope className="size-4 text-emerald-950" />
                    </div>
                </Link>

                {/* New Chat Circular Button */}
                {showNewChat && (
                    <Link
                        href="/chat"
                        className="flex items-center justify-center size-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:shadow-[0_0_18px_rgba(16,185,129,0.6)] transition-all active:scale-95"
                        title="New Chat"
                    >
                        <Plus className="size-5" />
                    </Link>
                )}
            </div>
        </header>
    );
}
