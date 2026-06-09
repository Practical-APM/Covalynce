"use client";

import { ArrowRight } from "lucide-react";
import { LANDING } from "@/lib/landing-copy";
import { LandingSection } from "@/components/landing/landing-section";

export function LandingHowItWorks() {
  return (
    <LandingSection
      id="how-it-works"
      eyebrow={LANDING.howEyebrow}
      title={LANDING.howTitle}
      lead={LANDING.howLead}
      align="center"
      className="py-16 sm:py-24"
    >
      <ol className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3 md:gap-6">
        {LANDING.howSteps.map((step, i) => (
          <li key={step.step} className="relative flex flex-col border border-border bg-card p-6 text-left rounded-[var(--radius)]">
            {i < LANDING.howSteps.length - 1 && (
              <ArrowRight
                className="absolute -right-3 top-10 hidden size-5 text-muted-foreground/40 md:block"
                aria-hidden
              />
            )}
            <span className="landing-step-num">{step.step}</span>
            <h3 className="font-display mt-3 text-xl tracking-tight">{step.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            <p className="mt-4 border-t border-border/60 pt-4 text-xs font-medium text-foreground/70">
              {step.outcome}
            </p>
          </li>
        ))}
      </ol>
    </LandingSection>
  );
}
