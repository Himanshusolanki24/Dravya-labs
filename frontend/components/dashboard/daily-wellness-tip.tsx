'use client';

import React from 'react';
import { Quote, Leaf } from 'lucide-react';

export function DailyWellnessTip() {
    return (
        <div className="bg-[#F2F9F2] rounded-2xl p-6 border border-[#E8F4E8] shadow-sm relative overflow-hidden flex items-center justify-between min-h-[140px]">
            {/* Left Content */}
            <div className="relative z-10 max-w-[65%]">
                <div className="flex items-center gap-3 mb-3 text-[#1A6136]">
                    <Quote className="w-8 h-8 fill-current text-[#347659]" strokeWidth={0} />
                    <h3 className="font-bold text-[18px]">Daily Wellness Tip</h3>
                </div>
                <p className="text-[#374151] text-[15px] font-medium leading-relaxed">
                    Drink warm water with a few drops of lemon in the morning to boost digestion.
                </p>
            </div>
            
            {/* Background organic glow */}
            <div className="absolute right-0 top-0 w-[200px] h-full pointer-events-none">
                <div className="absolute top-[-30%] right-[-10%] w-[180px] h-[180px] rounded-full bg-[#BBF7D0]/30 blur-[60px]"></div>
            </div>
            
            {/* Right Leaf Circle */}
            <div className="relative z-10 flex shrink-0">
                <div className="w-24 h-24 bg-[#E8F4E8] rounded-full flex items-center justify-center border border-[#DCFCE7]/50 shadow-inner">
                    <Leaf className="w-10 h-10 text-[#347659]" strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}
