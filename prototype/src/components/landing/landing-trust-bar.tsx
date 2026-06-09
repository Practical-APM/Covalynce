"use client";

import Link from "next/link";
import { LANDING } from "@/lib/landing-copy";
import { GITHUB_URL } from "@/lib/site-config";

/** Compact trust row — avoids repeating hero stats in a full section */
export function LandingTrustBar() {
  return (
    <section className="border-y border-border/70 bg-muted/20 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8">
          {LANDING.trustItems.map((item) => (
            <div key={item.label}>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-1 font-display text-lg tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/help/getting-started"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Self-host guide
          </Link>
          {GITHUB_URL && (
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              Source
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
