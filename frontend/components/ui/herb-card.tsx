'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Leaf, Sparkles } from 'lucide-react';
import { translations } from '@/lib/translations';
import { useLanguage } from '@/context/LanguageContext';

// Dosha color mapping
const doshaColors: Record<string, { bg: string; text: string; border: string }> = {
    Vata: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    Pitta: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    Kapha: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
};

// Category color mapping
const categoryColors: Record<string, { bg: string; text: string }> = {
    Adaptogen: { bg: 'bg-purple-100', text: 'text-purple-700' },
    Digestive: { bg: 'bg-orange-100', text: 'text-orange-700' },
    Immunity: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    'Skin Care': { bg: 'bg-pink-100', text: 'text-pink-700' },
    Respiratory: { bg: 'bg-sky-100', text: 'text-sky-700' },
    'Heart Health': { bg: 'bg-red-100', text: 'text-red-700' },
    "Women's Health": { bg: 'bg-rose-100', text: 'text-rose-700' },
    'Brain Health': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    Detox: { bg: 'bg-lime-100', text: 'text-lime-700' },
    Spice: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    Rejuvenation: { bg: 'bg-violet-100', text: 'text-violet-700' },
};

interface HerbCardProps {
    herbId: string;
    title: string;
    sanskritName?: string;
    description?: string;
    category?: string;
    doshas?: string[];
    benefits?: string[];
    imagePath?: string;
    gradientColors?: {
        from: string;
        to: string;
    };
}

export default function HerbCard({
    herbId,
    title = "HERB NAME",
    sanskritName,
    description,
    category,
    doshas = [],
    benefits = [],
    imagePath,
    gradientColors = { from: "rgb(16, 185, 129)", to: "rgb(52, 211, 153)" },
}: HerbCardProps) {
    const { language } = useLanguage();
    const t = translations[language];
    
    // Get translated herb title, category, description, and benefits
    const translatedTitle = (t.encyclopedia.herbTitles as Record<string, string>)[herbId] || title;
    const translatedCategory = category ? (t.encyclopedia.categories as Record<string, string>)[category] || category : undefined;
    const translatedDescription = (t.encyclopedia.herbDescriptions as Record<string, string>)[herbId] || description;
    
    // Translate benefits
    const getTranslatedBenefit = (benefit: string) => {
        return (t.encyclopedia.benefitTags as Record<string, string>)[benefit] || benefit;
    };
    
    return (
        <div className="herb-card group w-[280px] rounded-2xl bg-white overflow-hidden shadow-lg border border-gray-100 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-100/50">
            {/* Image Section */}
            <div
                className="relative h-[180px] overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${gradientColors.from} 0%, ${gradientColors.to} 100%)`
                }}
            >
                {/* Herb Image */}
                {imagePath && (
                    <Image
                        src={imagePath}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                )}

                {/* Gradient overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                />

                {/* Category badge */}
                {category && (
                    <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm ${categoryColors[category]?.bg || 'bg-gray-100'} ${categoryColors[category]?.text || 'text-gray-700'}`}>
                            {translatedCategory}
                        </span>
                    </div>
                )}

                {/* Decorative element */}
                <div className="absolute top-3 right-3">
                    <div className="size-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Leaf className="size-4 text-white" strokeWidth={2} />
                    </div>
                </div>

                {/* Title overlay at bottom of image */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white tracking-wide drop-shadow-lg">
                        {translatedTitle}
                    </h3>
                    {sanskritName && (
                        <p className="text-white/80 text-sm font-medium mt-0.5 drop-shadow">
                            {sanskritName}
                        </p>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
                {/* Description */}
                {description && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                        {translatedDescription}
                    </p>
                )}

                {/* Dosha Tags */}
                {doshas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide mr-1 self-center">{t.encyclopedia.balancing}:</span>
                        {doshas.map((dosha) => (
                            <span
                                key={dosha}
                                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${doshaColors[dosha]?.bg || 'bg-gray-50'} ${doshaColors[dosha]?.text || 'text-gray-600'} ${doshaColors[dosha]?.border || 'border-gray-200'}`}
                            >
                                {dosha}
                            </span>
                        ))}
                    </div>
                )}

                {/* Benefit Tags */}
                {benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {benefits.slice(0, 3).map((benefit, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-[11px] font-medium border border-emerald-100"
                            >
                                <Sparkles className="size-3" />
                                {getTranslatedBenefit(benefit)}
                            </span>
                        ))}
                    </div>
                )}

                {/* View Details Link */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link
                        href={`/encyclopedia/${herbId}`}
                        className="w-full text-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center justify-center gap-2 group/btn"
                    >
                        <span>{language === 'hi' ? 'विवरण देखें' : 'Explore Details'}</span>
                        <svg className="size-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

