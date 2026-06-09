"use client";

import { Building2, Code2, LineChart } from "lucide-react";
import { LANDING, LANDING_AUDIENCE, YC_ONE_LINER } from "@/lib/landing-copy";
import { LandingSection } from "@/components/landing/landing-section";

const icons = {
  finance: LineChart,
  platform: Code2,
  engineering: Building2,
} as const;

export function LandingAudience() {
  return (
    <LandingSection
      id="audience"
      eyebrow={LANDING.audienceEyebrow}
      title={LANDING.audienceTitle}
      lead={LANDING.audienceLead}
      align="left"
      border="top"
      className="bg-card/30 py-16 sm:py-24"
    >
      <blockquote className="mb-10 max-w-3xl border-l-2 border-[var(--brand-neon)]/60 pl-5 text-sm leading-relaxed text-foreground/85 sm:text-base">
        {YC_ONE_LINER}
      </blockquote>

      <div className="grid gap-5 md:grid-cols-3">
        {LANDING_AUDIENCE.map((persona) => {
          const Icon = icons[persona.icon];
          return (
            <article
              key={persona.role}
              className="flex flex-col border border-border bg-card p-6 sm:p-7 rounded-[var(--radius)]"
            >
              <div className="flex size-10 items-center justify-center border border-border bg-background">
                <Icon className="size-4 text-[var(--brand-neon)]" strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {persona.role}
              </p>
              <h3 className="mt-2 font-display text-lg tracking-tight text-foreground">
                &ldquo;{persona.question}&rdquo;
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {persona.outcome}
              </p>
            </article>
          );
        })}
      </div>
    </LandingSection>
  );
}
