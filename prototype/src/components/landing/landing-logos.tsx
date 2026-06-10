"use client";

import {
  PROVIDER_BRANDS,
  ProviderBrandLogo,
} from "@/components/landing/provider-brand-logo";
import { LandingSection } from "@/components/landing/landing-section";
import { RevealOnScroll } from "@/components/landing/landing-scroll-fx";
import { LANDING } from "@/lib/landing-copy";

const statusCopy = {
  live: {
    label: "Billing sync · Live",
    detail: "Connect billing credentials; usage syncs on a 15-minute schedule.",
  },
  gateway: {
    label: "Gateway proxy",
    detail: "Route traffic through the gateway today for per-project attribution.",
  },
  roadmap: {
    label: "Roadmap",
    detail: "Planned integration; tracked in the public feature matrix.",
  },
} as const;

export function LandingLogos() {
  return (
    <LandingSection
      id="integrations"
      index="§ 05"
      eyebrow={LANDING.integrationsEyebrow}
      title={LANDING.integrationsTitle}
      lead={LANDING.integrationsLead}
      border="top"
    >
      <div className="border-t-2 border-foreground/80" role="table" aria-label="Provider integrations">
        {PROVIDER_BRANDS.map((p, i) => {
          const status = statusCopy[p.status];
          return (
            <RevealOnScroll key={p.id} delay={i * 0.05}>
              <div
                role="row"
                className="grid grid-cols-[2.5rem_1fr] items-center gap-x-4 border-b border-border py-4 sm:grid-cols-[2.5rem_minmax(10rem,0.55fr)_minmax(9rem,0.45fr)_1.2fr] sm:py-5"
              >
                <ProviderBrandLogo id={p.id} className="size-7 sm:size-8" />
                <span role="cell" className="font-display text-base tracking-tight sm:text-lg">
                  {p.name}
                </span>
                <span
                  role="cell"
                  className={
                    p.status === "live"
                      ? "ledger-value col-start-2 text-xs sm:col-start-3"
                      : "col-start-2 font-mono text-xs text-muted-foreground sm:col-start-3"
                  }
                >
                  {status.label}
                </span>
                <span
                  role="cell"
                  className="col-span-2 mt-1.5 text-sm leading-relaxed text-muted-foreground sm:col-span-1 sm:col-start-4 sm:mt-0"
                >
                  {status.detail}
                </span>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>
    </LandingSection>
  );
}
