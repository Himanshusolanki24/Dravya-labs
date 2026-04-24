"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import Topbar from "@/components/topbar";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider defaultOpen={false}>
            <div className="bg-[var(--chat-bg-light)] text-[var(--chat-text-primary)] overflow-hidden h-screen flex w-full relative selection:bg-[var(--chat-primary)] selection:text-black">
                <AppSidebar />
                <SidebarInset className="flex-1 flex flex-col h-full min-w-0 relative transition-all duration-300">
                    <Topbar />
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
