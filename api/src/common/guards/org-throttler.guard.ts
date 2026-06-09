import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class OrgThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const user = req.user as AuthUser | undefined;
    if (user?.organizationId) {
      return Promise.resolve(`org:${user.organizationId}`);
    }
    const ip =
      (req.ip as string | undefined) ??
      (req.headers as { 'x-forwarded-for'?: string })['x-forwarded-for'] ??
      'anonymous';
    return Promise.resolve(`ip:${ip}`);
  }
}
