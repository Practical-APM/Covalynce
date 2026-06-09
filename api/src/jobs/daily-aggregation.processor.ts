import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AnalyticsService } from '../analytics/analytics.service';

export const DAILY_AGGREGATION_QUEUE = 'daily-aggregation';

@Processor(DAILY_AGGREGATION_QUEUE)
export class DailyAggregationProcessor extends WorkerHost {
  private readonly logger = new Logger(DailyAggregationProcessor.name);

  constructor(private readonly analytics: AnalyticsService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Running daily aggregation job ${job.id}`);
    return this.analytics.runDailyAggregationAllOrgs();
  }
}
