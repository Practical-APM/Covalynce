"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Official Covalynce mark — from covalynce.com (converging paths + center node) */
export function CovalynceMarkSvg({
  className,
  animated = false,
  variant = "adaptive",
}: {
  className?: string;
  animated?: boolean;
  /**
   * adaptive — obsidian on light surfaces, neon on dark (default)
   * tile — obsidian square + neon mark (favicon-style, always readable)
   * neon — force neon strokes (for obsidian/dark UI chips)
   */
  variant?: "adaptive" | "tile" | "neon";
}) {
  const reduce = useReducedMotion();
  const motion = animated && !reduce;
  const stroke = variant === "neon" ? "var(--brand-neon)" : "var(--brand-mark)";
  const dotFill = variant === "neon" ? "var(--brand-neon)" : "var(--brand-mark-dot)";

  const paths = (
    <>
      <g>
        <path
          d="M20 30 H65 V50"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        >
          {motion && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -3; 0 0"
              dur="4s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>
      <g>
        <path
          d="M80 70 H35 V50"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        >
          {motion && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 3; 0 0"
              dur="4s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>
      <circle cx="50" cy="50" r="5" fill={dotFill}>
        {motion && (
          <>
            <animate attributeName="r" values="5;6.5;5" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.65;1" dur="4s" repeatCount="indefinite" />
          </>
        )}
      </circle>
    </>
  );

  if (variant === "tile") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        className={cn("rounded-[var(--radius)] text-[var(--brand-neon)]", className)}
        aria-hidden
      >
        <rect width="100" height="100" rx="8" fill="var(--brand-obsidian)" />
        <g stroke="var(--brand-neon)">
          <path
            d="M20 30 H65 V50"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="square"
            strokeLinejoin="miter"
            fill="none"
          />
          <path
            d="M80 70 H35 V50"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="square"
            strokeLinejoin="miter"
            fill="none"
          />
          <circle cx="50" cy="50" r="5" fill="currentColor" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" fill="none" className={cn("shrink-0", className)} aria-hidden>
      {paths}
    </svg>
  );
}
