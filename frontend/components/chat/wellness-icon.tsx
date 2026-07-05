'use client';

import React from 'react';
import { Leaf } from 'lucide-react';

export default function WellnessIcon() {
    return (
        <div
            className="flex items-center justify-center mb-4 mt-4 animate-wellness-float"
            role="img"
            aria-label="Wellness icon"
        >
            <div className="relative size-16 sm:size-20 rounded-full bg-white border border-[#16826B]/10 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <Leaf className="size-6 sm:size-8 text-[#16826B]" strokeWidth={2} />
            </div>
        </div>
    );
}
