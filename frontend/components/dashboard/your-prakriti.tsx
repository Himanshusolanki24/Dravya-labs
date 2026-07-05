'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function YourPrakriti() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col @container">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#1F2937] text-xl">Your Prakriti</h3>
                <button className="text-[13px] font-medium text-[#6B7280] hover:text-[#374151] transition-colors">Retake Quiz</button>
            </div>
            <p className="text-[14px] text-[#6B7280] mb-8 leading-relaxed max-w-[280px]">
                Current mind-body constitution based on your latest assessment.
            </p>
            
            {/* Chart and Legend */}
            <div className="flex flex-row items-center justify-start gap-10 mb-8 mt-auto px-4">
                {/* SVG Doughnut Chart */}
                <div className="relative w-36 h-36 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {/* Pitta (Orange) 40% */}
                        <circle cx="50" cy="50" r="30" fill="transparent" stroke="#F97316" strokeWidth="20" pathLength="100" strokeDasharray="39 61" strokeDashoffset="0" />
                        {/* Vata (Blue) 35% */}
                        <circle cx="50" cy="50" r="30" fill="transparent" stroke="#3B82F6" strokeWidth="20" pathLength="100" strokeDasharray="34 66" strokeDashoffset="-40" />
                        {/* Kapha (Green) 25% */}
                        <circle cx="50" cy="50" r="30" fill="transparent" stroke="#22C55E" strokeWidth="20" pathLength="100" strokeDasharray="24 76" strokeDashoffset="-75" />
                    </svg>
                    
                    {/* Inner white circle for doughnut hole */}
                    <div className="absolute inset-0 m-auto w-[40px] h-[40px] bg-white rounded-full"></div>
                </div>
                
                {/* Legend */}
                <div className="flex flex-col gap-5 w-full @[360px]:w-auto">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#F97316]"></div>
                            <span className="text-[14px] font-bold text-[#1F2937]">Pitta</span>
                        </div>
                        <span className="text-[14px] font-medium text-[#6B7280]">40%</span>
                    </div>
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#3B82F6]"></div>
                            <span className="text-[14px] font-bold text-[#1F2937]">Vata</span>
                        </div>
                        <span className="text-[14px] font-medium text-[#6B7280]">35%</span>
                    </div>
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#22C55E]"></div>
                            <span className="text-[14px] font-bold text-[#1F2937]">Kapha</span>
                        </div>
                        <span className="text-[14px] font-medium text-[#6B7280]">25%</span>
                    </div>
                </div>
            </div>
            
            <Link href="#" className="mt-auto text-[14px] font-semibold text-[#1A6136] hover:text-[#104825] flex items-center justify-end gap-1.5 group">
                Learn more about your prakriti <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
