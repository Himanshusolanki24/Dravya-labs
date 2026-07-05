'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Leaf } from 'lucide-react';

export function HerbalWisdom() {
    return (
        <div className="bg-[#0A2F1E] rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-sm flex flex-col min-h-[220px] h-full">
            {/* Decorative concentric circles */}
            <div className="absolute -right-[150px] -top-[150px] w-[400px] h-[400px] pointer-events-none opacity-20 flex items-center justify-center">
                <div className="absolute w-[200px] h-[200px] border-[1px] border-[#93C572] rounded-full"></div>
                <div className="absolute w-[300px] h-[300px] border-[1px] border-[#93C572] rounded-full"></div>
                <div className="absolute w-[400px] h-[400px] border-[1px] border-[#93C572] rounded-full"></div>
            </div>
            
            <div className="relative z-10 w-full sm:w-[60%] lg:w-[65%] xl:w-[60%] mt-auto mb-auto">
                <h3 className="text-white font-bold text-xl mb-3 leading-snug">Herbal Wisdom, Modern Intelligence</h3>
                <p className="text-[#9CA3AF] text-[14px] leading-relaxed mb-6 font-medium">
                    Discover personalized remedies backed by 5000+ years of Ayurvedic knowledge.
                </p>
                
                <button className="bg-white text-[#0A2F1E] text-[13px] font-bold px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors w-fit active:scale-95">
                    Explore Encyclopedia <ArrowRight className="w-4 h-4" />
                </button>
            </div>
            
            {/* Icon top right */}
            <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm z-20">
                <Leaf className="w-6 h-6 text-[#93C572]" strokeWidth={2} />
            </div>

            {/* Image bottom right */}
            <div className="absolute -bottom-2 -right-4 w-[280px] h-[200px] pointer-events-none drop-shadow-2xl opacity-100">
                <Image 
                    src="/dashboard_assets/planthands.png" 
                    alt="Hands holding a young plant" 
                    fill
                    className="object-contain object-bottom"
                />
            </div>
        </div>
    );
}
