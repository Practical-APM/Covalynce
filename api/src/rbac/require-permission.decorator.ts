import { SetMetadata } from '@nestjs/common';
import type { Permission } from './permissions.constants';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
