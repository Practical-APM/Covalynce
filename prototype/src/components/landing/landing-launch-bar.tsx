"use client";

import { PRODUCT_HUNT_URL } from "@/lib/site-config";

/** Shown only when NEXT_PUBLIC_PRODUCT_HUNT_URL is set — enable on launch day. */
export function LandingLaunchBar() {
  if (!PRODUCT_HUNT_URL) return null;

  return (
    <div className="border-b border-[var(--landing-glow)] bg-[var(--landing-glow)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2 text-center text-xs sm:px-8 sm:text-sm">
        <span className="font-semibold text-foreground">We&apos;re live on Product Hunt today.</span>
        <a
          href={PRODUCT_HUNT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="landing-headline-accent font-semibold underline-offset-4 hover:underline"
        >
          Support our launch →
        </a>
      </div>
    </div>
  );
}
