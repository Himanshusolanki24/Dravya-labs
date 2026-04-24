'use client';

import React from 'react';

interface TitleSectionProps {
    headline?: string;
    subtitle?: string;
}

export default function TitleSection({
    headline = "What's on your mind today?",
    subtitle = "Describe your symptoms or wellness concerns, and receive personalized Ayurvedic suggestions tailored to your unique constitution."
}: TitleSectionProps) {
    return (
        <div className="text-center max-w-xl mx-auto mb-6 animate-wellness-fade-in">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-3 animate-wellness-slide-up">
                {headline}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-medium animate-wellness-slide-up animation-delay-100">
                {subtitle}
            </p>
        </div>
    );
}
