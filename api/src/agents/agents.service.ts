import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto, UpdateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private slugify(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
  }

  private currentPeriodStart() {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  }

  async list(organizationId: string) {
    const agents = await this.prisma.agent.findMany({
      where: { organizationId },
      include: { team: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      agents.map(async (a) => {
        const spent = await this.computeSpent(organizationId, a.id);
        const limit = a.monthlyBudget ? Number(a.monthlyBudget) : null;
        return {
          id: a.id,
          name: a.name,
          slug: a.slug,
          description: a.description,
          teamId: a.teamId,
          team: a.team,
          monthlyBudget: limit,
          spent,
          utilization: limit ? (spent / limit) * 100 : null,
          enabled: a.enabled,
          createdAt: a.createdAt,
        };
      }),
    );
  }

  async computeSpent(organizationId: string, agentId: string) {
    const agg = await this.prisma.usageEvent.aggregate({
      where: {
        organizationId,
        agentId,
        timestamp: { gte: this.currentPeriodStart() },
      },
      _sum: { cost: true },
    });
    return Number(agg._sum.cost ?? 0);
  }

  async create(organizationId: string, actor: AuthUser, dto: CreateAgentDto) {
    const slug = dto.slug?.trim() || this.slugify(dto.name);
    if (!slug) {
      throw new BadRequestException('Invalid agent name');
    }

    if (dto.teamId) {
      const team = await this.prisma.team.findFirst({
        where: { id: dto.teamId, organizationId },
      });
      if (!team) throw new NotFoundException('Team not found');
    }

    const agent = await this.prisma.agent.create({
      data: {
        organizationId,
        name: dto.name,
        slug,
        description: dto.description,
        teamId: dto.teamId,
        monthlyBudget: dto.monthlyBudget,
        enabled: dto.enabled ?? true,
      },
    });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'agent.created',
      resource: 'agent',
      resourceId: agent.id,
      metadata: { name: agent.name, slug: agent.slug },
    });

    return agent;
  }

  async update(
    id: string,
    organizationId: string,
    actor: AuthUser,
    dto: UpdateAgentDto,
  ) {
    const existing = await this.prisma.agent.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new NotFoundException('Agent not found');

    const agent = await this.prisma.agent.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.monthlyBudget !== undefined
          ? { monthlyBudget: dto.monthlyBudget }
          : {}),
        ...(dto.enabled !== undefined ? { enabled: dto.enabled } : {}),
        ...(dto.teamId !== undefined ? { teamId: dto.teamId } : {}),
      },
    });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'agent.updated',
      resource: 'agent',
      resourceId: id,
    });

    return agent;
  }

  async remove(id: string, organizationId: string, actor: AuthUser) {
    const existing = await this.prisma.agent.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new NotFoundException('Agent not found');

    await this.prisma.agent.delete({ where: { id } });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'agent.deleted',
      resource: 'agent',
      resourceId: id,
    });

    return { deleted: true };
  }

  resolveBySlug(organizationId: string, slug: string) {
    return this.prisma.agent.findFirst({
      where: { organizationId, slug, enabled: true },
    });
  }

  resolveAgent(organizationId: string, identifier: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier,
      );
    if (isUuid) {
      return this.prisma.agent.findFirst({
        where: { id: identifier, organizationId, enabled: true },
      });
    }
    return this.resolveBySlug(organizationId, identifier);
  }
}
