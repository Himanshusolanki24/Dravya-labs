"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/navigation/app-sidebar";
import Topbar from "@/components/navigation/topbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="bg-[#16826B] text-[var(--chat-text-primary)] overflow-hidden h-screen flex w-full relative selection:bg-[var(--chat-primary)] selection:text-black pt-2 pr-4 pb-4 pl-0">
                <AppSidebar />
                <div className="flex-1 flex flex-col h-full min-w-0">
                    <Topbar />
                    <SidebarInset className="flex-1 relative transition-all duration-300 bg-white rounded-[2rem] overflow-hidden shadow-2xl border-0">
                        <main className="h-full overflow-auto hide-scrollbar">
                            {children}
                        </main>
                    </SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    );
}
