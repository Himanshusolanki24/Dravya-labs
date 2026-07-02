'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function LandingNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
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
                <Image
                    src="/Full logo.png"
                    alt="Dravya Labs"
                    width={160}
                    height={50}
                    className="h-13 w-auto"
                    priority
                />
            </Link >

            {/* Right CTA Buttons */}
            < div className="hidden md:flex items-center gap-4 flex-1 justify-end" >
                <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                    Sign in
                </Link>
                <Link
                    href="/signup"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                >
                    Get Started →
                </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
                className="md:hidden p-2 touch-target"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button >

            {/* Mobile Menu */}
            {
                isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 md:hidden">
                        <div className="flex flex-col gap-4">
                            <Link
                                href="#about"
                                className="text-gray-700 hover:text-green-600 font-medium py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About
                            </Link>
                            <Link
                                href="#solution"
                                className="text-gray-700 hover:text-green-600 font-medium py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Solution
                            </Link>
                            <Link
                                href="#features"
                                className="text-gray-700 hover:text-green-600 font-medium py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Features
                            </Link>
                            <hr className="border-gray-200" />
                            <Link
                                href="/auth/login"
                                className="text-gray-700 hover:text-green-600 font-medium py-2"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full text-center"
                            >
                                Get Started →
                            </Link>
                        </div>
                    </div>
                )
            }
        </nav >
    );
}
