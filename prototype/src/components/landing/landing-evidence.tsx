"use client";

import { LANDING } from "@/lib/landing-copy";
import { LandingSection } from "@/components/landing/landing-section";

export function LandingEvidence() {
  return (
    <LandingSection
      eyebrow={LANDING.evidenceEyebrow}
      title={LANDING.evidenceTitle}
      lead={LANDING.evidenceLead}
      border="y"
      className="bg-muted/20 py-16 sm:py-20"
    >
      <dl className="grid gap-8 sm:grid-cols-3 sm:gap-6">
        {LANDING.evidenceItems.map((item) => (
          <div key={item.label} className="border-t border-border/70 pt-6 sm:border-t-0 sm:pt-0 sm:text-center">
            <dt className="flex items-baseline gap-1 sm:justify-center">
              <span className="landing-stat-value">{item.stat}</span>
              {item.unit && (
                <span className="text-sm font-medium text-muted-foreground">{item.unit}</span>
              )}
            </dt>
            <dd className="landing-stat-label sm:mx-auto sm:max-w-[14rem]">{item.label}</dd>
          </div>
        ))}
      </dl>
    </LandingSection>
  );
}
