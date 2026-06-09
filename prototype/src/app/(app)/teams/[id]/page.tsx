"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
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
import { getTeamById, users as mockUsers } from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { api } from "@/lib/api";
import { useLoadEffect } from "@/hooks/use-load-effect";

export default function TeamDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { apiMode } = useAuth();
  const [loading, setLoading] = useState(apiMode);
  const [notFound, setNotFound] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState(0);
  const [topModel, setTopModel] = useState("—");
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [budget, setBudget] = useState(0);
  const [trend, setTrend] = useState<number | null>(null);
  const [memberRows, setMemberRows] = useState<
    { id: string; name: string; cost: number }[]
  >([]);

  const load = useCallback(async () => {
    if (!apiMode) {
      const team = getTeamById(id);
      if (!team) {
        setNotFound(true);
        return;
      }
      setTeamName(team.name);
      setMembers(team.members);
      setTopModel(team.topModel);
      setMonthlySpend(team.monthlySpend);
      setBudget(team.budget);
      setTrend(team.trend);
      setMemberRows(
        mockUsers
          .filter((u) => u.team === team.name)
          .map((u) => ({ id: u.id, name: u.name, cost: u.cost }))
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [team, analytics, userSpend] = await Promise.all([
        api.getTeam(id),
        api.analyticsTeams(),
        api.analyticsUsers(),
      ]);
      const stats = analytics.find((a) => a.teamId === id);
      setTeamName(team.name);
      setMembers(team.members.length);
      setTopModel("—");
      setMonthlySpend(stats?.cost ?? 0);
      setBudget(stats?.budget ?? 0);
      setTrend(null);

      const spendByUser = new Map(
        userSpend
          .filter((u) => u.userId)
          .map((u) => [u.userId as string, u.cost])
      );
      setMemberRows(
        team.members
          .map((m) => ({
            id: m.user.id,
            name: m.user.name ?? m.user.email,
            cost: spendByUser.get(m.user.id) ?? 0,
          }))
          .sort((a, b) => b.cost - a.cost)
      );
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [apiMode, id]);

  useLoadEffect(load, [load]);

  if (notFound) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Team not found.</p>
        <Link href="/teams" className="text-sm text-primary hover:underline">
          Back to teams
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading team…</p>;
  }

  const pct = budget > 0 ? (monthlySpend / budget) * 100 : 0;

  return (
    <div className="space-y-6">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Teams
      </Link>

      <PageHeader
        title={teamName}
        description={`${members} members · Top model: ${topModel}`}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget utilization</CardTitle>
          <CardDescription>
            {formatCurrency(monthlySpend)}
            {budget > 0 ? ` of ${formatCurrency(budget)}` : ""}
            {trend != null ? ` · Trend ${formatPercent(trend)}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budget > 0 ? (
            <>
              <Progress
                value={pct}
                className={pct >= 90 ? "h-2 [&>div]:bg-amber-500" : "h-2"}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {pct.toFixed(0)}% used
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No budget set for this team.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team members by spend</CardTitle>
        </CardHeader>
        <CardContent>
          {memberRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberRows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link
                        href={`/users/${u.id}`}
                        className="font-medium hover:underline"
                      >
                        {u.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(u.cost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
