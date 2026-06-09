import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { DAILY_AGGREGATION_QUEUE } from './daily-aggregation.processor';

@Injectable()
export class DailyAggregationScheduler implements OnModuleInit {
  private readonly logger = new Logger(DailyAggregationScheduler.name);

  constructor(
    @InjectQueue(DAILY_AGGREGATION_QUEUE) private readonly queue: Queue,
  ) {}

  async onModuleInit() {
    await this.queue.add(
      'daily-rollup',
      {},
      {
        repeat: { every: 24 * 60 * 60 * 1000 },
        jobId: 'daily-aggregation-repeat',
      },
    );
    this.logger.log('Daily aggregation scheduled every 24 hours');
  }
}
