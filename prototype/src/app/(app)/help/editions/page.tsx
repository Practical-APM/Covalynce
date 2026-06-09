"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { DocsShell } from "@/components/docs-shell";
import { Callout } from "@/components/callout";
import { useAuth } from "@/components/auth-provider";
import { EditionBadge } from "@/components/edition-badge";
import { EDITION_COMPARISON, editionLabel } from "@/lib/editions";

export default function HelpEditionsPage() {
  const { session, apiMode } = useAuth();
  const plan = apiMode && session ? session.organization.plan : "community";

  return (
    <DocsShell
      title="Editions"
      description="Community Edition (free, self-host) vs Enterprise (SSO, exports, support)."
      readTime="4 min"
    >
      <Callout variant="tip" title="Your workspace">
        {apiMode && session ? (
          <span className="inline-flex flex-wrap items-center gap-2">
            This organization is on <EditionBadge plan={plan} linkToHelp={false} />.
            Community includes full FinOps visibility; Enterprise is optional below.
          </span>
        ) : (
          "Enable API mode to see your organization edition."
        )}
      </Callout>

      <p className="text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Community Edition</strong> is free to
        self-host: core FinOps visibility, teams, budgets, alerts, and optional
        gateway governance. <strong className="text-foreground">Enterprise Edition</strong>{" "}
        adds SSO, advanced RBAC, compliance exports, multi-workspace access, and
        commercial support.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {(["community", "enterprise"] as const).map((key) => {
          const ed = EDITION_COMPARISON[key];
          return (
            <div
              key={key}
              id={key === "enterprise" ? "enterprise" : undefined}
              className={
                key === "community"
                  ? "rounded-xl border border-foreground/15 bg-foreground/4 p-5"
                  : "rounded-xl border border-dashed border-border bg-muted/20 p-5"
              }
            >
              <h3 className="font-semibold">
                {key === "community" ? "Community Edition" : "Enterprise Edition"}
              </h3>
              <p className="mt-1 text-2xl font-semibold">{ed.price}</p>
              <p className="mt-2 text-xs text-muted-foreground">{ed.tagline}</p>
              <ul className="mt-4 space-y-2">
                {ed.highlights.slice(0, 6).map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 shrink-0 text-foreground" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Self-host Community Edition</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Clone the repository and follow QUICKSTART.md</li>
        <li>Run Docker Compose (Postgres + Redis + API + UI)</li>
        <li>Configure auth and secrets for your environment</li>
        <li>Sign up — new organizations default to the community plan</li>
      </ol>

      <h2 className="mt-10 text-lg font-semibold">Environment (planned)</h2>
      <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs">
{`COVALYNCE_EDITION=community   # community | enterprise
COVALYNCE_LICENSE_KEY=        # enterprise features (future)`}
      </pre>

      <p className="mt-6 text-sm text-muted-foreground">
        Compare editions on the{" "}
        <Link href="/editions" className="text-primary hover:underline">
          public editions page
        </Link>
        . See COMMUNITY_EDITION.md in the repository for the feature matrix.
      </p>

      {apiMode && session && (
        <p className="mt-4 text-sm">
          <Link href="/settings/billing" className="text-primary hover:underline">
            Settings → Billing
          </Link>{" "}
          shows {editionLabel(plan)} for this workspace.
        </p>
      )}
    </DocsShell>
  );
}
