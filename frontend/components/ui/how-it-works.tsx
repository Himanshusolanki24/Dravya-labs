"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "motion/react";

type ColorTheme = "orange" | "blue" | "purple" | "lime" | "mint" | "spring" | "emerald" | "leaf";

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: ColorTheme;
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

const PALETTES: Record<
  ColorTheme,
  { shell: string; bg: string; text: string; border: string; title: string; body: string }
> = {
  lime: {
    shell: "border-[#BEF264] bg-[#F7FEE7] shadow-[0_14px_32px_rgba(163,230,53,0.35)]",
    bg: "bg-[#D9F99D]",
    text: "text-[#3F6212]",
    border: "border-[#A3E635]",
    title: "text-[#1A2E05]",
    body: "text-[#3F6212]",
  },
  mint: {
    shell: "border-[#5EEAD4] bg-[#F0FDFA] shadow-[0_14px_32px_rgba(45,212,191,0.32)]",
    bg: "bg-[#99F6E4]",
    text: "text-[#0F766E]",
    border: "border-[#2DD4BF]",
    title: "text-[#134E4A]",
    body: "text-[#0F766E]",
  },
  spring: {
    shell: "border-[#86EFAC] bg-[#F0FDF4] shadow-[0_14px_32px_rgba(74,222,128,0.32)]",
    bg: "bg-[#BBF7D0]",
    text: "text-[#15803D]",
    border: "border-[#4ADE80]",
    title: "text-[#14532D]",
    body: "text-[#166534]",
  },
  emerald: {
    shell: "border-[#34D399] bg-[#ECFDF5] shadow-[0_14px_32px_rgba(16,185,129,0.3)]",
    bg: "bg-[#6EE7B7]",
    text: "text-[#047857]",
    border: "border-[#10B981]",
    title: "text-[#064E3B]",
    body: "text-[#065F46]",
  },
  leaf: {
    shell: "border-[#A3E635] bg-[#ECFCCB] shadow-[0_14px_32px_rgba(132,204,22,0.32)]",
    bg: "bg-[#BEF264]",
    text: "text-[#3F6212]",
    border: "border-[#84CC16]",
    title: "text-[#1A2E05]",
    body: "text-[#365314]",
  },
  orange: {
    shell: "border-[#86EFAC] bg-[#F0FDF4] shadow-[0_14px_32px_rgba(74,222,128,0.32)]",
    bg: "bg-[#BBF7D0]",
    text: "text-[#15803D]",
    border: "border-[#4ADE80]",
    title: "text-[#14532D]",
    body: "text-[#166534]",
  },
  blue: {
    shell: "border-[#5EEAD4] bg-[#F0FDFA] shadow-[0_14px_32px_rgba(45,212,191,0.32)]",
    bg: "bg-[#99F6E4]",
    text: "text-[#0F766E]",
    border: "border-[#2DD4BF]",
    title: "text-[#134E4A]",
    body: "text-[#0F766E]",
  },
  purple: {
    shell: "border-[#BEF264] bg-[#F7FEE7] shadow-[0_14px_32px_rgba(163,230,53,0.35)]",
    bg: "bg-[#D9F99D]",
    text: "text-[#3F6212]",
    border: "border-[#A3E635]",
    title: "text-[#1A2E05]",
    body: "text-[#3F6212]",
  },
};

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({
  number,
  title,
  description,
  colorTheme = "blue",
  className,
  rotate,
  colors: customColors,
}: CardProps) => {
  const palette = PALETTES[colorTheme] ?? PALETTES.spring;
  const bgColor = customColors?.bg || palette.bg;
  const textColor = customColors?.text || palette.text;
  const borderColor = customColors?.border || palette.border;

  return (
    <div
      className={`how-step relative w-full md:w-[280px] transition-transform duration-300 hover:z-30 hover:scale-105 ${rotate ?? ""} max-md:!rotate-0 ${className ?? ""}`}
    >
      <div className={`rounded-[25px] border p-2 ${palette.shell}`}>
        <Pin className={`mx-auto mb-6 h-8 w-8 ${textColor} z-20`} />
        <div
          className={`${bgColor} border ${borderColor} relative flex h-full flex-col overflow-hidden rounded-[15px] p-[15px]`}
        >
          <span
            className={`${textColor} font-handwriting mb-5 text-4xl`}
            style={{
              fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
            }}
          >
            {number}
          </span>
          <h3 className={`mb-[10px] text-2xl leading-none font-semibold ${palette.title}`}>
            {title}
          </h3>
          <p className={`text-sm/5 tracking-tight ${palette.body}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export interface Step {
  title: string;
  description: string;
  colorTheme?: ColorTheme;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[15%]", rotate: "rotate-8" },
  {
    className: "md:absolute md:top-[120px] md:right-[15%]",
    rotate: "-rotate-8",
  },
  { className: "md:absolute md:top-[450px] md:left-[15%]", rotate: "rotate-8" },
  {
    className: "md:absolute md:top-[570px] md:right-[10%]",
    rotate: "-rotate-8",
  },
  { className: "md:absolute md:top-[850px] md:left-[15%]", rotate: "rotate-8" },
];

export default function HowItWorks({
  features,
  className,
  stepPositions,
}: HowItWorksProps) {
  const defaultFeatures: Step[] = [
    {
      title: "Create Account",
      description:
        "Sign up in minutes. Enter your details and verify your email to get started.",
      colorTheme: "orange",
    },
    {
      title: "Verify Identity",
      description:
        "Complete your profile verification to ensure secure transactions and compliance.",
      colorTheme: "blue",
    },
    {
      title: "Select Plan",
      description:
        "Choose from a variety of investment plans tailored to your financial goals.",
      colorTheme: "purple",
    },
    {
      title: "Analyze & Invest",
      description:
        "Review returns and make your first investment with confidence.",
      colorTheme: "orange",
    },
    {
      title: "Track Growth",
      description:
        "Monitor your portfolio in real-time and watch your wealth grow over time.",
      colorTheme: "blue",
    },
  ];

  const data = features && features.length > 0 ? features : defaultFeatures;
  const positions = stepPositions || DEFAULT_CARD_POSITIONS;

  let height = 1130;
  if (data.length === 1) height = 400;
  else if (data.length === 2) height = 450;
  else if (data.length === 3) height = 800;
  else if (data.length === 4) height = 900;
  else height = 1130;

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={`how-it-works-root relative bg-transparent max-md:pt-2 max-md:pb-2 md:py-20 px-8 ${className ?? ""}`}
      >
        <div className="relative z-10 mx-auto max-w-6xl">
          <div
            className="relative w-full max-w-[1000px] mx-auto flex flex-col space-y-4 md:space-y-0 md:block h-auto md:h-[var(--md-height)] max-md:grid max-md:grid-cols-1 min-[480px]:max-md:grid-cols-2 max-md:gap-3 max-md:space-y-0"
            style={{ "--md-height": `${height}px` } as React.CSSProperties}
          >
            {data.length > 1 && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block z-0"
                viewBox={`0 0 1000 ${height}`}
                preserveAspectRatio="none"
              >
                {(() => {
                  const pathD = data.reduce((acc, _, index) => {
                    if (index >= data.length - 1) return acc;
                    if (index === 0)
                      return "M 290 150 C 500 150, 550 270, 710 270";
                    if (index === 1)
                      return acc + " C 850 270, 500 350, 290 450";
                    if (index === 2)
                      return acc + " C 290 600, 550 720, 750 720";
                    if (index === 3)
                      return acc + " C 950 720, 500 800, 290 850";
                    return acc;
                  }, "");
                  return (
                    <m.path
                      d={pathD}
                      stroke="currentColor"
                      className="text-[#1F7A45]/35"
                      strokeWidth="2"
                      strokeDasharray="8 6"
                      fill="none"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{
                        strokeDashoffset: -140,
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  );
                })()}
              </svg>
            )}

            {data.map((step, index) => {
              const position = positions[index % positions.length];

              return (
                <Card
                  key={step.title}
                  number={`0${index + 1}`}
                  title={step.title}
                  description={step.description}
                  colorTheme={step.colorTheme || "blue"}
                  colors={step.colors}
                  rotate={position.rotate}
                  className={position.className}
                />
              );
            })}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
