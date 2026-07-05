'use client';

import React from 'react';
import Image from 'next/image';

export default function ModernBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#FAFAFA]" aria-hidden="true">
            <Image 
                src="/chatbg.png" 
                alt="Background" 
                fill 
                className="object-cover object-top opacity-100"
                priority
            />
        </div>
    );
}
