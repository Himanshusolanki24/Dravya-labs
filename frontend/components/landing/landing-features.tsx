'use client';

import HowItWorks, { type Step } from '@/components/ui/how-it-works';
import { Leaf, ShieldCheck, Sparkles } from 'lucide-react';

const FEATURE_STEPS: Step[] = [
    {
        title: 'Create Account',
        description: 'Sign up in minutes and set the foundation for personalized Ayurvedic care.',
        colorTheme: 'lime',
    },
    {
        title: 'Discover Prakriti',
        description: 'Take the dosha quiz so every recommendation matches your constitution.',
        colorTheme: 'mint',
    },
    {
        title: 'Explore the Library',
        description: 'Browse 500+ herbs, identify plants, and understand classical uses.',
        colorTheme: 'spring',
    },
    {
        title: 'Consult Dravya AI',
        description: 'Ask for diagnosis support, remedies, and protocols grounded in tradition.',
        colorTheme: 'emerald',
    },
    {
        title: 'Track Wellness',
        description: 'Follow your plan, monitor progress, and refine care as you go.',
        colorTheme: 'leaf',
    },
];

export default function LandingFeatures() {
    return (
        <section id="features" className="section-features scroll-mt-20">
            <div className="relative z-10 mx-auto grid h-full min-h-0 w-full max-w-[1600px] grid-cols-1 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.2fr)]">
                <div className="features-copy flex min-h-0 flex-col justify-center px-5 pt-16 pb-3 sm:px-8 sm:pt-20 lg:px-12 lg:pt-8 lg:pb-8 xl:px-16">
                    <p
                        className="features-badge opacity-0 inline-flex w-fit -rotate-2 items-center rounded-full border-2 border-[#A3E635] bg-[#ECFCCB] px-3.5 py-1 text-[11px] font-bold tracking-[0.18em] text-[#3F6212] uppercase shadow-[3px_3px_0_#84CC16]"
                        style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
                    >
                        Why choose Dravya
                    </p>
                    <h2 className="features-heading opacity-0 mt-4 max-w-xl text-[clamp(1.9rem,4.4vw,3.45rem)] leading-[1.06] tracking-[-0.04em]">
                        <span className="font-bold text-[#14532D]">Everything</span>{' '}
                        <span
                            className="font-medium text-[#0F766E]"
                            style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
                        >
                            you need
                        </span>
                        <br />
                        <span className="font-semibold text-[#3F6212]">for</span>{' '}
                        <span className="relative inline-block font-bold text-[#15803D]">
                            <span className="relative z-10">holistic</span>
                            <span className="absolute inset-x-0 bottom-1 h-2.5 -rotate-1 rounded-full bg-[#A3E635]/80" aria-hidden />
                        </span>
                        <br />
                        <span className="inline-block rotate-1 rounded-xl bg-[#BBF7D0] px-2 py-0.5 font-bold text-[#047857] shadow-[3px_3px_0_#34D399]">
                            wellness
                        </span>
                    </h2>
                    <p className="features-sub opacity-0 mt-5 max-w-md text-[15px] leading-relaxed text-[#3F6212] sm:text-base">
                        From{' '}
                        <span className="rounded-md bg-[#99F6E4] px-1.5 py-0.5 font-semibold text-[#0F766E]">prakriti</span>
                        {' '}to{' '}
                        <span className="rounded-md bg-[#D9F99D] px-1.5 py-0.5 font-semibold text-[#3F6212]">protocol</span>
                        {' '}— a{' '}
                        <span className="font-semibold italic text-[#047857]">private</span>, science-backed path through authentic Ayurveda, on one screen.
                    </p>

                    <ul className="features-points mt-8 hidden space-y-3 sm:block">
                        <li className="features-point opacity-0 flex -rotate-1 items-start gap-3 rounded-2xl border-2 border-[#A3E635] bg-[#F7FEE7] p-3 shadow-[4px_4px_0_#84CC16]">
                            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#BEF264] text-[#3F6212]">
                                <Sparkles className="size-4" />
                            </span>
                            <span>
                                <strong className="block text-sm font-bold text-[#365314]">Prakriti-first AI</strong>
                                <span className="text-sm text-[#4D7C0F]">Recommendations adapt to vata, pitta, and kapha.</span>
                            </span>
                        </li>
                        <li className="features-point opacity-0 flex rotate-1 items-start gap-3 rounded-2xl border-2 border-[#2DD4BF] bg-[#F0FDFA] p-3 shadow-[4px_4px_0_#14B8A6]">
                            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#5EEAD4] text-[#0F766E]">
                                <Leaf className="size-4" />
                            </span>
                            <span>
                                <strong className="block text-sm font-bold text-[#134E4A]">Herb-backed library</strong>
                                <span className="text-sm text-[#0F766E]">Classical sources, modern safety, live plant ID.</span>
                            </span>
                        </li>
                        <li className="features-point opacity-0 flex -rotate-1 items-start gap-3 rounded-2xl border-2 border-[#4ADE80] bg-[#F0FDF4] p-3 shadow-[4px_4px_0_#22C55E]">
                            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#86EFAC] text-[#15803D]">
                                <ShieldCheck className="size-4" />
                            </span>
                            <span>
                                <strong className="block text-sm font-bold text-[#14532D]">Private by default</strong>
                                <span className="text-sm text-[#166534]">Your health data stays encrypted and in your control.</span>
                            </span>
                        </li>
                    </ul>
                </div>

                <div className="features-how opacity-0 relative min-h-0 h-full overflow-hidden lg:overflow-visible">
                    <div className="features-how-scale flex h-full min-h-0 w-full items-center justify-center">
                        <HowItWorks
                            features={FEATURE_STEPS}
                            className="!bg-transparent !px-2 !py-0 sm:!px-4 md:!py-0"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
