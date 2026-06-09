"use client";

import { LANDING, LANDING_PILLARS } from "@/lib/landing-copy";

const accentBorder = {
  primary: "border-foreground/20",
  violet: "border-chart-3/35",
  gold: "border-chart-4/40",
};

export function LandingPillars() {
  return (
    <section className="border-b border-border/70 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="landing-eyebrow text-foreground/70">{LANDING.pillarsEyebrow}</p>
          <h2 className="landing-headline mt-3">{LANDING.pillarsTitle}</h2>
          <p className="landing-subhead mx-auto">{LANDING.pillarsLead}</p>
        </header>

        <ol className="relative mt-14 space-y-0">
          <div
            className="absolute left-4 top-6 hidden h-[calc(100%-3rem)] w-px bg-border/80 sm:left-1/2 sm:block sm:-translate-x-px"
            aria-hidden
          />
          {LANDING_PILLARS.map((pillar, i) => {
            const flip = i % 2 === 1;
            return (
              <li
                key={pillar.title}
                className="relative grid gap-6 pb-12 last:pb-0 sm:grid-cols-2 sm:gap-12 sm:pb-16"
              >
                <span
                  className="absolute left-4 top-1 hidden size-2 -translate-x-1/2 rounded-full bg-foreground sm:left-1/2 sm:block"
                  aria-hidden
                />
                <div className={flip ? "sm:order-2 sm:pl-8" : "sm:pr-8 sm:text-right"}>
                  <span className="landing-step-num">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display mt-2 text-2xl tracking-tight sm:text-3xl">{pillar.title}</h3>
                </div>
                <div
                  className={`rounded-xl border bg-card p-6 sm:p-7 ${accentBorder[pillar.color]} ${
                    flip ? "sm:order-1 sm:mr-8" : "sm:ml-8"
                  }`}
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
                  <p className="mt-4 text-sm font-medium text-foreground/85">{pillar.outcome}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
