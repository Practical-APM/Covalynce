"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { LandingAudience } from "@/components/landing/landing-audience";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFaqSection } from "@/components/landing/landing-faq";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingJsonLd } from "@/components/landing/landing-json-ld";
import { LandingLaunchBar } from "@/components/landing/landing-launch-bar";
import { LandingLogos } from "@/components/landing/landing-logos";
import { LandingPlatformScroll } from "@/components/landing/landing-platform-scroll";
import { LandingProblem } from "@/components/landing/landing-problem";
import { LandingProductBleed } from "@/components/landing/landing-product-bleed";
import { LandingShell } from "@/components/landing/landing-shell";
import { LandingTrustBar } from "@/components/landing/landing-trust-bar";
import { LANDING } from "@/lib/landing-copy";
import { GITHUB_URL } from "@/lib/site-config";

/**
 * Landing narrative (single pass, no repeated sections):
 * Hero → Problem → Product demo → Platform → How it works → Integrations → Audience → Trust bar → FAQ → CTA
 */
export function LandingPageClient() {
  return (
    <LandingShell>
      <LandingJsonLd />
      <LandingLaunchBar />
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingProblem />
        <LandingProductBleed />
        <LandingPlatformScroll />
        <LandingHowItWorks />
        <LandingLogos />
        <LandingAudience />
        <LandingTrustBar />
        <LandingFaqSection />
        <LandingCta />
      </main>

      <footer className="landing-footer border-t py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-start">
            <div>
              <BrandLogo size="sm" tagline="AI spend control" animated />
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">{LANDING.footerTagline}</p>
            </div>
            <nav className="flex flex-wrap gap-12 sm:gap-16 text-sm">
              <ul className="space-y-2">
                <li className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product
                </li>
                <li>
                  <Link href="#product" className="text-foreground/75 hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#platform" className="text-foreground/75 hover:text-foreground">
                    Platform
                  </Link>
                </li>
                <li>
                  <Link href="#integrations" className="text-foreground/75 hover:text-foreground">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-foreground/75 hover:text-foreground">
                    Docs
                  </Link>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Company
                </li>
                <li>
                  <Link href="/editions" className="text-foreground/75 hover:text-foreground">
                    Editions
                  </Link>
                </li>
                <li>
                  <Link href="/help/getting-started" className="text-foreground/75 hover:text-foreground">
                    Self-host guide
                  </Link>
                </li>
                {GITHUB_URL && (
                  <li>
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/75 hover:text-foreground"
                    >
                      GitHub
                    </a>
                  </li>
                )}
              </ul>
              <ul className="space-y-2">
                <li className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </li>
                <li>
                  <Link href="/onboarding" className="text-foreground/75 hover:text-foreground">
                    Start free
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-foreground/75 hover:text-foreground">
                    Sign in
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <p className="mt-10 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Covalynce
          </p>
        </div>
      </footer>
    </LandingShell>
  );
}
