'use client';

import React from 'react';

/**
 * ModernBackground - A clean, minimal background for the chat
 */
export default function ModernBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gray-50" aria-hidden="true">
            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.8) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Subtle gradient at the top */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-white to-transparent opacity-80" />
            
            {/* Bottom gradient fade for input area */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent" />
        </div>
    );
}
