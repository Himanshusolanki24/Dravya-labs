'use client';

import React from 'react';

/**
 * ModernBackground - A minimalist animated background with floating gradient orbs
 * Creates a calm, modern aesthetic perfect for wellness applications
 */
export default function ModernBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/50" />

            {/* Animated gradient mesh */}
            <div className="absolute inset-0">
                {/* Large emerald orb - top right */}
                <div
                    className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full animate-float-slow blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.1) 40%, transparent 70%)',
                    }}
                />

                {/* Large teal orb - bottom left */}
                <div
                    className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full animate-float-medium blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0.08) 40%, transparent 70%)',
                    }}
                />

                {/* Medium accent orb - center */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full animate-float-gentle blur-2xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, rgba(52, 211, 153, 0.05) 50%, transparent 70%)',
                    }}
                />

                {/* Small floating orb - top left */}
                <div
                    className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full animate-float-fast blur-2xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(167, 243, 208, 0.3) 0%, rgba(167, 243, 208, 0.1) 50%, transparent 70%)',
                    }}
                />

                {/* Blue accent orb - right side */}
                <div
                    className="absolute top-1/3 -right-20 w-80 h-80 rounded-full animate-float-slow blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)',
                        animationDelay: '-7s'
                    }}
                />

                {/* Small purple-ish orb - bottom center */}
                <div
                    className="absolute bottom-1/3 left-1/2 w-48 h-48 rounded-full animate-float-medium blur-2xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
                        animationDelay: '-3s'
                    }}
                />
            </div>

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
          `,
                    backgroundSize: '80px 80px'
                }}
            />

            {/* Bottom gradient fade for input area */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white/90 to-transparent" />
        </div>
    );
}
