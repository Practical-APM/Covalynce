import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AnalyticsService } from '../analytics/analytics.service';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
    private readonly cache: CacheService,
  ) {}

  getSummary(organizationId: string, range = 'mtd') {
    return this.analytics.getDashboardSummary(organizationId, range);
  }

  /** Seed demo data for development / design partners */
  async seedDemoData(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) return null;

    const existing = await this.prisma.usageEvent.count({
      where: { organizationId },
    });
    if (existing > 0) {
      return { seeded: false, message: 'Organization already has usage data' };
    }

    let openai = await this.prisma.provider.findFirst({
      where: { organizationId, name: 'OPENAI' },
    });
    if (!openai) {
      openai = await this.prisma.provider.create({
        data: {
          organizationId,
          name: 'OPENAI',
          displayName: 'OpenAI',
          status: 'CONNECTED',
          encryptedCredentials: 'demo',
          lastSyncAt: new Date(),
        },
      });
    }

    const team = await this.prisma.team.upsert({
      where: {
        organizationId_name: {
          organizationId,
          name: 'Platform Engineering',
        },
      },
      create: { organizationId, name: 'Platform Engineering' },
      update: {},
    });

    const admin = await this.prisma.user.findFirst({
      where: { organizationId, role: 'ADMIN' },
    });

    const events: Prisma.UsageEventCreateManyInput[] = [];
    const models = ['gpt-4o', 'gpt-4o-mini', 'claude-sonnet-4'];
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - day);
      for (let i = 0; i < 8; i++) {
        events.push({
          organizationId,
          providerId: openai.id,
          provider: 'OPENAI',
          model: models[i % models.length],
          teamId: team.id,
          userId: admin?.id,
          inputTokens: 800 + i * 100,
          outputTokens: 200 + i * 50,
          cost: new Prisma.Decimal((12 + i * 1.5).toFixed(4)),
          timestamp: date,
          externalId: `demo-${day}-${i}`,
        });
      }
    }

    await this.prisma.usageEvent.createMany({
      data: events,
      skipDuplicates: true,
    });

    await this.cache.invalidateOrg(organizationId);

    return { seeded: true, eventsCreated: events.length };
  }
}
