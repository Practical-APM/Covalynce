"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { EditionBadge } from "@/components/edition-badge";
import { LinkButton } from "@/components/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { organization as mockOrg } from "@/lib/mock-data";
import {
  editionIsFree,
  editionLabel,
  EDITION_COMPARISON,
  planToEdition,
} from "@/lib/editions";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api";
import { useLoadEffect } from "@/hooks/use-load-effect";

export default function SettingsBillingPage() {
  const { apiMode, session } = useAuth();
  const org = apiMode && session ? session.organization : mockOrg;
  const plan = org.plan ?? "community";
  const edition = planToEdition(plan);
  const ed = EDITION_COMPARISON[edition];
  const [totalSpend, setTotalSpend] = useState<number | null>(
    apiMode ? null : mockOrg.totalSpend
  );

  const load = useCallback(async () => {
    if (!apiMode) {
      setTotalSpend(mockOrg.totalSpend);
      return;
    }
    const dashboard = await api.dashboard();
    setTotalSpend(dashboard.totalSpend);
  }, [apiMode]);

  useLoadEffect(load, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Product edition and AI spend tracked by Covalynce"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Product edition</CardTitle>
              <CardDescription>
                {editionIsFree(plan)
                  ? "Community Edition — no platform fee when self-hosted"
                  : "Commercial edition — contact us for changes"}
              </CardDescription>
            </div>
            <EditionBadge plan={plan} linkToHelp={false} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="text-2xl font-semibold">{ed.price}</p>
            <p className="mt-1 text-sm text-muted-foreground">{ed.tagline}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {editionLabel(plan)} · {ed.deploy}
            </p>
          </div>
          {editionIsFree(plan) ? (
            <p className="text-sm text-muted-foreground">
              Community Edition includes dashboards, budgets, providers, and cost
              centers at no platform fee.{" "}
              <Link href="/help/editions#enterprise" className="text-primary hover:underline">
                Enterprise
              </Link>{" "}
              is available when you need SSO or compliance exports.
            </p>
          ) : (
            <LinkButton variant="outline" href="mailto:sales@covalynce.io?subject=Enterprise%20Edition">
              Contact sales to change edition
            </LinkButton>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI spend tracked</CardTitle>
          <CardDescription>
            Not platform billing — your AI provider costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-3xl font-semibold">
            {totalSpend === null ? "—" : formatCurrency(totalSpend)}
          </p>
          <p className="text-sm text-muted-foreground">Month to date</p>
        </CardContent>
      </Card>
    </div>
  );
}
