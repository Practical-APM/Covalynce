import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ProvidersService } from '../providers/providers.service';

export const PROVIDER_SYNC_QUEUE = 'provider-sync';

export interface ProviderSyncJob {
  organizationId: string;
  providerId?: string;
}

@Processor(PROVIDER_SYNC_QUEUE)
export class ProviderSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(ProviderSyncProcessor.name);

  constructor(
    private readonly providersService: ProvidersService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<ProviderSyncJob>) {
    const { organizationId, providerId } = job.data;

    if (organizationId === '__all__') {
      const orgs = await this.prisma.organization.findMany({
        select: { id: true },
      });
      const results = [];
      for (const org of orgs) {
        results.push(
          await this.providersService.syncAllForOrganization(org.id),
        );
      }
      return results;
    }

    this.logger.log(
      `Sync job ${job.id} org=${organizationId} provider=${providerId ?? 'all'}`,
    );

    if (providerId) {
      return this.providersService.syncProvider(providerId, organizationId);
    }

    return this.providersService.syncAllForOrganization(organizationId);
  }
}
