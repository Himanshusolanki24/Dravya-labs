'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Activity, Bookmark, MessageSquare, ArrowRight } from 'lucide-react';

export function HeroHeader() {
    return (
        <div className="bg-[#0A4730] text-white rounded-[24px] p-6 lg:p-8 shadow-md relative overflow-hidden @container">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/20 blur-[100px]"></div>
            </div>
            
            <div className="flex flex-col @[800px]:flex-row items-start @[800px]:items-stretch justify-between gap-6 @[800px]:gap-8">
                {/* Left: Stats — wraps gracefully at smaller container widths */}
                <div className="flex flex-row flex-wrap items-center gap-6 @[500px]:gap-8 w-full @[800px]:w-auto flex-1 relative z-10">
                    {/* Wellness Score */}
                    <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full rotate-[-90deg] absolute inset-0" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="#34D399" strokeWidth="6" strokeDasharray="283" strokeDashoffset="62" strokeLinecap="round" pathLength="100" />
                            </svg>
                            <span className="text-xl font-bold z-10">78%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-semibold tracking-wider text-emerald-200/80 uppercase mb-1">Wellness Score</span>
                            <span className="text-lg font-semibold mb-0.5 leading-tight">Good</span>
                            <span className="text-[13px] text-emerald-100/90 mb-2 leading-tight">Keep it up!</span>
                            <span className="inline-flex items-center text-[10px] font-bold bg-[#136645] text-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">↑ 8% vs last month</span>
                        </div>
                    </div>

                    <div className="hidden @[600px]:block w-px h-20 bg-white/10"></div>

                    {/* Active Imbalances */}
                    <div className="flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-2 mb-2 text-emerald-200/80 text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap">
                            <Activity className="w-3.5 h-3.5 shrink-0" />
                            <span>Active Imbalances</span>
                        </div>
                        <span className="text-2xl font-bold mb-2">2</span>
                        <div className="flex flex-col gap-0.5 text-[13px] text-emerald-100/90 whitespace-nowrap">
                            <span>Pitta (Moderate)</span>
                            <span>Vata (Mild)</span>
                        </div>
                        <Link href="#" className="text-[12px] font-semibold mt-3 hover:text-emerald-300 transition-colors flex items-center gap-1 group whitespace-nowrap">
                            View Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="hidden @[600px]:block w-px h-20 bg-white/10"></div>

                    {/* Chat Summary */}
                    <div className="flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-2 mb-2 text-emerald-200/80 text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                            <span>Chat Summary</span>
                        </div>
                        <span className="text-2xl font-bold mb-2">24</span>
                        <div className="flex flex-col gap-0.5 text-[13px] text-emerald-100/90 whitespace-nowrap">
                            <span>Conversations</span>
                            <span>This Month</span>
                        </div>
                        <Link href="#" className="text-[12px] font-semibold mt-3 hover:text-emerald-300 transition-colors flex items-center gap-1 group whitespace-nowrap">
                            View History <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Right: Quote Box — flexible width, shrinks gracefully */}
                <div className="relative w-full @[800px]:w-[340px] @[900px]:w-[380px] bg-[#135A3D]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 pl-12 shadow-sm z-10 shrink-0 overflow-hidden">
                    {/* Large quote mark */}
                    <div className="absolute left-3 top-2 text-emerald-400/30 font-serif text-6xl leading-none">&quot;</div>
                    <div className="relative z-10 pr-20">
                        <p className="text-[13px] md:text-sm font-medium leading-relaxed italic mb-3 text-emerald-50">
                            &quot;When diet is wrong, medicine is of no use. When diet is correct, medicine is of no need.&quot;
                        </p>
                        <p className="text-xs text-emerald-300 font-medium">— Ayurvedic Proverb</p>
                    </div>
                    {/* Image overlay */}
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 pointer-events-none drop-shadow-2xl">
                        <Image 
                            src="/dashboard_assets/jadibooty.png" 
                            alt="Ayurvedic mortar and pestle" 
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
