'use client';

import React from 'react';
import { Leaf } from 'lucide-react';

export default function WellnessIcon() {
    return (
        <div
            className="wellness-icon-container mb-8"
            role="img"
            aria-label="Wellness icon representing Ayurvedic healing"
        >
            <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#16826B]/20 to-[#007200]/20 blur-xl animate-wellness-pulse" />

                {/* Middle ring */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#16826B]/30 to-[#007200]/30 blur-md animate-wellness-pulse-delayed" />

                {/* Icon container */}
                <div className="relative size-24 rounded-full bg-gradient-to-br from-white to-[#f0f9f6] border border-[#16826B]/20 flex items-center justify-center shadow-xl shadow-[#16826B]/10 animate-wellness-float">
                    <Leaf className="size-10 text-[#16826B] animate-wellness-breathe" strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}
