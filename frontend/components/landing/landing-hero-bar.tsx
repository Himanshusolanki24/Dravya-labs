import { BookOpen, Leaf, Shield, UserRound } from 'lucide-react';

const items = [
    {
        title: 'Prakriti analysis',
        copy: 'Dosha reading from your symptoms and habits',
        icon: UserRound,
        card: '-rotate-1 border-[#A3E635] bg-[#F7FEE7] shadow-[4px_4px_0_#84CC16]',
        iconWrap: 'bg-[#BEF264] text-[#3F6212]',
    },
    {
        title: 'Herb library',
        copy: '500+ plants with rasa, virya, and uses',
        icon: Leaf,
        card: 'rotate-1 border-[#99F6E4] bg-[#F0FDFA] shadow-[4px_4px_0_#14B8A6]',
        iconWrap: 'bg-[#5EEAD4] text-[#0F766E]',
    },
    {
        title: 'Classical sources',
        copy: 'Advice grounded in Ayurvedic texts',
        icon: BookOpen,
        card: '-rotate-1 border-[#FACC15] bg-[#FEFCE8] shadow-[4px_4px_0_#EAB308]',
        iconWrap: 'bg-[#FDE047] text-[#854D0E]',
    },
    {
        title: 'Safety checks',
        copy: 'Flags risky combinations before you act',
        icon: Shield,
        card: 'rotate-1 border-[#86EFAC] bg-[#ECFCCB] shadow-[4px_4px_0_#22C55E]',
        iconWrap: 'bg-[#86EFAC] text-[#14532D]',
    },
];

export default function LandingHeroBar() {
    return (
        <div className="relative z-20 mt-auto w-full shrink-0 px-4 sm:px-6 lg:px-10">
            <div className="hero-feature-bar invisible mx-auto w-full max-w-[92rem]">
                <ul className="hero-feature-bar-inner" role="list">
                    {items.map(({ title, copy, icon: Icon, card, iconWrap }) => (
                        <li key={title} className="hero-feature-item invisible">
                            <div className={`flex h-full min-h-[5.5rem] items-center gap-3 rounded-2xl border-2 px-4 py-3 sm:min-h-[6.25rem] sm:px-4 sm:py-4 ${card}`}>
                                <span className={`hero-feature-icon ${iconWrap}`} aria-hidden>
                                    <Icon strokeWidth={1.6} />
                                </span>
                                <div className="min-w-0 text-left">
                                    <p className="text-[15px] font-bold leading-tight text-[#14532D]">{title}</p>
                                    <p className="hero-feature-copy mt-1 text-[13px] leading-snug text-[#3F6212]">
                                        {copy}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
