'use client';

import Link from 'next/link';
import LandingNavbar from '@/components/navigation/LandingNavbar';
import LandingFooter from '@/components/landing/landing-footer';
import LandingHeroBar from '@/components/landing/landing-hero-bar';
import LandingPlantCarousel from '@/components/landing/landing-plant-carousel';
import LandingPricing from '@/components/landing/landing-pricing';
import LandingFeatures from '@/components/landing/landing-features';
import PlantGallery from '@/components/features/PlantGallery';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
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

        // --- 2. LENIS + GSAP (whole landing page) ---
        gsap.registerPlugin(ScrollTrigger);

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const lenis = new Lenis({
            autoRaf: false,
            lerp: reducedMotion ? 1 : 0.09,
            smoothWheel: !reducedMotion,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.05,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            anchors: { offset: -96, duration: 1.15 },
        });

        lenis.on('scroll', ScrollTrigger.update);

        const onTick = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);

        const ctx = gsap.context(() => {
            const sectionEnter = (trigger: string) =>
                gsap.timeline({
                    defaults: { ease: 'power3.out' },
                    scrollTrigger: {
                        trigger,
                        start: 'top 82%',
                        toggleActions: 'play none none reverse',
                    },
                });

            // Hero plays on load; Lenis owns the rest of the page
            const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            heroTl
                .fromTo('.landing-nav-anim', { y: -100, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, delay: 0.15 })
                .fromTo('.hero-badge', { y: 24, autoAlpha: 0, rotate: -8 }, { y: 0, autoAlpha: 1, rotate: -2, duration: 0.75 }, '-=0.8')
                .fromTo('.hero-title', { y: 48, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.95 }, '-=0.65')
                .fromTo('.hero-subtitle', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, '-=0.75')
                .fromTo('.hero-buttons', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.85 }, '-=0.75')
                .fromTo('.hero-connector-left .hero-connector-inner', { autoAlpha: 0, x: -28 }, { autoAlpha: 1, x: 0, duration: 0.85 }, '-=0.5')
                .fromTo('.hero-connector-right .hero-connector-inner', { autoAlpha: 0, x: 28 }, { autoAlpha: 1, x: 0, duration: 0.85 }, '<')
                .fromTo('.hero-connector-line', { strokeDashoffset: 160 }, { strokeDashoffset: 0, duration: 1 }, '-=0.65')
                .fromTo('.hero-feature-bar', { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.85 }, '-=0.9')
                .fromTo('.hero-feature-item', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(1.25)' }, '-=0.5');

            const aboutTl = sectionEnter('#about');
            aboutTl
                .fromTo('.about-badge', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 })
                .fromTo('.about-heading', { y: 32, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.75 }, '-=0.35')
                .fromTo('.about-text', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.12, duration: 0.7 }, '-=0.45')
                .fromTo('.about-feature-card', { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.12, duration: 0.55 }, '-=0.45')
                .fromTo('.about-gallery', { autoAlpha: 0, x: 28 }, { autoAlpha: 1, x: 0, duration: 0.85 }, '-=0.55');

            const encyclopediaTl = sectionEnter('#encyclopedia');
            encyclopediaTl
                .fromTo('.ency-badge', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 })
                .fromTo('.ency-heading', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, '-=0.32')
                .fromTo('.ency-sub', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 }, '-=0.4')
                .fromTo('.ency-stage', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, '-=0.32');

            const featuresTl = sectionEnter('#features');
            featuresTl
                .fromTo('.features-badge', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 })
                .fromTo('.features-heading', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, '-=0.32')
                .fromTo('.features-sub', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 }, '-=0.4')
                .fromTo('.features-point', { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.1, duration: 0.5 }, '-=0.35')
                .fromTo('.features-how', { autoAlpha: 0, x: 32 }, { autoAlpha: 1, x: 0, duration: 0.8 }, '-=0.4')
                .fromTo('.how-step', { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.08, duration: 0.45 }, '-=0.45');

            const pricingTl = sectionEnter('#pricing');
            pricingTl
                .fromTo('.pricing-badge', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 })
                .fromTo('.pricing-heading', { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65 }, '-=0.32')
                .fromTo('.pricing-sub', { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, '-=0.38')
                .fromTo('.pricing-toggle', { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45 }, '-=0.32')
                .fromTo('.pricing-card', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.65 }, '-=0.28')
                .fromTo('.pricing-trust', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, '-=0.3')
                .fromTo('.pricing-trust > div', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.4 }, '-=0.35');

            if (!reducedMotion) {
                gsap.to('.hero-video', {
                    yPercent: 10,
                    scale: 1.06,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.section-hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.65,
                    },
                });
                gsap.to('.pricing-deco-tl', {
                    y: 70,
                    ease: 'none',
                    scrollTrigger: { trigger: '#pricing', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
                });
                gsap.to('.pricing-deco-br', {
                    y: -50,
                    ease: 'none',
                    scrollTrigger: { trigger: '#pricing', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
                });
            }

            requestAnimationFrame(() => ScrollTrigger.refresh());
        });

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('resize', onResize);
            if (container) container.remove();
            if (mainCursor) mainCursor.remove();
            document.documentElement.classList.remove('custom-cursor-active');
            gsap.ticker.remove(onTick);
            gsap.ticker.lagSmoothing(500);
            lenis.destroy();
            ctx.revert();
        };
    }, []);

    return (
        <div className="landing-page-root relative min-h-screen overflow-x-clip">
            <div className="landing-main relative z-10 overflow-x-clip bg-white">
            {/* Navbar wrapped in animation helper */}
            <div className="landing-nav-anim opacity-0 relative z-50">
                <LandingNavbar />
            </div>

            {/* Section 1: Hero */}
            <section className="section-hero relative h-dvh max-h-dvh flex flex-col overflow-hidden pt-24 sm:pt-28 md:pt-[6.5rem] pb-4 sm:pb-5 md:pb-6">
                <div className="hero-video-container">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        poster="/logo.png"
                        className="hero-video"
                        suppressHydrationWarning
                    >
                        <source src="/homebg.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-[#14532D]/25" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#ECFCCB]/20 via-transparent to-[#F0FDF4]" />
                </div>

                <div className="relative z-10 w-full flex flex-1 min-h-0 items-center px-4 xl:px-6 2xl:px-10">
                    <div className="hero-connector-left hidden xl:flex w-28 2xl:w-32 shrink-0 justify-center self-center overflow-visible">
                        <div className="hero-connector-inner invisible relative flex flex-col items-center">
                            <div className="relative group cursor-pointer">
                                <div className="-rotate-3 rounded-[1.6rem] border-2 border-[#A3E635] bg-[#F7FEE7] p-4 shadow-[5px_5px_0_#84CC16] transition-transform duration-300 group-hover:-rotate-1 group-hover:scale-105">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#BEF264] text-[#3F6212]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <p className="mt-3 text-center text-sm font-bold leading-tight text-[#365314]">Personalized</p>
                                    <p className="mt-0.5 text-center text-[11px] text-[#4D7C0F]">Recommendations</p>
                                </div>
                                <svg className="absolute left-[5.25rem] top-8 pointer-events-none overflow-visible text-[#84CC16]" width="132" height="48" viewBox="0 0 132 48" fill="none" aria-hidden>
                                    <line className="hero-connector-line" x1="0" y1="32" x2="118" y2="8" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" />
                                    <circle cx="122" cy="6" r="5" className="fill-[#EAB308]" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="hero-copy-shift flex-1 max-w-5xl mx-auto flex flex-col items-center justify-center min-w-0">
                        <span
                            className="hero-badge opacity-0 mb-5 inline-flex -rotate-2 items-center rounded-full border-2 border-[#A3E635] bg-[#ECFCCB] px-3.5 py-1 text-[11px] font-bold tracking-[0.18em] text-[#3F6212] uppercase shadow-[3px_3px_0_#84CC16]"
                            style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
                        >
                            Ayurvedic intelligence
                        </span>

                        <h1 className="hero-title opacity-0 text-center text-[clamp(1.85rem,5vw,4.5rem)] font-bold text-white mb-3 sm:mb-5 md:mb-6 tracking-[-0.04em] leading-[1.08] drop-shadow-[0_2px_18px_rgba(15,40,20,0.45)]">
                            Your AI-powered gateway to{' '}
                            <br className="hidden sm:block" />
                            <span className="relative inline-block text-[#ECFCCB]">
                                <span className="relative z-10">Ayurvedic</span>
                                <span className="absolute inset-x-0 bottom-2 h-3 -rotate-1 rounded-full bg-[#A3E635]/90" aria-hidden />
                            </span>{' '}
                            <span className="mt-2 inline-block rotate-1 rounded-xl bg-[#FDE047] px-2 py-0.5 text-[#3F6212] shadow-[4px_4px_0_#CA8A04]">
                                wellness
                            </span>
                        </h1>

                        <p className="hero-subtitle opacity-0 text-center text-[clamp(0.95rem,2vw,1.25rem)] text-white/90 mb-5 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_12px_rgba(15,40,20,0.4)]">
                            Discover{' '}
                            <span className="rounded-md bg-[#99F6E4] px-1.5 py-0.5 font-semibold text-[#0F766E]">personalized</span>
                            {' '}herbal solutions backed by centuries of{' '}
                            <span className="font-semibold italic text-[#FDE047]">traditional knowledge</span>.
                        </p>

                        <div className="hero-buttons opacity-0 flex justify-center">
                            <Link
                                href="/auth/login"
                                className="rounded-full border-2 border-[#84CC16] bg-[#ECFCCB] px-8 py-3.5 text-[17px] font-bold text-[#365314] shadow-[4px_4px_0_#84CC16] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#84CC16] flex items-center gap-2"
                            >
                                Get Started
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="hero-connector-right hidden xl:flex w-28 2xl:w-32 shrink-0 justify-center self-center overflow-visible">
                        <div className="hero-connector-inner invisible relative flex flex-col items-center">
                            <div className="relative group cursor-pointer">
                                <div className="rotate-3 rounded-[1.6rem] border-2 border-[#FACC15] bg-white p-4 shadow-[5px_5px_0_#EAB308] transition-transform duration-300 group-hover:rotate-1 group-hover:scale-105">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#FDE047] text-[#854D0E]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 3c1 2 2 5.5 1 9.5a7 7 0 0 1-9 7.5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21.5V12" />
                                        </svg>
                                    </div>
                                    <p className="mt-3 text-center text-sm font-bold leading-tight text-[#111]">100% Natural</p>
                                    <p className="mt-0.5 text-center text-[11px] text-[#667068]">Solutions</p>
                                </div>
                                <svg className="absolute right-[5.25rem] top-8 pointer-events-none overflow-visible text-[#EAB308]" width="132" height="48" viewBox="0 0 132 48" fill="none" aria-hidden>
                                    <line className="hero-connector-line" x1="132" y1="32" x2="14" y2="8" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" />
                                    <circle cx="10" cy="6" r="5" className="fill-[#84CC16]" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <LandingHeroBar />
            </section>

            {/* Section 2: About */}
            <section id="about" className="section-about scroll-mt-20">
                <div className="about-inner mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6">
                    <div className="about-grid grid min-h-0 items-center gap-10 lg:grid-cols-2 lg:gap-16">
                        <div className="about-copy min-h-0 space-y-8">
                            <div>
                                <span
                                    className="about-badge opacity-0 inline-flex -rotate-2 items-center rounded-full border-2 border-[#A3E635] bg-[#ECFCCB] px-3.5 py-1 text-[11px] font-bold tracking-[0.18em] text-[#3F6212] uppercase shadow-[3px_3px_0_#84CC16]"
                                    style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
                                >
                                    About Dravya Labs
                                </span>
                                <h2 className="about-heading opacity-0 mt-4 text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.08] tracking-[-0.035em]">
                                    Bridging{' '}
                                    <span className="relative inline-block text-[#15803D]">
                                        <span className="relative z-10">Ancient Ayurveda</span>
                                        <span className="absolute inset-x-0 bottom-1 h-2.5 -rotate-1 rounded-full bg-[#A3E635]/80" aria-hidden />
                                    </span>
                                    {' '}with{' '}
                                    <span className="mt-2 inline-block rotate-1 rounded-xl bg-[#BBF7D0] px-2 py-0.5 text-[#047857] shadow-[3px_3px_0_#34D399]">
                                        Modern Technology
                                    </span>
                                </h2>
                            </div>

                            <p className="about-text opacity-0 text-base md:text-lg leading-relaxed text-[#3F6212]">
                                Dravya Labs is an{' '}
                                <span className="rounded-md bg-[#99F6E4] px-1.5 py-0.5 font-semibold text-[#0F766E]">AI-powered</span>
                                {' '}platform that brings the timeless wisdom of Ayurveda to your fingertips. We combine cutting-edge intelligence with authentic knowledge for{' '}
                                <span className="font-semibold italic text-[#047857]">personalized</span> wellness.
                            </p>

                            <p className="about-text opacity-0 text-base md:text-lg leading-relaxed text-[#166534]">
                                Explore a living library of medicinal herbs, properties, uses, and interactions — so you can choose care that is{' '}
                                <span className="rounded-md bg-[#D9F99D] px-1.5 py-0.5 font-semibold text-[#3F6212]">safe</span>
                                {' '}and rooted in tradition.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                                <div className="about-feature-card opacity-0 flex -rotate-1 items-start gap-4 rounded-2xl border-2 border-[#A3E635] bg-[#F7FEE7] p-5 shadow-[5px_5px_0_#84CC16]">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#BEF264] text-[#3F6212]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-base font-bold text-[#365314]">AI-Powered Insights</h3>
                                        <p className="text-xs leading-relaxed text-[#4D7C0F]">Smart recommendations based on your unique health profile</p>
                                    </div>
                                </div>

                                <div className="about-feature-card opacity-0 flex rotate-1 items-start gap-4 rounded-2xl border-2 border-[#2DD4BF] bg-[#F0FDFA] p-5 shadow-[5px_5px_0_#14B8A6]">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#5EEAD4] text-[#0F766E]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-base font-bold text-[#134E4A]">Herbal Encyclopedia</h3>
                                        <p className="text-xs leading-relaxed text-[#0F766E]">Comprehensive database of 500+ Ayurvedic herbs</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="about-gallery opacity-0 min-h-0 h-full lg:pl-8">
                            <PlantGallery />
                        </div>
                    </div>
                </div>
            </section>

            <LandingPlantCarousel />

            <LandingFeatures />

            <LandingPricing />
            </div>

            <div className="footer-reveal-spacer h-dvh" aria-hidden />
            <LandingFooter />
        </div>
    );
}
