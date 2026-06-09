"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CAPABILITIES, LANDING } from "@/lib/landing-copy";
import { DiagramByType } from "@/components/landing/explainer-diagrams";
import { cn } from "@/lib/utils";

export function LandingPlatformScroll() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const cap = CAPABILITIES[active];

  return (
    <section id="platform" className="scroll-mt-20 border-t border-border/70 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="max-w-2xl">
          <p className="landing-eyebrow text-foreground/70">Platform</p>
          <h2 className="landing-headline mt-3 text-3xl sm:text-4xl leading-tight">
            {LANDING.capabilitiesTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {LANDING.capabilitiesLead}
          </p>
        </header>

        {/* Desktop: selected detail + horizontal picker */}
        <div className="mt-10 hidden lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <motion.div
            key={cap.title}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex min-h-[360px] flex-col justify-between rounded-[var(--radius)] border border-border bg-card p-8"
          >
            <div>
              <h3 className="font-display text-2xl tracking-tight">{cap.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{cap.body}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">{cap.outcome}</p>
            </div>
            <div className="mt-8 flex min-h-[200px] items-center justify-center rounded-[var(--radius)] border border-border/60 bg-background/50 p-6">
              <DiagramByType type={cap.diagram} />
            </div>
          </motion.div>

          <div className="flex flex-col gap-2">
            {CAPABILITIES.map((c, i) => (
              <button
                key={c.title}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "rounded-[var(--radius)] border px-5 py-4 text-left transition-colors",
                  active === i
                    ? "border-[var(--brand-neon)]/40 bg-[var(--brand-neon)]/5"
                    : "border-border bg-card hover:border-border/80"
                )}
              >
                <span className="font-medium">{c.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground line-clamp-1">
                  {c.outcome}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile / tablet: large horizontal scroll cards */}
        <div className="mt-10 lg:hidden">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Swipe to explore →
          </p>
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 -mx-5 px-5 sm:-mx-8 sm:px-8">
            {CAPABILITIES.map((c, i) => (
              <motion.article
                key={c.title}
                className="w-[min(92vw,440px)] shrink-0 snap-center rounded-[var(--radius)] border border-border bg-card p-7 sm:p-8"
                whileHover={reduce ? undefined : { y: -4 }}
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} / {String(CAPABILITIES.length).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-xl tracking-tight sm:text-2xl">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                <div className="mt-6 flex min-h-[180px] items-center justify-center rounded-[var(--radius)] border border-border/60 bg-background/50 p-5">
                  <DiagramByType type={c.diagram} />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
