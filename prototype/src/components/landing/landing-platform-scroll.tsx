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
    <section
      id="platform"
      className="scroll-mt-20 border-t border-border/70 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="mb-12 sm:mb-16">
          <div className="flex items-baseline gap-4">
            <span className="ledger-index">§ 04</span>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Platform
            </span>
            <span aria-hidden className="h-px flex-1 self-center bg-border" />
          </div>
          <h2 className="landing-headline mt-6 max-w-3xl">{LANDING.capabilitiesTitle}</h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {LANDING.capabilitiesLead}
          </p>
        </header>

        {/* Desktop: ruled selector rail + pinned detail */}
        <div className="hidden lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div role="tablist" aria-label="Capabilities" className="border-t-2 border-foreground/80">
            {CAPABILITIES.map((c, i) => (
              <button
                key={c.title}
                type="button"
                role="tab"
                aria-selected={active === i}
                onClick={() => setActive(i)}
                className={cn(
                  "grid w-full grid-cols-[3rem_1fr] gap-x-2 border-b border-border py-5 pr-4 text-left transition-colors",
                  active === i ? "bg-accent" : "hover:bg-muted/50"
                )}
              >
                <span
                  className={cn(
                    "pt-0.5 font-mono text-[11px] font-semibold tracking-[0.12em]",
                    active === i ? "ledger-index" : "text-muted-foreground"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className={cn("font-display text-lg tracking-tight", active === i ? "text-foreground" : "text-foreground/80")}>
                    {c.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {c.outcome}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <motion.div
            key={cap.title}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col border border-border bg-card"
          >
            <div className="flex items-center justify-between border-b border-border/70 px-6 py-3">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {cap.title}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {String(active + 1).padStart(2, "0")} / {String(CAPABILITIES.length).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-1 items-center justify-center p-10">
              <DiagramByType type={cap.diagram} />
            </div>
            <p className="border-t border-border/70 px-6 py-4 text-sm leading-relaxed text-muted-foreground">
              {cap.body}
            </p>
          </motion.div>
        </div>

        {/* Mobile / tablet: horizontal swipe, ruled plates */}
        <div className="lg:hidden">
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Swipe to explore →
          </p>
          <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8">
            {CAPABILITIES.map((c, i) => (
              <article
                key={c.title}
                className="w-[min(92vw,440px)] shrink-0 snap-center border border-border bg-card p-7 sm:p-8"
              >
                <span className="ledger-index">
                  {String(i + 1).padStart(2, "0")} / {String(CAPABILITIES.length).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-3 text-xl tracking-tight sm:text-2xl">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                <div className="mt-6 flex min-h-[180px] items-center justify-center border-t border-border/70 pt-6">
                  <DiagramByType type={c.diagram} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
