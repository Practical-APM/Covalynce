"use client";

import { ArrowRight, Play } from "lucide-react";
import { type ReactNode } from "react";
import { LandingButton, LandingTextLink } from "@/components/landing/landing-button";
import { ProviderLogoStrip } from "@/components/landing/provider-logo-strip";
import { LANDING } from "@/lib/landing-copy";
import { cn } from "@/lib/utils";

type LandingCtaPanelProps = {
  title: string;
  lead: string;
  className?: string;
  /** Light card (default) or on dark section-cta (inverts secondary) */
  onDark?: boolean;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  tertiaryHref?: string;
  tertiaryLabel?: string;
  showLogos?: boolean;
  children?: ReactNode;
};

export function LandingCtaPanel({
  title,
  lead,
  className,
  onDark = false,
  primaryHref = "/onboarding",
  primaryLabel = LANDING.ctaPrimary,
  secondaryHref = "/dashboard",
  secondaryLabel = LANDING.ctaSecondary,
  tertiaryHref = "/editions",
  tertiaryLabel = LANDING.ctaEnterprise,
  showLogos = false,
  children,
}: LandingCtaPanelProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <div className="text-center lg:text-left">
        <h2
          className={cn(
            "font-display text-3xl tracking-tight text-balance sm:text-4xl",
            onDark ? "text-card-foreground" : "text-foreground"
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            "mt-4 max-w-md text-base leading-relaxed",
            onDark ? "text-card-foreground/70" : "text-muted-foreground",
            "mx-auto lg:mx-0"
          )}
        >
          {lead}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
        <LandingButton href={primaryHref} variant={onDark ? "primary" : "primary"}>
          {primaryLabel}
          <ArrowRight className="size-4" />
        </LandingButton>
        <LandingButton href={secondaryHref} variant="secondary">
          <Play className="size-3.5 fill-current" />
          {secondaryLabel}
        </LandingButton>
      </div>

      <LandingTextLink
        href={tertiaryHref}
        className={cn(
          "mx-auto block text-center text-xs sm:mx-0 lg:text-left",
          onDark && "text-card-foreground/60 hover:text-card-foreground"
        )}
      >
        {tertiaryLabel} →
      </LandingTextLink>

      {showLogos && (
        <ProviderLogoStrip
          label={LANDING.ctaWorksWith}
          size="sm"
          className="items-center lg:items-start"
        />
      )}

      {children}
    </div>
  );
}
