"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LandingParallax({
  children,
  className,
  offset = 48,
  scaleRange = [0.97, 1] as [number, number],
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
  scaleRange?: [number, number];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yRaw = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const scaleRaw = useTransform(scrollYProgress, [0, 0.5, 1], [scaleRange[0], 1, scaleRange[1]]);
  const opacityRaw = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0.72, 1, 1, 0.9]);

  const y = useSpring(yRaw, { stiffness: 90, damping: 28, mass: 0.85 });
  const scale = useSpring(scaleRaw, { stiffness: 90, damping: 28, mass: 0.85 });
  const opacity = useSpring(opacityRaw, { stiffness: 90, damping: 28, mass: 0.85 });

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div style={{ y, scale, opacity }} className="origin-center will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
