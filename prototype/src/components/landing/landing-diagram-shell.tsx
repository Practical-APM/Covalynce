"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function DiagramAnimate({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={cn("w-full", className)}
      initial={reduce ? false : "hidden"}
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function DiagramItem({
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
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Animated horizontal fill bar — triggers when diagram scrolls into view */
export function AnimatedBar({
  width,
  className,
  delay = 0,
}: {
  width: number;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-24px" });
  const reduce = useReducedMotion();

  return (
    <div ref={ref} className="h-full w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className={cn("h-full rounded-full", className)}
        initial={{ width: reduce ? `${width}%` : "0%" }}
        animate={{ width: inView ? `${width}%` : "0%" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/** Pulsing flow dot traveling along a connector */
export function FlowPulse({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <span className={cn("text-muted-foreground", className)} aria-hidden>
        →
      </span>
    );
  }
  return (
    <span className={cn("relative inline-flex w-8 items-center justify-center", className)} aria-hidden>
      <motion.span
        className="absolute size-1.5 rounded-full bg-primary"
        animate={{ x: [-10, 10], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="text-muted-foreground/40">—</span>
    </span>
  );
}
