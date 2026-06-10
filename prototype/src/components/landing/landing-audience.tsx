"use client";

import { LANDING, LANDING_AUDIENCE } from "@/lib/landing-copy";
import { LandingSection } from "@/components/landing/landing-section";
import { RevealOnScroll } from "@/components/landing/landing-scroll-fx";

export function LandingAudience() {
  return (
    <LandingSection
      id="audience"
      index="§ 06"
      eyebrow={LANDING.audienceEyebrow}
      title={LANDING.audienceTitle}
      lead={LANDING.audienceLead}
      border="top"
    >
      <div className="grid border-t-2 border-foreground/80 md:grid-cols-3">
        {LANDING_AUDIENCE.map((persona, i) => (
          <RevealOnScroll key={persona.role} delay={i * 0.1}>
            <article className="flex h-full flex-col border-b border-border py-8 md:border-b-0 md:pr-10 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-border md:[&:not(:first-child)]:pl-10">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {persona.role}
              </p>
              <h3 className="font-display mt-4 flex-1 text-2xl leading-snug tracking-tight text-foreground">
                &ldquo;{persona.question}&rdquo;
              </h3>
              <p className="mt-6 border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
                {persona.outcome}
              </p>
            </article>
          </RevealOnScroll>
        ))}
      </div>
    </LandingSection>
  );
}
