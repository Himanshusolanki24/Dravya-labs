'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import anime from 'animejs';
import { HeroHeader } from '@/components/dashboard/hero-header';
import { HealthOverview } from '@/components/dashboard/health-overview';
import { HealthAlerts } from '@/components/dashboard/health-alerts';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { DailyWellnessTip } from '@/components/dashboard/daily-wellness-tip';
import { YourPrakriti } from '@/components/dashboard/your-prakriti';
import { HerbalWisdom } from '@/components/dashboard/herbal-wisdom';

export default function DashboardPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // GSAP Animation for Hero Header (Fade in and scale up)
        gsap.fromTo(
            '.dashboard-hero',
            { opacity: 0, scale: 0.95, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );

        // Anime.js Animation for all dashboard cards (Staggered slide up)
        anime({
            targets: '.dashboard-card',
            translateY: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(100, { start: 200 }),
            duration: 800,
            easing: 'easeOutQuart'
        });

    }, []);

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] pb-12 font-sans" ref={containerRef}>
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 @container">
                
                {/* 1. Hero Header Card */}
                <div className="dashboard-hero opacity-0">
                    <HeroHeader />
                </div>

                {/* Main Content Grid — uses container queries for sidebar-aware responsiveness */}
                <div className="grid grid-cols-1 @[700px]:grid-cols-3 gap-6">
                    
                    {/* Left Column (2/3) */}
                    <div className="@[700px]:col-span-2 flex flex-col gap-6">
                        {/* Health Overview */}
                        <div className="dashboard-card opacity-0"><HealthOverview /></div>

                        {/* Health Alerts */}
                        <div className="dashboard-card opacity-0"><HealthAlerts /></div>
                    </div>

                    {/* Right Column (1/3) */}
                    <div className="@[700px]:col-span-1 flex flex-col gap-6">
                        {/* Daily Wellness Tip */}
                        <div className="dashboard-card opacity-0"><DailyWellnessTip /></div>

                        {/* Your Prakriti */}
                        <div className="dashboard-card opacity-0"><YourPrakriti /></div>
                    </div>
                </div>

                {/* Bottom 3-column row — collapses gracefully with container queries */}
                <div className="grid grid-cols-1 @[600px]:grid-cols-2 @[900px]:grid-cols-3 gap-6">
                    <div className="h-full dashboard-card opacity-0">
                        <QuickActions />
                    </div>
                    <div className="h-full dashboard-card opacity-0">
                        <RecentActivity />
                    </div>
                    <div className="h-full dashboard-card opacity-0 @[600px]:col-span-2 @[900px]:col-span-1">
                        <HerbalWisdom />
                    </div>
                </div>
                
            </div>
        </div>
    );
}
