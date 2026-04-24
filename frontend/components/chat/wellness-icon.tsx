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
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/40 blur-xl animate-wellness-pulse" />

                {/* Middle ring */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-100/60 to-teal-100/60 blur-md animate-wellness-pulse-delayed" />

                {/* Icon container */}
                <div className="relative size-20 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 flex items-center justify-center shadow-lg shadow-emerald-100/50 animate-wellness-float">
                    <Leaf className="size-10 text-emerald-600 animate-wellness-breathe" strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}
