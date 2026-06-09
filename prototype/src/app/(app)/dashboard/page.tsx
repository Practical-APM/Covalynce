"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { DateRangeSelect } from "@/components/date-range-select";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SpendOverTimeChart, ProviderPieChart } from "@/components/charts";
import { Callout } from "@/components/callout";
import { EmptyState, SyncHealthBanner } from "@/components/empty-state";
import { WhatIfSimulator } from "@/components/what-if-simulator";
import { MetricCard } from "@/components/metric-card";
import { Plug } from "lucide-react";
import {
  alerts,
  modelBreakdown,
  organization,
  providers,
  teams,
} from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/format";
import { api } from "@/lib/api";
import { DashboardSkeleton } from "@/components/loading-skeletons";
import { track } from "@/lib/analytics";
import { markStepComplete } from "@/lib/getting-started";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useLoadEffect } from "@/hooks/use-load-effect";

type DashboardData = Awaited<ReturnType<typeof api.dashboard>>;

export default function DashboardPage() {
  const { apiMode } = useAuth();
  const [range, setRange] = useState("mtd");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");
  const [showWelcome] = useState(() => {
    if (typeof window === "undefined") return false;
    const welcome =
      new URLSearchParams(window.location.search).get("welcome") === "1" ||
      sessionStorage.getItem("covalynce_onboarding_complete") === "1";
    if (welcome) {
      sessionStorage.removeItem("covalynce_onboarding_complete");
    }
    return welcome;
  });
  const [syncHealth, setSyncHealth] = useState<
    Awaited<ReturnType<typeof api.syncHealth>> | null
  >(null);

  const load = useCallback(async () => {
    if (!apiMode) return;
    setLoading(true);
    try {
      const [summary, health] = await Promise.all([
        api.dashboard(range),
        api.syncHealth(),
      ]);
      setData(summary);
      setSyncHealth(health);
    } finally {
      setLoading(false);
    }
  }, [apiMode, range]);

  useLoadEffect(load, [load]);

  useEffect(() => {
    if (apiMode) {
      track("dashboard_viewed", { range });
    }
  }, [apiMode, range]);

  async function handleSeedDemo() {
    if (!apiMode) return;
    setSeeding(true);
    setSeedMessage("");
    try {
      const result = await api.seedDemo();
      if (result.seeded) {
        markStepComplete("provider");
        setSeedMessage("Sample spend data loaded.");
        track("demo_seeded", { source: "dashboard" });
      } else {
        setSeedMessage("Sample data already exists or a provider is connected.");
      }
      await load();
    } catch (err) {
      setSeedMessage(err instanceof Error ? err.message : "Failed to load sample data");
    } finally {
      setSeeding(false);
    }
  }

  const totalSpend = apiMode && data ? data.totalSpend : organization.totalSpend;
  const monthlyBudget =
    apiMode && data?.monthlyBudget != null
      ? data.monthlyBudget
      : organization.monthlyBudget;
  const budgetUsed =
    apiMode && data?.budgetUtilization != null
      ? data.budgetUtilization
      : (organization.totalSpend / organization.monthlyBudget) * 100;
  const activeUsers = apiMode && data ? data.activeUsers : organization.activeUsers;
  const activeTeams = apiMode && data ? data.activeTeams : organization.activeTeams;
  const providerCount =
    apiMode && data ? data.connectedProviders : providers.length;
  const totalRequests =
    apiMode && data ? data.totalRequests : organization.totalRequests;

  const pieData =
    apiMode && data
      ? data.byProvider.map((p) => ({
          name: p.provider,
          value: p.cost,
        }))
      : undefined;

  const topModels =
    apiMode && data
      ? data.topModels
      : modelBreakdown.slice(0, 5).map((m) => ({
          model: m.model,
          provider: m.provider,
          cost: m.cost,
          share: m.share,
          requests: 0,
        }));

  const topTeamsData =
    apiMode && data
      ? data.topTeams
      : teams.slice(0, 4).map((t) => ({
          teamId: t.id,
          name: t.name,
          cost: t.monthlySpend,
          requests: 0,
        }));

  const teamBudgetMap = new Map(teams.map((t) => [t.name, t.budget]));

  if (apiMode && loading && !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={`Unified view across ${providerCount} providers, ${activeTeams} teams, and ${activeUsers} users`}
        help="Your home for total AI spend, budget used, and top cost drivers. Use the date range to change the period."
        docHref="/help/features/overview"
      >
        <DateRangeSelect value={range} onValueChange={setRange} />
        <div className="flex gap-2">
          <LinkButton variant="outline" href="/providers">
            Connect provider
          </LinkButton>
          <LinkButton href="/budgets">
            Manage budgets
            <ArrowUpRight className="size-4" />
          </LinkButton>
        </div>
      </PageHeader>

      {apiMode && loading && !data && (
        <p className="sr-only">Loading dashboard…</p>
      )}

      {showWelcome && (
        <Callout variant="success" title="You're all set">
          Your organization is ready. Review spend below, set a budget, or invite
          teammates from Settings → Members.
        </Callout>
      )}

      {seedMessage && (
        <Callout variant={seedMessage.includes("loaded") ? "success" : "note"}>
          {seedMessage}
        </Callout>
      )}


      {apiMode && syncHealth && syncHealth.overall !== "empty" && (
        <SyncHealthBanner
          overall={syncHealth.overall}
          providerCount={syncHealth.providerCount}
          errorCount={syncHealth.errorCount}
          staleCount={syncHealth.staleCount}
        />
      )}

      {apiMode && data && data.connectedProviders === 0 && data.totalSpend === 0 && (
        <EmptyState
          icon={Plug}
          title="Get started with AI spend tracking"
          description="Connect a provider with a demo key, or load sample data to explore the dashboard in one click."
          actionLabel="Connect provider"
          actionHref="/providers"
          secondaryLabel={seeding ? "Loading…" : "Load sample data"}
          secondaryOnAction={seeding ? undefined : handleSeedDemo}
        />
      )}

      {apiMode && data && data.connectedProviders === 0 && data.totalSpend > 0 && (
        <EmptyState
          icon={Plug}
          title="Connect your first provider"
          description="Link OpenAI, Anthropic, or Gemini to keep tracking AI spend. Use sk-demo-test-key for instant sample sync."
          actionLabel="Connect provider"
          actionHref="/providers"
          secondaryLabel="Quickstart guide"
          secondaryHref="/help"
        />
      )}

      {!apiMode && alerts.filter((a) => !a.read).length > 0 && (
        <Callout variant="warning" title={`${alerts.filter((a) => !a.read).length} active alerts`}>
          Review budget thresholds and spend spikes on the{" "}
          <Link href="/alerts" className="font-medium underline underline-offset-4">
            Alerts page
          </Link>
          .
        </Callout>
      )}

      {(!apiMode || (data && (data.connectedProviders > 0 || data.totalSpend > 0))) && (
        <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total spend"
          value={formatCurrency(totalSpend)}
          trend={apiMode ? undefined : organization.spendTrend}
          help="Sum of all AI costs from connected providers in the selected period."
        />
        <MetricCard
          label="Budget utilization"
          value={`${budgetUsed.toFixed(0)}%`}
          sublabel={`${formatCurrency(Math.max(0, monthlyBudget - totalSpend))} remaining`}
          help="Spend divided by your monthly budget. Above 100% means over budget."
        />
        <MetricCard
          label="Active users"
          value={String(activeUsers)}
          sublabel={`${activeTeams} teams`}
          help="People with at least one usage event in this period."
        />
        <MetricCard
          label="Total requests"
          value={formatNumber(totalRequests)}
          sublabel={range === "mtd" ? "Month to date" : range}
          help="Count of API calls or billed usage events, depending on provider data."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Spend over time</CardTitle>
            <CardDescription>Daily AI spend across all providers</CardDescription>
          </CardHeader>
          <CardContent>
            <SpendOverTimeChart
              data={data?.dailySpend}
              empty={apiMode && !!data && data.dailySpend?.length === 0}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">By provider</CardTitle>
            <CardDescription>Spend distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderPieChart
              data={pieData}
              empty={apiMode && !!data && (pieData?.length ?? 0) === 0}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Top models by cost</CardTitle>
              <CardDescription>Highest spend models in period</CardDescription>
            </div>
            <Badge variant="outline">{topModels.length} models</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topModels.map((m) => (
                  <TableRow key={m.model}>
                    <TableCell className="font-medium">{m.model}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.provider}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(m.cost)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {m.share.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Team spend</CardTitle>
              <CardDescription>Top teams by cost</CardDescription>
            </div>
            <LinkButton variant="ghost" size="sm" href="/teams">
              View all
              <ArrowRight className="size-4" />
            </LinkButton>
          </CardHeader>
          <CardContent className="space-y-4">
            {topTeamsData.map((team) => {
              const budget = teamBudgetMap.get(team.name) ?? team.cost * 1.2;
              const pct = budget ? (team.cost / budget) * 100 : 0;
              return (
                <div key={team.teamId ?? team.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{team.name}</span>
                    <span className="font-mono text-muted-foreground">
                      {formatCurrency(team.cost)}
                      {!apiMode && ` / ${formatCurrency(budget)}`}
                    </span>
                  </div>
                  {!apiMode && (
                    <Progress
                      value={pct}
                      className={
                        pct >= 90
                          ? "[&>div]:bg-amber-500"
                          : "[&>div]:bg-emerald-600"
                      }
                    />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {apiMode && data && data.connectedProviders > 0 && (
        <WhatIfSimulator />
      )}

        </>
      )}
    </div>
  );
}
