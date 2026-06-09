import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AlertsModule } from '../alerts/alerts.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ProvidersModule } from '../providers/providers.module';
import {
  ALERT_EVALUATION_QUEUE,
  AlertEvaluationProcessor,
} from './alert-evaluation.processor';
import { AlertEvaluationScheduler } from './alert-evaluation.scheduler';
import { DailyAggregationProcessor } from './daily-aggregation.processor';
import { DAILY_AGGREGATION_QUEUE } from './daily-aggregation.processor';
import { DailyAggregationScheduler } from './daily-aggregation.scheduler';
import {
  PROVIDER_SYNC_QUEUE,
  ProviderSyncProcessor,
} from './provider-sync.processor';
import { ProviderSyncScheduler } from './provider-sync.scheduler';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
        },
      }),
    }),
    BullModule.registerQueue(
      { name: PROVIDER_SYNC_QUEUE },
      { name: DAILY_AGGREGATION_QUEUE },
      { name: ALERT_EVALUATION_QUEUE },
    ),
    AnalyticsModule,
    forwardRef(() => ProvidersModule),
    AlertsModule,
  ],
  providers: [
    ProviderSyncProcessor,
    ProviderSyncScheduler,
    DailyAggregationProcessor,
    DailyAggregationScheduler,
    AlertEvaluationProcessor,
    AlertEvaluationScheduler,
  ],
  exports: [ProviderSyncScheduler, BullModule],
})
export class JobsModule {}
