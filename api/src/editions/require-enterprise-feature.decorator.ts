import { SetMetadata } from '@nestjs/common';
import type { EnterpriseFeature } from './editions.constants';

export const ENTERPRISE_FEATURE_KEY = 'enterprise_feature';

export const RequireEnterpriseFeature = (feature: EnterpriseFeature) =>
  SetMetadata(ENTERPRISE_FEATURE_KEY, feature);
