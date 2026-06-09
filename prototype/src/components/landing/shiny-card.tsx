"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";
import { springButtery } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ShinyCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  float?: boolean;
  instant?: boolean;
  delay?: number;
} & Omit<HTMLMotionProps<"div">, "children">;

export function ShinyCard({
  children,
  className,
  hover = true,
  float = false,
  instant = false,
  delay = 0,
  ...props
}: ShinyCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={reduce || !instant ? undefined : { opacity: 1, y: 0 }}
      whileInView={
        reduce || instant
          ? undefined
          : { opacity: 1, y: 0, transition: { duration: 0.72, delay, ease: [0.19, 1, 0.22, 1] } }
      }
      viewport={{ once: true, margin: "-48px" }}
      whileHover={
        reduce || !hover ? undefined : { y: -4, transition: springButtery }
      }
      className={cn(
        "card-shine group relative overflow-hidden",
        float && !reduce && "animate-float-gentle",
        className
      )}
      style={{ willChange: hover ? "transform" : undefined }}
      {...props}
    >
      <span className="card-shine-edge pointer-events-none" aria-hidden />
      <span className="card-shine-sweep pointer-events-none" aria-hidden />
      <div className="relative z-1">{children}</div>
    </motion.div>
  );
}
