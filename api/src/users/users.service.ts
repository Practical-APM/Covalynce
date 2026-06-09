import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { NotificationsService } from '../alerts/notifications.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import {
  resolveDateRange,
  timestampFilter,
} from '../analytics/date-range.util';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, plan: true },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      ...this.authService.sanitizeUser(user),
      organization: user.organization,
    };
  }

  listByOrganization(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getProfile(userId: string, organizationId: string, rangeKey = 'mtd') {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        teamMembers: {
          take: 1,
          select: { team: { select: { name: true } } },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const range = resolveDateRange(rangeKey);
    const agg = await this.prisma.usageEvent.aggregate({
      where: {
        organizationId,
        userId,
        timestamp: timestampFilter(range),
      },
      _sum: { cost: true, inputTokens: true, outputTokens: true },
      _count: true,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      team: user.teamMembers[0]?.team.name ?? null,
      cost: Number(agg._sum.cost ?? 0),
      requests: agg._count,
      tokens: (agg._sum.inputTokens ?? 0) + (agg._sum.outputTokens ?? 0),
    };
  }

  async invite(organizationId: string, actor: AuthUser, dto: InviteUserDto) {
    if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only admins and managers can invite users');
    }

    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { organizationId_email: { organizationId, email } },
    });
    if (existing) {
      throw new ConflictException('User already exists in this organization');
    }

    const role = dto.role ?? UserRole.VIEWER;
    if (role === UserRole.ADMIN && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can invite other admins');
    }

    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email,
        name: dto.name ?? email.split('@')[0],
        role,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'user.invited',
        resource: 'user',
        resourceId: user.id,
        metadata: { email, role },
      },
    });

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, slug: true },
    });
    const frontend =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const loginUrl = `${frontend.replace(/\/$/, '')}/login?slug=${encodeURIComponent(org?.slug ?? '')}`;

    const emailResult = await this.notifications.sendEmail(
      [email],
      `You're invited to ${org?.name ?? 'Covalynce'}`,
      [
        `You've been invited to ${org?.name ?? 'an organization'} on Covalynce as ${role}.`,
        '',
        `Sign in with ${email} and org slug "${org?.slug ?? ''}":`,
        loginUrl,
        '',
        'If you did not expect this invite, you can ignore this email.',
      ].join('\n'),
    );

    return {
      ...this.authService.sanitizeUser(user),
      inviteEmail: emailResult,
    };
  }

  async updateRole(
    userId: string,
    organizationId: string,
    actor: AuthUser,
    dto: UpdateUserRoleDto,
  ) {
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change roles');
    }
    if (userId === actor.userId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'user.role_updated',
        resource: 'user',
        resourceId: userId,
        metadata: { from: user.role, to: dto.role },
      },
    });

    return this.authService.sanitizeUser(updated);
  }

  async remove(userId: string, organizationId: string, actor: AuthUser) {
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can remove users');
    }
    if (userId === actor.userId) {
      throw new ForbiddenException('Cannot remove yourself');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { organizationId, role: UserRole.ADMIN },
      });
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot remove the last admin');
      }
    }

    await this.prisma.user.delete({ where: { id: userId } });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'user.removed',
        resource: 'user',
        resourceId: userId,
        metadata: { email: user.email },
      },
    });

    return { deleted: true };
  }
}
