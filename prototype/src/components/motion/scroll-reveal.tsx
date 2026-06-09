"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";
import { tweenReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "scale";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  once?: boolean;
  amount?: number;
}

function variantsFor(direction: Direction, distance: number): Variants {
  const hidden: Record<string, number> = { opacity: 0 };
  const visible = { opacity: 1, x: 0, y: 0, scale: 1 };

  switch (direction) {
    case "down":
      hidden.y = -distance;
      break;
    case "left":
      hidden.x = distance;
      break;
    case "right":
      hidden.x = -distance;
      break;
    case "scale":
      hidden.scale = 0.97;
      break;
    default:
      hidden.y = distance;
  }

  return {
    hidden,
    visible: {
      ...visible,
      transition: { ...tweenReveal, delay: 0 },
    },
  };
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
  amount = 0.15,
}: ScrollRevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={variantsFor(direction, 24)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: "0px 0px -48px 0px" }}
      transition={{ ...tweenReveal, delay }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
