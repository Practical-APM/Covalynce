import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { csvRow } from '../common/csv.util';

@Injectable()
export class ComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  async exportBundle(organizationId: string, days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, slug: true },
    });

    const [auditCsv, usageCsv, policiesCsv] = await Promise.all([
      this.buildAuditCsv(organizationId, since),
      this.buildUsageCsv(organizationId, since),
      this.buildPoliciesCsv(organizationId),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      organization: org?.name ?? organizationId,
      periodDays: days,
      files: [
        { filename: 'audit-log.csv', content: auditCsv },
        { filename: 'usage-events.csv', content: usageCsv },
        { filename: 'policy-rules.csv', content: policiesCsv },
      ],
    };
  }

  private async buildAuditCsv(organizationId: string, since: Date) {
    const logs = await this.prisma.auditLog.findMany({
      where: { organizationId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    const actorIds = [
      ...new Set(logs.map((l) => l.actorUserId).filter(Boolean)),
    ] as string[];
    const actors =
      actorIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: actorIds } },
            select: { id: true, email: true },
          })
        : [];
    const actorMap = new Map(actors.map((a) => [a.id, a.email]));

    const header = csvRow([
      'timestamp',
      'action',
      'resource',
      'resource_id',
      'actor_email',
      'metadata',
    ]);

    const rows = logs.map((log) =>
      csvRow([
        log.createdAt.toISOString(),
        log.action,
        log.resource,
        log.resourceId,
        log.actorUserId ? actorMap.get(log.actorUserId) : '',
        log.metadata,
      ]),
    );

    return [header, ...rows].join('\n');
  }

  private async buildUsageCsv(organizationId: string, since: Date) {
    const events = await this.prisma.usageEvent.findMany({
      where: { organizationId, timestamp: { gte: since } },
      orderBy: { timestamp: 'desc' },
      take: 10_000,
      select: {
        timestamp: true,
        provider: true,
        model: true,
        inputTokens: true,
        outputTokens: true,
        cost: true,
        userId: true,
        teamId: true,
        externalId: true,
      },
    });

    const header = csvRow([
      'timestamp',
      'provider',
      'model',
      'input_tokens',
      'output_tokens',
      'cost_usd',
      'user_id',
      'team_id',
      'external_id',
    ]);

    const rows = events.map((e) =>
      csvRow([
        e.timestamp.toISOString(),
        e.provider,
        e.model,
        e.inputTokens,
        e.outputTokens,
        Number(e.cost),
        e.userId,
        e.teamId,
        e.externalId,
      ]),
    );

    return [header, ...rows].join('\n');
  }

  private async buildPoliciesCsv(organizationId: string) {
    const rules = await this.prisma.policyRule.findMany({
      where: { organizationId },
      include: { team: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { budgetEnforcement: true },
    });

    const header = csvRow([
      'name',
      'type',
      'scope',
      'team',
      'enabled',
      'config',
      'budget_enforcement',
    ]);

    const rows = rules.map((r) =>
      csvRow([
        r.name,
        r.type,
        r.scope,
        r.team?.name ?? '',
        r.enabled,
        r.config,
        org?.budgetEnforcement ?? '',
      ]),
    );

    return [header, ...rows].join('\n');
  }
}
