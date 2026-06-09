"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import "lenis/dist/lenis.css";

/** Lenis default easing — smooth deceleration at end of scroll */
function butterEasing(t: number) {
  return Math.min(1, 1.001 - Math.pow(2, -10 * t));
}

export function LandingSmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.05,
        duration: 1.35,
        easing: butterEasing,
        smoothWheel: true,
        wheelMultiplier: 0.85,
        touchMultiplier: 1.1,
        autoRaf: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
