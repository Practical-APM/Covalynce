import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { resolveDateRange, timestampFilter } from './date-range.util';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private async cached<T>(
    orgId: string,
    segment: string,
    range: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const key = this.cache.cacheKey(orgId, segment, range);
    const hit = await this.cache.get<T>(key);
    if (hit) return hit;
    const data = await fn();
    await this.cache.set(key, data);
    return data;
  }

  async getDashboardSummary(organizationId: string, rangeKey = 'mtd') {
    return this.cached(organizationId, 'dashboard', rangeKey, () =>
      this.buildDashboardSummary(organizationId, rangeKey),
    );
  }

  private async buildDashboardSummary(
    organizationId: string,
    rangeKey: string,
  ) {
    const range = resolveDateRange(rangeKey);
    const ts = timestampFilter(range);

    const [
      spendAgg,
      userCount,
      teamCount,
      providerCount,
      requestCount,
      byProvider,
      byTeam,
      byModel,
      dailyRows,
      orgBudget,
    ] = await Promise.all([
      this.prisma.usageEvent.aggregate({
        where: { organizationId, timestamp: ts },
        _sum: { cost: true },
      }),
      this.prisma.user.count({ where: { organizationId } }),
      this.prisma.team.count({ where: { organizationId } }),
      this.prisma.provider.count({
        where: { organizationId, status: 'CONNECTED' },
      }),
      this.prisma.usageEvent.count({
        where: { organizationId, timestamp: ts },
      }),
      this.prisma.usageEvent.groupBy({
        by: ['provider'],
        where: { organizationId, timestamp: ts },
        _sum: { cost: true },
        _count: true,
      }),
      this.prisma.usageEvent.groupBy({
        by: ['teamId'],
        where: { organizationId, timestamp: ts, teamId: { not: null } },
        _sum: { cost: true },
        _count: true,
      }),
      this.prisma.usageEvent.groupBy({
        by: ['model', 'provider'],
        where: { organizationId, timestamp: ts },
        _sum: { cost: true },
        _count: true,
      }),
      this.prisma.$queryRaw<
        { day: Date; spend: Prisma.Decimal; requests: bigint }[]
      >`
        SELECT DATE(timestamp) as day,
               SUM(cost) as spend,
               COUNT(*)::bigint as requests
        FROM usage_events
        WHERE organization_id = ${organizationId}
          AND timestamp >= ${range.from}
          AND timestamp <= ${range.to}
        GROUP BY DATE(timestamp)
        ORDER BY day ASC
      `,
      this.prisma.budget.findFirst({
        where: { organizationId, scope: 'ORGANIZATION' },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalSpend = Number(spendAgg._sum.cost ?? 0);
    const monthlyBudget = orgBudget ? Number(orgBudget.monthlyLimit) : null;

    const topTeamsSorted = [...byTeam]
      .sort((a, b) => Number(b._sum.cost ?? 0) - Number(a._sum.cost ?? 0))
      .slice(0, 6);
    const topModelsSorted = [...byModel]
      .sort((a, b) => Number(b._sum.cost ?? 0) - Number(a._sum.cost ?? 0))
      .slice(0, 7);

    const teamIds = topTeamsSorted
      .map((t) => t.teamId)
      .filter((id): id is string => id !== null);
    const teams =
      teamIds.length > 0
        ? await this.prisma.team.findMany({
            where: { id: { in: teamIds } },
            select: { id: true, name: true },
          })
        : [];
    const teamMap = new Map(teams.map((t) => [t.id, t.name]));

    const modelTotal = topModelsSorted.reduce(
      (s, m) => s + Number(m._sum.cost ?? 0),
      0,
    );

    return {
      period: rangeKey,
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      totalSpend,
      monthlyBudget,
      budgetUtilization: monthlyBudget
        ? (totalSpend / monthlyBudget) * 100
        : null,
      activeUsers: userCount,
      activeTeams: teamCount,
      connectedProviders: providerCount,
      totalRequests: requestCount,
      byProvider: byProvider.map((row) => ({
        provider: row.provider,
        cost: Number(row._sum.cost ?? 0),
        requests: row._count,
      })),
      topTeams: topTeamsSorted.map((row) => ({
        teamId: row.teamId,
        name: row.teamId
          ? (teamMap.get(row.teamId) ?? 'Unknown')
          : 'Unassigned',
        cost: Number(row._sum.cost ?? 0),
        requests: row._count,
      })),
      topModels: topModelsSorted.map((row) => ({
        model: row.model,
        provider: row.provider,
        cost: Number(row._sum.cost ?? 0),
        share: modelTotal ? (Number(row._sum.cost ?? 0) / modelTotal) * 100 : 0,
        requests: row._count,
      })),
      dailySpend: dailyRows.map((row) => ({
        date: row.day.toISOString().slice(0, 10),
        spend: Number(row.spend),
        requests: Number(row.requests),
      })),
    };
  }

  getProviders(organizationId: string, rangeKey = 'mtd') {
    return this.cached(organizationId, 'providers', rangeKey, async () => {
      const range = resolveDateRange(rangeKey);
      const rows = await this.prisma.usageEvent.groupBy({
        by: ['provider'],
        where: { organizationId, timestamp: timestampFilter(range) },
        _sum: { cost: true, inputTokens: true, outputTokens: true },
        _count: true,
      });
      return rows.map((r) => ({
        provider: r.provider,
        cost: Number(r._sum.cost ?? 0),
        requests: r._count,
        inputTokens: r._sum.inputTokens ?? 0,
        outputTokens: r._sum.outputTokens ?? 0,
      }));
    });
  }

  getTeams(organizationId: string, rangeKey = 'mtd') {
    return this.cached(organizationId, 'teams', rangeKey, async () => {
      const range = resolveDateRange(rangeKey);
      const rows = await this.prisma.usageEvent.groupBy({
        by: ['teamId'],
        where: {
          organizationId,
          timestamp: timestampFilter(range),
          teamId: { not: null },
        },
        _sum: { cost: true },
        _count: true,
      });
      const sorted = [...rows].sort(
        (a, b) => Number(b._sum.cost ?? 0) - Number(a._sum.cost ?? 0),
      );
      const teamIds = sorted
        .map((r) => r.teamId)
        .filter((id): id is string => id !== null);
      const teams = await this.prisma.team.findMany({
        where: { id: { in: teamIds } },
        include: { _count: { select: { members: true } } },
      });
      const map = new Map(teams.map((t) => [t.id, t]));
      const budgets = await this.prisma.budget.findMany({
        where: { organizationId, teamId: { in: teamIds } },
      });
      const budgetMap = new Map(budgets.map((b) => [b.teamId, b]));

      return sorted.map((r) => {
        const team = r.teamId ? map.get(r.teamId) : null;
        const budget = r.teamId ? budgetMap.get(r.teamId) : null;
        const cost = Number(r._sum.cost ?? 0);
        return {
          teamId: r.teamId,
          name: team?.name ?? 'Unassigned',
          members: team?._count.members ?? 0,
          cost,
          budget: budget ? Number(budget.monthlyLimit) : null,
          requests: r._count,
          utilization: budget
            ? (cost / Number(budget.monthlyLimit)) * 100
            : null,
        };
      });
    });
  }

  getUsers(organizationId: string, rangeKey = 'mtd') {
    return this.cached(organizationId, 'users', rangeKey, async () => {
      const range = resolveDateRange(rangeKey);
      const rows = await this.prisma.usageEvent.groupBy({
        by: ['userId'],
        where: {
          organizationId,
          timestamp: timestampFilter(range),
          userId: { not: null },
        },
        _sum: { cost: true, inputTokens: true, outputTokens: true },
        _count: true,
      });
      const sorted = [...rows]
        .sort((a, b) => Number(b._sum.cost ?? 0) - Number(a._sum.cost ?? 0))
        .slice(0, 20);
      const userIds = sorted
        .map((r) => r.userId)
        .filter((id): id is string => id !== null);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          email: true,
          teamMembers: {
            take: 1,
            select: { team: { select: { name: true } } },
          },
        },
      });
      const map = new Map(users.map((u) => [u.id, u]));
      return sorted.map((r) => {
        const profile = r.userId ? map.get(r.userId) : undefined;
        return {
          userId: r.userId,
          name: profile?.name ?? null,
          email: profile?.email ?? null,
          team: profile?.teamMembers[0]?.team.name ?? null,
          cost: Number(r._sum.cost ?? 0),
          requests: r._count,
          tokens: (r._sum.inputTokens ?? 0) + (r._sum.outputTokens ?? 0),
        };
      });
    });
  }

  getModels(organizationId: string, rangeKey = 'mtd') {
    return this.cached(organizationId, 'models', rangeKey, async () => {
      const range = resolveDateRange(rangeKey);
      const rows = await this.prisma.usageEvent.groupBy({
        by: ['model', 'provider'],
        where: { organizationId, timestamp: timestampFilter(range) },
        _sum: { cost: true },
        _count: true,
      });
      const sorted = [...rows].sort(
        (a, b) => Number(b._sum.cost ?? 0) - Number(a._sum.cost ?? 0),
      );
      const total = sorted.reduce((s, r) => s + Number(r._sum.cost ?? 0), 0);
      return sorted.map((r) => ({
        model: r.model,
        provider: r.provider,
        cost: Number(r._sum.cost ?? 0),
        share: total ? (Number(r._sum.cost ?? 0) / total) * 100 : 0,
        requests: r._count,
      }));
    });
  }

  async runDailyAggregation(organizationId: string, date: Date) {
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const agg = await this.prisma.usageEvent.aggregate({
      where: {
        organizationId,
        timestamp: { gte: dayStart, lte: dayEnd },
      },
      _sum: { cost: true, inputTokens: true, outputTokens: true },
      _count: true,
    });

    if (agg._count === 0) return null;

    await this.prisma.dailySpendSnapshot.upsert({
      where: {
        organizationId_snapshotDate: {
          organizationId,
          snapshotDate: dayStart,
        },
      },
      create: {
        organizationId,
        snapshotDate: dayStart,
        totalCost: agg._sum.cost ?? 0,
        requestCount: agg._count,
        inputTokens: agg._sum.inputTokens ?? 0,
        outputTokens: agg._sum.outputTokens ?? 0,
      },
      update: {
        totalCost: agg._sum.cost ?? 0,
        requestCount: agg._count,
        inputTokens: agg._sum.inputTokens ?? 0,
        outputTokens: agg._sum.outputTokens ?? 0,
      },
    });

    await this.cache.invalidateOrg(organizationId);
    return { organizationId, date: dayStart.toISOString().slice(0, 10) };
  }

  async runDailyAggregationAllOrgs() {
    const orgs = await this.prisma.organization.findMany({
      select: { id: true },
    });
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const results = [];
    for (const org of orgs) {
      const r = await this.runDailyAggregation(org.id, yesterday);
      if (r) results.push(r);
    }
    return results;
  }
}
