"use client";

import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";
import { LANDING } from "@/lib/landing-copy";
import { GITHUB_URL } from "@/lib/site-config";
import { LandingSection } from "@/components/landing/landing-section";

export function LandingTrust() {
  return (
    <LandingSection
      id="trust"
      eyebrow={LANDING.trustEyebrow}
      title={LANDING.trustTitle}
      lead={LANDING.trustLead}
      align="center"
      border="y"
      className="bg-muted/20 py-16 sm:py-24"
    >
      <dl className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING.trustItems.map((item) => (
          <div
            key={item.label}
            className="border border-border bg-card px-5 py-6 text-center rounded-[var(--radius)]"
          >
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-2 font-display text-2xl tracking-tight text-foreground">
              {item.value}
            </dd>
            <dd className="mt-1 text-xs text-muted-foreground">{item.detail}</dd>
          </div>
        ))}
      </dl>

      <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/help/getting-started"
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Self-host in 5 minutes
          <ArrowRight className="size-3.5" />
        </Link>
        {GITHUB_URL && (
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Code2 className="size-4" />
            View source
          </a>
        )}
      </div>
    </LandingSection>
  );
}
