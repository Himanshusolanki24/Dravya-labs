'use client';

import React, { useState, useCallback } from 'react';
import { Moon, Brain, Shield, Heart, Zap, ChevronRight } from 'lucide-react';

const DigestionIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 21c-4.97 0-9-4.03-9-9 0-4.11 2.76-7.56 6.55-8.68.79-.23 1.63-.32 2.45-.32 4.97 0 9 4.03 9 9s-4.03 9-9 9z" opacity="0.3"/>
        <path d="M14.5 4.5c1.5 1.5 2.5 3.5 2.5 6s-1 4.5-2.5 6"/>
        <path d="M10 4.5C8 5.5 7 7.5 7 10.5S8.5 15.5 10 16.5"/>
    </svg>
);

const chips = [
    { id: 'sleep', title: 'Sleep Issues', subtitle: 'Trouble sleeping or\npoor rest?', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50/80', outline: 'border-indigo-100' },
    { id: 'stress', title: 'Stress & Anxiety', subtitle: 'Feeling overwhelmed\nor tense?', icon: Brain, color: 'text-sky-500', bg: 'bg-sky-50/80', outline: 'border-sky-100' },
    { id: 'digestion', title: 'Digestion', subtitle: 'Bloating, acidity or\nindigestion?', icon: DigestionIcon, color: 'text-emerald-500', bg: 'bg-emerald-50/80', outline: 'border-emerald-100' },
    { id: 'immunity', title: 'Immunity', subtitle: 'Want to boost your\nimmunity?', icon: Shield, color: 'text-orange-500', bg: 'bg-orange-50/80', outline: 'border-orange-100' },
    { id: 'energy', title: 'Low Energy', subtitle: 'Feeling tired or\nfatigued?', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50/80', outline: 'border-amber-100' },
    { id: 'wellness', title: 'General Wellness', subtitle: 'Tips for a balanced\nlifestyle?', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50/80', outline: 'border-rose-100' },
];

export default function SuggestionChips({ onSelect }: { onSelect?: (id: string) => void }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleSelect = useCallback((chipId: string) => {
        setSelectedId(prev => prev === chipId ? null : chipId);
        onSelect?.(chipId);
    }, [onSelect]);

    return (
        <div className="flex flex-wrap justify-center gap-4 max-w-[1080px] mx-auto mb-6 px-4 animate-wellness-slide-up animation-delay-200 relative z-10">
            {chips.map((chip, index) => {
                const Icon = chip.icon;
                const isSelected = selectedId === chip.id;

                return (
                    <div
                        key={chip.id}
                        onClick={() => handleSelect(chip.id)}
                        className={`
                            bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border 
                            flex items-center gap-4 cursor-pointer w-full sm:w-[calc(50%-0.5rem)] md:w-[250px] text-left relative group
                            transition-all duration-300 ease-out hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5
                            ${isSelected ? 'border-[#16826B] ring-1 ring-[#16826B]' : 'border-gray-100 hover:border-gray-200'}
                        `}
                        style={{ animationDelay: `${150 + index * 50}ms` }}
                    >
                        <div className={`size-11 rounded-full flex items-center justify-center shrink-0 border ${chip.bg} ${chip.color} ${chip.outline} transition-transform group-hover:scale-105`}>
                            <Icon className="size-5" />
                        </div>
                        <div className="flex-1 pr-6">
                            <h3 className="font-semibold text-gray-900 text-[15px]">{chip.title}</h3>
                            <p className="text-gray-500 text-[13px] leading-[1.3] mt-0.5 whitespace-pre-line">{chip.subtitle}</p>
                        </div>
                        <ChevronRight className="size-4 text-gray-300 absolute right-4 group-hover:text-gray-400 transition-colors" />
                    </div>
                );
            })}
        </div>
    );
}
