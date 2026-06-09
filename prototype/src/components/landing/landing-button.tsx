"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { springButtery } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function LandingButton({
  href,
  children,
  className,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "metallic" | "ink";
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      transition={springButtery}
    >
      <Link
        href={href}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 overflow-hidden px-6 py-2.5 text-sm font-semibold transition-[background,opacity] duration-200 rounded-[var(--radius)]",
          variant === "primary" && "bg-primary text-primary-foreground border border-primary hover:opacity-92",
          variant === "metallic" && "bg-card text-foreground border border-border hover:bg-muted/50",
          variant === "ink" && "bg-primary text-primary-foreground border border-primary hover:opacity-90",
          variant === "secondary" && "bg-card border border-border text-foreground hover:bg-muted/50",
          className
        )}
      >
        <span className="relative z-1 flex items-center gap-1.5">{children}</span>
      </Link>
    </motion.div>
  );
}

export function LandingTextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline",
        className
      )}
    >
      {children}
    </Link>
  );
}
