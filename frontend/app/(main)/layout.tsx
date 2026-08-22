"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/navigation/app-sidebar";
import Topbar from "@/components/navigation/topbar";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
            router.replace(`/auth/login${next}`);
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="size-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="h-screen flex w-full bg-gray-50 overflow-hidden">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-300 ease-in-out">
                    <Topbar />
                    <SidebarInset className="flex-1 relative overflow-hidden border-0">
                        <main className="h-full overflow-auto hide-scrollbar bg-[#F8FAFC]">
                            {children}
                        </main>
                    </SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    );
}
