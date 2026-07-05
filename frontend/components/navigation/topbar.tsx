'use client';

import React from 'react';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Stethoscope, Plus, Sun, Bell } from 'lucide-react';

interface TopbarProps {
    showSearch?: boolean;
    showNewChat?: boolean;
}

export default function Topbar({
    showSearch = true,
    showNewChat = true
}: TopbarProps) {
    return (
        <header className="h-16 shrink-0 bg-transparent flex items-center justify-between z-40 relative px-4 lg:px-8 text-slate-800">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="size-10 bg-[#F4F9F4] text-[#267F37] hover:text-[#1e662c] hover:bg-[#E8F0E5] transition-all rounded-full border-none shadow-none flex items-center justify-center [&>svg]:size-5" />

                {/* Search Bar - Left Aligned */}
                {showSearch && (
                    <div className="hidden md:flex items-center bg-white border border-slate-200 hover:border-[#267F37]/30 focus-within:border-[#267F37]/50 rounded-full px-5 py-2.5 transition-all duration-300 w-[350px] lg:w-[450px]">
                        <Search className="size-4.5 text-[#267F37] shrink-0" />
                        <input
                            type="text"
                            className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium text-slate-700 w-full placeholder:text-slate-500 p-0 ml-3 h-auto leading-none"
                            placeholder="Search insights, herbs, remedies..."
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">


                {/* Bell Icon */}
                <button
                    className="flex items-center justify-center size-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95 relative"
                    title="Notifications"
                >
                    <Bell className="size-4.5" />
                    <span className="absolute top-2.5 right-2.5 size-2 bg-[#267F37] rounded-full border border-white"></span>
                </button>

                {/* Find Doctor Icon */}
                <Link
                    href="/doctor"
                    className="flex items-center justify-center size-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                    title="Find Doctor"
                >
                    <Stethoscope className="size-4.5" />
                </Link>

                {/* New Chat Circular Button */}
                {showNewChat && (
                    <Link
                        href="/chat"
                        className="flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-[#267F37] to-teal-600 text-white hover:opacity-90 transition-all active:scale-95 shadow-sm"
                        title="New Chat"
                    >
                        <Plus className="size-5" />
                    </Link>
                )}
            </div>
        </header>
    );
}
