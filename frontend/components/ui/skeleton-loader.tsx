import React from 'react';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`}
            style={{
                animation: 'shimmer 1.5s ease-in-out infinite',
            }}
        />
    );
}

// Page-level skeleton presets
export function PageSkeleton() {
    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-white">
                        <Skeleton className="h-4 w-20 mb-3" />
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                ))}
            </div>

            {/* Content area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                        <Skeleton className="h-3 w-full mb-2" />
                        <Skeleton className="h-3 w-5/6" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ChatSkeleton() {
    return (
        <div className="flex flex-col h-full p-4 space-y-4 animate-fadeIn">
            {/* Messages skeleton */}
            <div className="flex-1 space-y-6 py-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] space-y-2 ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
                            <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? 'w-64' : 'w-80'}`} />
                        </div>
                    </div>
                ))}
            </div>
            {/* Input skeleton */}
            <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="p-5 rounded-2xl border border-gray-100 bg-white animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-5/6" />
        </div>
    );
}
