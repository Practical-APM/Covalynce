import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { AlertsService } from '../alerts/alerts.service';

export const ALERT_EVALUATION_QUEUE = 'alert-evaluation';

@Processor(ALERT_EVALUATION_QUEUE)
export class AlertEvaluationProcessor extends WorkerHost {
  private readonly logger = new Logger(AlertEvaluationProcessor.name);

  constructor(private readonly alerts: AlertsService) {
    super();
  }

  process() {
    this.logger.debug('Running alert evaluation');
    return this.alerts.evaluateAllOrganizations();
  }
}
