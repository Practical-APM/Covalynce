import Link from "next/link";
import { Check } from "lucide-react";
import { LandingShell } from "@/components/landing/landing-shell";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingButton } from "@/components/landing/landing-button";
import { BrandMark } from "@/components/brand-mark";
import {
  EDITION_COMPARISON,
  EDITION_FAQ,
} from "@/lib/editions";

export const metadata = {
  title: "Editions — Covalynce Community & Enterprise",
  description:
    "Community Edition is free to self-host. Enterprise adds SSO, compliance exports, and commercial support.",
};

export default function EditionsPage() {
  return (
    <LandingShell>
      <LandingHeader />
      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Editions
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight sm:text-5xl">
          Community is free.
          <br />
          Enterprise when you need more.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Start on Community Edition—solo or with a team—at no platform cost.
          Enterprise is gatekept for organizations that need SSO, compliance exports,
          and commercial support.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <LandingButton href="/onboarding">Start free — Community Edition</LandingButton>
          <Link
            href="/help/editions"
            className="inline-flex h-10 items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            In-app edition guide →
          </Link>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {(["community", "enterprise"] as const).map((key) => {
            const ed = EDITION_COMPARISON[key];
            return (
              <div
                key={key}
                className={
                  key === "community"
                    ? "landing-card-rich border-primary/25 p-8"
                    : "rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 opacity-95"
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold capitalize">
                      {key === "community" ? "Community Edition" : "Enterprise Edition"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{ed.tagline}</p>
                  </div>
                  <p className="text-2xl font-semibold tabular-nums">{ed.price}</p>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {ed.license} · {ed.deploy}
                </p>
                <ul className="mt-6 space-y-3">
                  {ed.highlights.map((item) => (
                    <li key={item} className="flex gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
          <dl className="mt-8 space-y-6">
            {EDITION_FAQ.map((item) => (
              <div key={item.q}>
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-12 text-sm text-muted-foreground">
          Self-host steps are in{" "}
          <Link href="/help/getting-started" className="text-primary hover:underline">
            Getting started
          </Link>
          . The full feature matrix lives in{" "}
          <code className="text-foreground">COMMUNITY_EDITION.md</code> at the
          repository root.
        </p>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 sm:flex-row sm:justify-between sm:px-8">
          <div className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span className="text-sm font-semibold">Covalynce</span>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </footer>
    </LandingShell>
  );
}
