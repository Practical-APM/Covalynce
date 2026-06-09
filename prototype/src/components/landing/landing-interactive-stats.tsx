"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LANDING } from "@/lib/landing-copy";
import { cn } from "@/lib/utils";

function AnimatedStat({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const numeric = value.match(/^(\$?)(\d+(?:\.\d+)?)(.*)$/);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || !numeric || reduce) return;
    const [, prefix = "", numStr, suffix = ""] = numeric;
    const target = parseFloat(numStr);
    const isFloat = numStr.includes(".");
    let frame = 0;
    const total = 36;
    const id = requestAnimationFrame(function tick() {
      frame++;
      const t = frame / total;
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      setDisplay(
        `${prefix}${isFloat ? current.toFixed(1) : Math.round(current)}${suffix}`
      );
      if (frame < total) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [inView, numeric, reduce, value]);

  return (
    <div ref={ref} className="py-3 sm:py-0 px-4">
      <dt
        className={cn(
          "font-display text-3xl font-normal tabular-nums",
          accent ? "landing-stat-value-accent" : "landing-stat-value"
        )}
      >
        {inView && numeric && !reduce ? display : value}
      </dt>
      <dd className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dd>
    </div>
  );
}

export function LandingInteractiveStats() {
  return (
    <motion.dl
      className="mx-auto mt-12 grid max-w-3xl grid-cols-1 divide-y divide-border/60 border-y border-border/60 py-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {LANDING.heroStats.map((s, i) => (
        <AnimatedStat key={s.label} value={s.value} label={s.label} accent={i === 0} />
      ))}
    </motion.dl>
  );
}
