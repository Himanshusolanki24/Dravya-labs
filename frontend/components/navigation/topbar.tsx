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
        <header className="h-14 shrink-0 bg-[#16826B] flex items-center justify-between z-40 relative px-4 border-b border-[#106954]">
            <div className="flex items-center gap-4">

                {/* Search Bar - Left Aligned */}
                {showSearch && (
                    <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
                        <Search className="size-4 text-gray-500" />
                        <input
                            type="text"
                            className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium text-gray-900 w-[200px] lg:w-[280px] placeholder:text-gray-500 p-0 ml-3 h-auto leading-none"
                            placeholder='Try searching "insights"'
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* Find Doctor Icon */}
                <Link
                    href="/doctor"
                    className="flex items-center justify-center size-9 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
                    title="Find Doctor"
                >
                    <Stethoscope className="size-4" />
                </Link>

                {/* New Chat Circular Button */}
                {showNewChat && (
                    <Link
                        href="/chat"
                        className="flex items-center justify-center size-9 rounded-full bg-white hover:bg-gray-50 text-[#16826B] shadow-sm transition-all active:scale-95"
                        title="New Chat"
                    >
                        <Plus className="size-5 text-[#16826B]" />
                    </Link>
                )}
            </div>
        </header>
    );
}
