'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    ArrowRight,
    Instagram,
    Linkedin,
    Twitter,
    Youtube,
} from 'lucide-react';

const productLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'For Practitioners', href: '#' },
    { label: 'For Clinics', href: '#' },
    { label: 'Integrations', href: '#' },
];

const resourceLinks = [
    { label: 'Blog', href: '#' },
    { label: 'Ayurveda Encyclopedia', href: '/encyclopedia' },
    { label: 'Research & Insights', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Webinars', href: '#' },
];

const companyLinks = [
    { label: 'About Us', href: '#about' },
    { label: 'Our Mission', href: '#about' },
    { label: 'Careers', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Privacy Policy', href: '#' },
];

const socials = [
    { label: 'Twitter', href: '#', icon: Twitter },
    { label: 'LinkedIn', href: '#', icon: Linkedin },
    { label: 'Instagram', href: '#', icon: Instagram },
    { label: 'YouTube', href: '#', icon: Youtube },
];

export default function LandingFooter() {
    const footerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const footer = footerRef.current;
        const spacer = document.querySelector('.footer-reveal-spacer');
        if (!footer || !spacer) return;

        gsap.registerPlugin(ScrollTrigger);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const ctx = gsap.context(() => {
            gsap.set(footer, { autoAlpha: 0 });

            ScrollTrigger.create({
                trigger: spacer,
                start: 'top 92%',
                onEnter: () => gsap.set(footer, { autoAlpha: 1 }),
                onLeaveBack: () => gsap.set(footer, { autoAlpha: 0 }),
            });

            const reveal = {
                trigger: spacer,
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: 0.7,
            };

            gsap.fromTo('.footer-layer-1', { y: 180 }, { y: 0, ease: 'none', scrollTrigger: reveal });
            gsap.fromTo('.footer-layer-2', { y: 110 }, { y: 0, ease: 'none', scrollTrigger: reveal });
            gsap.fromTo('.footer-layer-3', { y: 64 }, { y: 0, ease: 'none', scrollTrigger: reveal });
            gsap.fromTo('.footer-layer-clouds', { y: -48 }, { y: 0, ease: 'none', scrollTrigger: reveal });
            gsap.fromTo(
                '.footer-layer-nature',
                { y: 80, scale: 0.94 },
                { y: 0, scale: 1, ease: 'none', scrollTrigger: reveal }
            );
            gsap.fromTo(
                '.footer-copy',
                { y: 36, opacity: 0 },
                { y: 0, opacity: 1, ease: 'none', scrollTrigger: { ...reveal, start: 'top 85%' } }
            );
        }, footer);

        return () => ctx.revert();
    }, []);

    const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.currentTarget.reset();
    };

    return (
        <footer
            ref={footerRef}
            className="landing-footer fixed inset-x-0 bottom-0 z-0 h-dvh overflow-hidden text-[#1F3D34]"
        >
            <div className="footer-landscape" aria-hidden>
                <div className="footer-layer-nature">
                    <span>NATURE</span>
                </div>
                <img src="/footer/clouds.svg" alt="" className="footer-layer-clouds" />
                <img src="/footer/layer3.svg" alt="" className="footer-layer-3" />
                <img src="/footer/layer2.svg" alt="" className="footer-layer-2" />
                <img src="/footer/layer1.svg" alt="" className="footer-layer-1" />
            </div>

            <div className="footer-copy relative z-20 flex h-full flex-col opacity-0">
                <div className="mx-auto w-full max-w-7xl shrink-0 px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-12 lg:gap-6">
                        <div className="col-span-2 lg:col-span-3">
                            <Link href="/" className="mb-3 inline-flex items-center">
                                <Image
                                    src="/Full logo.png"
                                    alt="Dravya Labs"
                                    width={160}
                                    height={44}
                                    className="h-8 w-auto sm:h-10"
                                    style={{ width: 'auto', height: 'auto' }}
                                />
                            </Link>
                            <p className="max-w-[240px] text-sm leading-relaxed text-[#4A635C]">
                                Bridging ancient wisdom with modern science to deliver personalized Ayurvedic wellness solutions.
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                {socials.map(({ label, href, icon: Icon }) => (
                                    <Link
                                        key={label}
                                        href={href}
                                        aria-label={label}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C8E8DC] text-[#0F5C45] transition-colors hover:bg-[#0F5C45] hover:text-white"
                                    >
                                        <Icon className="h-4 w-4" aria-hidden />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <FooterColumn title="Product" links={productLinks} />
                        <FooterColumn title="Resources" links={resourceLinks} />
                        <FooterColumn title="Company" links={companyLinks} />

                        <div className="col-span-2 lg:col-span-3">
                            <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0F5C45]">
                                Stay Connected
                            </h2>
                            <p className="mb-3 max-w-xs text-sm text-[#4A635C]">
                                Subscribe to get wellness tips, updates & exclusive offers.
                            </p>
                            <form onSubmit={handleSubscribe} className="relative max-w-sm">
                                <label htmlFor="footer-email" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="footer-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                    className="h-12 w-full rounded-full border border-white bg-white pl-5 pr-14 text-sm text-[#1F3D34] outline-none placeholder:text-[#8AA39A] focus:ring-2 focus:ring-[#0F5C45]/30"
                                />
                                <button
                                    type="submit"
                                    aria-label="Subscribe"
                                    className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#0F5C45] text-white transition-colors hover:bg-[#0A3D2E]"
                                >
                                    <ArrowRight className="h-4 w-4" aria-hidden />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1" />
            </div>
        </footer>
    );
}

function FooterColumn({
    title,
    links,
}: {
    title: string;
    links: { label: string; href: string }[];
}) {
    return (
        <nav className="lg:col-span-2" aria-label={title}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0F5C45] sm:mb-3">
                {title}
            </h2>
            <ul className="space-y-1.5 sm:space-y-2">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link
                            href={link.href}
                            className="text-sm text-[#4A635C] transition-colors hover:text-[#0F5C45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C45]"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
