"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, ScrollText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { DateRangeSelect } from "@/components/date-range-select";
import { TableSkeleton } from "@/components/loading-skeletons";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { usageRecords, providers, teams } from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/format";
import { downloadCsv } from "@/lib/download";
import { resolveDateRangeBounds } from "@/lib/date-range";
import { HelpTip } from "@/components/help-tip";
import { api } from "@/lib/api";
import { useLoadEffect } from "@/hooks/use-load-effect";

export default function UsagePage() {
  const { apiMode } = useAuth();
  const [range, setRange] = useState("mtd");
  const [provider, setProvider] = useState("all");
  const [team, setTeam] = useState("all");
  const [teamOptions, setTeamOptions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [apiEvents, setApiEvents] = useState<
    Awaited<ReturnType<typeof api.listUsage>>["events"]
  >([]);
  const [summary, setSummary] = useState<{ count: number; totalCost: number } | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!apiMode) return;
    api.listTeams().then(setTeamOptions).catch(console.error);
  }, [apiMode]);

  const load = useCallback(async (cursor?: string, append = false) => {
    if (!apiMode) return;
    if (!append) setLoading(true);
    try {
      const { from, to } = resolveDateRangeBounds(range);
      const res = await api.listUsage({
        provider: provider === "all" ? undefined : provider.toUpperCase(),
        teamId: team === "all" ? undefined : team,
        from,
        to,
        limit: 100,
        cursor,
      });
      setApiEvents((prev) => (append ? [...prev, ...res.events] : res.events));
      setSummary({ count: res.summary.count, totalCost: res.summary.totalCost });
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } finally {
      if (!append) setLoading(false);
    }
  }, [apiMode, provider, team, range]);

  useLoadEffect(() => {
    if (apiMode) return load();
  }, [apiMode, load]);

  const filtered = usageRecords.filter((r) => {
    if (provider !== "all" && r.provider !== provider) return false;
    if (team !== "all" && r.team !== team) return false;
    return true;
  });

  const displayEvents = apiMode
    ? apiEvents.map((e) => ({
        id: e.id,
        timestamp: new Date(e.timestamp).toLocaleString(),
        provider: e.provider,
        model: e.model,
        user: e.user?.name ?? e.user?.email ?? "—",
        team: e.team?.name ?? "—",
        inputTokens: e.inputTokens,
        outputTokens: e.outputTokens,
        cost: e.cost,
      }))
    : filtered.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        provider: r.provider,
        model: r.model,
        user: r.user,
        team: r.team,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        cost: r.cost,
      }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usage"
        description={
          apiMode && summary
            ? `${summary.count} events in range · ${formatCurrency(summary.totalCost)} total`
            : "Line-by-line AI usage across providers. Data syncs every 15 minutes."
        }
        help="Each row is one billed request. Filter by provider or export for audits."
        docHref="/help/concepts#attribution"
      >
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeSelect value={range} onValueChange={setRange} />
          <span className="inline-flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={displayEvents.length === 0}
              onClick={() =>
                downloadCsv(
                  "covalynce-usage.csv",
                  [
                    "timestamp",
                    "provider",
                    "model",
                    "user",
                    "team",
                    "input_tokens",
                    "output_tokens",
                    "cost",
                  ],
                  displayEvents.map((e) => ({
                    timestamp: e.timestamp,
                    provider: e.provider,
                    model: e.model,
                    user: e.user,
                    team: e.team,
                    input_tokens: String(e.inputTokens),
                    output_tokens: String(e.outputTokens),
                    cost: String(e.cost),
                  }))
                )
              }
            >
              <Download className="size-4" />
              Export CSV
            </Button>
            <HelpTip content="Exports the rows currently shown in the table." />
          </span>
        </div>
      </PageHeader>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-3">
            <Select
              value={provider}
              onValueChange={(v) => v && setProvider(v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All providers</SelectItem>
                {apiMode ? (
                  <>
                    <SelectItem value="OPENAI">OpenAI</SelectItem>
                    <SelectItem value="ANTHROPIC">Anthropic</SelectItem>
                    <SelectItem value="GEMINI">Gemini</SelectItem>
                    <SelectItem value="AZURE_OPENAI">Azure OpenAI</SelectItem>
                    <SelectItem value="BEDROCK">AWS Bedrock</SelectItem>
                  </>
                ) : (
                  providers.map((p) => (
                    <SelectItem key={p.id} value={p.displayName}>
                      {p.displayName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Select value={team} onValueChange={(v) => v && setTeam(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All teams</SelectItem>
                {apiMode
                  ? teamOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))
                  : teams.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && apiMode ? (
            <TableSkeleton rows={10} cols={8} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-right">In</TableHead>
                      <TableHead className="text-right">Out</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayEvents.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-muted-foreground">
                          {row.timestamp}
                        </TableCell>
                        <TableCell>{row.provider}</TableCell>
                        <TableCell className="font-medium">{row.model}</TableCell>
                        <TableCell>{row.user}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.team}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber(row.inputTokens)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber(row.outputTokens)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(row.cost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {displayEvents.length === 0 && (
                <EmptyState
                  icon={ScrollText}
                  title={apiMode ? "No usage events yet" : "No events match filters"}
                  description={
                    apiMode
                      ? "Connect a provider and run sync to populate the usage explorer."
                      : "Try adjusting your filters."
                  }
                  actionLabel={apiMode ? "Connect provider" : undefined}
                  actionHref={apiMode ? "/providers" : undefined}
                  className="border-0 shadow-none"
                />
              )}
              {apiMode && hasMore && displayEvents.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingMore}
                    onClick={async () => {
                      if (!nextCursor) return;
                      setLoadingMore(true);
                      try {
                        await load(nextCursor, true);
                      } finally {
                        setLoadingMore(false);
                      }
                    }}
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
