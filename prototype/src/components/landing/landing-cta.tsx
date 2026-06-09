"use client";

import { ArrowRight } from "lucide-react";
import { LandingButton, LandingTextLink } from "@/components/landing/landing-button";
import { LANDING } from "@/lib/landing-copy";

export function LandingCta() {
  return (
    <section
      data-surface="section-ink"
      className="border-t border-border/70 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="font-display text-4xl tracking-tight text-balance sm:text-5xl text-foreground">
          {LANDING.ctaTitle}
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-foreground/70">
          {LANDING.ctaLead}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <LandingButton href="/onboarding" variant="ink">
            {LANDING.ctaPrimary}
            <ArrowRight className="size-4" />
          </LandingButton>
          <LandingTextLink
            href="/dashboard"
            className="text-sm font-semibold text-foreground/75 hover:text-foreground hover:underline"
          >
            {LANDING.ctaSecondary}
          </LandingTextLink>
        </div>

        <LandingTextLink
          href="/editions"
          className="mx-auto mt-8 block text-xs font-medium text-foreground/60 hover:text-foreground/90"
        >
          {LANDING.ctaEnterprise} →
        </LandingTextLink>
      </div>
    </section>
  );
}

