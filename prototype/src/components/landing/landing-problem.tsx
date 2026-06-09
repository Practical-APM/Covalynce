"use client";

import { LANDING } from "@/lib/landing-copy";
import { DiagramBeforeAfter } from "@/components/landing/landing-graphics";
import { RevealOnScroll, StickyParallaxColumn } from "@/components/landing/landing-scroll-fx";

export function LandingProblem() {
  return (
    <section
      id="problem"
      className="scroll-mt-20 border-y border-border/70 bg-muted/25 py-16 sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16">
        <StickyParallaxColumn>
          <p className="landing-eyebrow text-foreground/70">{LANDING.problemEyebrow}</p>
          <h2 className="landing-headline mt-3 text-3xl sm:text-4xl">{LANDING.problemTitle}</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            {LANDING.problemLead}
          </p>
        </StickyParallaxColumn>

        <div className="space-y-8">
          <RevealOnScroll>
            <div className="landing-diagram-frame">
              <DiagramBeforeAfter />
            </div>
          </RevealOnScroll>

          <ol className="space-y-6">
            {LANDING.problems.map((item, i) => (
              <RevealOnScroll key={item.title} delay={i * 0.08}>
              <li className="flex gap-4 border-t border-border/60 pt-6 first:border-t-0 first:pt-0">
                <span className="landing-step-num mt-1 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-xl tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </li>
              </RevealOnScroll>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
