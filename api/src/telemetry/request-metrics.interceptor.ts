import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const started = Date.now();
    const req = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      requestId?: string;
      user?: { organizationId?: string; userId?: string };
    }>();
    const res = context.switchToHttp().getResponse<{ statusCode: number }>();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - started;
          this.metrics.recordRequest(durationMs, res.statusCode);
          this.logger.log(
            JSON.stringify({
              requestId: req.requestId,
              method: req.method,
              path: req.url,
              status: res.statusCode,
              durationMs,
              orgId: req.user?.organizationId,
              userId: req.user?.userId,
            }),
          );
        },
        error: () => {
          const durationMs = Date.now() - started;
          const status = res.statusCode >= 400 ? res.statusCode : 500;
          this.metrics.recordRequest(durationMs, status);
        },
      }),
    );
  }
}
