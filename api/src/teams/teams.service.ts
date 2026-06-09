import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  listByOrganization(organizationId: string) {
    return this.prisma.team.findMany({
      where: { organizationId },
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId },
      include: {
        members: { include: { user: true } },
        _count: { select: { usageEvents: true } },
      },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async create(organizationId: string, actor: AuthUser, dto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: {
        organizationId,
        name: dto.name,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'team.created',
        resource: 'team',
        resourceId: team.id,
        metadata: { name: dto.name },
      },
    });

    return team;
  }

  async update(
    id: string,
    organizationId: string,
    actor: AuthUser,
    dto: UpdateTeamDto,
  ) {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const updated = await this.prisma.team.update({
      where: { id },
      data: { name: dto.name },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'team.updated',
        resource: 'team',
        resourceId: id,
        metadata: { from: team.name, to: dto.name },
      },
    });

    return updated;
  }

  async remove(id: string, organizationId: string, actor: AuthUser) {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    await this.prisma.team.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'team.deleted',
        resource: 'team',
        resourceId: id,
        metadata: { name: team.name },
      },
    });

    return { deleted: true };
  }

  assertOrgAccess(requestedOrgId: string, user: AuthUser) {
    if (requestedOrgId !== user.organizationId) {
      throw new ForbiddenException('Cross-organization access denied');
    }
  }
}
