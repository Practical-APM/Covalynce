import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import {
  PROVIDER_SYNC_QUEUE,
  ProviderSyncJob,
} from './provider-sync.processor';

@Injectable()
export class ProviderSyncScheduler implements OnModuleInit {
  private readonly logger = new Logger(ProviderSyncScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(PROVIDER_SYNC_QUEUE) private readonly queue: Queue,
  ) {}

  async onModuleInit() {
    await this.queue.add(
      'sync-all-orgs',
      { organizationId: '__all__' },
      {
        repeat: { every: 15 * 60 * 1000 },
        jobId: 'provider-sync-repeat',
      },
    );
    this.logger.log('Provider sync scheduled every 15 minutes');
  }

  async enqueueProviderSync(organizationId: string, providerId: string) {
    return this.queue.add(
      'sync-provider',
      { organizationId, providerId } satisfies ProviderSyncJob,
      { removeOnComplete: 100 },
    );
  }

  async runScheduledSync() {
    const orgs = await this.prisma.organization.findMany({
      select: { id: true },
    });
    for (const org of orgs) {
      await this.queue.add(
        'sync-org',
        { organizationId: org.id } satisfies ProviderSyncJob,
        { removeOnComplete: 100, removeOnFail: 50 },
      );
    }
  }
}
