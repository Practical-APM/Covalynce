import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BudgetScope, Prisma } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  private currentPeriodStart() {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  }

  async computeSpent(organizationId: string, teamId?: string | null) {
    const start = this.currentPeriodStart();
    const agg = await this.prisma.usageEvent.aggregate({
      where: {
        organizationId,
        timestamp: { gte: start },
        ...(teamId ? { teamId } : {}),
      },
      _sum: { cost: true },
    });
    return Number(agg._sum.cost ?? 0);
  }

  async listWithSpend(organizationId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { organizationId },
      include: { team: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return Promise.all(
      budgets.map(async (b) => {
        const spent = await this.computeSpent(
          organizationId,
          b.scope === BudgetScope.TEAM ? b.teamId : null,
        );
        const limit = Number(b.monthlyLimit);
        return {
          id: b.id,
          name: b.name,
          scope: b.scope,
          teamId: b.teamId,
          teamName: b.team?.name ?? null,
          monthlyLimit: limit,
          spent,
          utilization: limit ? (spent / limit) * 100 : 0,
          periodStart: b.periodStart,
          period: 'month_to_date',
        };
      }),
    );
  }

  async create(organizationId: string, actor: AuthUser, dto: CreateBudgetDto) {
    if (dto.scope === BudgetScope.TEAM && !dto.teamId) {
      throw new BadRequestException('teamId required for team budgets');
    }
    if (dto.scope === BudgetScope.ORGANIZATION && dto.teamId) {
      throw new BadRequestException(
        'teamId must be empty for organization budgets',
      );
    }

    if (dto.teamId) {
      const team = await this.prisma.team.findFirst({
        where: { id: dto.teamId, organizationId },
      });
      if (!team) throw new NotFoundException('Team not found');
    }

    const budget = await this.prisma.budget.create({
      data: {
        organizationId,
        name: dto.name,
        scope: dto.scope,
        teamId: dto.scope === BudgetScope.TEAM ? dto.teamId : null,
        monthlyLimit: new Prisma.Decimal(dto.monthlyLimit),
        periodStart: this.currentPeriodStart(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'budget.created',
        resource: 'budget',
        resourceId: budget.id,
        metadata: { name: dto.name, limit: dto.monthlyLimit },
      },
    });

    const spent = await this.computeSpent(organizationId, budget.teamId);
    return {
      ...budget,
      monthlyLimit: Number(budget.monthlyLimit),
      spent,
    };
  }

  async update(
    id: string,
    organizationId: string,
    actor: AuthUser,
    dto: UpdateBudgetDto,
  ) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, organizationId },
    });
    if (!budget) throw new NotFoundException('Budget not found');

    const updated = await this.prisma.budget.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.monthlyLimit
          ? { monthlyLimit: new Prisma.Decimal(dto.monthlyLimit) }
          : {}),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'budget.updated',
        resource: 'budget',
        resourceId: id,
      },
    });

    return {
      ...updated,
      monthlyLimit: Number(updated.monthlyLimit),
    };
  }

  async remove(id: string, organizationId: string, actor: AuthUser) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, organizationId },
    });
    if (!budget) throw new NotFoundException('Budget not found');

    await this.prisma.budget.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'budget.deleted',
        resource: 'budget',
        resourceId: id,
      },
    });

    return { deleted: true };
  }

  /** Org burn rate: avg daily spend MTD */
  async getOrgBurnRate(organizationId: string) {
    const spent = await this.computeSpent(organizationId);
    const dayOfMonth = new Date().getUTCDate();
    const days = Math.max(dayOfMonth, 1);
    return { spent, dailyBurn: spent / days, days };
  }
}
