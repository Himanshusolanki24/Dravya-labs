'use client';

import React from 'react';

export default function TitleSection() {
    return (
        <div className="text-center max-w-2xl mx-auto mb-6 animate-wellness-fade-in px-4 relative z-10">
            <h1 className="text-[28px] sm:text-[36px] font-bold text-[#0F172A] leading-[1.2] tracking-tight mb-2 animate-wellness-slide-up">
                How can we support <br className="hidden sm:block" /> your <span className="text-[#16826B]">wellness</span> today?
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-500 leading-relaxed font-medium animate-wellness-slide-up animation-delay-100 max-w-[500px] mx-auto">
                Share your symptoms or wellness concerns and get personalized Ayurvedic guidance tailored to you.
            </p>
        </div>
    );
}
