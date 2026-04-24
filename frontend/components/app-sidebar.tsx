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
    { icon: BookOpen, label: 'Encyclopedia', href: '/ensyclopedia' },
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
    return (
        <Sidebar collapsible="icon" className="border-r border-[var(--chat-border)]">
            {/* Logo Header */}
            <SidebarHeader className="h-16 flex items-center justify-center border-b border-[var(--chat-border)]">
                <Link href="/" className="flex items-center gap-3">
                    <div className="size-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        <Image
                            src="/logo.png"
                            alt="Dravya Labs"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                    <span className="font-bold text-lg text-[var(--chat-text-primary)] group-data-[collapsible=icon]:hidden">
                        Dravya Labs
                    </span>
                </Link>
            </SidebarHeader>

            {/* Main Navigation */}
            <SidebarContent className="pt-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-gray-400 uppercase tracking-wider">
                        Main Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <React.Fragment key={item.label}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.label}
                                            className="text-gray-600 hover:bg-[var(--chat-primary)]/10 hover:text-[var(--chat-primary-dark)]"
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="size-5" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    {/* Chat History dropdown right after Chat item */}
                                    {item.label === 'Chat' && (
                                        <ChatHistorySection />
                                    )}
                                </React.Fragment>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-gray-400 uppercase tracking-wider">
                        Settings
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {secondaryNavItems.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.label}
                                        className="text-gray-500 hover:bg-[var(--chat-bg-light)] hover:text-[var(--chat-text-primary)]"
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="size-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer with Support */}
            <SidebarFooter className="border-t border-[var(--chat-border)]">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Support"
                            className="text-gray-500 hover:bg-[var(--chat-bg-light)] hover:text-[var(--chat-text-primary)]"
                        >
                            <Link href="/support">
                                <HelpCircle className="size-5" />
                                <span>Support</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
