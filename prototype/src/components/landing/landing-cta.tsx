"use client";

import { ArrowRight } from "lucide-react";
import { LandingButton, LandingTextLink } from "@/components/landing/landing-button";
import { LANDING } from "@/lib/landing-copy";

export function LandingCta() {
  return (
    <section data-surface="section-ink" className="ink-glow ledger-lines py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-baseline gap-4">
          <span className="ledger-index">§ 08</span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Closing entry
          </span>
          <span aria-hidden className="h-px flex-1 self-center bg-border/60" />
        </div>

        <div className="mt-10 max-w-3xl">
          <h2 className="landing-headline text-foreground">{LANDING.ctaTitle}</h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-foreground/70">
            {LANDING.ctaLead}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <LandingButton href="/onboarding">
              {LANDING.ctaPrimary}
              <ArrowRight className="size-4" />
            </LandingButton>
            <LandingTextLink
              href="/dashboard"
              className="text-sm font-semibold text-foreground/70 hover:text-foreground"
            >
              {LANDING.ctaSecondary}
            </LandingTextLink>
          </div>

          <LandingTextLink
            href="/editions"
            className="mt-10 inline-block font-mono text-[11px] uppercase tracking-[0.12em] text-foreground/55 hover:text-foreground/85"
          >
            {LANDING.ctaEnterprise} →
          </LandingTextLink>
        </div>
      </div>
    </section>
  );
}
