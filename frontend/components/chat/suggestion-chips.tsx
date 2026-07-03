'use client';

import React, { useState, useCallback } from 'react';
import { Moon, Brain, Sparkles, Shield, Heart, Zap } from 'lucide-react';
import { translations } from '@/lib/translations';
import { useLanguage } from '@/context/LanguageContext';

interface Chip {
    id: string;
    icon: React.ElementType;
}

const defaultChips: Chip[] = [
    { id: 'sleep', icon: Moon },
    { id: 'stress', icon: Brain },
    { id: 'digestion', icon: Sparkles },
    { id: 'immunity', icon: Shield },
    { id: 'energy', icon: Zap },
    { id: 'wellness', icon: Heart },
];

interface SuggestionChipsProps {
    chips?: Chip[];
    onSelect?: (chipId: string) => void;
}

export default function SuggestionChips({
    chips = defaultChips,
    onSelect
}: SuggestionChipsProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { language } = useLanguage();
    const t = translations[language];

    const getChipLabel = (chipId: string) => {
        const chipTranslations = t.chat.chips as Record<string, string>;
        return chipTranslations[chipId] || chipId;
    };

    const handleSelect = useCallback((chipId: string) => {
        setSelectedId(prev => prev === chipId ? null : chipId);
        onSelect?.(chipId);
    }, [onSelect]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent, chipId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect(chipId);
        }
    }, [handleSelect]);

    return (
        <div
            className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto mb-12 animate-wellness-fade-in animation-delay-200"
            role="group"
            aria-label="Health concern suggestions"
        >
            {chips.map((chip, index) => {
                const Icon = chip.icon;
                const isSelected = selectedId === chip.id;

                return (
                    <button
                        key={chip.id}
                        onClick={() => handleSelect(chip.id)}
                        onKeyDown={(e) => handleKeyDown(e, chip.id)}
                        aria-pressed={isSelected}
                        className={`
              suggestion-chip
              group relative flex items-center gap-2.5 px-5 py-3 rounded-full
              font-medium text-sm sm:text-base
              border transition-all duration-500 ease-out
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16826B] focus-visible:ring-offset-2
              animate-wellness-slide-up
              ${isSelected
                                ? 'bg-[#16826B]/10 border-[#16826B] text-[#16826B] shadow-lg shadow-[#16826B]/20'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-[#16826B]/50 hover:bg-[#16826B]/5 hover:text-[#16826B] hover:shadow-md hover:shadow-[#16826B]/10'
                            }
            `}
                        style={{ animationDelay: `${150 + index * 50}ms` }}
                    >
                        <Icon
                            className={`size-4 sm:size-5 transition-all duration-500 ${isSelected
                                    ? 'text-[#16826B] scale-110'
                                    : 'text-gray-400 group-hover:text-[#16826B] group-hover:scale-110'
                                }`}
                            strokeWidth={1.5}
                        />
                        <span>{getChipLabel(chip.id)}</span>

                        {/* Selection indicator */}
                        <span
                            className={`
                absolute inset-0 rounded-full border-2 border-[#16826B] 
                transition-all duration-500 ease-out
                ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              `}
                            aria-hidden="true"
                        />
                    </button>
                );
            })}
        </div>
    );
}
