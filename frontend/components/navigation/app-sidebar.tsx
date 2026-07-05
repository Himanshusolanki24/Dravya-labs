'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import {
    LayoutGrid, Settings, BookOpen, MessageSquare,
    HelpCircle, Clock, User, FileText, ChevronDown,
    Plus, Trash2, FlaskConical, LogOut, PanelLeft
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar
} from '@/components/ui/sidebar';
import { aiService, ChatSession } from '@/lib/ai-service';
import { useUser } from '@/context/UserContext';

interface NavItem {
    icon: React.ElementType;
    label: string;
    href: string;
}

const mainNavItems: NavItem[] = [
    { icon: MessageSquare, label: 'Chat', href: '/chat' },
    { icon: BookOpen, label: 'Encyclopedia', href: '/encyclopedia' },
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
    { icon: Clock, label: 'History', href: '/history' },
    { icon: FlaskConical, label: 'Treatment', href: '/treatment' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: FileText, label: 'Feedback', href: '/feedback' },
];

const secondaryNavItems: NavItem[] = [
    { icon: Settings, label: 'Settings', href: '/settings' },
];

// ─── Chat History Dropdown ──────────────────────────────────

function ChatHistorySection() {
    const [isOpen, setIsOpen] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    const fetchSessions = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const data = await aiService.getChatSessions(user.id);
            setSessions(data);
        } catch {
            // Silently fail
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Fetch sessions when dropdown opens
    useEffect(() => {
        if (isOpen) fetchSessions();
    }, [isOpen, fetchSessions]);

    // Refresh when navigating to chat page
    useEffect(() => {
        if (pathname === '/chat') fetchSessions();
    }, [pathname, fetchSessions]);

    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        try {
            await aiService.deleteChatSession(sessionId);
            setSessions(prev => prev.filter(s => s.session_id !== sessionId));
        } catch {
            // Silently fail
        }
    };

    const handleSelectSession = (sessionId: string) => {
        router.push(`/chat?session=${sessionId}`);
    };

    const handleNewChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push('/chat?new=true');
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - d.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays < 7) return `${diffDays}d ago`;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    return (
        <div className="group-data-[collapsible=icon]:hidden">
            {/* Toggle button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen); }}
                className="w-full flex items-center justify-between px-3 h-10 text-[14px] font-medium text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 transition-colors cursor-pointer rounded-xl"
            >
                <div className="flex items-center">
                    <Clock className="size-[18px] mr-3 text-slate-500" strokeWidth={2} />
                    <span>Chat History</span>
                </div>
                <button
                    onClick={handleNewChat}
                    className="p-1.5 rounded-full hover:bg-slate-200 transition-colors"
                    title="New Chat"
                >
                    <Plus className="size-4 text-slate-500" strokeWidth={2} />
                </button>
            </div>

            {/* Dropdown content */}
            {isOpen && (
                <div className="mx-2 mb-2 max-h-52 overflow-y-auto rounded-xl border border-slate-200/60 bg-slate-50/50 backdrop-blur-md hide-scrollbar shadow-inner">
                    {isLoading ? (
                        <div className="p-3 text-center">
                            <div className="flex justify-center gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                            No chat history yet
                        </div>
                    ) : (
                        <ul className="py-1">
                            {sessions.map((session) => (
                                <li key={session.session_id}>
                                        <div
                                        onClick={() => handleSelectSession(session.session_id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectSession(session.session_id); }}
                                        className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-emerald-50 hover:text-emerald-700 transition-all group/item cursor-pointer"
                                    >
                                        <MessageSquare className="size-3.5 mt-0.5 text-slate-400 shrink-0 group-hover/item:text-emerald-600" strokeWidth={2} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-700 truncate">
                                                {session.title}
                                            </p>
                                            <p className="text-[9px] text-slate-400">
                                                {formatDate(session.updated_at)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteSession(e, session.session_id)}
                                            className="p-0.5 rounded opacity-0 group-hover/item:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all text-slate-400"
                                            title="Delete"
                                        >
                                            <Trash2 className="size-3.5" strokeWidth={2} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── User Profile Widget ────────────────────────────────────

function UserProfileWidget() {
    const { user, isLoading, logout } = useAuthStore();
    const router = useRouter();

    const handleSignOut = async () => {
        await logout();
        router.push('/auth/login');
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-3 px-3 py-2 mx-3 mb-3 rounded-xl bg-slate-50/50 border border-slate-200/60 animate-pulse group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:mx-1">
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                <div className="flex flex-col gap-2 w-full group-data-[collapsible=icon]:hidden">
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-2 bg-slate-200 rounded w-1/2" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-between px-3 py-2 mx-3 mb-3 mt-2 rounded-xl bg-slate-50/50 border border-slate-200/60 group group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:mx-1 transition-all duration-300 hover:border-slate-200">
                <div className="flex items-center gap-3 min-w-0 group-data-[collapsible=icon]:gap-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0">
                        ?
                    </div>
                    <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium text-slate-700 truncate">Guest</span>
                        <span className="text-[10px] text-slate-400 truncate">Not logged in</span>
                    </div>
                </div>
                <button 
                    onClick={() => router.push('/auth/login')}
                    className="px-2 py-1 rounded text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 transition-all shrink-0 group-data-[collapsible=icon]:hidden active:scale-95"
                >
                    Log In
                </button>
            </div>
        );
    }

    const name = user.fullName || user.email?.split('@')[0] || 'User';
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="flex items-center justify-between px-3 py-2 mx-3 mb-3 mt-1 rounded-[20px] bg-white border border-slate-200 group group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:mx-1 transition-all duration-300 hover:shadow-sm cursor-pointer" onClick={handleSignOut} title="Click to Sign Out">
            <div className="flex items-center gap-3 min-w-0 group-data-[collapsible=icon]:gap-0">
                <div className="size-9 rounded-full bg-[#051F14] flex items-center justify-center text-white font-medium text-[15px] shrink-0">
                    {initial}
                </div>
                <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium text-slate-800 truncate">{name}</span>
                    <span className="text-[11px] text-slate-500 truncate">{user.email}</span>
                </div>
            </div>
            <div className="shrink-0 group-data-[collapsible=icon]:hidden pr-1 text-slate-600 group-hover:text-red-500 transition-colors">
                <ChevronDown className="size-4" strokeWidth={2.5} />
            </div>
        </div>
    );
}

// ─── Main Sidebar ───────────────────────────────────────────

export default function AppSidebar() {
    const pathname = usePathname();
    const { toggleSidebar } = useSidebar();
    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Sidebar 
            collapsible="icon" 
            className="border-r border-slate-200/80 [&_[data-sidebar=sidebar]]:!bg-[#FAFAFA] [&_[data-sidebar=sidebar]]:border-r [&_[data-sidebar=sidebar]]:border-slate-200/80 text-slate-900" 
        >
            {/* Logo Header */}
            <SidebarHeader className="h-20 flex items-center justify-start pt-6 pb-2 px-6">
                <button onClick={toggleSidebar} className="relative group flex items-center gap-3 w-full cursor-pointer focus:outline-none group-data-[collapsible=icon]:justify-center">
                    {/* Collapsed Logo (Icon only) */}
                    <div className="size-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden hidden group-data-[collapsible=icon]:flex mx-auto relative">
                        <Image
                            src="/logo.png"
                            alt="Dravya Labs"
                            width={40}
                            height={40}
                            className="object-contain transition-opacity duration-300 group-hover:opacity-0"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <PanelLeft className="size-5 text-slate-600" strokeWidth={1.5} />
                        </div>
                    </div>
                    {/* Expanded Full Logo */}
                    <div className="flex items-center shrink-0 overflow-hidden group-data-[collapsible=icon]:hidden relative transition-colors">
                        <Image
                            src="/Full logo.png"
                            alt="Dravya Labs"
                            width={160}
                            height={48}
                            className="object-contain h-10 w-auto transition-opacity duration-300 group-hover:opacity-20"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <PanelLeft className="size-6 text-slate-600" strokeWidth={1.5} />
                        </div>
                    </div>
                </button>
            </SidebarHeader>

            {/* Main Navigation */}
            <SidebarContent className="px-3 pt-2 [&::-webkit-scrollbar]:hidden scrollbar-none flex flex-col gap-0.5">
                <SidebarGroup className="pt-0">
                    <SidebarGroupLabel className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1 px-3 group-data-[collapsible=icon]:hidden">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {mainNavItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                <React.Fragment key={item.label}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.label}
                                            className={`transition-all duration-200 h-10 rounded-xl px-3 flex items-center ${active ? 'bg-[#E8F0E5] text-[#267F37] font-semibold' : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 font-medium'}`}
                                        >
                                            <Link href={item.href} className="flex items-center w-full">
                                                <item.icon className={`size-[18px] mr-3 transition-colors ${active ? 'text-[#267F37]' : 'text-slate-500 group-hover:text-slate-600'}`} strokeWidth={2} />
                                                <span className="group-data-[collapsible=icon]:hidden text-[14px]">{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    {/* Chat History dropdown right after Chat item */}
                                    {item.label === 'Chat' && (
                                        <ChatHistorySection />
                                    )}
                                </React.Fragment>
                            )})}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="pt-2">
                    <SidebarGroupLabel className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1 px-3 group-data-[collapsible=icon]:hidden">
                        Settings
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {secondaryNavItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.label}
                                        className={`transition-all duration-200 h-10 rounded-xl px-3 flex items-center ${active ? 'bg-[#E8F0E5] text-[#267F37] font-semibold' : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 font-medium'}`}
                                    >
                                        <Link href={item.href} className="flex items-center w-full">
                                            <item.icon className={`size-[18px] mr-3 transition-colors ${active ? 'text-[#267F37]' : 'text-slate-500 group-hover:text-slate-600'}`} strokeWidth={2} />
                                            <span className="group-data-[collapsible=icon]:hidden text-[14px]">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )})}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer with Profile */}
            <SidebarFooter className="border-none pb-2 px-0 group-data-[collapsible=icon]:px-0">
                <UserProfileWidget />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
