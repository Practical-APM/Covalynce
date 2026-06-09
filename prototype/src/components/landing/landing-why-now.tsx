"use client";

import { LANDING, YC_ONE_LINER } from "@/lib/landing-copy";
import { LandingSection } from "@/components/landing/landing-section";

export function LandingWhyNow() {
  return (
    <LandingSection
      id="why-now"
      eyebrow={LANDING.whyNowEyebrow}
      title={LANDING.whyNowTitle}
      lead={LANDING.whyNowLead}
      align="left"
      className="py-16 sm:py-24"
    >
      <blockquote className="mb-10 max-w-3xl border-l-2 border-primary pl-5 text-base leading-relaxed text-foreground/90 sm:text-lg">
        {YC_ONE_LINER}
      </blockquote>

      <ol className="grid gap-6 md:grid-cols-3">
        {LANDING.whyNowPoints.map((point, i) => (
          <li
            key={point.title}
            className="border border-border bg-card p-6 rounded-[var(--radius)]"
          >
            <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 font-display text-xl tracking-tight">{point.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.body}</p>
          </li>
        ))}
      </ol>
    </LandingSection>
  );
}
