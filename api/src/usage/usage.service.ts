import { Injectable } from '@nestjs/common';
import { ProviderName } from '@prisma/client';
import {
  decodeCursor,
  encodeCursor,
  parsePageLimit,
} from '../common/cursor-pagination';
import { PrismaService } from '../prisma/prisma.service';
import { UsageQueryDto } from './dto/usage-query.dto';

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string, query: UsageQueryDto) {
    const limit = parsePageLimit(query.limit, 50, 500);
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    const decoded = query.cursor ? decodeCursor(query.cursor) : null;

    const providerFilter = query.provider
      ? (query.provider.toUpperCase() as ProviderName)
      : undefined;

    const events = await this.prisma.usageEvent.findMany({
      where: {
        organizationId,
        ...(from || to
          ? {
              timestamp: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
        ...(providerFilter ? { provider: providerFilter } : {}),
        ...(query.teamId ? { teamId: query.teamId } : {}),
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.model ? { model: query.model } : {}),
        ...(decoded
          ? {
              OR: [
                { timestamp: { lt: new Date(decoded.iso) } },
                {
                  timestamp: new Date(decoded.iso),
                  id: { lt: decoded.id },
                },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
      },
      orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });

    const hasMore = events.length > limit;
    const page = hasMore ? events.slice(0, limit) : events;

    const total = await this.prisma.usageEvent.aggregate({
      where: {
        organizationId,
        ...(from || to
          ? {
              timestamp: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
        ...(providerFilter ? { provider: providerFilter } : {}),
        ...(query.teamId ? { teamId: query.teamId } : {}),
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.model ? { model: query.model } : {}),
      },
      _sum: { cost: true, inputTokens: true, outputTokens: true },
      _count: true,
    });

    const last = page[page.length - 1];

    return {
      events: page.map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        provider: e.provider,
        model: e.model,
        user: e.user,
        team: e.team,
        inputTokens: e.inputTokens,
        outputTokens: e.outputTokens,
        cost: Number(e.cost),
      })),
      summary: {
        count: total._count,
        totalCost: Number(total._sum.cost ?? 0),
        inputTokens: total._sum.inputTokens ?? 0,
        outputTokens: total._sum.outputTokens ?? 0,
      },
      hasMore,
      nextCursor:
        hasMore && last
          ? encodeCursor(last.timestamp.toISOString(), last.id)
          : null,
    };
  }
}
