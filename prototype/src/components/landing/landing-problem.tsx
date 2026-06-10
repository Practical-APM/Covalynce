"use client";

import { LANDING } from "@/lib/landing-copy";
import { DiagramBeforeAfter } from "@/components/landing/landing-graphics";
import { RevealOnScroll, StickyParallaxColumn } from "@/components/landing/landing-scroll-fx";

export function LandingProblem() {
  return (
    <section id="problem" className="scroll-mt-20 border-b border-border/70 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-baseline gap-4">
          <span className="ledger-index">§ 01</span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {LANDING.problemEyebrow}
          </span>
          <span aria-hidden className="h-px flex-1 self-center bg-border" />
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16">
          <StickyParallaxColumn>
            <h2 className="landing-headline">{LANDING.problemTitle}</h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {LANDING.problemLead}
            </p>
          </StickyParallaxColumn>

          <div>
            <RevealOnScroll>
              <div className="border border-border bg-card p-5 sm:p-6">
                <DiagramBeforeAfter />
              </div>
            </RevealOnScroll>

            <ol className="mt-10">
              {LANDING.problems.map((item, i) => (
                <RevealOnScroll key={item.title} delay={i * 0.08}>
                  <li className="grid grid-cols-[3rem_1fr] gap-x-2 border-t border-border py-6 first:border-t-2 first:border-t-foreground/80">
                    <span className="ledger-index pt-1.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-xl tracking-tight">{item.title}</h3>
                      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </li>
                </RevealOnScroll>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
