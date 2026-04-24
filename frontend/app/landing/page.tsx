'use client';

import Link from 'next/link';
import Image from 'next/image';
import LandingNavbar from '@/components/LandingNavbar';
import PlantGallery from '@/components/PlantGallery';
import './landing.css';

export default function LandingPage() {
    return (
        <div className="relative min-h-screen bg-white">
            {/* White Frame Border */}
            <div className="landing-frame" />

            {/* Navbar */}
            <LandingNavbar />

            {/* Section 1: Hero */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Video Background */}
                <div className="hero-video-container">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="hero-video"
                    >
                        <source src="/homebg.mp4" type="video/mp4" />
                    </video>
                    <div className="hero-overlay" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <div className="animate-wellness-slide-up">
                        <p className="text-green-400 text-lg md:text-xl font-medium tracking-widest uppercase mb-4">
                            Ancient Wisdom, Modern Science
                        </p>
                    </div>

                    <h1 className="animate-wellness-slide-up animation-delay-100 text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-tight">
                        DRAVYA
                        <span className="text-gradient-green block"> LABS</span>
                    </h1>

                    <p className="animate-wellness-slide-up animation-delay-200 text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Your AI-powered gateway to Ayurvedic wellness. Discover personalized herbal solutions backed by centuries of traditional knowledge.
                    </p>

                    <div className="animate-wellness-slide-up animation-delay-300 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
                        <Link
                            href="/auth/login"
                            className="group bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-10 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 flex items-center gap-2"
                        >
                            Get Started
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link
                            href="#about"
                            className="border-2 border-white/50 hover:border-white text-white font-semibold text-lg px-10 py-4 rounded-full transition-all duration-300 hover:bg-white/10"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 scroll-indicator-landing text-white/80">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm uppercase tracking-widest">Scroll</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Section 2: About */}
            <section id="about" className="section-about py-16 sm:py-20 md:py-24 lg:py-32 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Text Content */}
                        <div className="space-y-8">
                            <div>
                                <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
                                    About Dravya Labs
                                </span>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                                    Bridging <span className="text-gradient-green">Ancient Ayurveda</span> with Modern Technology
                                </h2>
                            </div>

                            <p className="text-lg text-gray-600 leading-relaxed">
                                Dravya Labs is an innovative AI-powered platform that brings the timeless wisdom of Ayurveda to your fingertips. We combine cutting-edge artificial intelligence with authentic Ayurvedic knowledge to provide personalized wellness recommendations.
                            </p>

                            <p className="text-lg text-gray-600 leading-relaxed">
                                Our comprehensive database includes detailed information about medicinal herbs, their properties, uses, and potential interactions, empowering you to make informed decisions about your health journey.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
                                <div className="feature-card p-6 rounded-2xl">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Insights</h3>
                                    <p className="text-gray-600">Smart recommendations based on your unique health profile</p>
                                </div>

                                <div className="feature-card p-6 rounded-2xl">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Herbal Encyclopedia</h3>
                                    <p className="text-gray-600">Comprehensive database of 500+ Ayurvedic herbs</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Plant Gallery */}
                        <div className="lg:pl-8">
                            <PlantGallery />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Problem & Solution */}
            <section id="solution" className="section-solution py-16 sm:py-20 md:py-24 lg:py-32 scroll-mt-20">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Problem & Solution Text */}
                        <div className="space-y-10">
                            <div>
                                <span className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
                                    The Problem
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                    Ayurvedic Knowledge is Scattered and Inaccessible
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Despite Ayurveda&apos;s 5,000-year history, authentic information remains fragmented across ancient texts, making it difficult for modern users to access reliable, personalized guidance for their wellness needs.
                                </p>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                            <div>
                                <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
                                    Our Solution
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                    AI-Powered <span className="text-gradient-green">Ayurvedic Assistant</span>
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    Dravya Labs uses advanced AI to analyze traditional texts and provide instant, personalized recommendations. Our platform offers:
                                </p>

                                <ul className="space-y-4">
                                    {[
                                        'Plant identification using image recognition',
                                        'Personalized herbal remedies based on your dosha',
                                        'Drug interaction checker for safety',
                                        'AI consultation for wellness queries',
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-700 text-lg">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Right: Solution Image */}
                        <div className="lg:pl-8">
                            <div className="relative max-w-lg mx-auto">
                                <Image
                                    src="/solution-hero.png"
                                    alt="AI-Powered Ayurvedic Health Assistant"
                                    width={500}
                                    height={500}
                                    className="w-full h-auto rounded-3xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Features Bento Grid */}
            <section id="features" className="section-features py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-50 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
                            Why Choose Us
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                            Everything You Need for <span className="text-gradient-green">Holistic Wellness</span>
                        </h2>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Card 1: Ayurvedic Expertise - Large */}
                        <div className="bento-card lg:col-span-2 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Rooted in Ancient Wisdom</h3>
                                <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                                    Our platform is built on authentic Ayurvedic texts and principles, curated by experts with deep knowledge of traditional Indian medicine systems spanning over 5,000 years.
                                </p>
                            </div>
                            {/* Decorative Element */}
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <div className="absolute right-8 top-8 opacity-10">
                                <svg className="w-32 h-32 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                        </div>

                        {/* Card 2: Secure & Private */}
                        <div className="bento-card bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Secure & Private</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Your health data is securely stored and protected. We follow strict privacy protocols to keep your personal information safe.
                                </p>
                            </div>
                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-green-500/20 rounded-full blur-xl" />
                        </div>

                        {/* Card 3: Integrations */}
                        <div className="bento-card bg-white rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Comprehensive Platform</h3>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    All the tools you need for your Ayurvedic wellness journey, integrated in one seamless experience.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {['Plant ID', 'AI Chat', 'Encyclopedia', 'Dosha Quiz', 'Remedies', 'Tracker'].map((item) => (
                                        <span key={item} className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Visual Card with Plant Image */}
                        <div className="bento-card lg:col-span-2 rounded-3xl overflow-hidden relative group hover:shadow-2xl transition-all duration-500 h-64 lg:h-auto">
                            <Image
                                src="/ayurvedic_plants/Ashwagandha.jpg"
                                alt="Ayurvedic Herbs"
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <h3 className="text-2xl md:text-3xl font-bold mb-2">500+ Medicinal Herbs</h3>
                                <p className="text-gray-200 text-lg">Explore our comprehensive encyclopedia of Ayurvedic plants and their healing properties</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-12">
                        {[
                            { value: '500+', label: 'Medicinal Herbs' },
                            { value: '5000+', label: 'Years of Wisdom' },
                            { value: '99%', label: 'Accuracy Rate' },
                            { value: '24/7', label: 'AI Availability' },
                        ].map((stat, index) => (
                            <div key={index} className="text-center p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-green mb-1 sm:mb-2">{stat.value}</div>
                                <div className="text-gray-600 font-medium text-xs sm:text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 5: Footer */}
            <footer className="landing-footer py-10 sm:py-12 md:py-16 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12">
                        {/* Logo & Description */}
                        <div className="md:col-span-2">
                            <Image
                                src="/Full logo.png"
                                alt="Dravya Labs"
                                width={180}
                                height={50}
                                className="h-12 w-auto mb-6 brightness-0 invert"
                            />
                            <p className="text-gray-400 leading-relaxed max-w-md">
                                Empowering wellness through the fusion of ancient Ayurvedic wisdom and modern artificial intelligence. Your journey to holistic health starts here.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-green-400">Quick Links</h4>
                            <ul className="space-y-3">
                                {[
                                    { label: 'Encyclopedia', href: '/ensyclopedia' },
                                    { label: 'AI Consultation', href: '/chat' },
                                    { label: 'Plant Identifier', href: '/dravya-id' },
                                    { label: 'Dashboard', href: '/dashboard' },
                                ].map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors animated-underline"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-green-400">Contact</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-center gap-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    contact@dravyalabs.com
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    India
                                </li>
                            </ul>

                            {/* Social Links */}
                            <div className="flex gap-4 mt-6">
                                {[
                                    { icon: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z', name: 'Twitter' },
                                    { icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z', name: 'GitHub' },
                                ].map((social) => (
                                    <a
                                        key={social.name}
                                        href="#"
                                        className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                                        aria-label={social.name}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d={social.icon} />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm">
                            © 2026 Dravya Labs. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
