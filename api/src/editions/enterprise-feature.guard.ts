import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { EditionsService } from './editions.service';
import { ENTERPRISE_FEATURE_KEY } from './require-enterprise-feature.decorator';
import type { EnterpriseFeature } from './editions.constants';

@Injectable()
export class EnterpriseFeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly editions: EditionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<EnterpriseFeature>(
      ENTERPRISE_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!feature) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!user?.organizationId) return true;

    await this.editions.assertEnterpriseFeature(user.organizationId, feature);
    return true;
  }
}
