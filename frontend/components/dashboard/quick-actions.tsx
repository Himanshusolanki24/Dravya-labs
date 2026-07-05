'use client';

import React from 'react';
import { Leaf, MessageSquare, Scan, BookOpen, Brain, Activity, CalendarClock } from 'lucide-react';

export function QuickActions() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-5">
                <Leaf className="w-5 h-5 text-[#5F8D4E]" />
                <h3 className="font-bold text-gray-900 text-lg">Quick Actions</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-3 flex-1">
                {/* Action 1 */}
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-transparent bg-[#F2F9F2] hover:bg-[#E8F4E8] transition-all group active:scale-95">
                    <div className="text-[#1A6136] group-hover:scale-105 transition-transform mb-1">
                        <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <span className="text-[12px] font-bold text-[#1F2937] text-center leading-tight">Ask AI Consultation</span>
                </button>
                
                {/* Action 2 */}
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-transparent bg-[#F2F9F2] hover:bg-[#E8F4E8] transition-all group active:scale-95">
                    <div className="text-[#1A6136] group-hover:scale-105 transition-transform mb-1">
                        <Scan className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <span className="text-[12px] font-bold text-[#1F2937] text-center leading-tight">Plant Identifier</span>
                </button>
                
                {/* Action 3 */}
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-transparent bg-[#FFF8ED] hover:bg-[#FFF0D4] transition-all group active:scale-95">
                    <div className="text-[#D97706] group-hover:scale-105 transition-transform mb-1">
                        <BookOpen className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <span className="text-[12px] font-bold text-[#1F2937] text-center leading-tight">Herb Encyclopedia</span>
                </button>
                
                {/* Action 4 */}
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-transparent bg-[#F8F5FF] hover:bg-[#F3EDFF] transition-all group active:scale-95">
                    <div className="text-[#9333EA] group-hover:scale-105 transition-transform mb-1">
                        <Brain className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <span className="text-[12px] font-bold text-[#1F2937] text-center leading-tight">Dosha Quiz</span>
                </button>
                
                {/* Action 5 */}
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-transparent bg-[#F3F8FF] hover:bg-[#E8F2FF] transition-all group active:scale-95">
                    <div className="text-[#2563EB] group-hover:scale-105 transition-transform mb-1">
                        <Activity className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <span className="text-[12px] font-bold text-[#1F2937] text-center leading-tight">Symptom Checker</span>
                </button>
                
                {/* Action 6 */}
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-transparent bg-[#FFF5F5] hover:bg-[#FFE8E8] transition-all group active:scale-95">
                    <div className="text-[#E11D48] group-hover:scale-105 transition-transform mb-1">
                        <CalendarClock className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <span className="text-[12px] font-bold text-[#1F2937] text-center leading-tight">Daily Routine</span>
                </button>
            </div>
        </div>
    );
}
