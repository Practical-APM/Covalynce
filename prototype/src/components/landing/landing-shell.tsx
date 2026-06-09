"use client";

import { type ReactNode } from "react";
import { LandingSmoothScroll } from "@/components/landing/landing-smooth-scroll";

export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <LandingSmoothScroll>
      <div
        data-surface="landing"
        className="relative min-h-screen overflow-x-hidden bg-background text-foreground landing-theme"
      >
        {children}
      </div>
    </LandingSmoothScroll>
  );
}
