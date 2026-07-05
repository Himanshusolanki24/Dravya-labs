'use client';

import Link from 'next/link';
import Image from 'next/image';
import LandingNavbar from '@/components/navigation/LandingNavbar';
import PlantGallery from '@/components/features/PlantGallery';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './landing.css';

export default function LandingPage() {
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // --- 1. PETAL CURSOR FOR DESKTOP ONLY ---
        const isFinePointer = window.matchMedia('(pointer: fine)').matches;
        let mainCursor: HTMLDivElement | null = null;
        let container: HTMLDivElement | null = null;

        if (isFinePointer) {
            // Container for trailing petals
            container = document.createElement('div');
            container.id = 'petal-cursor-container';
            container.style.position = 'fixed';
            container.style.inset = '0';
            container.style.pointerEvents = 'none';
            container.style.zIndex = '9999';
            document.body.appendChild(container);

            // Main cursor petal
            mainCursor = document.createElement('div');
            mainCursor.style.position = 'fixed';
            mainCursor.style.width = '14px';
            mainCursor.style.height = '14px';
            mainCursor.style.borderRadius = '50% 0 50% 50%';
            mainCursor.style.backgroundColor = '#22c55e';
            mainCursor.style.boxShadow = '0 0 10px rgba(34, 197, 94, 0.5)';
            mainCursor.style.pointerEvents = 'none';
            mainCursor.style.zIndex = '10000';
            // Start it offscreen
            mainCursor.style.left = '-100px';
            mainCursor.style.top = '-100px';
            mainCursor.style.transform = 'translate(-50%, -50%) rotate(45deg)';
            mainCursor.style.transition = 'width 0.25s, height 0.25s, background-color 0.25s';
            document.body.appendChild(mainCursor);
            
            // Add custom cursor class to html element
            document.documentElement.classList.add('custom-cursor-active');
        }

        const handleMouseMove = (e: MouseEvent) => {
            const x = e.clientX;
            const y = e.clientY;
            
            if (mainCursor) {
                // Instantly update cursor position so it is perfectly in sync with the mouse!
                mainCursor.style.left = `${x}px`;
                mainCursor.style.top = `${y}px`;

                // Calculate direction of movement to rotate the petal cursor dynamically
                const dx = x - lastPos.current.x;
                const dy = y - lastPos.current.y;
                
                if (Math.hypot(dx, dy) > 1.5) {
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    // Leaf shape starts pointing top-right (45 deg).
                    // Rotating by `angle + 135` aligns its tip in the direction of motion.
                    gsap.to(mainCursor, {
                        rotation: angle + 135,
                        duration: 0.15,
                        ease: 'power1.out'
                    });
                }
            }

            if (!container) return;

            // Calculate distance from last petal spawn
            const dist = Math.hypot(x - lastPos.current.x, y - lastPos.current.y);
            if (dist < 35) return; // Spawn every 35px of movement to keep it clean and performant
            
            lastPos.current = { x, y };

            // Create trailing petal element
            const petal = document.createElement('div');
            petal.className = 'petal-particle';
            
            // Random leaf size
            const size = gsap.utils.random(8, 15);
            petal.style.width = `${size}px`;
            petal.style.height = `${size}px`;
            petal.style.position = 'absolute';
            petal.style.left = `${x - size / 2}px`;
            petal.style.top = `${y - size / 2}px`;
            petal.style.pointerEvents = 'none';
            
            // Leaf shape (teardrop)
            petal.style.borderRadius = '50% 0 50% 50%';
            
            // Random green shades matching the theme
            const colors = ['#22c55e', '#10b981', '#4ade80', '#86efac', '#15803d'];
            const color = gsap.utils.random(colors);
            petal.style.backgroundColor = color;
            petal.style.opacity = '0.7';
            
            container.appendChild(petal);

            // GSAP animate the drifting petal
            gsap.fromTo(petal, 
                {
                    scale: 0.2,
                    rotation: gsap.utils.random(0, 360),
                },
                {
                    scale: 1,
                    rotation: '+=120',
                    x: gsap.utils.random(-30, 30),
                    y: gsap.utils.random(40, 90), // falls down
                    opacity: 0,
                    duration: gsap.utils.random(1.2, 1.8),
                    ease: 'power2.out',
                    onComplete: () => {
                        petal.remove();
                    }
                }
            );
        };

        const handleMouseOver = (e: MouseEvent) => {
            if (!mainCursor) return;
            const target = e.target as HTMLElement;
            if (target.closest('a') || target.closest('button') || target.closest('.group') || target.classList.contains('cursor-pointer')) {
                gsap.to(mainCursor, {
                    width: 24,
                    height: 24,
                    backgroundColor: '#4ade80',
                    duration: 0.2
                });
            } else {
                gsap.to(mainCursor, {
                    width: 14,
                    height: 14,
                    backgroundColor: '#22c55e',
                    duration: 0.2
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        // --- 2. GSAP REVEALING ANIMATIONS ---
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // Navbar slide down
            heroTl.fromTo('.landing-nav-anim', 
                { y: -100, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 1.2, delay: 0.2 }
            );

            // Badge
            heroTl.fromTo('.hero-badge',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 },
                '-=0.8'
            );

            // Title Reveal
            heroTl.fromTo('.hero-title',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 },
                '-=0.8'
            );

            // Subtitle Reveal
            heroTl.fromTo('.hero-subtitle',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 },
                '-=0.8'
            );

            // Buttons
            heroTl.fromTo('.hero-buttons',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 },
                '-=0.8'
            );

            // Side Connectors Fade In & Scale
            heroTl.fromTo('.hero-connector-left',
                { scale: 0.8, opacity: 0, x: -30 },
                { scale: 1, opacity: 1, x: 0, duration: 1.2, ease: 'back.out(1.5)' },
                '-=0.6'
            );

            heroTl.fromTo('.hero-connector-right',
                { scale: 0.8, opacity: 0, x: 30 },
                { scale: 1, opacity: 1, x: 0, duration: 1.2, ease: 'back.out(1.5)' },
                '-=1.2'
            );

            // Bottom Feature Bar
            heroTl.fromTo('.hero-feature-bar',
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2 },
                '-=1'
            );

            // Staggered features inside the bar
            heroTl.fromTo('.hero-feature-item',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.15, duration: 0.8 },
                '-=0.8'
            );

            // --- ABOUT SECTION ---
            const aboutTl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#about',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });
            aboutTl.fromTo('.about-badge', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
                   .fromTo('.about-heading', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.4')
                   .fromTo('.about-text', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.2, duration: 0.8 }, '-=0.6')
                   .fromTo('.about-feature-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.2, duration: 0.8, ease: 'back.out(1.2)' }, '-=0.6')
                   .fromTo('.about-gallery', { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.8');

            // --- SOLUTION SECTION ---
            const solutionTl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#solution',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });
            solutionTl.fromTo('.solution-badge-1', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
                      .fromTo('.solution-heading-1', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.4')
                      .fromTo('.solution-text-1', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
                      .fromTo('.solution-text-2', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
                      .fromTo('.solution-image', { scale: 0.95, opacity: 0, x: 50 }, { scale: 1, opacity: 1, x: 0, duration: 1, ease: 'power2.out' }, '-=0.8');

            // --- FEATURES BENTO GRID ---
            const featuresTl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#features',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });
            featuresTl.fromTo('.features-badge', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
                      .fromTo('.features-heading', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.4')
                      .fromTo('.bento-card-anim', { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.2, duration: 0.8, ease: 'back.out(1.1)' }, '-=0.6')
                      .fromTo('.stat-card-anim', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.6 }, '-=0.4');

            // --- FOOTER ---
            gsap.fromTo('.footer-reveal',
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    scrollTrigger: {
                        trigger: '.landing-footer',
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            if (container) container.remove();
            if (mainCursor) mainCursor.remove();
            document.documentElement.classList.remove('custom-cursor-active');
            ctx.revert();
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-white">
            {/* Navbar wrapped in animation helper */}
            <div className="landing-nav-anim opacity-0 relative z-50">
                <LandingNavbar />
            </div>

            {/* Section 1: Hero */}
            <section className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden bg-[#0A1A10] pt-32 pb-6 md:pb-10">
                {/* Video Background */}
                <div className="hero-video-container">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        poster="/logo.png"
                        className="hero-video opacity-80"
                        suppressHydrationWarning
                    >
                        <source src="/homebg.mp4" type="video/mp4" />
                    </video>
                    {/* Dark overlay to match the premium dark green vibe */}
                    <div className="absolute inset-0 bg-[#0B150F]/80 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B150F]/40 to-[#0B150F] pointer-events-none" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-1 flex-col items-center justify-center">
                    {/* Top Badge */}
                    <div className="hero-badge opacity-0 mb-8">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-sm text-gray-200 shadow-sm">
                            <span className="text-green-400">🌿</span>
                            <span className="font-medium tracking-wide">Ancient Wisdom. Modern Wellness.</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="hero-title opacity-0 text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1] max-w-5xl">
                        Your AI-powered gateway to <br className="hidden sm:block" />
                        <span className="text-[#4ADE80]">Ayurvedic wellness.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="hero-subtitle opacity-0 text-center text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                        Discover personalized herbal solutions backed by centuries of traditional knowledge.
                    </p>

                    {/* Buttons */}
                    <div className="hero-buttons opacity-0 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/auth/signup"
                            className="bg-[#267F37] hover:bg-[#1E672B] text-white font-medium px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-900/50 flex items-center gap-2 text-[17px]"
                        >
                            Get Started
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link
                            href="#about"
                            className="border border-white/30 hover:border-white hover:bg-white/5 text-white font-medium px-8 py-3.5 rounded-full transition-all duration-300 flex items-center gap-2 text-[17px]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Side Connectors (Hidden on mobile & tablet) */}
                <div className="hero-connector-left hidden xl:block absolute left-[3%] 2xl:left-[8%] top-[55%] -translate-y-1/2 z-30 opacity-0">
                    <div className="relative group cursor-pointer">
                        <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:bg-green-500/10 group-hover:border-green-400/50 group-hover:shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                            {/* Replaced credit card icon with personalized user avatar icon */}
                            <svg className="w-8 h-8 text-white transition-colors duration-500 group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        {/* Fixed: Mathematically aligned dashed connector and glowing dot using SVG */}
                        <svg className="absolute left-1/2 top-1/2 w-48 h-20 pointer-events-none overflow-visible">
                            <line 
                                x1="40" 
                                y1="0" 
                                x2="150" 
                                y2="-25" 
                                stroke="currentColor" 
                                strokeWidth="1.5" 
                                strokeDasharray="4 4" 
                                className="text-white/40 transition-colors duration-500 group-hover:text-green-400"
                            />
                            <circle 
                                cx="150" 
                                cy="-25" 
                                r="4" 
                                className="fill-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)] transition-all duration-500 group-hover:scale-150 group-hover:fill-green-300"
                            />
                        </svg>
                        <div className="mt-4 text-center transition-transform duration-500 group-hover:translate-y-1">
                            <p className="text-white font-medium text-sm transition-colors duration-300 group-hover:text-green-300">Personalized</p>
                            <p className="text-gray-400 text-xs">Recommendations</p>
                        </div>
                    </div>
                </div>

                <div className="hero-connector-right hidden xl:block absolute right-[3%] 2xl:right-[8%] top-[45%] -translate-y-1/2 z-30 opacity-0">
                    <div className="relative flex flex-col items-end group cursor-pointer">
                        <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:bg-green-500/10 group-hover:border-green-400/50 group-hover:shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                            {/* Replaced beaker flask icon with natural leaf icon */}
                            <svg className="w-8 h-8 text-white transition-colors duration-500 group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 3c1 2 2 5.5 1 9.5a7 7 0 0 1-9 7.5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21.5V12" />
                            </svg>
                        </div>
                        {/* Fixed: Mathematically aligned dashed connector and glowing dot using SVG */}
                        <svg className="absolute left-1/2 top-1/2 w-48 h-20 pointer-events-none overflow-visible">
                            <line 
                                x1="-40" 
                                y1="0" 
                                x2="-150" 
                                y2="25" 
                                stroke="currentColor" 
                                strokeWidth="1.5" 
                                strokeDasharray="4 4" 
                                className="text-white/40 transition-colors duration-500 group-hover:text-green-400"
                            />
                            <circle 
                                cx="-150" 
                                cy="25" 
                                r="4" 
                                className="fill-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)] transition-all duration-500 group-hover:scale-150 group-hover:fill-green-300"
                            />
                        </svg>
                        <div className="mt-4 text-center transition-transform duration-500 group-hover:translate-y-1">
                            <p className="text-white font-medium text-sm transition-colors duration-300 group-hover:text-green-300">100% Natural</p>
                            <p className="text-gray-400 text-xs">Solutions</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Area: Scroll Indicator and Feature Bar */}
                <div className="relative z-20 w-full flex flex-col items-center gap-8 md:gap-12 mt-8 px-4">
                    {/* Scroll Indicator */}
                    <div className="hidden md:flex flex-col items-center">
                        <div className="relative w-24 h-24 flex items-center justify-center group">
                            <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
                                <path id="curve" fill="transparent" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                                <text className="text-[10px] uppercase tracking-[0.2em] fill-gray-300 font-medium transition-colors duration-300 group-hover:fill-green-400">
                                    <textPath href="#curve" startOffset="0">
                                        SCROLL TO EXPLORE • SCROLL TO EXPLORE • 
                                    </textPath>
                                </text>
                            </svg>
                            <a href="#about" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-black/20 hover:bg-green-500/20 hover:border-green-400/50 backdrop-blur-sm transition-all duration-300 cursor-pointer text-white relative z-10 group-hover:scale-110">
                                <svg className="w-4 h-4 transition-colors duration-300 group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Bottom Feature Bar (Glassmorphic) */}
                    <div className="hero-feature-bar opacity-0 w-full max-w-6xl">
                        <div className="bg-[#1C231F]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
                                
                                {/* Feature 1 */}
                                <div className="hero-feature-item opacity-0 flex items-center gap-4 py-4 lg:py-2 px-4 lg:px-6 group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0 bg-white/5 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-500/20 group-hover:border-green-400/50 group-hover:shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                                        <svg className="w-5 h-5 text-white transition-colors duration-300 group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium mb-1 text-base transition-colors duration-300 group-hover:text-green-300">AI-Powered</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">Advanced AI analyzes your health needs</p>
                                    </div>
                                </div>
                                
                                {/* Feature 2 */}
                                <div className="hero-feature-item opacity-0 flex items-center gap-4 py-4 lg:py-2 px-4 lg:px-6 group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0 bg-white/5 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-500/20 group-hover:border-green-400/50">
                                        <svg className="w-5 h-5 text-white transition-colors duration-300 group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium mb-1 text-base transition-colors duration-300 group-hover:text-green-300">Natural & Safe</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">100% natural solutions from Ayurveda</p>
                                    </div>
                                </div>

                                {/* Feature 3 */}
                                <div className="hero-feature-item opacity-0 flex items-center gap-4 py-4 lg:py-2 px-4 lg:px-6 group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0 bg-white/5 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-500/20 group-hover:border-green-400/50">
                                        <svg className="w-5 h-5 text-white transition-colors duration-300 group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium mb-1 text-base transition-colors duration-300 group-hover:text-green-300">Trusted Knowledge</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">Backed by centuries of traditional Ayurveda</p>
                                    </div>
                                </div>

                                {/* Feature 4 */}
                                <div className="hero-feature-item opacity-0 flex items-center gap-4 py-4 lg:py-2 px-4 lg:px-6 group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0 bg-white/5 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-500/20 group-hover:border-green-400/50">
                                        <svg className="w-5 h-5 text-white transition-colors duration-300 group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium mb-1 text-base transition-colors duration-300 group-hover:text-green-300">Personalized for You</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">Tailored recommendations just for your needs</p>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                <span className="about-badge opacity-0 inline-block text-green-600 text-sm font-bold uppercase tracking-wider mb-2">
                                    ABOUT DRAVYA LABS
                                </span>
                                <h2 className="about-heading opacity-0 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                                    Bridging <span className="text-green-600">Ancient Ayurveda</span> with Modern Technology
                                </h2>
                            </div>

                            <p className="about-text opacity-0 text-base md:text-lg text-gray-600 leading-relaxed">
                                Dravya Labs is an innovative AI-powered platform that brings the timeless wisdom of Ayurveda to your fingertips. We combine cutting-edge artificial intelligence with authentic Ayurvedic knowledge to provide personalized wellness recommendations.
                            </p>

                            <p className="about-text opacity-0 text-base md:text-lg text-gray-600 leading-relaxed">
                                Our comprehensive database includes detailed information about medicinal herbs, their properties, uses, and potential interactions, empowering you to make informed decisions about your health journey.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                                {/* Card 1: AI-Powered Insights */}
                                <div className="about-feature-card opacity-0 bg-white border border-gray-100 p-5 rounded-2xl flex items-start gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 mb-1">AI-Powered Insights</h3>
                                        <p className="text-gray-500 text-xs leading-relaxed">Smart recommendations based on your unique health profile</p>
                                    </div>
                                </div>

                                {/* Card 2: Herbal Encyclopedia */}
                                <div className="about-feature-card opacity-0 bg-white border border-gray-100 p-5 rounded-2xl flex items-start gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 mb-1">Herbal Encyclopedia</h3>
                                        <p className="text-gray-500 text-xs leading-relaxed">Comprehensive database of 500+ Ayurvedic herbs</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Plant Gallery */}
                        <div className="about-gallery opacity-0 lg:pl-8">
                            <PlantGallery />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Problem & Solution (Redesigned with Premium UI) */}
            <section id="solution" className="section-solution py-16 sm:py-20 md:py-24 lg:py-32 bg-white scroll-mt-20 overflow-hidden">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <span className="solution-badge-1 opacity-0 inline-block bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
                            Our Innovation
                        </span>
                        <h2 className="solution-heading-1 opacity-0 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 max-w-3xl mx-auto leading-tight">
                            Transforming How You <span className="text-green-600">Experience Wellness</span>
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                        {/* Left Column: Challenge & Solution Comparison (7 cols on lg) */}
                        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                            
                            {/* Card 1: The Challenge (Pain Point) */}
                            <div className="solution-text-1 opacity-0 bg-slate-50/80 border border-slate-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-md">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">The Pain Point</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Ayurvedic Knowledge is Scattered & Inaccessible</h3>
                                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                        Despite Ayurveda&apos;s 5,000-year history, authentic information remains fragmented across ancient Sanskrit texts, making it extremely difficult to access reliable, personalized, and safe wellness advice.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200/60">
                                    {[
                                        { label: 'Scattered Texts', desc: 'Sanskrit sutras are hard to find and translate' },
                                        { label: 'Safety Risks', desc: 'Unknown drug-herb interactions cause health issues' },
                                        { label: 'General Recipes', desc: 'Generic tips ignore your unique body type' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-red-600 font-semibold text-sm">
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                <span>{item.label}</span>
                                            </div>
                                            <p className="text-slate-500 text-xs leading-normal">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card 2: The Solution */}
                            <div className="solution-text-2 opacity-0 bg-gradient-to-br from-green-50/80 to-emerald-50 border border-green-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
                                {/* Soft glow decorative circle */}
                                <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-green-200/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                
                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                        <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Our Solution</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">AI-Powered Personalized Wisdom</h3>
                                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                        Dravya Labs uses advanced AI models to synthesize traditional texts and offer direct, safe, and custom-tailored recommendations based on your unique body type.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-green-200/60 relative z-10">
                                    {[
                                        { label: 'Instant Plant ID', desc: 'Identify medicinal herbs with your phone camera' },
                                        { label: 'Safety Checker', desc: 'Cross-check drug interactions instantly' },
                                        { label: 'Dosha Customization', desc: 'Tailor remedies to your custom body type' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-green-700 font-semibold text-sm">
                                                <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                <span>{item.label}</span>
                                            </div>
                                            <p className="text-slate-500 text-xs leading-normal">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Premium AI Mockup Dashboard (5 cols on lg) */}
                        <div className="solution-image opacity-0 lg:col-span-5 flex items-stretch">
                            <div className="w-full bg-gradient-to-br from-slate-50 to-[#EDF4EE] border border-slate-200/80 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[480px]">
                                {/* Grid background effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                                
                                {/* Header of mockup */}
                                <div className="flex justify-between items-center relative z-10 mb-4 pb-4 border-b border-slate-200/60">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <span className="text-[11px] text-slate-400 uppercase tracking-widest font-mono">Dravya AI Panel v1.2</span>
                                </div>

                                {/* Floating mockup cards inside container */}
                                <div className="flex-1 flex flex-col gap-4 justify-center relative z-10">
                                    
                                    {/* Mock Card 1: Chat interface */}
                                    <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-md hover:-translate-y-1 transition-transform duration-300 cursor-default group/card">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[11px] font-bold text-green-700 uppercase tracking-wide">Dravya Wellness AI</span>
                                        </div>
                                        <p className="text-slate-600 text-xs leading-relaxed italic">
                                            &quot;Ashwagandha is highly recommended for Vata-Pitta stress relief. Take 1 tsp at bedtime.&quot;
                                        </p>
                                    </div>

                                    {/* Mock Card 2: Interaction Checker */}
                                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 shadow-md hover:-translate-y-1 transition-transform duration-300 cursor-default">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Interaction Scanner</span>
                                            </div>
                                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-medium">Safe</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-600">Ashwagandha + Ibuprofen</span>
                                            <span className="text-emerald-600 font-bold">0 Interactions</span>
                                        </div>
                                    </div>

                                    {/* Mock Card 3: Dosha Profile */}
                                    <div className="bg-white border border-slate-100 text-slate-800 rounded-2xl p-4 shadow-md hover:-translate-y-1 transition-transform duration-300 cursor-default">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide font-sans">Dosha Profile (Prakriti)</span>
                                            <span className="text-[10px] text-green-600 font-semibold">Active</span>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { name: 'Vata (Wind)', pct: '45%', color: 'bg-green-600' },
                                                { name: 'Pitta (Fire)', pct: '35%', color: 'bg-emerald-600' },
                                                { name: 'Kapha (Earth)', pct: '20%', color: 'bg-slate-400' }
                                            ].map((dosha, idx) => (
                                                <div key={idx} className="space-y-0.5">
                                                    <div className="flex justify-between text-[10px] font-medium">
                                                        <span className="text-slate-500">{dosha.name}</span>
                                                        <span className="text-slate-800 font-bold">{dosha.pct}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${dosha.color}`} style={{ width: dosha.pct }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                {/* Bottom decorative link */}
                                <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between items-center text-xs text-slate-450 relative z-10">
                                    <span className="text-slate-400 font-medium">AI Diagnosis System</span>
                                    <span className="text-green-600 hover:text-green-700 cursor-pointer flex items-center gap-1 transition-colors font-bold">
                                        Open WebApp
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </span>
                                </div>
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
                        <span className="features-badge opacity-0 inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
                            Why Choose Us
                        </span>
                        <h2 className="features-heading opacity-0 text-4xl md:text-5xl font-bold text-gray-900">
                            Everything You Need for <span className="text-gradient-green">Holistic Wellness</span>
                        </h2>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Card 1: Ayurvedic Expertise - Large */}
                        <div className="bento-card-anim opacity-0 bento-card lg:col-span-2 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
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
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <div className="absolute right-8 top-8 opacity-10">
                                <svg className="w-32 h-32 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                        </div>

                        {/* Card 2: Secure & Private */}
                        <div className="bento-card-anim opacity-0 bento-card bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
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
                        <div className="bento-card-anim opacity-0 bento-card bg-white rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100">
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
                        <div className="bento-card-anim opacity-0 bento-card lg:col-span-2 rounded-3xl overflow-hidden relative group hover:shadow-2xl transition-all duration-500 h-64 lg:h-auto">
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
                            <div key={index} className="stat-card-anim opacity-0 text-center p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-green mb-1 sm:mb-2">{stat.value}</div>
                                <div className="text-gray-600 font-medium text-xs sm:text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 5: Footer */}
            <footer className="footer-reveal opacity-0 landing-footer py-10 sm:py-12 md:py-16 text-white">
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
                                    { label: 'Encyclopedia', href: '/encyclopedia' },
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
