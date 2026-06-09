import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly startedAt = Date.now();
  private requestCount = 0;
  private errorCount = 0;
  private totalDurationMs = 0;

  recordRequest(durationMs: number, statusCode: number) {
    this.requestCount += 1;
    this.totalDurationMs += durationMs;
    if (statusCode >= 500) {
      this.errorCount += 1;
    }
  }

  snapshot() {
    const uptimeMs = Date.now() - this.startedAt;
    return {
      uptimeSeconds: Math.floor(uptimeMs / 1000),
      requests: {
        total: this.requestCount,
        errors5xx: this.errorCount,
        avgDurationMs:
          this.requestCount > 0
            ? Math.round(this.totalDurationMs / this.requestCount)
            : 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
