'use client';

import React, { useState, useMemo } from 'react';
import HerbCard from '@/components/ui/herb-card';
import { Leaf, Sparkles, Search, Filter, X } from 'lucide-react';
import { herbs, categories, doshaOptions } from '@/lib/herbs-data';
import { translations } from '@/lib/translations';
import { useLanguage } from '@/context/LanguageContext';

export default function EncyclopediaPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDoshas, setSelectedDoshas] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(true);

    const toggleDosha = (dosha: string) => {
        setSelectedDoshas(prev =>
            prev.includes(dosha)
                ? prev.filter(d => d !== dosha)
                : [...prev, dosha]
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setSelectedDoshas([]);
    };

    const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedDoshas.length > 0;

    const filteredHerbs = useMemo(() => {
        return herbs.filter(herb => {
            // Search filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchesSearch = herb.title.toLowerCase().includes(query) ||
                    herb.sanskritName?.toLowerCase().includes(query) ||
                    herb.description?.toLowerCase().includes(query) ||
                    herb.benefits?.some(b => b.toLowerCase().includes(query));
                if (!matchesSearch) return false;
            }

            // Category filter
            if (selectedCategory !== 'All' && herb.category !== selectedCategory) {
                return false;
            }

            // Dosha filter
            if (selectedDoshas.length > 0) {
                const hasMatchingDosha = selectedDoshas.some(d => herb.doshas?.includes(d));
                if (!hasMatchingDosha) return false;
            }

            return true;
        });
    }, [searchQuery, selectedCategory, selectedDoshas]);

    return (
        <div className="flex-1 flex flex-col h-full overflow-auto bg-gradient-to-b from-gray-50 to-white">
            {/* Header Section */}
            <div className="px-6 py-8 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-green-50/30 border-b border-emerald-100/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Leaf className="size-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                                {t.encyclopedia.title}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {t.encyclopedia.subtitle.replace('{count}', String(herbs.length))}
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl">
                        <div className="flex items-center bg-white rounded-2xl px-5 py-4 border border-gray-200 shadow-sm focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 transition-all">
                            <Search className="size-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t.encyclopedia.searchPlaceholder}
                                className="flex-1 ml-3 text-base bg-transparent border-none focus:outline-none placeholder:text-gray-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                        >
                            <Filter className="size-4" />
                            <span>{showFilters ? t.encyclopedia.hideFilters : t.encyclopedia.showFilters}</span>
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                            >
                                <X className="size-4" />
                                {t.encyclopedia.clearAll}
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="space-y-4">
                            {/* Dosha Filters */}
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t.encyclopedia.byDoshaBalance}</span>
                                <div className="flex flex-wrap gap-2">
                                    {doshaOptions.map(dosha => {
                                        const isSelected = selectedDoshas.includes(dosha);
                                        const colors = {
                                            Vata: isSelected ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
                                            Pitta: isSelected ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
                                            Kapha: isSelected ? 'bg-teal-500 text-white border-teal-500' : 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100',
                                        };
                                        return (
                                            <button
                                                key={dosha}
                                                onClick={() => toggleDosha(dosha)}
                                                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${colors[dosha as keyof typeof colors]}`}
                                            >
                                                {dosha}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Category Filters */}
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t.encyclopedia.byCategory}</span>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(category => {
                                        const translatedCategory = (t.encyclopedia.categories as Record<string, string>)[category] || category;
                                        return (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedCategory === category
                                                    ? 'bg-emerald-500 text-white border-emerald-500'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                                    }`}
                                            >
                                                {translatedCategory}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results count */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            {t.encyclopedia.showing} <span className="font-semibold text-emerald-600">{filteredHerbs.length}</span> {t.encyclopedia.of} {herbs.length} {t.encyclopedia.herbs}
                            {hasActiveFilters && <span className="text-gray-400"> {t.encyclopedia.filtered}</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="flex-1 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    {filteredHerbs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                            {filteredHerbs.map((herb) => (
                                <HerbCard
                                    key={herb.id}
                                    herbId={herb.id}
                                    title={herb.title}
                                    sanskritName={`${herb.botanicalName} • ${herb.sanskritName}`}
                                    description={herb.description}
                                    category={herb.category}
                                    doshas={herb.doshas}
                                    benefits={herb.benefits}
                                    imagePath={herb.imagePath}
                                    gradientColors={herb.gradientColors}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="size-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                                <Sparkles className="size-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">{t.encyclopedia.noHerbsFound}</h3>
                            <p className="text-gray-400 max-w-md">
                                {t.encyclopedia.noHerbsDescription}
                            </p>
                            <button
                                onClick={clearFilters}
                                className="mt-6 px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-full hover:bg-emerald-600 transition-colors"
                            >
                                {t.encyclopedia.clearAllFilters}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
