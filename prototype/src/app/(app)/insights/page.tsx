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

export default function InsightsPage() {
  const { apiMode, session } = useAuth();
  const admin = isAdmin(session?.user.role ?? "VIEWER");
  const [insights, setInsights] = useState<
    Awaited<ReturnType<typeof api.optimizationInsights>>
  >([]);
  const [anomalies, setAnomalies] = useState<
    Awaited<ReturnType<typeof api.anomalies>>
  >([]);
  const [applying, setApplying] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
    try {
      const res = await api.applyOptimizationInsight(id);
      setMessage(res.message);
      await load();
    } catch (e) {
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

      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}

      {apiMode && anomalies.length > 0 && (
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
