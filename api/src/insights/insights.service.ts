import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PolicyRuleType, PolicyScope } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PoliciesService } from '../policies/policies.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CHEAPER_ALTERNATIVES,
  type AnomalyInsight,
  type CostSimulationResult,
  type OptimizationInsight,
} from './insights.constants';
import type { SimulateCostDto } from './dto/simulate-cost.dto';

@Injectable()
export class InsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policies: PoliciesService,
  ) {}

  async getOptimizationInsights(
    organizationId: string,
  ): Promise<OptimizationInsight[]> {
    const since = new Date(Date.now() - 30 * 86400000);

    const byModel = await this.prisma.usageEvent.groupBy({
      by: ['model', 'provider'],
      where: { organizationId, timestamp: { gte: since } },
      _sum: { cost: true, inputTokens: true, outputTokens: true },
      _count: { id: true },
    });

    if (byModel.length === 0) {
      return [];
    }

    const totalSpend = byModel.reduce(
      (s, r) => s + Number(r._sum.cost ?? 0),
      0,
    );

    const insights: OptimizationInsight[] = [];

    for (const row of byModel) {
      const alt = CHEAPER_ALTERNATIVES[row.model];
      if (!alt || alt.provider !== row.provider) continue;

      const spend = Number(row._sum.cost ?? 0);
      const share = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;
      if (share < 10) continue;

      const altPricing = await this.prisma.pricingVersion.findFirst({
        where: { provider: row.provider, model: alt.model },
        orderBy: { effectiveDate: 'desc' },
      });
      const curPricing = await this.prisma.pricingVersion.findFirst({
        where: { provider: row.provider, model: row.model },
        orderBy: { effectiveDate: 'desc' },
      });

      if (!altPricing || !curPricing) continue;

      const input = Number(row._sum.inputTokens ?? 0);
      const output = Number(row._sum.outputTokens ?? 0);
      const altCost =
        (input / 1_000_000) * Number(altPricing.inputCostPerMillion) +
        (output / 1_000_000) * Number(altPricing.outputCostPerMillion);
      const savings = Math.max(0, spend - altCost);

      if (savings < 5) continue;

      insights.push({
        id: `downgrade-${row.model}`,
        type: 'model_downgrade',
        severity: share >= 30 ? 'high' : share >= 15 ? 'medium' : 'low',
        title: `Consider ${alt.model} instead of ${row.model}`,
        description: `${row.model} accounts for ${share.toFixed(0)}% of spend ($${spend.toFixed(0)}/30d). Routing similar workloads to ${alt.model} could save ~$${savings.toFixed(0)}/month.`,
        estimatedMonthlySavings: Math.round(savings),
        actionLabel: 'Apply deny policy',
        actionHref: '/policies',
        applyable: true,
        denyModel: row.model,
        suggestModel: alt.model,
      });
    }

    const byProvider = await this.prisma.usageEvent.groupBy({
      by: ['provider'],
      where: { organizationId, timestamp: { gte: since } },
      _sum: { cost: true },
    });

    if (byProvider.length >= 3) {
      const top = [...byProvider].sort(
        (a, b) => Number(b._sum.cost ?? 0) - Number(a._sum.cost ?? 0),
      );
      const topSpend = Number(top[0]?._sum.cost ?? 0);
      const restSpend = top
        .slice(1)
        .reduce((s, p) => s + Number(p._sum.cost ?? 0), 0);

      if (restSpend > 0 && restSpend < topSpend * 0.15) {
        insights.push({
          id: 'provider-consolidation',
          type: 'provider_consolidation',
          severity: 'low',
          title: 'Consolidate low-volume providers',
          description: `Most spend is on ${top[0]?.provider}. Minor providers contribute <$${restSpend.toFixed(0)}/mo — evaluate whether you need them all.`,
          estimatedMonthlySavings: Math.round(restSpend * 0.5),
          actionLabel: 'View providers',
          actionHref: '/providers',
          applyable: false,
        });
      }
    }

    return insights.sort(
      (a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings,
    );
  }

  async applyOptimizationInsight(
    organizationId: string,
    actor: AuthUser,
    insightId: string,
  ) {
    if (!insightId.startsWith('downgrade-')) {
      throw new BadRequestException(
        'Only model downgrade insights can be auto-applied as policies',
      );
    }

    const expensiveModel = insightId.replace('downgrade-', '');
    const alt = CHEAPER_ALTERNATIVES[expensiveModel];
    if (!alt) {
      throw new NotFoundException('Unknown insight or model mapping');
    }

    const rule = await this.policies.create(organizationId, actor, {
      name: `Block ${expensiveModel} (insight)`,
      type: PolicyRuleType.MODEL_DENY_LIST,
      scope: PolicyScope.ORGANIZATION,
      config: { models: [expensiveModel] },
    });

    return {
      applied: true,
      insightId,
      policy: rule,
      message: `Created deny policy for ${expensiveModel}. Use ${alt.model} via gateway instead.`,
    };
  }

  async getAnomalies(organizationId: string): Promise<AnomalyInsight[]> {
    const since = new Date(Date.now() - 30 * 86400000);
    const anomalies: AnomalyInsight[] = [];
    const now = new Date().toISOString();

    const dailyRows = await this.prisma.$queryRaw<
      { day: Date; spend: number; requests: bigint }[]
    >`
      SELECT DATE(timestamp) as day,
             SUM(cost)::float as spend,
             COUNT(*)::bigint as requests
      FROM usage_events
      WHERE organization_id = ${organizationId}
        AND timestamp >= ${since}
      GROUP BY DATE(timestamp)
      ORDER BY day ASC
    `;

    if (dailyRows.length >= 7) {
      const spends = dailyRows.map((r) => Number(r.spend));
      const mean = spends.reduce((a, b) => a + b, 0) / spends.length;
      const variance =
        spends.reduce((s, v) => s + (v - mean) ** 2, 0) / spends.length;
      const stdDev = Math.sqrt(variance) || 1;

      const latest = dailyRows[dailyRows.length - 1];
      const latestSpend = Number(latest.spend);
      const zScore = (latestSpend - mean) / stdDev;

      if (zScore >= 2) {
        anomalies.push({
          id: 'anomaly-daily-spend',
          type: 'spend_spike',
          severity: zScore >= 3 ? 'high' : 'medium',
          title: 'Unusual daily spend detected',
          description: `Yesterday's spend ($${latestSpend.toFixed(0)}) is ${zScore.toFixed(1)}σ above your 30-day average ($${mean.toFixed(0)}/day).`,
          metric: 'daily_spend',
          value: latestSpend,
          baseline: mean,
          zScore: Math.round(zScore * 10) / 10,
          detectedAt: now,
          actionLabel: 'View usage',
          actionHref: '/usage',
        });
      }

      const requests = dailyRows.map((r) => Number(r.requests));
      const reqMean = requests.reduce((a, b) => a + b, 0) / requests.length;
      const reqStd =
        Math.sqrt(
          requests.reduce((s, v) => s + (v - reqMean) ** 2, 0) /
            requests.length,
        ) || 1;
      const latestReq = Number(latest.requests);
      const reqZ = (latestReq - reqMean) / reqStd;

      if (reqZ >= 2.5 && latestReq > reqMean * 1.5) {
        anomalies.push({
          id: 'anomaly-request-volume',
          type: 'request_spike',
          severity: reqZ >= 3.5 ? 'high' : 'medium',
          title: 'Request volume spike',
          description: `${latestReq.toLocaleString()} requests on the latest day vs ${reqMean.toFixed(0)} daily average (${reqZ.toFixed(1)}σ).`,
          metric: 'daily_requests',
          value: latestReq,
          baseline: reqMean,
          zScore: Math.round(reqZ * 10) / 10,
          detectedAt: now,
          actionLabel: 'View models',
          actionHref: '/models',
        });
      }
    }

    const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
    const byModel = await this.prisma.usageEvent.groupBy({
      by: ['model', 'provider'],
      where: { organizationId, timestamp: { gte: since } },
      _sum: { cost: true },
      _count: true,
    });

    for (const row of byModel) {
      const recent = await this.prisma.usageEvent.aggregate({
        where: {
          organizationId,
          model: row.model,
          timestamp: { gte: threeDaysAgo },
        },
        _sum: { cost: true },
        _count: true,
      });

      const totalCost = Number(row._sum.cost ?? 0);
      const totalCount = row._count;
      if (totalCount < 20 || totalCost < 10) continue;

      const recentCost = Number(recent._sum.cost ?? 0);
      const recentCount = recent._count;
      const priorDays = 27;
      const priorDailyCost = (totalCost - recentCost) / priorDays;
      const recentDailyCost = recentCost / 3;

      if (priorDailyCost > 0 && recentDailyCost > priorDailyCost * 2) {
        const pct = ((recentDailyCost - priorDailyCost) / priorDailyCost) * 100;
        anomalies.push({
          id: `anomaly-model-${row.model}`,
          type: 'model_spike',
          severity: pct >= 150 ? 'high' : 'medium',
          title: `${row.model} usage surging`,
          description: `${row.model} daily cost is up ${pct.toFixed(0)}% vs prior 27 days (${recentCount} requests in last 3 days).`,
          metric: 'model_daily_cost',
          value: recentDailyCost,
          baseline: priorDailyCost,
          detectedAt: now,
          actionLabel: 'Simulate downgrade',
          actionHref: '/dashboard',
        });
      }
    }

    const byUser = await this.prisma.usageEvent.groupBy({
      by: ['userId'],
      where: {
        organizationId,
        timestamp: { gte: threeDaysAgo },
        userId: { not: null },
      },
      _sum: { cost: true },
      _count: true,
    });

    if (byUser.length >= 2) {
      const sorted = [...byUser].sort(
        (a, b) => Number(b._sum.cost ?? 0) - Number(a._sum.cost ?? 0),
      );
      const top = sorted[0];
      const restAvg =
        sorted.slice(1).reduce((s, u) => s + Number(u._sum.cost ?? 0), 0) /
        (sorted.length - 1);
      const topCost = Number(top._sum.cost ?? 0);

      if (restAvg > 0 && topCost > restAvg * 3) {
        const user = top.userId
          ? await this.prisma.user.findUnique({
              where: { id: top.userId },
              select: { name: true, email: true },
            })
          : null;
        const label = user?.name ?? user?.email ?? 'A user';

        anomalies.push({
          id: `anomaly-user-${top.userId}`,
          type: 'user_spike',
          severity: topCost > restAvg * 5 ? 'high' : 'medium',
          title: 'Concentrated user spend',
          description: `${label} spent $${topCost.toFixed(0)} in 3 days — ${(topCost / restAvg).toFixed(1)}× the average of other active users.`,
          metric: 'user_3d_spend',
          value: topCost,
          baseline: restAvg,
          detectedAt: now,
          actionLabel: 'View user',
          actionHref: top.userId ? `/users/${top.userId}` : '/users',
        });
      }
    }

    return anomalies.sort((a, b) => {
      const sev = { high: 3, medium: 2, low: 1 };
      return sev[b.severity] - sev[a.severity];
    });
  }

  async getSimulationModels(organizationId: string) {
    const since = new Date(Date.now() - 30 * 86400000);
    const rows = await this.prisma.usageEvent.groupBy({
      by: ['model', 'provider'],
      where: { organizationId, timestamp: { gte: since } },
      _sum: { cost: true },
      _count: true,
    });

    return [...rows]
      .sort((a, b) => Number(b._sum.cost ?? 0) - Number(a._sum.cost ?? 0))
      .map((r) => ({
        model: r.model,
        provider: r.provider,
        cost30d: Number(r._sum.cost ?? 0),
        requests: r._count,
        suggestedAlternative: CHEAPER_ALTERNATIVES[r.model]?.model ?? null,
      }));
  }

  async simulateCost(
    organizationId: string,
    dto: SimulateCostDto,
  ): Promise<CostSimulationResult> {
    const periodDays = 30;
    const since = new Date(Date.now() - periodDays * 86400000);
    const volumeMultiplier = 1 + (dto.volumeChangePercent ?? 0) / 100;

    const byModel = await this.prisma.usageEvent.groupBy({
      by: ['model', 'provider'],
      where: { organizationId, timestamp: { gte: since } },
      _sum: { cost: true, inputTokens: true, outputTokens: true },
      _count: true,
    });

    const modelMap = new Map(
      byModel.map((r) => [
        r.model,
        {
          provider: r.provider,
          cost: Number(r._sum.cost ?? 0),
          input: Number(r._sum.inputTokens ?? 0),
          output: Number(r._sum.outputTokens ?? 0),
          requests: r._count,
        },
      ]),
    );

    let currentMonthly = 0;
    let projectedMonthly = 0;
    const breakdown: CostSimulationResult['breakdown'] = [];

    for (const row of byModel) {
      currentMonthly += Number(row._sum.cost ?? 0);
    }

    const swapMap = new Map(dto.swaps.map((s) => [s.fromModel, s.toModel]));

    for (const row of byModel) {
      const data = modelMap.get(row.model)!;
      const toModel = swapMap.get(row.model);
      const scaledInput = Math.round(data.input * volumeMultiplier);
      const scaledOutput = Math.round(data.output * volumeMultiplier);
      const scaledCost = data.cost * volumeMultiplier;

      if (!toModel) {
        projectedMonthly += scaledCost;
        continue;
      }

      const toPricing = await this.prisma.pricingVersion.findFirst({
        where: { provider: data.provider, model: toModel },
        orderBy: { effectiveDate: 'desc' },
      });

      let projectedCost = scaledCost;
      if (toPricing) {
        projectedCost =
          (scaledInput / 1_000_000) * Number(toPricing.inputCostPerMillion) +
          (scaledOutput / 1_000_000) * Number(toPricing.outputCostPerMillion);
      } else {
        const alt = CHEAPER_ALTERNATIVES[row.model];
        if (alt?.model === toModel) {
          const altPricing = await this.prisma.pricingVersion.findFirst({
            where: { provider: alt.provider, model: alt.model },
            orderBy: { effectiveDate: 'desc' },
          });
          if (altPricing) {
            projectedCost =
              (scaledInput / 1_000_000) *
                Number(altPricing.inputCostPerMillion) +
              (scaledOutput / 1_000_000) *
                Number(altPricing.outputCostPerMillion);
          }
        }
      }

      projectedMonthly += projectedCost;
      breakdown.push({
        fromModel: row.model,
        toModel,
        provider: data.provider,
        currentCost: scaledCost,
        projectedCost,
        savings: scaledCost - projectedCost,
        requests: Math.round(data.requests * volumeMultiplier),
      });
    }

    const monthlySavings = Math.max(0, currentMonthly - projectedMonthly);
    const savingsPercent =
      currentMonthly > 0 ? (monthlySavings / currentMonthly) * 100 : 0;

    return {
      periodDays,
      currentMonthlyProjected: Math.round(currentMonthly * 100) / 100,
      projectedMonthly: Math.round(projectedMonthly * 100) / 100,
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      savingsPercent: Math.round(savingsPercent * 10) / 10,
      breakdown: breakdown.sort((a, b) => b.savings - a.savings),
    };
  }
}
