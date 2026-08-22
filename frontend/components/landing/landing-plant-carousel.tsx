'use client';

import CarouselStacked, { type Slide } from '@/components/ui/carousel-07';
import { herbs } from '@/lib/herbs-data';

const CAROUSEL_IDS = [
    'tulsi',
    'ashwagandha',
    'turmeric',
    'neem',
    'brahmi',
    'amla',
    'shatavari',
    'giloy',
    'moringa',
    'arjuna',
    'ginger',
    'triphala',
];

const slides: Slide[] = CAROUSEL_IDS.map((id) => herbs.find((herb) => herb.id === id))
    .filter((herb): herb is NonNullable<typeof herb> => Boolean(herb))
    .map((herb) => ({
        image: herb.imagePath,
        title: herb.title.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()),
        description: herb.description,
        badge: herb.category,
    }));

export default function LandingPlantCarousel() {
    return (
        <section id="encyclopedia" className="section-encyclopedia scroll-mt-20">
            <div className="relative z-10 flex h-full min-h-0 flex-col items-center px-4 pt-8 pb-6 sm:px-6 sm:pt-10 md:pt-[3.25rem] md:pb-8">
                <p
                    className="ency-badge opacity-0 mb-0 inline-flex shrink-0 -rotate-2 items-center rounded-full border-2 border-[#A3E635] bg-[#ECFCCB] px-3.5 py-1 text-[11px] font-bold tracking-[0.18em] text-[#3F6212] uppercase shadow-[3px_3px_0_#84CC16]"
                    style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
                >
                    Trusted by 10,000+ practitioners
                </p>

                <h2 className="ency-heading opacity-0 mt-3 max-w-3xl shrink-0 text-center text-[clamp(1.85rem,4.6vw,3.4rem)] leading-[1.08] tracking-[-0.04em] sm:mt-3.5">
                    <span className="font-bold text-[#14532D]">Intelligent</span>{' '}
                    <span className="relative inline-block font-bold text-[#15803D]">
                        <span className="relative z-10">Ayurveda</span>
                        <span className="absolute inset-x-0 bottom-1 h-2.5 -rotate-1 rounded-full bg-[#A3E635]/80" aria-hidden />
                    </span>
                    ,
                    <br />
                    <span
                        className="font-medium text-[#0F766E]"
                        style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
                    >
                        powered by
                    </span>{' '}
                    <span className="inline-block rotate-1 rounded-xl bg-[#BBF7D0] px-2 py-0.5 font-bold text-[#047857] shadow-[3px_3px_0_#34D399]">
                        Dravya Labs
                    </span>
                </h2>

                <p className="ency-sub opacity-0 mt-3 max-w-2xl shrink-0 text-center text-[15px] leading-[1.7] text-[#3F6212] sm:mt-3.5 sm:text-[16.5px]">
                    Advanced AI for{' '}
                    <span className="rounded-md bg-[#99F6E4] px-1.5 py-0.5 font-semibold text-[#0F766E]">diagnosis</span>
                    , personalized remedies, and better patient outcomes.
                    <span className="mt-1 block">
                        Built for practitioners. Backed by science.{' '}
                        <span className="font-semibold italic text-[#047857]">Rooted in tradition.</span>
                    </span>
                </p>

                <div className="ency-stage opacity-0 relative mt-4 flex min-h-0 w-full flex-1 items-stretch sm:mt-5">
                    <CarouselStacked slides={slides} autoplay className="h-full w-full" />
                </div>
            </div>
        </section>
    );
}
