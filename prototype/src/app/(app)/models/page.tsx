"use client";

import { useCallback, useState } from "react";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { TableSkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "@/components/page-header";
import { DateRangeSelect } from "@/components/date-range-select";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { modelBreakdown } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { api } from "@/lib/api";

export default function ModelsPage() {
  const { apiMode } = useAuth();
  const [range, setRange] = useState("mtd");
  const [loading, setLoading] = useState(apiMode);
  const [models, setModels] = useState<
    { model: string; provider: string; cost: number; share: number }[]
  >([]);

  const load = useCallback(async () => {
    if (!apiMode) {
      setModels(modelBreakdown);
      return;
    }
    setLoading(true);
    try {
      const data = await api.analyticsModels(range);
      setModels(data);
    } finally {
      setLoading(false);
    }
  }, [apiMode, range]);

  useLoadEffect(load, [load]);

  const display = apiMode ? models : modelBreakdown;
  const total = display.reduce((s, m) => s + m.cost, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Models"
        description="Cost breakdown by model. Find expensive defaults and shift teams to cheaper options."
        help="Share is each model's cost as a percent of total spend in the period."
        docHref="/help/features/overview"
      >
        <DateRangeSelect value={range} onValueChange={setRange} />
      </PageHeader>

      {!apiMode && (
        <p className="text-xs text-muted-foreground">
          Demo mode: sample model breakdown shown. Connect the API for live
          spend by model.
        </p>
      )}

      {loading && display.length === 0 && <TableSkeleton rows={6} cols={4} />}

      <div
        className={
          loading && display.length === 0
            ? "hidden"
            : "grid gap-4 lg:grid-cols-2"
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost distribution</CardTitle>
            <CardDescription>Share of total AI spend by model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {display.map((m) => (
              <div key={m.model} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{m.model}</span>
                  <span className="font-mono text-muted-foreground">
                    {formatCurrency(m.cost)} ({m.share.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={m.share} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All models</CardTitle>
            <CardDescription>
              Total {formatCurrency(total)} across {display.length} models
            </CardDescription>
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
                {display.map((m) => (
                  <TableRow key={m.model}>
                    <TableCell className="font-medium">{m.model}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.provider}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(m.cost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.share.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
      </Card>

      {apiMode && !loading && display.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title="No model usage yet"
          description="Connect a provider and sync usage to see cost breakdown by model."
          actionLabel="Connect provider"
          actionHref="/providers"
          secondaryLabel="Quickstart"
          secondaryHref="/help"
        />
      )}
    </div>
    </div>
  );
}
