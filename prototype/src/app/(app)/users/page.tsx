"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { users as mockUsers } from "@/lib/mock-data";
import { PAGE_META } from "@/lib/page-meta";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { TableSkeleton } from "@/components/loading-skeletons";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  team: string;
  requests: number;
  tokens: number;
  cost: number;
  trend: number | null;
};

const meta = PAGE_META["/users"];

export default function UsersPage() {
  const { apiMode } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!apiMode) {
      setUsers(
        mockUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          team: u.team,
          requests: u.requests,
          tokens: u.tokens,
          cost: u.cost,
          trend: u.trend,
        }))
      );
      return;
    }
    setLoading(true);
    try {
      const rows = await api.analyticsUsers();
      setUsers(
        rows
          .filter((r) => r.userId)
          .map((r) => ({
            id: r.userId as string,
            name: r.name ?? r.email ?? "Unknown",
            email: r.email ?? "",
            team: r.team ?? "Unassigned",
            requests: r.requests,
            tokens: r.tokens,
            cost: r.cost,
            trend: null,
          }))
          .sort((a, b) => b.cost - a.cost)
      );
    } finally {
      setLoading(false);
    }
  }, [apiMode]);

  useLoadEffect(load, [load]);

  const totalCost = useMemo(
    () => users.reduce((sum, u) => sum + u.cost, 0),
    [users]
  );
  const topSpender = users[0];
  const mostActive = useMemo(
    () =>
      users.length
        ? [...users].sort((a, b) => b.requests - a.requests)[0]
        : null,
    [users]
  );

  return (
    <div>
      <PageHeader
        title={meta.title}
        description={meta.description}
        help={meta.help}
        docHref={meta.docHref}
      />

      {loading && users.length === 0 ? (
        <TableSkeleton rows={8} cols={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No user spend yet"
          description="After you connect a provider and usage syncs, spend appears here per person. In demo mode, open the dashboard with sample data first."
          actionLabel="Connect provider"
          actionHref="/providers"
          secondaryLabel="View sample Overview"
          secondaryHref="/dashboard"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Top spender"
              value={formatCurrency(topSpender.cost)}
              sublabel={topSpender.name}
              help="Highest total AI cost in the current data set."
            />
            <MetricCard
              label="Most active"
              value={formatNumber(mostActive?.requests ?? 0)}
              sublabel="requests"
              help="User with the most API requests recorded."
            />
            <MetricCard
              label="Total tracked"
              value={formatCurrency(totalCost)}
              sublabel={`${users.length} users`}
              help="Sum of all users shown in the table below."
            />
          </div>

          <div className="surface-panel mt-6 overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">User spend ranking</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Sorted by cost. Click a name for detail.
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, i) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="w-4 text-xs tabular-nums text-muted-foreground">
                          {i + 1}
                        </span>
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {initials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/users/${user.id}`}
                            className="font-medium hover:underline"
                          >
                            {user.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.team}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatNumber(user.requests)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {formatNumber(user.tokens)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">
                      {formatCurrency(user.cost)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono text-sm text-muted-foreground",
                        user.trend != null && user.trend > 20 && "text-warning",
                        user.trend != null && user.trend < 0 && "text-success"
                      )}
                    >
                      {user.trend != null ? formatPercent(user.trend) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
