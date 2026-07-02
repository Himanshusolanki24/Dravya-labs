'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, MessageSquarePlus, User, Stethoscope } from 'lucide-react';

interface TopbarProps {
    showSearch?: boolean;
    showNewChat?: boolean;
}

export default function Topbar({
    showSearch = true,
    showNewChat = true
}: TopbarProps) {
    return (
        <header className="h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-[var(--chat-border)] flex items-center justify-between px-4 lg:px-6 z-40 relative shadow-sm">
            <div className="flex items-center gap-3">
                {/* Sidebar Toggle - works on all screen sizes */}
                <SidebarTrigger className="text-gray-500 hover:text-gray-900" />

                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/Full logo.png"
                        alt="Dravya Labs"
                        width={140}
                        height={40}
                        className="h-8 w-auto object-contain"
                        priority
                    />
                </Link>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                {/* Search Bar */}
                {showSearch && (
                    <div className="hidden md:flex items-center bg-[var(--chat-bg-light)] rounded-lg px-3 py-1.5 border border-[var(--chat-border)] focus-within:border-[var(--chat-primary)]/50 focus-within:ring-2 focus-within:ring-[var(--chat-primary)]/20 transition-all">
                        <Search className="size-4 text-gray-400" />
                        <input
                            type="text"
                            className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs font-medium text-gray-700 w-32 lg:w-48 placeholder:text-gray-400 p-0 ml-2 h-auto leading-none"
                            placeholder="Search..."
                        />
                    </div>
                )}

                {/* Find Doctor Button */}
                <Link
                    href="/doctor"
                    className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all text-blue-700 text-xs font-bold shadow-sm hover:shadow-md active:scale-95"
                >
                    <Stethoscope className="size-4" />
                    <span className="hidden sm:inline">Find Doctor</span>
                </Link>

                {/* New Chat Button */}
                {showNewChat && (
                    <Link
                        href="/chat"
                        className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-[var(--chat-primary)] hover:bg-[var(--chat-primary-dark)] transition-all text-[var(--chat-text-primary)] text-xs font-bold shadow-sm hover:shadow-md active:scale-95"
                    >
                        <MessageSquarePlus className="size-4" />
                        <span className="hidden sm:inline">New Chat</span>
                    </Link>
                )}

                {/* Divider */}
                <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                {/* User Avatar */}
                <Link
                    href="/profile"
                    className="size-9 rounded-full bg-gradient-to-tr from-[var(--chat-primary)] to-[var(--chat-accent-emerald)] p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-sm"
                >
                    <div className="size-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <User className="size-5 text-gray-600" />
                    </div>
                </Link>
            </div>
        </header>
    );
}
