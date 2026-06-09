import { Controller, Get } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { SkipThrottle } from '@nestjs/throttler';
import type { Queue } from 'bullmq';
import { CacheService } from '../cache/cache.service';
import { PROVIDER_SYNC_QUEUE } from '../jobs/provider-sync.processor';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from '../telemetry/metrics.service';

@SkipThrottle()
@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
    private readonly cache: CacheService,
    @InjectQueue(PROVIDER_SYNC_QUEUE)
    private readonly providerSyncQueue: Queue,
  ) {}

  @Get('health')
  rootHealth() {
    return { status: 'ok', service: 'covalynce-api' };
  }

  @Get('api/v1/health')
  async apiHealth() {
    let database: 'ok' | 'error' = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'error';
    }

    const redis = await this.cache.ping();

    let workers: 'ok' | 'error' = 'error';
    try {
      await this.providerSyncQueue.getJobCounts();
      workers = 'ok';
    } catch {
      workers = 'error';
    }

    const checks = { database, redis, workers };
    const allOk = Object.values(checks).every((v) => v === 'ok');

    return {
      status: allOk ? 'ok' : 'degraded',
      service: 'covalynce-api',
      version: '0.1.0',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/v1/health/metrics')
  metricsSnapshot() {
    return this.metrics.snapshot();
  }
}
