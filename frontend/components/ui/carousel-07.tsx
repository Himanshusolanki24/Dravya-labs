"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
  type MotionValue,
  type AnimationPlaybackControls,
} from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface Slide {
  image: string;
  title: string;
  description: string;
  badge: string;
}

const defaultSlides: Slide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
    title: "Mountain Trek",
    description: "Scale new heights and embrace the hiker's journey.",
    badge: "Adventure",
  },
  {
    image:
      "https://images.unsplash.com/photo-1432405972615-c3b80d0c3070?auto=format&fit=crop&w=900&q=80",
    title: "River Rafting",
    description: "Feel the adrenaline rush as you navigate the wild rapids.",
    badge: "Extreme",
  },
  {
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
    title: "Forest Walk",
    description: "Deep dive into the silence of the ancient woods.",
    badge: "Nature",
  },
  {
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    title: "Azure Beach",
    description: "Unwind on the crystal clear shores of a tropical paradise.",
    badge: "Paradise",
  },
  {
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
    title: "Spiritual Path",
    description: "Discover inner peace through ancient wisdom.",
    badge: "Serenity",
  },
];

interface CarouselConfig {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  yMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
}

const getCarouselConfig = (width: number): CarouselConfig => {
  if (width < 640) {
    return {
      distanceDivisor: 120,
      velocityDivisor: 500,
      sensitivity: 180,
      xMultiplier: 108,
      yMultiplier: 18,
      rotationMultiplier: 8,
      scaleReduction: 0.05,
    };
  }
  if (width < 1024) {
    return {
      distanceDivisor: 160,
      velocityDivisor: 650,
      sensitivity: 220,
      xMultiplier: 168,
      yMultiplier: 26,
      rotationMultiplier: 10,
      scaleReduction: 0.07,
    };
  }
  return {
    distanceDivisor: 200,
    velocityDivisor: 800,
    sensitivity: 250,
    xMultiplier: 230,
    yMultiplier: 32,
    rotationMultiplier: 11,
    scaleReduction: 0.08,
  };
};

interface CarouselStackedProps {
  slides?: Slide[];
  className?: string;
  autoplay?: boolean;
}

const CarouselStacked = ({
  slides = defaultSlides,
  className,
  autoplay = true,
}: CarouselStackedProps) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const scrollProgress = useMotionValue(0);
  const startProgress = React.useRef(0);
  const pausedRef = React.useRef(false);
  const inViewRef = React.useRef(true);
  const [windowWidth, setWindowWidth] = React.useState(0);

  const total = slides.length;

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!autoplay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let controls: AnimationPlaybackControls | undefined;
    let cancelled = false;

    const loop = async () => {
      while (!cancelled) {
        if (pausedRef.current || !inViewRef.current || document.hidden) {
          await new Promise((resolve) => setTimeout(resolve, 240));
          continue;
        }

        const next = Math.round(scrollProgress.get()) + 1;
        controls = animate(scrollProgress, next, {
          type: "spring",
          stiffness: 70,
          damping: 22,
          mass: 1.05,
        });

        try {
          await controls.finished;
        } catch {
          // animation interrupted by drag
        }

        if (cancelled) break;
        await new Promise((resolve) => setTimeout(resolve, 2400));
      }
    };

    void loop();

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [autoplay, scrollProgress]);

  const config = React.useMemo(
    () => getCarouselConfig(windowWidth),
    [windowWidth],
  );

  const handleDragStart = () => {
    pausedRef.current = true;
    startProgress.current = scrollProgress.get();
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const dragDistance = info.offset.x;
    const velocity = info.velocity.x;

    const distanceShift = -dragDistance / config.distanceDivisor;
    const velocityShift = -velocity / config.velocityDivisor;

    let totalShift = Math.round(distanceShift + velocityShift);
    totalShift = Math.max(-3, Math.min(3, totalShift));

    const target = Math.round(startProgress.current) + totalShift;

    animate(scrollProgress, target, {
      type: "spring",
      stiffness: 200,
      damping: 30,
      mass: 1,
    });

    window.setTimeout(() => {
      pausedRef.current = false;
    }, 1800);
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex h-full min-h-0 w-full flex-col items-center justify-center overflow-visible bg-transparent py-0 select-none",
        className,
      )}
    >
      <div className="relative flex h-full min-h-0 w-full items-center justify-center overflow-visible">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDrag={(_, info) => {
            const delta = -info.delta.x / config.sensitivity;
            scrollProgress.set(scrollProgress.get() + delta);
          }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
        />

        {slides.map((slide, i) => (
          <Card
            key={`${slide.title}-${i}`}
            slide={slide}
            index={i}
            total={total}
            progress={scrollProgress}
            config={config}
          />
        ))}
      </div>
    </div>
  );
};

interface CardProps {
  slide: Slide;
  index: number;
  total: number;
  progress: MotionValue<number>;
  config: CarouselConfig;
}

const Card = ({ slide, index, total, progress, config }: CardProps) => {
  const offset = useTransform(progress, (p) => {
    let diff = (index - p) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });

  const x = useTransform(offset, (o) => o * config.xMultiplier);
  const rotate = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return o * config.rotationMultiplier;
  });
  const y = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return absO * config.yMultiplier;
  });
  const scale = useTransform(
    offset,
    (o) => 1 - Math.abs(o) * config.scaleReduction,
  );
  const opacity = useTransform(
    offset,
    [-total / 2, -total / 2 + 0.5, 0, total / 2 - 0.5, total / 2],
    [0, 1, 1, 1, 0],
  );
  const zIndex = useTransform(offset, (o) =>
    Math.round(100 - Math.abs(o) * 10),
  );
  const overlayOpacity = useTransform(
    offset,
    [-2, -0.5, 0, 0.5, 2],
    [0.5, 0.2, 0, 0.2, 0.5],
  );
  const captionOpacity = useTransform(offset, [-0.5, 0, 0.5], [0, 1, 0]);

  return (
    <motion.div
      style={{
        x,
        rotate,
        y,
        scale,
        opacity,
        zIndex,
      }}
      className={cn(
        "absolute overflow-hidden rounded-2xl bg-muted group pointer-events-none",
        "h-[86%] max-h-[34rem] w-[min(72vw,16.5rem)] sm:w-[min(40vw,20rem)] lg:w-[min(24vw,22.5rem)]",
      )}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <motion.div
        style={{ opacity: overlayOpacity }}
        className="pointer-events-none absolute inset-0 bg-black"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      <Badge className="absolute top-3 right-3 rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold tracking-widest text-black uppercase backdrop-blur-md sm:top-5 sm:right-5 sm:px-3 sm:py-1 lg:top-6 lg:right-6">
        {slide.badge}
      </Badge>

      <div className="absolute right-3 bottom-5 left-3 text-center text-white sm:right-5 sm:bottom-8 sm:left-5 sm:text-left lg:right-6 lg:bottom-10 lg:left-6">
        <motion.p
          style={{ opacity: captionOpacity }}
          className="mb-0.5 text-sm leading-tight font-bold drop-shadow-md sm:mb-1 sm:text-lg lg:text-xl"
        >
          {slide.title}
        </motion.p>
        <motion.p
          style={{ opacity: captionOpacity }}
          className="hidden text-xs font-medium text-white/70 italic sm:line-clamp-2"
        >
          {slide.description}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default CarouselStacked;
