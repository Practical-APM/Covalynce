"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Lightbulb, TrendingDown } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api";
import { isAdmin } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useLoadEffect } from "@/hooks/use-load-effect";

/** Sample insights for demo mode — mirrors what the API computes from live usage. */
const DEMO_INSIGHTS: Awaited<ReturnType<typeof api.optimizationInsights>> = [
  {
    id: "demo-downgrade-gpt4o",
    type: "model_downgrade",
    severity: "high",
    title: "Route summarization traffic to gpt-4o-mini",
    description:
      "62% of gpt-4o requests come from the support-summarizer agent with short prompts. gpt-4o-mini handles this workload at ~6% of the cost.",
    estimatedMonthlySavings: 1840,
    actionLabel: "Review model usage",
    actionHref: "/models",
    suggestModel: "gpt-4o-mini",
  },
  {
    id: "demo-claude-haiku",
    type: "model_downgrade",
    severity: "medium",
    title: "Claude Sonnet → Haiku for classification jobs",
    description:
      "The tagging pipeline sends single-label classification prompts to Sonnet. Haiku matches accuracy on this prompt shape in most published evals.",
    estimatedMonthlySavings: 620,
    actionLabel: "See team usage",
    actionHref: "/teams",
    suggestModel: "claude-haiku",
  },
  {
    id: "demo-idle-license",
    type: "license_overlap",
    severity: "low",
    title: "8 unused Copilot seats",
    description:
      "8 of 40 Copilot Business seats show no activity in 30 days. Reclaim or reassign them before renewal.",
    estimatedMonthlySavings: 152,
    actionLabel: "Open licenses",
    actionHref: "/licenses",
  },
];

const DEMO_ANOMALIES: Awaited<ReturnType<typeof api.anomalies>> = [
  {
    id: "demo-anomaly-gemini",
    type: "spend_spike",
    severity: "medium",
    title: "Gemini spend 3.1× above baseline",
    description:
      "Daily Gemini spend jumped from ~$38 to $118 on Jun 8, driven by the research team's batch embedding job.",
    metric: "daily_spend",
    value: 118,
    baseline: 38,
    zScore: 3.1,
    detectedAt: new Date().toISOString(),
    actionLabel: "Inspect usage",
    actionHref: "/usage",
  },
];

export default function InsightsPage() {
  const { apiMode, session } = useAuth();
  const admin = isAdmin(session?.user.role ?? "VIEWER");
  const [insights, setInsights] = useState<
    Awaited<ReturnType<typeof api.optimizationInsights>>
  >(apiMode ? [] : DEMO_INSIGHTS);
  const [anomalies, setAnomalies] = useState<
    Awaited<ReturnType<typeof api.anomalies>>
  >(apiMode ? [] : DEMO_ANOMALIES);
  const [applying, setApplying] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);

  const load = useCallback(async () => {
    if (!apiMode) return;
    const [opt, anom] = await Promise.all([
      api.optimizationInsights(),
      api.anomalies(),
    ]);
    setInsights(opt);
    setAnomalies(anom);
  }, [apiMode]);

  useLoadEffect(load, [load]);

  async function handleApply(id: string) {
    setApplying(id);
    setMessage(null);
    setMessageIsError(false);
    try {
      const res = await api.applyOptimizationInsight(id);
      setMessage(res.message);
      await load();
    } catch (e) {
      setMessageIsError(true);
      setMessage(e instanceof Error ? e.message : "Apply failed");
    } finally {
      setApplying(null);
    }
  }

  const totalSavings = insights.reduce(
    (s, i) => s + i.estimatedMonthlySavings,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Automatic ways to save money and flags when spend looks unusual."
        docHref="/help/features/insights"
      />

      {!apiMode && (insights.length > 0 || anomalies.length > 0) && (
        <p className="text-xs text-muted-foreground">
          Demo mode: sample savings and anomaly signals. Connect the API to
          compute insights from your live usage.
        </p>
      )}

      {message && (
        <p
          className={
            messageIsError
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {message}
        </p>
      )}

      {anomalies.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="size-4 text-amber-600" />
            Anomalies detected ({anomalies.length})
          </h2>
          <div className="grid gap-3">
            {anomalies.map((a) => (
              <Card
                key={a.id}
                className={cn(
                  a.severity === "high" && "border-amber-500/40",
                  a.severity === "medium" && "border-blue-500/30"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {a.severity}
                      {a.zScore != null && ` · ${a.zScore}σ`}
                    </Badge>
                  </div>
                  <CardDescription>{a.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={a.actionHref}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {a.actionLabel} →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {insights.length > 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <TrendingDown className="size-8 text-emerald-600" />
            <div>
              <p className="text-sm text-muted-foreground">
                Estimated savings opportunity
              </p>
              <p className="font-mono text-2xl font-semibold">
                {formatCurrency(totalSavings)}/mo
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {apiMode && insights.length === 0 && anomalies.length === 0 && (
        <EmptyState
          icon={Lightbulb}
          title="No insights yet"
          description="Connect providers and accumulate usage — we'll detect anomalies and suggest model downgrades."
          actionLabel="Connect provider"
          actionHref="/providers"
        />
      )}

      {insights.length > 0 && (
        <h2 className="text-sm font-medium">Optimization recommendations</h2>
      )}

      <div className="grid gap-4">
        {insights.map((insight) => (
          <Card key={insight.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{insight.title}</CardTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    insight.severity === "high" && "border-amber-500 text-amber-700",
                    insight.severity === "medium" && "border-blue-500"
                  )}
                >
                  Save ~{formatCurrency(insight.estimatedMonthlySavings)}/mo
                </Badge>
              </div>
              <CardDescription>{insight.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              {insight.applyable && admin && apiMode && (
                <Button
                  size="sm"
                  onClick={() => handleApply(insight.id)}
                  disabled={applying === insight.id}
                >
                  {applying === insight.id ? "Applying…" : "Apply deny policy"}
                </Button>
              )}
              {insight.suggestModel && (
                <span className="text-xs text-muted-foreground">
                  Prefer: {insight.suggestModel}
                </span>
              )}
              <Link
                href={insight.actionHref}
                className="text-sm font-medium text-primary hover:underline"
              >
                {insight.actionLabel} →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
