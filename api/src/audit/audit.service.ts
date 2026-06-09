import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  decodeCursor,
  encodeCursor,
  parsePageLimit,
} from '../common/cursor-pagination';
import { CursorQueryDto } from '../common/dto/cursor-query.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string, query: CursorQueryDto = {}) {
    const limit = parsePageLimit(query.limit, 50, 500);
    const decoded = query.cursor ? decodeCursor(query.cursor) : null;

    const logs = await this.prisma.auditLog.findMany({
      where: {
        organizationId,
        ...(decoded
          ? {
              OR: [
                { createdAt: { lt: new Date(decoded.iso) } },
                {
                  createdAt: new Date(decoded.iso),
                  id: { lt: decoded.id },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });

    const hasMore = logs.length > limit;
    const page = hasMore ? logs.slice(0, limit) : logs;

    const actorIds = [
      ...new Set(page.map((l) => l.actorUserId).filter(Boolean)),
    ] as string[];

    const actors =
      actorIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: actorIds } },
            select: { id: true, email: true, name: true },
          })
        : [];

    const actorMap = new Map(actors.map((a) => [a.id, a]));

    const items = page.map((log) => {
      const actor = log.actorUserId ? actorMap.get(log.actorUserId) : undefined;
      return {
        id: log.id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        metadata: log.metadata,
        createdAt: log.createdAt,
        actor: actor
          ? { id: actor.id, email: actor.email, name: actor.name }
          : null,
      };
    });

    const last = page[page.length - 1];
    return {
      items,
      hasMore,
      nextCursor:
        hasMore && last
          ? encodeCursor(last.createdAt.toISOString(), last.id)
          : null,
    };
  }

  log(
    organizationId: string,
    payload: {
      actorUserId?: string;
      action: string;
      resource: string;
      resourceId?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    return this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: payload.actorUserId,
        action: payload.action,
        resource: payload.resource,
        resourceId: payload.resourceId,
        metadata: payload.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
