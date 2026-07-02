'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const plantImages = [
    { src: '/ayurvedic_plants/Ashwagandha.jpg', name: 'Ashwagandha' },
    { src: '/ayurvedic_plants/Tulsi.png', name: 'Tulsi' },
    { src: '/ayurvedic_plants/neem.jpg', name: 'Neem' },
    { src: '/ayurvedic_plants/Turmeric.jpg', name: 'Turmeric' },
    { src: '/ayurvedic_plants/Brahmi.jpg', name: 'Brahmi' },
];

export default function PlantGallery() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % plantImages.length);
                setIsTransitioning(false);
            }, 500);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-lg mx-auto">
            {/* Main Image Container */}
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-100 to-emerald-50">
                {/* Decorative Border */}
                <div className="absolute inset-0 rounded-3xl border-4 border-white/30 z-10 pointer-events-none" />

                {/* Plant Image */}
                <div className={`absolute inset-0 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
                    <Image
                        src={plantImages[currentIndex].src}
                        alt={plantImages[currentIndex].name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 500px"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Plant Name Badge */}
                <div className={`absolute bottom-6 left-6 right-6 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
                        <p className="text-sm text-green-600 font-medium uppercase tracking-wider">Ayurvedic Herb</p>
                        <h3 className="text-2xl font-bold text-gray-800">{plantImages[currentIndex].name}</h3>
                    </div>
                </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-3 mt-6">
                {plantImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setIsTransitioning(true);
                            setTimeout(() => {
                                setCurrentIndex(index);
                                setIsTransitioning(false);
                            }, 300);
                        }}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-green-500 w-8'
                                : 'bg-gray-300 hover:bg-green-300'
                            }`}
                        aria-label={`View ${plantImages[index].name}`}
                    />
                ))}
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-200/50 rounded-full blur-2xl animate-wellness-pulse" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-emerald-200/50 rounded-full blur-2xl animate-wellness-pulse-delayed" />
        </div>
    );
}
