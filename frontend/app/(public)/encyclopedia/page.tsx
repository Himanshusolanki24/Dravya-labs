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
            <div className="relative px-6 py-5 border-b border-emerald-100/50 overflow-hidden bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-green-50/80 shrink-0">
                {/* Decorative abstract background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-20 w-72 h-72 bg-teal-300/10 rounded-full blur-3xl translate-y-1/3"></div>
                
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
                            <Leaf className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent leading-tight">
                                {t.encyclopedia.title}
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {t.encyclopedia.subtitle.replace('{count}', String(herbs.length))}
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full md:max-w-[320px] shrink-0">
                        <div className="flex items-center bg-white/80 backdrop-blur-md rounded-xl px-4 py-2.5 border border-emerald-100 shadow-sm focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100/50 transition-all">
                            <Search className="size-4 text-emerald-600" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t.encyclopedia.searchPlaceholder}
                                className="flex-1 ml-3 text-sm bg-transparent border-none focus:outline-none placeholder:text-gray-400 text-gray-800"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-gray-400 hover:text-emerald-600 p-0.5 transition-colors"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10 shrink-0">
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
                        <div className="flex flex-col sm:flex-row gap-4 mb-2">
                            {/* Dosha Filters */}
                            <div className="flex-1 max-w-[200px]">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t.encyclopedia.byDoshaBalance}</label>
                                <select 
                                    value={selectedDoshas.length > 0 ? selectedDoshas[0] : 'All'}
                                    onChange={(e) => {
                                        if (e.target.value === 'All') setSelectedDoshas([]);
                                        else setSelectedDoshas([e.target.value]);
                                    }}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-gray-100 transition-colors"
                                >
                                    <option value="All">All Doshas</option>
                                    {doshaOptions.map(dosha => (
                                        <option key={dosha} value={dosha}>{dosha}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Filters */}
                            <div className="flex-1 max-w-[250px]">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t.encyclopedia.byCategory}</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-gray-100 transition-colors"
                                >
                                    {categories.map(category => {
                                        const translatedCategory = (t.encyclopedia.categories as Record<string, string>)[category] || category;
                                        return (
                                            <option key={category} value={category}>{translatedCategory}</option>
                                        );
                                    })}
                                </select>
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
