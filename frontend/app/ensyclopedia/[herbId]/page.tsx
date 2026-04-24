'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Leaf, Heart, Share2, ChevronRight, Star,
    FlaskConical, Sparkles, AlertTriangle, Send,
    ArrowLeft, Check, Flame, Droplets, Zap, BookOpen
} from 'lucide-react';
import { getHerbById, getRelatedHerbs } from '@/lib/herbs-data';
import { useSavedItems } from '@/context/SavedItemsContext';
import { translations } from '@/lib/translations';
import { useLanguage } from '@/context/LanguageContext';

// Property icon mapping
const propertyIcons: Record<string, React.ReactNode> = {
    rasa: <Flame className="size-5" />,
    guna: <Droplets className="size-5" />,
    virya: <Zap className="size-5" />,
    vipaka: <FlaskConical className="size-5" />,
};

const propertyColors: Record<string, { bg: string; text: string }> = {
    rasa: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    guna: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    virya: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
    vipaka: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
};

// Dosha colors
const doshaStyles: Record<string, string> = {
    Vata: 'bg-blue-50 text-blue-700 border-blue-200',
    Pitta: 'bg-amber-50 text-amber-700 border-amber-200',
    Kapha: 'bg-teal-50 text-teal-700 border-teal-200',
};

type TabType = 'properties' | 'benefits' | 'usage' | 'cautions';

export default function HerbDetailPage() {
    const params = useParams();
    const herbId = params.herbId as string;
    const [activeTab, setActiveTab] = useState<TabType>('properties');
    const [aiQuestion, setAiQuestion] = useState('');
    const { isItemSaved, toggleItem } = useSavedItems();
    const { language } = useLanguage();
    const t = translations[language];

    const herb = getHerbById(herbId);
    const relatedHerbs = getRelatedHerbs(herbId, 3);

    // Get translated herb title and category
    const getTranslatedTitle = (id: string, fallback: string) =>
        (t.encyclopedia.herbTitles as Record<string, string>)[id] || fallback;
    const getTranslatedCategory = (cat: string) =>
        (t.encyclopedia.categories as Record<string, string>)[cat] || cat;
    const getTranslatedLongDescription = (id: string, fallback: string) =>
        (t.encyclopedia.herbLongDescriptions as Record<string, string>)[id] || fallback;
    const getTranslatedBenefit = (benefit: string) =>
        (t.encyclopedia.benefitTags as Record<string, string>)[benefit] || benefit;

    if (!herb) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Leaf className="size-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-600 mb-2">{t.encyclopedia.herbNotFound}</h1>
                <p className="text-gray-500 mb-6">{t.encyclopedia.herbNotFoundDesc}</p>
                <Link
                    href="/ensyclopedia"
                    className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
                >
                    {t.encyclopedia.backButton}
                </Link>
            </div>
        );
    }

    const translatedTitle = getTranslatedTitle(herb.id, herb.title);
    const translatedCategory = getTranslatedCategory(herb.category);

    const tabs = [
        { id: 'properties' as TabType, label: t.encyclopedia.properties, icon: <FlaskConical className="size-5" /> },
        { id: 'benefits' as TabType, label: t.encyclopedia.benefits, icon: <Sparkles className="size-5" /> },
        { id: 'usage' as TabType, label: t.encyclopedia.howToUse, icon: <BookOpen className="size-5" /> },
        { id: 'cautions' as TabType, label: t.encyclopedia.cautions, icon: <AlertTriangle className="size-5" /> },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Main Content */}
            <main className="flex-1 py-8 px-4 sm:px-8 lg:px-20">
                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/ensyclopedia" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                            <ArrowLeft className="size-4" />
                            {t.encyclopedia.backToEncyclopedia}
                        </Link>
                        <ChevronRight className="size-4" />
                        <span className="font-semibold text-gray-900">{translatedTitle}</span>
                    </nav>

                    {/* Hero Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-10">
                        {/* Hero Image */}
                        <div className="lg:col-span-5">
                            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl">
                                <Image
                                    src={herb.imagePath}
                                    alt={herb.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => toggleItem({
                                            item_id: herb.id,
                                            category: herb.category,
                                            name: herb.title,
                                            image_url: herb.imagePath
                                        })}
                                        className={`flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors backdrop-blur-sm ${isItemSaved(herb.id) ? 'text-red-500 hover:text-red-600' : 'text-gray-700 hover:text-red-500'
                                            }`}
                                    >
                                        <Heart className={`size-5 ${isItemSaved(herb.id) ? 'fill-current' : ''}`} />
                                    </button>
                                    <button className="flex size-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm hover:text-emerald-500 transition-colors backdrop-blur-sm">
                                        <Share2 className="size-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Hero Content */}
                        <div className="lg:col-span-7 flex flex-col justify-center gap-5">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                                        {translatedTitle}
                                    </h1>
                                    <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5">
                                        <Star className="size-5 text-emerald-500 fill-emerald-500" />
                                        <span className="font-bold text-gray-900">{herb.rating}</span>
                                        <span className="text-xs text-gray-500">({herb.reviewCount} reviews)</span>
                                    </div>
                                </div>
                                <h2 className="text-xl font-medium text-emerald-600">
                                    {herb.botanicalName} <span className="text-gray-400 mx-2">|</span> {herb.sanskritName}
                                </h2>
                            </div>

                            <p className="text-base leading-relaxed text-gray-600">
                                {getTranslatedLongDescription(herb.id, herb.longDescription)}
                            </p>

                            {/* Quick Property Tags */}
                            <div className="flex flex-wrap gap-2">
                                {herb.doshas.map(dosha => (
                                    <span
                                        key={dosha}
                                        className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold border ${doshaStyles[dosha]}`}
                                    >
                                        {dosha} {t.encyclopedia.balancing}
                                    </span>
                                ))}
                                <span className="inline-flex items-center rounded-full bg-purple-50 px-4 py-1.5 text-sm font-semibold text-purple-700 border border-purple-200">
                                    {translatedCategory}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4 pt-2">
                                <button
                                    onClick={() => toggleItem({
                                        item_id: herb.id,
                                        category: herb.category, // e.g. 'Herb'
                                        name: herb.title,
                                        image_url: herb.imagePath
                                    })}
                                    className={`flex flex-1 min-w-[160px] items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all shadow-lg ${isItemSaved(herb.id)
                                        ? 'bg-red-50 text-red-600 shadow-red-100 hover:bg-red-100'
                                        : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'
                                        }`}
                                >
                                    <Heart className={`size-5 ${isItemSaved(herb.id) ? 'fill-current' : ''}`} />
                                    <span>{isItemSaved(herb.id) ? t.encyclopedia.savedToCollection : t.encyclopedia.addToCollection}</span>
                                </button>
                                <button className="flex flex-1 min-w-[160px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all">
                                    <Sparkles className="size-5 text-emerald-500" />
                                    <span>{t.encyclopedia.askAiAbout} {translatedTitle}</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Tabs Navigation */}
                    <div className="sticky top-0 z-40 -mx-4 overflow-x-auto bg-white/95 backdrop-blur-md px-4 pb-1 pt-4 border-b border-gray-200 mb-8">
                        <div className="flex min-w-max">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'border-emerald-500 text-emerald-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 flex flex-col gap-8">
                            {/* Properties Tab */}
                            {activeTab === 'properties' && (
                                <>
                                    <section>
                                        <h3 className="mb-5 text-xl font-bold text-gray-900">{t.encyclopedia.ayurvedicProperties}</h3>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                            {Object.entries(herb.properties).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="flex flex-col items-center gap-3 rounded-xl bg-white p-5 shadow-sm border border-gray-100 text-center"
                                                >
                                                    <div className={`flex size-12 items-center justify-center rounded-full ${propertyColors[key]?.bg} ${propertyColors[key]?.text}`}>
                                                        {propertyIcons[key]}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                                        </p>
                                                        <p className="font-bold text-gray-900">{value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Benefits Summary */}
                                    <section>
                                        <h3 className="mb-5 text-xl font-bold text-gray-900">{t.encyclopedia.keyBenefits}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {herb.benefits.map((benefit, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-sm font-medium border border-emerald-100"
                                                >
                                                    <Sparkles className="size-4" />
                                                    {getTranslatedBenefit(benefit)}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* Benefits Tab */}
                            {activeTab === 'benefits' && (
                                <section>
                                    <h3 className="mb-5 text-xl font-bold text-gray-900">{t.encyclopedia.therapeuticBenefits}</h3>
                                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                                        <ul className="space-y-5">
                                            {herb.therapeuticBenefits.map((benefit, idx) => (
                                                <li key={idx} className="flex items-start gap-4">
                                                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                                                        <Check className="size-4" strokeWidth={3} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{benefit.title}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </section>
                            )}

                            {/* Usage Tab */}
                            {activeTab === 'usage' && (
                                <section>
                                    <h3 className="mb-5 text-xl font-bold text-gray-900">{t.encyclopedia.howToUse}</h3>
                                    <div className="space-y-4">
                                        {herb.usageMethods.map((method, idx) => (
                                            <div key={idx} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                                        <BookOpen className="size-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{method.method}</h4>
                                                        <p className="text-sm text-emerald-600 font-medium">{t.encyclopedia.dosage}: {method.dosage}</p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm pl-13">{method.instructions}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Cautions Tab */}
                            {activeTab === 'cautions' && (
                                <section>
                                    <h3 className="mb-5 text-xl font-bold text-gray-900">{t.encyclopedia.cautionsPrecautions}</h3>
                                    <div className="rounded-xl bg-amber-50 p-6 border border-amber-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <AlertTriangle className="size-6 text-amber-600" />
                                            <p className="font-bold text-amber-800">{t.encyclopedia.pleaseNote}</p>
                                        </div>
                                        <ul className="space-y-3">
                                            {herb.cautions.map((caution, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-amber-800">
                                                    <span className="text-amber-500 mt-1">•</span>
                                                    <span className="text-sm">{caution}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-4 text-xs text-amber-700 italic">
                                            {t.encyclopedia.consultPractitioner}
                                        </p>
                                    </div>
                                </section>
                            )}

                            {/* User Reviews */}
                            <section>
                                <h3 className="mb-5 text-xl font-bold text-gray-900">{t.encyclopedia.userReviews}</h3>
                                <div className="flex flex-wrap gap-x-8 gap-y-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                                    <div className="flex flex-col gap-2 min-w-[120px]">
                                        <p className="text-5xl font-black text-gray-900">{herb.rating}</p>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star
                                                    key={star}
                                                    className={`size-5 ${star <= Math.floor(herb.rating) ? 'text-emerald-500 fill-emerald-500' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-500">{t.encyclopedia.basedOn} {herb.reviewCount} {t.encyclopedia.reviews}</p>
                                    </div>
                                    <div className="flex-1 min-w-[200px] space-y-2">
                                        {[5, 4, 3, 2, 1].map(rating => {
                                            const percentage = rating === 5 ? 78 : rating === 4 ? 15 : rating === 3 ? 5 : rating === 2 ? 2 : 0;
                                            return (
                                                <div key={rating} className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-gray-700 w-4">{rating}</span>
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-500 w-10 text-right">{percentage}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            {/* Ask AI Widget */}
                            <div className="rounded-xl bg-gradient-to-b from-emerald-50 to-transparent p-5 border border-emerald-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-10 flex items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{t.encyclopedia.askAiAbout} {translatedTitle}</h3>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button className="rounded-lg bg-white p-3 text-sm text-gray-600 shadow-sm border border-gray-100 hover:border-emerald-200 text-left transition-colors">
                                        &quot;How does {herb.title} affect Pitta dosha?&quot;
                                    </button>
                                    <button className="rounded-lg bg-white p-3 text-sm text-gray-600 shadow-sm border border-gray-100 hover:border-emerald-200 text-left transition-colors">
                                        &quot;Can I take {herb.title} with Ashwagandha?&quot;
                                    </button>
                                    <div className="relative mt-2">
                                        <input
                                            type="text"
                                            value={aiQuestion}
                                            onChange={(e) => setAiQuestion(e.target.value)}
                                            placeholder={t.encyclopedia.askQuestion}
                                            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-12 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 shadow-sm"
                                        />
                                        <button className="absolute right-2 top-2 size-8 flex items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                                            <Send className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Related Herbs */}
                            <div>
                                <h3 className="mb-4 text-lg font-bold text-gray-900">{t.encyclopedia.relatedDravyas}</h3>
                                <div className="flex flex-col gap-3">
                                    {relatedHerbs.map(related => (
                                        <Link
                                            key={related.id}
                                            href={`/ensyclopedia/${related.id}`}
                                            className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm border border-gray-100 hover:border-emerald-200 transition-all group"
                                        >
                                            <div className="relative size-16 shrink-0 rounded-lg overflow-hidden">
                                                <Image
                                                    src={related.imagePath}
                                                    alt={related.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                                    {getTranslatedTitle(related.id, related.title)}
                                                </h4>
                                                <p className="text-xs text-gray-500 italic">{related.botanicalName}</p>
                                                <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                                    <Leaf className="size-3" />
                                                    {getTranslatedCategory(related.category)}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
