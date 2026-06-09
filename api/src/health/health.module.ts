import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '../cache/cache.module';
import { PROVIDER_SYNC_QUEUE } from '../jobs/provider-sync.processor';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    CacheModule,
    TelemetryModule,
    BullModule.registerQueue({ name: PROVIDER_SYNC_QUEUE }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
