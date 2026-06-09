import { Injectable, Logger } from '@nestjs/common';
import { AlertSeverity, AlertType, UserRole } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetsService } from '../budgets/budgets.service';
import { UpdateAlertSettingsDto } from './dto/update-alert-settings.dto';
import { NotificationsService } from './notifications.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly budgets: BudgetsService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  list(organizationId: string, unreadOnly = false) {
    return this.prisma.alert.findMany({
      where: {
        organizationId,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markRead(id: string, organizationId: string) {
    const alert = await this.prisma.alert.findFirst({
      where: { id, organizationId },
    });
    if (!alert) return null;
    return this.prisma.alert.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllRead(organizationId: string) {
    await this.prisma.alert.updateMany({
      where: { organizationId, read: false },
      data: { read: true },
    });
    return { updated: true };
  }

  private enrichSettings(
    settings: Awaited<ReturnType<PrismaService['alertSetting']['findUnique']>>,
    organizationId: string,
  ) {
    return {
      id: settings?.id ?? null,
      organizationId,
      emailEnabled: settings?.emailEnabled ?? true,
      slackWebhook: settings?.slackWebhook ?? null,
      budgetThresholdPercent: settings?.budgetThresholdPercent ?? 90,
      lastEmailDeliveryAt: settings?.lastEmailDeliveryAt ?? null,
      lastEmailDeliveryStatus: settings?.lastEmailDeliveryStatus ?? null,
      lastEmailDeliveryError: settings?.lastEmailDeliveryError ?? null,
      lastSlackDeliveryAt: settings?.lastSlackDeliveryAt ?? null,
      lastSlackDeliveryStatus: settings?.lastSlackDeliveryStatus ?? null,
      lastSlackDeliveryError: settings?.lastSlackDeliveryError ?? null,
      emailDeliveryConfigured: this.notifications.isEmailConfigured(),
    };
  }

  async getSettings(organizationId: string) {
    const settings = await this.prisma.alertSetting.findUnique({
      where: { organizationId },
    });
    return this.enrichSettings(settings, organizationId);
  }

  async recordTestDelivery(
    organizationId: string,
    channel: 'email' | 'slack',
    result: { sent: boolean; demo?: boolean; error?: string },
  ) {
    return this.recordDelivery(organizationId, channel, result);
  }

  private async recordDelivery(
    organizationId: string,
    channel: 'email' | 'slack',
    result: { sent: boolean; demo?: boolean; error?: string; status?: number },
  ) {
    const status = result.sent ? 'sent' : result.demo ? 'demo' : 'error';
    const now = new Date();
    await this.prisma.alertSetting.upsert({
      where: { organizationId },
      create: {
        organizationId,
        ...(channel === 'email'
          ? {
              lastEmailDeliveryAt: now,
              lastEmailDeliveryStatus: status,
              lastEmailDeliveryError: result.error ?? null,
            }
          : {
              lastSlackDeliveryAt: now,
              lastSlackDeliveryStatus: status,
              lastSlackDeliveryError: result.error ?? null,
            }),
      },
      update:
        channel === 'email'
          ? {
              lastEmailDeliveryAt: now,
              lastEmailDeliveryStatus: status,
              lastEmailDeliveryError: result.error ?? null,
            }
          : {
              lastSlackDeliveryAt: now,
              lastSlackDeliveryStatus: status,
              lastSlackDeliveryError: result.error ?? null,
            },
    });
  }

  async updateSettings(
    organizationId: string,
    actor: AuthUser,
    dto: UpdateAlertSettingsDto,
  ) {
    const settings = await this.prisma.alertSetting.upsert({
      where: { organizationId },
      create: {
        organizationId,
        emailEnabled: dto.emailEnabled ?? true,
        slackWebhook: dto.slackWebhook,
        budgetThresholdPercent: dto.budgetThresholdPercent ?? 90,
      },
      update: {
        ...(dto.emailEnabled !== undefined
          ? { emailEnabled: dto.emailEnabled }
          : {}),
        ...(dto.slackWebhook !== undefined
          ? { slackWebhook: dto.slackWebhook }
          : {}),
        ...(dto.budgetThresholdPercent !== undefined
          ? { budgetThresholdPercent: dto.budgetThresholdPercent }
          : {}),
      },
    });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'alert_settings.updated',
      resource: 'alert_settings',
      resourceId: settings.id,
      metadata: {
        emailEnabled: settings.emailEnabled,
        budgetThresholdPercent: settings.budgetThresholdPercent,
        slackConfigured: !!settings.slackWebhook,
      },
    });

    return this.enrichSettings(settings, organizationId);
  }

  private async recentDuplicate(
    organizationId: string,
    type: AlertType,
    resourceKey: string,
    hours = 6,
  ) {
    const since = new Date(Date.now() - hours * 3600000);
    const existing = await this.prisma.alert.findFirst({
      where: {
        organizationId,
        type,
        createdAt: { gte: since },
        metadata: { path: ['resourceKey'], equals: resourceKey },
      },
    });
    return !!existing;
  }

  private async createAndNotify(
    organizationId: string,
    payload: {
      type: AlertType;
      severity: AlertSeverity;
      title: string;
      message: string;
      resourceKey: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    if (
      await this.recentDuplicate(
        organizationId,
        payload.type,
        payload.resourceKey,
      )
    ) {
      return null;
    }

    const alert = await this.prisma.alert.create({
      data: {
        organizationId,
        type: payload.type,
        severity: payload.severity,
        title: payload.title,
        message: payload.message,
        metadata: { resourceKey: payload.resourceKey, ...payload.metadata },
      },
    });

    const settings = await this.getSettings(organizationId);
    const text = `*${payload.title}*\n${payload.message}`;

    if (settings?.slackWebhook) {
      const slackResult = await this.notifications.sendSlack(
        settings.slackWebhook,
        text,
      );
      await this.recordDelivery(organizationId, 'slack', slackResult);
    }

    if (settings?.emailEnabled) {
      const admins = await this.prisma.user.findMany({
        where: { organizationId, role: UserRole.ADMIN },
        select: { email: true },
      });
      if (admins.length) {
        const emailResult = await this.notifications.sendEmail(
          admins.map((a) => a.email),
          payload.title,
          payload.message,
        );
        await this.recordDelivery(organizationId, 'email', emailResult);
      }
    }

    return alert;
  }

  async evaluateOrganization(organizationId: string) {
    const settings = await this.getSettings(organizationId);
    const threshold = settings?.budgetThresholdPercent ?? 90;
    const created = [];

    const budgets = await this.budgets.listWithSpend(organizationId);
    for (const budget of budgets) {
      if (budget.utilization >= threshold) {
        const severity =
          budget.utilization >= 100
            ? AlertSeverity.CRITICAL
            : AlertSeverity.WARNING;
        const alert = await this.createAndNotify(organizationId, {
          type: AlertType.BUDGET_THRESHOLD,
          severity,
          title: `${budget.name} at ${budget.utilization.toFixed(0)}% budget`,
          message: `Spent $${budget.spent.toFixed(2)} of $${budget.monthlyLimit.toFixed(2)} monthly limit.`,
          resourceKey: `budget:${budget.id}`,
          metadata: { budgetId: budget.id, utilization: budget.utilization },
        });
        if (alert) created.push(alert);
      }
    }

    const spendSpike = await this.detectSpendSpike(organizationId);
    if (spendSpike) {
      const alert = await this.createAndNotify(organizationId, {
        type: AlertType.SPEND_SPIKE,
        severity: AlertSeverity.WARNING,
        title: 'Weekly spend spike detected',
        message: spendSpike.message,
        resourceKey: 'spend:org-spike',
        metadata: spendSpike,
      });
      if (alert) created.push(alert);
    }

    const providerSpikes = await this.detectProviderSpikes(organizationId);
    for (const spike of providerSpikes) {
      const alert = await this.createAndNotify(organizationId, {
        type: AlertType.PROVIDER_SPIKE,
        severity: AlertSeverity.WARNING,
        title: `${spike.provider} costs trending higher`,
        message: spike.message,
        resourceKey: `provider:${spike.provider}`,
        metadata: spike,
      });
      if (alert) created.push(alert);
    }

    return { organizationId, alertsCreated: created.length };
  }

  private async detectSpendSpike(organizationId: string) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

    const [recent, prior] = await Promise.all([
      this.prisma.usageEvent.aggregate({
        where: {
          organizationId,
          timestamp: { gte: weekAgo, lte: now },
        },
        _sum: { cost: true },
      }),
      this.prisma.usageEvent.aggregate({
        where: {
          organizationId,
          timestamp: { gte: twoWeeksAgo, lt: weekAgo },
        },
        _sum: { cost: true },
      }),
    ]);

    const recentSpend = Number(recent._sum.cost ?? 0);
    const priorSpend = Number(prior._sum.cost ?? 0);
    if (priorSpend <= 0 || recentSpend <= 0) return null;

    const change = ((recentSpend - priorSpend) / priorSpend) * 100;
    if (change < 20) return null;

    return {
      message: `Spend up ${change.toFixed(0)}% vs prior week ($${recentSpend.toFixed(0)} vs $${priorSpend.toFixed(0)}).`,
      change,
      recentSpend,
      priorSpend,
    };
  }

  private async detectProviderSpikes(organizationId: string) {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 86400000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    const providers = await this.prisma.usageEvent.groupBy({
      by: ['provider'],
      where: { organizationId, timestamp: { gte: thirtyDaysAgo } },
    });

    const spikes = [];
    for (const { provider } of providers) {
      const [recent, total] = await Promise.all([
        this.prisma.usageEvent.aggregate({
          where: {
            organizationId,
            provider,
            timestamp: { gte: threeDaysAgo },
          },
          _sum: { cost: true },
        }),
        this.prisma.usageEvent.aggregate({
          where: {
            organizationId,
            provider,
            timestamp: { gte: thirtyDaysAgo },
          },
          _sum: { cost: true },
        }),
      ]);

      const recentCost = Number(recent._sum.cost ?? 0);
      const totalCost = Number(total._sum.cost ?? 0);
      const dailyAvg = totalCost / 30;
      const recentDaily = recentCost / 3;

      if (dailyAvg > 0 && recentDaily > dailyAvg * 1.18) {
        const pct = ((recentDaily - dailyAvg) / dailyAvg) * 100;
        spikes.push({
          provider,
          message: `${provider} spend is ${pct.toFixed(0)}% above 30-day daily average.`,
          pct,
        });
      }
    }
    return spikes;
  }

  async evaluateAllOrganizations() {
    const orgs = await this.prisma.organization.findMany({
      select: { id: true },
    });
    const results = [];
    for (const org of orgs) {
      results.push(await this.evaluateOrganization(org.id));
    }
    this.logger.log(`Evaluated ${orgs.length} organizations`);
    return results;
  }
}
