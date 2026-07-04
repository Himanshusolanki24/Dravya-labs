"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/navigation/app-sidebar";
import Topbar from "@/components/navigation/topbar";

export default function EncyclopediaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="h-screen flex w-full bg-gray-50 overflow-hidden">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0 h-full">
                    <Topbar />
                    <SidebarInset className="flex-1 relative overflow-hidden border-0">
                        <main className="h-full overflow-auto">
                            {children}
                        </main>
                    </SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    );
}
