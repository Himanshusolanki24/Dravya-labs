'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    ArrowRight,
    Building2,
    Check,
    Heart,
    Leaf,
    Shield,
    Sparkles,
    Star,
    X,
} from 'lucide-react';

type Billing = 'monthly' | 'annual';

type Plan = {
    id: 'free' | 'pro' | 'enterprise';
    name: string;
    tagline: string;
    monthly: number;
    featured?: boolean;
    included: string[];
    excluded?: string[];
};

const plans: Plan[] = [
    {
        id: 'free',
        name: 'Starter',
        tagline: 'Explore Ayurveda on your own time.',
        monthly: 0,
        included: [
            'Prakriti (dosha) quiz',
            '50 encyclopedia entries',
            '5 Dravya AI questions / month',
            'Community support',
        ],
        excluded: ['Plant ID & safety checks'],
    },
    {
        id: 'pro',
        name: 'Pro',
        tagline: 'Full intelligence for daily practice.',
        monthly: 15,
        featured: true,
        included: [
            'Unlimited prakriti & AI consults',
            'Full 500+ herb library',
            'Plant ID & safety checks',
            'Priority support',
        ],
    },
    {
        id: 'enterprise',
        name: 'Clinic',
        tagline: 'Teams, clinics, and shared care.',
        monthly: 25,
        included: [
            'Everything in Pro',
            'Shared clinic workspace',
            'Unlimited team seats',
            'Dedicated support + SLA',
        ],
    },
];

function money(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function billingCopy(monthly: number, billing: Billing) {
    if (monthly === 0) {
        return { perMonth: '0', cadence: 'Forever free', footnote: 'No card required' };
    }
    if (billing === 'annual') {
        const year = monthly * 12 * 0.9;
        const perMonth = year / 12;
        const save = monthly * 12 - year;
        return {
            perMonth: money(perMonth),
            cadence: `Billed $${money(year)} / year`,
            footnote: `Save $${money(save)} vs monthly`,
        };
    }
    return {
        perMonth: money(monthly),
        cadence: `Billed $${monthly} each month`,
        footnote: 'Cancel anytime · USD',
    };
}

export default function LandingPricing() {
    const [billing, setBilling] = useState<Billing>('annual');

    return (
        <section id="pricing" className="section-pricing scroll-mt-20">
            <div className="pricing-deco pricing-deco-tl" aria-hidden />
            <div className="pricing-deco pricing-deco-br" aria-hidden />

            <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 pt-10 pb-5 sm:px-6">
                <header className="mb-3 shrink-0 text-center">
                    <span
                        className="pricing-badge opacity-0 inline-flex -rotate-2 items-center gap-1.5 rounded-full border-2 border-[#A3E635] bg-[#ECFCCB] px-3 py-0.5 text-[11px] font-bold tracking-[0.18em] text-[#3F6212] uppercase shadow-[3px_3px_0_#84CC16]"
                        style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
                    >
                        <Leaf className="h-3.5 w-3.5" strokeWidth={2.2} />
                        Transparent pricing
                    </span>
                    <h2 className="pricing-heading opacity-0 mt-2 text-[1.75rem] font-bold tracking-[-0.035em] text-[#14532D] sm:text-3xl lg:text-[2.35rem]">
                        Simple plans.{' '}
                        <span className="relative inline-block text-[#15803D]">
                            <span className="relative z-10">No surprises.</span>
                            <span className="absolute inset-x-0 bottom-1 h-2 -rotate-1 rounded-full bg-[#A3E635]/80" aria-hidden />
                        </span>{' '}
                        <span className="inline-block rotate-1 rounded-xl bg-[#FDE047] px-2 py-0.5 text-[#3F6212] shadow-[3px_3px_0_#CA8A04]">
                            listed below
                        </span>
                    </h2>
                    <p className="pricing-sub opacity-0 mx-auto mt-1.5 max-w-xl text-[13px] leading-snug text-[#3F6212] sm:text-sm">
                        What’s on the card is what’s included.{' '}
                        <span className="rounded-md bg-[#99F6E4] px-1 py-0.5 font-semibold text-[#0F766E]">No setup fees</span>
                        {' · '}
                        <span className="font-semibold italic text-[#047857]">Annual saves 10%</span>.
                    </p>

                    <div className="pricing-toggle opacity-0 mt-3 inline-flex items-center gap-1 rounded-full border-2 border-white/70 bg-white/45 p-1 shadow-[3px_3px_0_#86EFAC] backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => setBilling('monthly')}
                            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                                billing === 'monthly' ? 'bg-[#ECFCCB] text-[#14532D] shadow-[2px_2px_0_#84CC16]' : 'text-[#667068]'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            type="button"
                            onClick={() => setBilling('annual')}
                            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                                billing === 'annual' ? 'bg-[#FDE047] text-[#3F6212] shadow-[2px_2px_0_#CA8A04]' : 'text-[#667068]'
                            }`}
                        >
                            Annual · 10% off
                        </button>
                    </div>
                </header>

                <div className="relative z-10 flex min-h-0 flex-1 items-center">
                    <div className="pricing-card-row grid w-full grid-cols-1 items-start gap-4 md:grid-cols-3 md:gap-5">
                    {plans.map((plan) => {
                        const copy = billingCopy(plan.monthly, billing);
                        const tilt = plan.id === 'free' ? '-rotate-1' : plan.id === 'enterprise' ? 'rotate-1' : 'rotate-0';
                        const shell =
                            plan.id === 'pro'
                                ? 'border-[#A3E635] bg-[#ECFCCB]/55 shadow-[6px_6px_0_#84CC16]'
                                : plan.id === 'enterprise'
                                  ? 'border-[#5EEAD4] bg-white/40 shadow-[6px_6px_0_#14B8A6]'
                                  : 'border-white/80 bg-white/40 shadow-[6px_6px_0_#86EFAC]';

                        return (
                            <article key={plan.id} className="pricing-card opacity-0">
                                <div
                                    className={`relative flex flex-col rounded-[1.6rem] border-2 px-5 py-5 backdrop-blur-xl sm:px-6 ${tilt} ${shell}`}
                                >
                                    {plan.featured && (
                                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border-2 border-[#CA8A04] bg-[#FDE047] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#713F12] shadow-[2px_2px_0_#CA8A04]">
                                            <Star className="h-3 w-3 fill-current" />
                                            Most chosen
                                        </span>
                                    )}

                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={`flex size-9 items-center justify-center rounded-full ${
                                                plan.id === 'pro'
                                                    ? 'bg-[#FDE047] text-[#854D0E]'
                                                    : plan.id === 'enterprise'
                                                      ? 'bg-[#99F6E4] text-[#0F766E]'
                                                      : 'bg-[#D9F99D] text-[#3F6212]'
                                            }`}
                                        >
                                            {plan.id === 'enterprise' ? (
                                                <Building2 className="size-5" strokeWidth={1.7} />
                                            ) : plan.id === 'pro' ? (
                                                <Sparkles className="size-5" strokeWidth={1.7} />
                                            ) : (
                                                <Leaf className="size-5" strokeWidth={1.7} />
                                            )}
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-bold tracking-tight text-[#14532D]">{plan.name}</h3>
                                            <p className="text-[12px] leading-snug text-[#3F6212]">{plan.tagline}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-end gap-1">
                                        <span className="text-[2.15rem] leading-none font-bold tracking-tight text-[#047857]">
                                            ${copy.perMonth}
                                        </span>
                                        <span className="pb-1 text-sm font-medium text-[#4D7C0F]">/month</span>
                                    </div>
                                    <p className="mt-1 text-[11px] font-medium text-[#3F6212]">
                                        {copy.cadence}
                                        {copy.footnote ? ` · ${copy.footnote}` : ''}
                                    </p>

                                    <Link
                                        href="/auth/login"
                                        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 py-2 text-sm font-bold transition hover:translate-x-0.5 hover:translate-y-0.5 ${
                                            plan.id === 'pro'
                                                ? 'border-[#CA8A04] bg-[#FDE047] text-[#3F6212] shadow-[3px_3px_0_#CA8A04] hover:shadow-[1px_1px_0_#CA8A04]'
                                                : 'border-[#84CC16] bg-white/70 text-[#365314] shadow-[3px_3px_0_#84CC16] hover:shadow-[1px_1px_0_#84CC16]'
                                        }`}
                                    >
                                        {plan.monthly === 0 ? 'Start free' : 'Get this plan'}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>

                                    <p className="mt-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#667068]">
                                        Included
                                    </p>
                                    <ul className="space-y-1.5">
                                        {plan.included.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2.5 text-[13px] leading-snug text-[#14532D]">
                                                <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-white">
                                                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                                                </span>
                                                {feature}
                                            </li>
                                        ))}
                                        {plan.excluded?.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2.5 text-[13px] leading-snug text-[#94A3B8] line-through">
                                                <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#E4E4E7] text-[#71717A]">
                                                    <X className="h-2.5 w-2.5" strokeWidth={3.5} />
                                                </span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </article>
                        );
                    })}
                    </div>
                </div>

                <div className="pricing-trust opacity-0 mt-4 grid shrink-0 grid-cols-2 gap-2.5 md:grid-cols-4">
                    {[
                        {
                            icon: Shield,
                            title: 'No hidden fees',
                            copy: 'The number on the card is the full price. No setup, seats, or usage add-ons later.',
                        },
                        {
                            icon: Heart,
                            title: 'Cancel anytime',
                            copy: 'Monthly stops next cycle. Annual runs to year-end with no lock-in after that.',
                        },
                        {
                            icon: Sparkles,
                            title: 'Same features yearly',
                            copy: 'Annual is 10% off the same Pro or Clinic plan — nothing is stripped out.',
                        },
                        {
                            icon: Leaf,
                            title: 'USD, listed in full',
                            copy: 'Prices are in US dollars. If tax applies, it only appears at checkout.',
                        },
                    ].map((item, index) => {
                        const Icon = item.icon;
                        const skins = [
                            '-rotate-1 border-[#A3E635]/80',
                            'rotate-1 border-[#5EEAD4]/80',
                            '-rotate-1 border-[#FACC15]/80',
                            'rotate-1 border-[#86EFAC]/80',
                        ];
                        return (
                            <div
                                key={item.title}
                                className={`flex items-start gap-2.5 rounded-2xl border-2 bg-white/45 px-3.5 py-3 backdrop-blur-md shadow-[3px_3px_0_rgba(132,204,22,0.35)] ${skins[index]}`}
                            >
                                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#15803D]" strokeWidth={1.8} />
                                <div className="min-w-0">
                                    <p className="text-[13px] font-bold leading-tight text-[#14532D]">{item.title}</p>
                                    <p className="mt-1 text-[11px] leading-snug text-[#3F6212]">{item.copy}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
