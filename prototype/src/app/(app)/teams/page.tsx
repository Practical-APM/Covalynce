"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamSpendChart } from "@/components/charts";
import { teams as mockTeams } from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { PAGE_META } from "@/lib/page-meta";
import { api } from "@/lib/api";
import { TableSkeleton } from "@/components/loading-skeletons";
import { canManageMembers } from "@/lib/permissions";
import { useLoadEffect } from "@/hooks/use-load-effect";

type TeamRow = {
  id: string;
  name: string;
  members: number;
  monthlySpend: number;
  budget: number;
  trend: number | null;
  topModel: string;
};

export default function TeamsPage() {
  const { apiMode, session } = useAuth();
  const canCreate = canManageMembers(session?.user.role ?? "VIEWER");
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!apiMode) {
      setTeams(
        mockTeams.map((t) => ({
          id: t.id,
          name: t.name,
          members: t.members,
          monthlySpend: t.monthlySpend,
          budget: t.budget,
          trend: t.trend,
          topModel: t.topModel,
        }))
      );
      return;
    }
    setLoading(true);
    try {
      const [allTeams, analytics] = await Promise.all([
        api.listTeams(),
        api.analyticsTeams(),
      ]);
      const spendById = new Map(
        analytics
          .filter((a) => a.teamId)
          .map((a) => [a.teamId as string, a])
      );
      setTeams(
        allTeams.map((t) => {
          const stats = spendById.get(t.id);
          return {
            id: t.id,
            name: t.name,
            members: stats?.members ?? t._count.members,
            monthlySpend: stats?.cost ?? 0,
            budget: stats?.budget ?? 0,
            trend: null,
            topModel: "—",
          };
        })
      );
    } finally {
      setLoading(false);
    }
  }, [apiMode]);

  useLoadEffect(load, [load]);

  async function handleCreateTeam() {
    if (!teamName.trim() || !apiMode) return;
    setCreateError(null);
    setCreating(true);
    try {
      await api.createTeam(teamName.trim());
      setTeamName("");
      setCreateOpen(false);
      await load();
    } catch (e) {
      setCreateError(
        e instanceof Error ? e.message : "Could not create team. Try again."
      );
    } finally {
      setCreating(false);
    }
  }

  const chartData = useMemo(
    () =>
      teams.map((t) => ({
        name: t.name.split(" ")[0],
        spend: t.monthlySpend,
        budget: t.budget || t.monthlySpend,
      })),
    [teams]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={PAGE_META["/teams"].title}
        description={PAGE_META["/teams"].description}
        help={PAGE_META["/teams"].help}
        docHref={PAGE_META["/teams"].docHref}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spend vs. budget</CardTitle>
          <CardDescription>Monthly comparison across teams</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading teams…</p>
          ) : (
            <TeamSpendChart data={chartData} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">All teams</CardTitle>
            <CardDescription>{teams.length} teams tracked</CardDescription>
          </div>
          {apiMode && canCreate ? (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Plus className="size-4" />
                Create team
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Create team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team name</Label>
                    <Input
                      id="team-name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Platform Engineering"
                    />
                  </div>
                  {createError && (
                    <p className="text-sm text-destructive">{createError}</p>
                  )}
                  <Button
                    className="w-full"
                    disabled={!teamName.trim() || creating}
                    onClick={handleCreateTeam}
                  >
                    {creating ? "Creating…" : "Create team"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <p className="text-xs text-muted-foreground">
              Sign in with the API connected to create teams.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {loading && teams.length === 0 ? (
            <TableSkeleton rows={6} cols={7} />
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Members</TableHead>
                {!apiMode && <TableHead>Top model</TableHead>}
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                {!apiMode && (
                  <TableHead className="text-right">Trend</TableHead>
                )}
                <TableHead className="w-[140px]">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => {
                const pct =
                  team.budget > 0
                    ? (team.monthlySpend / team.budget) * 100
                    : 0;
                return (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/teams/${team.id}`}
                        className="hover:underline"
                      >
                        {team.name}
                      </Link>
                    </TableCell>
                    <TableCell>{team.members}</TableCell>
                    {!apiMode && (
                      <TableCell className="text-muted-foreground">
                        {team.topModel}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-mono">
                      {formatCurrency(team.monthlySpend)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {team.budget > 0 ? formatCurrency(team.budget) : "—"}
                    </TableCell>
                    {!apiMode && (
                      <TableCell
                        className={cn(
                          "text-right font-mono text-sm text-muted-foreground",
                          team.trend != null &&
                            team.trend > 15 &&
                            "text-amber-600 dark:text-amber-400",
                          team.trend != null &&
                            team.trend < 0 &&
                            "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {team.trend != null ? formatPercent(team.trend) : "—"}
                      </TableCell>
                    )}
                    <TableCell>
                      {team.budget > 0 ? (
                        <div className="flex items-center gap-2">
                          <Progress
                            value={pct}
                            className={
                              pct >= 90
                                ? "h-1.5 [&>div]:bg-amber-500"
                                : "h-1.5 [&>div]:bg-emerald-600"
                            }
                          />
                          <span className="w-8 text-right text-xs text-muted-foreground">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
