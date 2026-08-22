'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const slides = [
    {
        src: '/about_ayurveda.jpg',
        title: 'Personalized Wellness',
        subtitle: 'AI-driven recommendations tailored to your dosha, lifestyle & health goals.',
    },
    {
        src: '/ayurvedic_plants/Ashwagandha.jpg',
        title: 'Stress Relief',
        subtitle: 'Explore adaptogenic herbs like Ashwagandha to manage stress and boost energy.',
    },
    {
        src: '/ayurvedic_plants/Tulsi.png',
        title: 'Immune Support',
        subtitle: 'Harness the therapeutic power of Tulsi to strengthen your natural defenses.',
    },
    {
        src: '/ayurvedic_plants/neem.jpg',
        title: 'Skin Purifier',
        subtitle: 'Utilize organic Neem to detoxify, cleanse and promote healthy glowing skin.',
    },
    {
        src: '/ayurvedic_plants/Turmeric.jpg',
        title: 'Natural Healing',
        subtitle: 'Leverage Turmeric’s potent anti-inflammatory properties for complete joint care.',
    },
];

const pulsePath =
    'M0 52 C 28 52, 36 18, 52 28 C 72 42, 78 70, 98 48 C 116 28, 128 16, 148 32 C 168 48, 176 62, 198 40 C 214 24, 228 36, 248 44 C 268 52, 280 22, 300 30';

export default function PlantGallery() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setIsTransitioning(true);
            window.setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % slides.length);
                setIsTransitioning(false);
            }, 280);
        }, 4500);

        return () => window.clearInterval(interval);
    }, []);

    const goTo = (index: number) => {
        if (index === currentIndex || isTransitioning) return;
        setIsTransitioning(true);
        window.setTimeout(() => {
            setCurrentIndex(index);
            setIsTransitioning(false);
        }, 280);
    };

    return (
        <div className="about-gallery-frame relative mx-auto flex h-full w-full max-w-[520px] flex-col">
            <svg width="0" height="0" className="absolute" aria-hidden>
                <defs>
                    <clipPath id="aboutPlantPhotoClip" clipPathUnits="objectBoundingBox">
                        <path d="M 0.12 0.04 C 0.28 -0.02, 0.72 0.00, 0.88 0.08 C 0.99 0.16, 1.02 0.34, 0.98 0.52 C 0.94 0.74, 0.96 0.90, 0.82 0.96 C 0.62 1.03, 0.32 0.99, 0.14 0.90 C -0.02 0.78, -0.01 0.48, 0.03 0.28 C 0.06 0.12, 0.02 0.08, 0.12 0.04 Z" />
                    </clipPath>
                </defs>
            </svg>

            <div className="pointer-events-none absolute -top-6 -right-4 h-20 w-20 rounded-full bg-[#FDE047]/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-[#BBF7D0]/70 blur-3xl" />

            <aside className="absolute left-1 top-4 z-30 hidden flex-col items-center gap-3 rounded-[2rem] bg-white px-2 py-3 shadow-[0_12px_40px_rgba(20,40,28,0.1)] sm:flex">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="rounded-full p-1.5 text-[#111] transition hover:bg-[#FEF9C3]" aria-label="Instagram">
                    <Instagram className="size-4" strokeWidth={1.8} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="rounded-full p-1.5 text-[#111] transition hover:bg-[#FEF9C3]" aria-label="Facebook">
                    <Facebook className="size-4" strokeWidth={1.8} />
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="rounded-full p-1.5 text-[#111] transition hover:bg-[#FEF9C3]" aria-label="X">
                    <Twitter className="size-4" strokeWidth={1.8} />
                </a>
            </aside>

            <div className="about-photo-stage relative min-h-0 w-full flex-1">
                <div className="about-photo-blob pointer-events-none absolute inset-0 translate-x-2 translate-y-3 rotate-2 bg-[#FACC15]" />
                <div className="about-photo-blob pointer-events-none absolute inset-0 -translate-x-1.5 translate-y-1 -rotate-1 bg-[#BBF7D0]" />

                <div className="about-photo-clip absolute inset-0">
                    <div className={`absolute inset-0 transition-all duration-500 ${isTransitioning ? 'scale-105 opacity-0' : 'scale-100 opacity-100'}`}>
                        <Image
                            src={slides[currentIndex].src}
                            alt={slides[currentIndex].title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 520px"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20" />
                    </div>
                </div>

                <article className="absolute right-3 bottom-3 z-20 w-[min(100%-1.5rem,17.5rem)] rounded-[1.6rem] bg-white p-4 shadow-[0_16px_40px_rgba(20,40,28,0.12)] sm:right-4 sm:bottom-4 sm:p-5">
                    <h4 className="mb-3 text-[15px] font-bold tracking-tight text-[#111]">Heart rate measurement</h4>
                    <svg viewBox="0 0 300 80" className="h-16 w-full" aria-hidden>
                        <defs>
                            <linearGradient id="pulseFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FACC15" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d={`${pulsePath} L 300 80 L 0 80 Z`} fill="url(#pulseFill)" />
                        <path d={pulsePath} fill="none" stroke="#CA8A04" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                    <div className="mt-3 flex items-center gap-5 text-[12px] text-[#3F3F46]">
                        <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-[#EAB308]" />
                            Goal <strong className="text-[#111]">83bpm</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-[#111]" />
                            Current <strong className="text-[#111]">97bpm</strong>
                        </span>
                    </div>
                    <p className={`mt-2 text-[11px] leading-relaxed text-[#667068] transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                        {slides[currentIndex].title} — {slides[currentIndex].subtitle}
                    </p>
                </article>
            </div>

            <div className="mt-3 flex shrink-0 justify-center gap-2 sm:mt-4">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => goTo(index)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                            index === currentIndex ? 'w-6 bg-[#EAB308]' : 'w-2.5 bg-[#D4D4D8] hover:bg-[#FDE047]'
                        }`}
                        aria-label={`View slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
