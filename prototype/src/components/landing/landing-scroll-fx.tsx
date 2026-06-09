"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { type ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

/** Vertical parallax layer — bind to parent scroll progress */
export function ParallaxLayer({
  children,
  className,
  offset = 40,
  progress,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], [0, offset]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

/** Section wrapper with internal scroll-linked transforms */
export function ScrollSection({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode | ((progress: MotionValue<number>) => ReactNode);
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={ref} id={id} className={className}>
      {typeof children === "function" ? children(scrollYProgress) : children}
    </section>
  );
}

/** Fade + rise when entering viewport */
export function RevealOnScroll({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Horizontal drag / scroll strip for feature cards */
export function HorizontalScrollStrip({
  children,
  className,
  label = "Scroll",
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("relative", className)}>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label} →
      </p>
      <motion.div
        className="flex cursor-grab gap-4 overflow-x-auto pb-4 active:cursor-grabbing snap-x snap-mandatory scrollbar-thin"
        drag={reduce ? false : "x"}
        dragConstraints={{ left: -600, right: 0 }}
        dragElastic={0.08}
        whileTap={{ cursor: "grabbing" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Sticky column that parallax-shifts while sibling scrolls */
export function StickyParallaxColumn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 48]);
  const reduce = useReducedMotion();

  return (
    <div ref={ref} className={cn("lg:sticky lg:top-24", className)}>
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}
