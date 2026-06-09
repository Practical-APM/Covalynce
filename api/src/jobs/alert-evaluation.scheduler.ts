import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ALERT_EVALUATION_QUEUE } from './alert-evaluation.processor';

@Injectable()
export class AlertEvaluationScheduler implements OnModuleInit {
  constructor(
    @InjectQueue(ALERT_EVALUATION_QUEUE)
    private readonly queue: Queue,
  ) {}

  async onModuleInit() {
    await this.queue.add(
      'evaluate-all',
      {},
      {
        repeat: { every: 5 * 60 * 1000 },
        jobId: 'alert-evaluation-repeat',
      },
    );
  }
}
