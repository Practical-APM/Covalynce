import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLicenseDto, UpdateLicenseDto } from './dto/create-license.dto';

@Injectable()
export class LicensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(organizationId: string) {
    return this.prisma.aiLicense.findMany({
      where: { organizationId },
      orderBy: { renewsAt: 'asc' },
    });
  }

  summary(organizationId: string) {
    return this.prisma.aiLicense.aggregate({
      where: { organizationId },
      _sum: { monthlyCost: true, seats: true },
      _count: true,
    });
  }

  async create(organizationId: string, actor: AuthUser, dto: CreateLicenseDto) {
    const license = await this.prisma.aiLicense.create({
      data: {
        organizationId,
        vendor: dto.vendor,
        planName: dto.planName,
        seats: dto.seats,
        monthlyCost: dto.monthlyCost,
        renewsAt: dto.renewsAt ? new Date(dto.renewsAt) : null,
        notes: dto.notes,
      },
    });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'license.created',
      resource: 'ai_license',
      resourceId: license.id,
      metadata: { vendor: dto.vendor, planName: dto.planName },
    });

    return license;
  }

  async update(
    id: string,
    organizationId: string,
    actor: AuthUser,
    dto: UpdateLicenseDto,
  ) {
    const existing = await this.prisma.aiLicense.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new NotFoundException('License not found');

    const license = await this.prisma.aiLicense.update({
      where: { id },
      data: {
        ...(dto.vendor ? { vendor: dto.vendor } : {}),
        ...(dto.planName ? { planName: dto.planName } : {}),
        ...(dto.seats !== undefined ? { seats: dto.seats } : {}),
        ...(dto.monthlyCost !== undefined
          ? { monthlyCost: dto.monthlyCost }
          : {}),
        ...(dto.renewsAt !== undefined
          ? { renewsAt: dto.renewsAt ? new Date(dto.renewsAt) : null }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'license.updated',
      resource: 'ai_license',
      resourceId: id,
    });

    return license;
  }

  async remove(id: string, organizationId: string, actor: AuthUser) {
    const existing = await this.prisma.aiLicense.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new NotFoundException('License not found');

    await this.prisma.aiLicense.delete({ where: { id } });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'license.deleted',
      resource: 'ai_license',
      resourceId: id,
    });

    return { deleted: true };
  }
}
