'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const slides = [
    {
        src: '/about_ayurveda.jpg',
        title: 'Personalized Wellness',
        subtitle: 'AI-driven recommendations tailored to your dosha, lifestyle & health goals.'
    },
    {
        src: '/ayurvedic_plants/Ashwagandha.jpg',
        title: 'Stress Relief',
        subtitle: 'Explore adaptogenic herbs like Ashwagandha to manage stress and boost energy.'
    },
    {
        src: '/ayurvedic_plants/Tulsi.png',
        title: 'Immune Support',
        subtitle: 'Harness the therapeutic power of Tulsi to strengthen your natural defenses.'
    },
    {
        src: '/ayurvedic_plants/neem.jpg',
        title: 'Skin Purifier',
        subtitle: 'Utilize organic Neem to detoxify, cleanse and promote healthy glowing skin.'
    },
    {
        src: '/ayurvedic_plants/Turmeric.jpg',
        title: 'Natural Healing',
        subtitle: 'Leverage Turmeric’s potent anti-inflammatory properties for complete joint care.'
    }
];

export default function PlantGallery() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % slides.length);
                setIsTransitioning(false);
            }, 400);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const handleDotClick = (index: number) => {
        if (index === currentIndex || isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsTransitioning(false);
        }, 300);
    };

    return (
        <div className="relative w-full max-w-xl mx-auto lg:pl-16">
            {/* Desktop Overlapping Card: exact style as in reference image */}
            <div className={`hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 z-20 w-72 bg-[#F6FAF6]/95 backdrop-blur-md border border-green-100/30 rounded-3xl p-6 shadow-[0_15px_35px_rgba(0,0,0,0.06)] -translate-x-[50px] transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <h4 className="text-xl font-bold text-gray-900 mb-2 leading-snug">{slides[currentIndex].title}</h4>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{slides[currentIndex].subtitle}</p>
            </div>

            {/* Main Image Slider Container (4:3 horizontal aspect ratio) */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.08)] bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-white/50">
                {/* Current Slide Image */}
                <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
                    <Image
                        src={slides[currentIndex].src}
                        alt={slides[currentIndex].title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 600px"
                        priority
                    />
                    {/* Subtle vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>

                {/* Mobile Floating Card overlay */}
                <div className={`block lg:hidden absolute bottom-4 left-4 right-4 z-20 bg-[#F6FAF6]/95 backdrop-blur-md border border-green-100/30 rounded-2xl p-5 shadow-lg transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                    <h4 className="text-lg font-bold text-gray-900 mb-1 leading-snug">{slides[currentIndex].title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{slides[currentIndex].subtitle}</p>
                </div>
            </div>

            {/* Navigation Dots (Centered circular indicator dots) */}
            <div className="flex justify-center gap-2.5 mt-6">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-green-600'
                                : 'bg-gray-300 hover:bg-green-400/50'
                            }`}
                        aria-label={`View slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Subtle background glow effect */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-100/40 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none" />
        </div>
    );
}
