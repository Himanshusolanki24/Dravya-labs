'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Settings, BookOpen, MessageCircle,
    HelpCircle, Clock, User, MessageSquare, ChevronDown,
    Plus, Trash2, Pill
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
} from '@/components/ui/sidebar';
import { aiService, ChatSession } from '@/lib/ai-service';
import { useUser } from '@/context/UserContext';

interface NavItem {
    icon: React.ElementType;
    label: string;
    href: string;
}

const mainNavItems: NavItem[] = [
    { icon: MessageCircle, label: 'Chat', href: '/chat' },
    { icon: BookOpen, label: 'Encyclopedia', href: '/encyclopedia' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Clock, label: 'History', href: '/history' },
    { icon: Pill, label: 'Treatment', href: '/treatment' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: MessageSquare, label: 'Feedback', href: '/feedback' },
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
        <div className="mt-0.5 group-data-[collapsible=icon]:hidden">
            {/* Toggle button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-1.5">
                    <ChevronDown
                        className={`size-3 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
                    />
                    <span className="uppercase tracking-wider font-medium">Chat History</span>
                </div>
                <button
                    onClick={handleNewChat}
                    className="p-1 rounded-md hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                    title="New Chat"
                >
                    <Plus className="size-3.5" />
                </button>
            </div>

            {/* Dropdown content */}
            {isOpen && (
                <div className="mx-2 mb-2 max-h-52 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50">
                    {isLoading ? (
                        <div className="p-3 text-center">
                            <div className="flex justify-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-400">
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
                                        className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-emerald-50 transition-colors group/item cursor-pointer"
                                    >
                                        <MessageCircle className="size-3.5 mt-0.5 text-gray-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-700 truncate">
                                                {session.title}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {formatDate(session.updated_at)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteSession(e, session.session_id)}
                                            className="p-0.5 rounded opacity-0 group-hover/item:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="size-3" />
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

// ─── Main Sidebar ───────────────────────────────────────────

export default function AppSidebar() {
    const pathname = usePathname();
    const { user } = useUser();

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                /* Override shadcn sidebar inner background */
                [data-sidebar="sidebar"] {
                    background-color: #1A3B28 !important;
                    border-right: none !important;
                }
                .dravya-sidebar-active {
                    background-color: #F1F5F0;
                    color: #267F37 !important;
                    position: relative;
                    border-top-left-radius: 24px;
                    border-bottom-left-radius: 24px;
                    border-top-right-radius: 0;
                    border-bottom-right-radius: 0;
                    font-weight: 700;
                }
                .dravya-sidebar-active::before {
                    content: '';
                    position: absolute;
                    top: -24px;
                    right: 0;
                    width: 24px;
                    height: 24px;
                    background-color: transparent;
                    border-bottom-right-radius: 24px;
                    box-shadow: 10px 10px 0 0 #F1F5F0;
                    pointer-events: none;
                }
                .dravya-sidebar-active::after {
                    content: '';
                    position: absolute;
                    bottom: -24px;
                    right: 0;
                    width: 24px;
                    height: 24px;
                    background-color: transparent;
                    border-top-right-radius: 24px;
                    box-shadow: 10px -10px 0 0 #F1F5F0;
                    pointer-events: none;
                }
            `}} />
            <Sidebar collapsible="icon" className="border-none">
                {/* Profile/User Header */}
                <SidebarHeader className="h-24 flex items-center justify-center pt-6 pb-4 border-b border-white/10">
                    {user ? (
                        <div className="flex items-center gap-3 w-full px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.fullName || 'User'}
                                    className="size-10 rounded-full object-cover border border-white/20 shrink-0"
                                />
                            ) : (
                                <div className="size-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white font-bold shrink-0">
                                    {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                                <span className="text-sm font-semibold text-white truncate">
                                    {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                                </span>
                                <span className="text-xs text-white/60 truncate">
                                    {user.email}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 w-full px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                            <div className="size-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white font-bold shrink-0">
                                G
                            </div>
                            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                                <span className="text-sm font-semibold text-white truncate">
                                    Guest User
                                </span>
                            </div>
                        </div>
                    )}
                </SidebarHeader>

                {/* Main Navigation */}
                <SidebarContent className="pt-8 px-0">
                    <SidebarGroup className="px-0">
                        <SidebarGroupContent className="px-0">
                            <SidebarMenu className="gap-2 px-0">
                                {mainNavItems.map((item, index) => {
                                    const isActive = pathname.startsWith(item.href);
                                    
                                    // Dummy notification badges based on image
                                    let badge = null;
                                    if (item.label === 'Chat') badge = '1';
                                    if (item.label === 'History') badge = '3';
                                    
                                    return (
                                        <React.Fragment key={item.label}>
                                            <SidebarMenuItem className="px-0 pl-4">
                                                <SidebarMenuButton
                                                    asChild
                                                    tooltip={item.label}
                                                    className={`transition-all duration-300 py-6 pr-4 ${
                                                        isActive 
                                                            ? 'dravya-sidebar-active w-[calc(100%+4px)]' 
                                                            : 'text-white/70 hover:text-white hover:bg-white/5 rounded-xl mr-4'
                                                    }`}
                                                >
                                                    <Link href={item.href} className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-4">
                                                            <item.icon className={`size-5 shrink-0 ${isActive ? 'text-[#267F37]' : 'text-white/70'}`} />
                                                            <span className="text-[15px]">{item.label}</span>
                                                        </div>
                                                        {badge && (
                                                            <span className={`flex items-center justify-center size-6 rounded-full text-xs font-bold ${isActive ? 'bg-[#267F37] text-white' : 'bg-white/10 text-white/90'}`}>
                                                                {badge}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        </React.Fragment>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* Footer with Bird/Illustration and Button */}
                <SidebarFooter className="p-4 pb-8 relative overflow-hidden mt-auto">
                    {/* Abstract overlapping circles as bird placeholder (Dravya labs theme) */}
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-tr from-green-400 to-[#267F37] rounded-full blur-2xl opacity-40 group-data-[collapsible=icon]:hidden pointer-events-none"></div>
                    <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-gradient-to-tr from-yellow-300 to-green-500 rounded-full blur-xl opacity-30 group-data-[collapsible=icon]:hidden pointer-events-none"></div>
                    
                    <div className="relative z-10 w-full group-data-[collapsible=icon]:hidden flex justify-center py-4">
                        <span className="text-xl font-bold text-white tracking-wide shadow-sm">Dravya Labs</span>
                    </div>
                    
                    {/* Collapsed state mini placeholder */}
                    <div className="hidden group-data-[collapsible=icon]:flex relative z-10 w-full justify-center py-4">
                        <div className="size-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">DL</span>
                        </div>
                    </div>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>
        </>
    );
}
