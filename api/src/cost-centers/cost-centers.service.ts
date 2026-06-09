import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from '../alerts/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCostCenterDto,
  UpdateCostCenterDto,
} from './dto/cost-center.dto';

@Injectable()
export class CostCentersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private currentPeriodStart() {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  }

  async list(organizationId: string) {
    const centers = await this.prisma.costCenter.findMany({
      where: { organizationId },
      include: { team: { select: { id: true, name: true } } },
      orderBy: { code: 'asc' },
    });

    const start = this.currentPeriodStart();
    return Promise.all(
      centers.map(async (c) => {
        const agg = await this.prisma.usageEvent.aggregate({
          where: {
            organizationId,
            projectTag: c.code,
            timestamp: { gte: start },
          },
          _sum: { cost: true },
        });
        return {
          id: c.id,
          code: c.code,
          name: c.name,
          description: c.description,
          teamId: c.teamId,
          teamName: c.team?.name ?? null,
          monthToDateSpend: Number(agg._sum.cost ?? 0),
          createdAt: c.createdAt,
        };
      }),
    );
  }

  async create(
    organizationId: string,
    actor: AuthUser,
    dto: CreateCostCenterDto,
  ) {
    const code = dto.code.trim().toUpperCase();
    if (dto.teamId) {
      await this.assertTeam(organizationId, dto.teamId);
    }

    try {
      const center = await this.prisma.costCenter.create({
        data: {
          organizationId,
          code,
          name: dto.name.trim(),
          description: dto.description?.trim(),
          teamId: dto.teamId,
        },
      });
      return center;
    } catch {
      throw new BadRequestException(
        `Cost center code "${code}" already exists`,
      );
    }
  }

  async update(id: string, organizationId: string, dto: UpdateCostCenterDto) {
    await this.findOrThrow(id, organizationId);
    if (dto.teamId) {
      await this.assertTeam(organizationId, dto.teamId);
    }

    return this.prisma.costCenter.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        teamId: dto.teamId === null ? null : dto.teamId,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOrThrow(id, organizationId);
    await this.prisma.costCenter.delete({ where: { id } });
    return { deleted: true };
  }

  async chargebackReport(organizationId: string, days: number) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);

    const centers = await this.prisma.costCenter.findMany({
      where: { organizationId },
      include: { team: { select: { name: true } } },
      orderBy: { code: 'asc' },
    });

    const lines = await Promise.all(
      centers.map(async (c) => {
        const agg = await this.prisma.usageEvent.aggregate({
          where: {
            organizationId,
            projectTag: c.code,
            timestamp: { gte: since },
          },
          _sum: { cost: true, inputTokens: true, outputTokens: true },
          _count: true,
        });
        return {
          code: c.code,
          name: c.name,
          teamName: c.team?.name ?? null,
          eventCount: agg._count,
          inputTokens: agg._sum.inputTokens ?? 0,
          outputTokens: agg._sum.outputTokens ?? 0,
          spend: Number(agg._sum.cost ?? 0),
        };
      }),
    );

    const untagged = await this.prisma.usageEvent.aggregate({
      where: {
        organizationId,
        projectTag: null,
        timestamp: { gte: since },
      },
      _sum: { cost: true, inputTokens: true, outputTokens: true },
      _count: true,
    });

    const taggedTotal = lines.reduce((sum, l) => sum + l.spend, 0);
    const untaggedSpend = Number(untagged._sum.cost ?? 0);
    const totalSpend = taggedTotal + untaggedSpend;

    return {
      periodDays: days,
      since: since.toISOString(),
      generatedAt: new Date().toISOString(),
      totalSpend,
      taggedSpend: taggedTotal,
      untaggedSpend,
      untagged: {
        eventCount: untagged._count,
        inputTokens: untagged._sum.inputTokens ?? 0,
        outputTokens: untagged._sum.outputTokens ?? 0,
        spend: untaggedSpend,
      },
      costCenters: lines,
    };
  }

  async emailChargebackReport(
    organizationId: string,
    userId: string,
    days: number,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const report = await this.chargebackReport(organizationId, days);
    const rows = [
      'code,name,team,events,spend_usd',
      ...report.costCenters.map(
        (l) =>
          `${l.code},"${l.name.replace(/"/g, '""')}",${l.teamName ?? ''},${l.eventCount},${l.spend.toFixed(2)}`,
      ),
      `UNTAGGED,"Untagged gateway usage",,${report.untagged.eventCount},${report.untagged.spend.toFixed(2)}`,
    ];
    const csv = rows.join('\n');
    const subject = `Covalynce chargeback report (${days} days)`;
    const body = [
      `Chargeback summary for the last ${days} days.`,
      '',
      `Total spend: $${report.totalSpend.toFixed(2)}`,
      `Tagged: $${report.taggedSpend.toFixed(2)}`,
      `Untagged: $${report.untaggedSpend.toFixed(2)}`,
      '',
      'CSV attached inline below:',
      '',
      csv,
    ].join('\n');

    const result = await this.notifications.sendEmail(
      [user.email],
      subject,
      body,
    );
    if (!result.sent && !result.demo) {
      throw new BadRequestException(
        result.error ?? 'Email not configured — set RESEND_API_KEY on the API',
      );
    }

    return {
      sent: result.sent,
      demo: result.demo,
      message: result.sent
        ? `Chargeback report emailed to ${user.email}`
        : result.demo
          ? 'Email not configured — CSV returned in response for dev'
          : 'Failed to send email',
      report,
      csv,
    };
  }

  private async findOrThrow(id: string, organizationId: string) {
    const center = await this.prisma.costCenter.findFirst({
      where: { id, organizationId },
    });
    if (!center) {
      throw new NotFoundException('Cost center not found');
    }
    return center;
  }

  private async assertTeam(organizationId: string, teamId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId },
    });
    if (!team) {
      throw new BadRequestException('Team not found in this organization');
    }
  }
}
