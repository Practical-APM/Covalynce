import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GatewayKeysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(organizationId: string) {
    return this.prisma.gatewayApiKey.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        enabled: true,
        rateLimitRpm: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(organizationId: string, actor: AuthUser, name: string) {
    const rawKey = `gk_${randomBytes(24).toString('base64url')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.slice(0, 16);

    const record = await this.prisma.gatewayApiKey.create({
      data: {
        organizationId,
        name,
        keyPrefix,
        keyHash,
      },
    });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'gateway_key.created',
      resource: 'gateway_api_key',
      resourceId: record.id,
      metadata: { name, keyPrefix },
    });

    return {
      id: record.id,
      name: record.name,
      keyPrefix: record.keyPrefix,
      /** Shown once — store securely */
      key: rawKey,
      createdAt: record.createdAt,
    };
  }

  async revoke(id: string, organizationId: string, actor: AuthUser) {
    const key = await this.prisma.gatewayApiKey.findFirst({
      where: { id, organizationId },
    });
    if (!key) return null;

    await this.prisma.gatewayApiKey.delete({ where: { id } });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'gateway_key.revoked',
      resource: 'gateway_api_key',
      resourceId: id,
    });

    return { revoked: true };
  }

  async updateRateLimit(
    id: string,
    organizationId: string,
    actor: AuthUser,
    rateLimitRpm: number,
  ) {
    const key = await this.prisma.gatewayApiKey.findFirst({
      where: { id, organizationId },
    });
    if (!key) return null;

    const updated = await this.prisma.gatewayApiKey.update({
      where: { id },
      data: { rateLimitRpm },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        enabled: true,
        rateLimitRpm: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'gateway_key.rate_limit_updated',
      resource: 'gateway_api_key',
      resourceId: id,
      metadata: { rateLimitRpm },
    });

    return updated;
  }

  async validateKey(rawKey: string) {
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const key = await this.prisma.gatewayApiKey.findFirst({
      where: { keyHash, enabled: true },
    });
    if (!key) return null;

    await this.prisma.gatewayApiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      organizationId: key.organizationId,
      keyId: key.id,
      rateLimitRpm: key.rateLimitRpm,
    };
  }
}
