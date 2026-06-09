"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatedProductPreview } from "@/components/landing/animated-product-preview";
import { LandingButton, LandingTextLink } from "@/components/landing/landing-button";
import { LandingInteractiveStats } from "@/components/landing/landing-interactive-stats";
import { LANDING } from "@/lib/landing-copy";

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const previewY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const previewScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const previewOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.65]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -24]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 22 });
  const tiltX = useTransform(springY, [-0.5, 0.5], [4, -4]);
  const tiltY = useTransform(springX, [-0.5, 0.5], [-4, 4]);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onPointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-border/70 bg-background py-16 sm:py-24 lg:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-0 h-[480px] w-[480px] rounded-full landing-ambient-neon blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-[400px] w-[400px] rounded-full landing-ambient-neon opacity-60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 text-center">
        <motion.div
          className="mx-auto max-w-4xl"
          style={reduce ? undefined : { y: headlineY }}
        >
          <span className="landing-eyebrow-badge inline-flex items-center border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
            {LANDING.eyebrow}
          </span>
          <h1 className="landing-headline mt-6 text-4xl sm:text-[3.25rem] md:text-[4.25rem] leading-[1.02] tracking-tight">
            {LANDING.headline}{" "}
            <span className="landing-headline-accent block mt-2">{LANDING.headlineAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground text-balance">
            {LANDING.subhead}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <LandingButton href="/onboarding">
              {LANDING.ctaPrimary}
              <ArrowRight className="size-4" />
            </LandingButton>
            <LandingTextLink href="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              {LANDING.ctaSecondary}
            </LandingTextLink>
          </div>

          <LandingInteractiveStats />
        </motion.div>

        <motion.div
          ref={previewRef}
          className="mx-auto mt-16 max-w-5xl landing-panel p-1 sm:p-2"
          style={
            reduce
              ? undefined
              : {
                  y: previewY,
                  scale: previewScale,
                  opacity: previewOpacity,
                  rotateX: tiltX,
                  rotateY: tiltY,
                  transformPerspective: 1200,
                }
          }
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <AnimatedProductPreview size="large" />
        </motion.div>
      </div>
    </section>
  );
}
