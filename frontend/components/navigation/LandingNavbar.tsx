'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function LandingNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
<<<<<<< HEAD:frontend/components/navigation/LandingNavbar.tsx
        <nav className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 bg-white/100 backdrop-blur-sm rounded-2xl md:rounded-none md:rounded-b-[20px] shadow-lg px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between w-[95%] sm:w-[90%] max-w-4xl safe-area-top">
            {/* Left Navigation */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-1">
                <Link
                    href="#about"
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors text-sm lg:text-base"
                >
                    About
                </Link>
                <Link
                    href="#solution"
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors text-sm lg:text-base"
                >
                    Solution
                </Link>
                <Link
                    href="#features"
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors text-sm lg:text-base"
                >
                    Features
                </Link>
            </div >

            {/* Centered Logo */}
            < Link href="/landing" className="flex items-center justify-center" >
=======
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#F9FBF8] rounded-full shadow-md px-6 py-3 flex items-center justify-between w-[95%] max-w-6xl safe-area-top transition-all duration-300">
            {/* Left: Logo */}
            <Link href="/landing" className="flex items-center gap-2 z-10 min-w-[160px]">
>>>>>>> ac09a43 (Landing Page Modified):frontend/components/LandingNavbar.tsx
                <Image
                    src="/Full logo.png"
                    alt="Dravya Labs"
                    width={140}
                    height={40}
                    className="h-10 w-auto"
                    priority
                />
            </Link>

            {/* Center: Navigation Links */}
            <div className="hidden md:flex items-center justify-center gap-8 flex-1">
                <Link href="#about" className="text-gray-900 hover:text-green-700 font-medium text-[15px] transition-colors">
                    About
                </Link>
                <Link href="#solution" className="text-gray-900 hover:text-green-700 font-medium text-[15px] transition-colors">
                    Solution
                </Link>
                <Link href="#features" className="text-gray-900 hover:text-green-700 font-medium text-[15px] transition-colors">
                    Features
                </Link>
                <Link href="#" className="text-gray-900 hover:text-green-700 font-medium text-[15px] transition-colors">
                    Testimonials
                </Link>
                <Link href="#" className="text-gray-900 hover:text-green-700 font-medium text-[15px] transition-colors">
                    Blog
                </Link>
            </div>

            {/* Right: CTA Buttons */}
            <div className="hidden md:flex items-center justify-end gap-6 min-w-[200px]">
                <Link
                    href="/auth/login"
                    className="text-gray-900 hover:text-green-700 font-semibold text-[15px] transition-colors"
                >
                    Sign in
                </Link>
                <Link
<<<<<<< HEAD:frontend/components/navigation/LandingNavbar.tsx
                    href="/signup"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
=======
                    href="/auth/signup"
                    className="bg-[#267F37] hover:bg-[#1E672B] text-white font-medium text-[15px] px-6 py-2.5 rounded-full transition-all flex items-center gap-2"
>>>>>>> ac09a43 (Landing Page Modified):frontend/components/LandingNavbar.tsx
                >
                    Get Started →
                </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
                className="md:hidden p-2 touch-target z-10"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 md:hidden flex flex-col gap-5 border border-gray-100">
                    <Link href="#about" className="text-gray-900 hover:text-green-700 font-medium text-lg" onClick={() => setIsMenuOpen(false)}>About</Link>
                    <Link href="#solution" className="text-gray-900 hover:text-green-700 font-medium text-lg" onClick={() => setIsMenuOpen(false)}>Solution</Link>
                    <Link href="#features" className="text-gray-900 hover:text-green-700 font-medium text-lg" onClick={() => setIsMenuOpen(false)}>Features</Link>
                    <Link href="#" className="text-gray-900 hover:text-green-700 font-medium text-lg" onClick={() => setIsMenuOpen(false)}>Testimonials</Link>
                    <Link href="#" className="text-gray-900 hover:text-green-700 font-medium text-lg" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                    <hr className="border-gray-200 my-2" />
                    <Link href="/auth/login" className="text-gray-900 hover:text-green-700 font-medium text-lg text-center" onClick={() => setIsMenuOpen(false)}>Sign in</Link>
                    <Link href="/auth/signup" className="bg-[#267F37] hover:bg-[#1E672B] text-white font-medium px-6 py-3 rounded-full text-center text-lg" onClick={() => setIsMenuOpen(false)}>Get Started →</Link>
                </div>
            )}
        </nav>
    );
}
