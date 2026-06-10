"use client";

import { LANDING } from "@/lib/landing-copy";
import { LandingSection } from "@/components/landing/landing-section";
import { RevealOnScroll } from "@/components/landing/landing-scroll-fx";

export function LandingHowItWorks() {
  return (
    <LandingSection
      id="how-it-works"
      index="§ 03"
      eyebrow={LANDING.howEyebrow}
      title={LANDING.howTitle}
      lead={LANDING.howLead}
      className="py-20 sm:py-28"
    >
      <ol className="grid border-t-2 border-foreground/80 md:grid-cols-3">
        {LANDING.howSteps.map((step, i) => (
          <RevealOnScroll key={step.step} delay={i * 0.1}>
            <li className="flex h-full flex-col border-b border-border py-8 md:border-b-0 md:pr-10 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-border md:[&:not(:first-child)]:pl-10">
              <span className="ledger-index text-base">{step.step}</span>
              <h3 className="font-display mt-4 text-2xl tracking-tight">{step.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
              <p className="mt-6 font-mono text-[11px] leading-relaxed tracking-tight text-foreground/70">
                {step.outcome}
              </p>
            </li>
          </RevealOnScroll>
        ))}
      </ol>
    </LandingSection>
  );
}
