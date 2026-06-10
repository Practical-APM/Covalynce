import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Organization slug already exists');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          plan: 'community',
        },
      });

      const admin = await tx.user.create({
        data: {
          organizationId: org.id,
          email: dto.adminEmail.toLowerCase(),
          name: dto.adminName ?? dto.adminEmail.split('@')[0],
          role: UserRole.ADMIN,
        },
      });

      await tx.alertSetting.create({
        data: { organizationId: org.id },
      });

      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          actorUserId: admin.id,
          action: 'organization.created',
          resource: 'organization',
          resourceId: org.id,
        },
      });

      return { organization: org, admin };
    });

    return {
      ...(await this.authService.signSession(
        result.admin,
        result.organization,
      )),
    };
  }

  async updateName(id: string, actorUserId: string, name: string) {
    const org = await this.prisma.organization.update({
      where: { id },
      data: { name },
      select: { id: true, name: true, slug: true, plan: true },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId: id,
        actorUserId,
        action: 'organization.renamed',
        resource: 'organization',
        resourceId: id,
        metadata: { name },
      },
    });

    return org;
  }

  async findById(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            teams: true,
            providers: true,
          },
        },
      },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async findBySlug(slug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }
}
