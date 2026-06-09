import { UserRole } from '@prisma/client';

/** Fine-grained permissions for advanced RBAC */
export const PERMISSIONS = [
  'providers:read',
  'providers:manage',
  'budgets:read',
  'budgets:manage',
  'policies:read',
  'policies:manage',
  'gateway:read',
  'gateway:manage',
  'agents:read',
  'agents:manage',
  'licenses:read',
  'licenses:manage',
  'insights:read',
  'insights:apply',
  'members:read',
  'members:manage',
  'audit:view',
  'compliance:export',
  'alerts:manage',
  'cost_centers:read',
  'cost_centers:manage',
  'sso:manage',
  'rbac:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  'providers:read': 'View providers',
  'providers:manage': 'Manage providers',
  'budgets:read': 'View budgets',
  'budgets:manage': 'Manage budgets',
  'policies:read': 'View policies',
  'policies:manage': 'Manage policies',
  'gateway:read': 'View gateway',
  'gateway:manage': 'Manage gateway keys',
  'agents:read': 'View agents',
  'agents:manage': 'Manage agents',
  'licenses:read': 'View licenses',
  'licenses:manage': 'Manage licenses',
  'insights:read': 'View insights',
  'insights:apply': 'Apply insight policies',
  'members:read': 'View members',
  'members:manage': 'Invite & manage members',
  'audit:view': 'View audit log',
  'compliance:export': 'Export compliance bundle',
  'alerts:manage': 'Manage alert settings',
  'cost_centers:read': 'View cost centers',
  'cost_centers:manage': 'Manage cost centers',
  'sso:manage': 'Configure SSO',
  'rbac:manage': 'Configure role permissions',
};

const all = (): Record<Permission, boolean> =>
  Object.fromEntries(PERMISSIONS.map((p) => [p, true])) as Record<
    Permission,
    boolean
  >;

/** Default permission matrix by role */
export const DEFAULT_ROLE_PERMISSIONS: Record<
  UserRole,
  Record<Permission, boolean>
> = {
  [UserRole.ADMIN]: all(),
  [UserRole.MANAGER]: {
    ...(Object.fromEntries(PERMISSIONS.map((p) => [p, false])) as Record<
      Permission,
      boolean
    >),
    'providers:read': true,
    'providers:manage': true,
    'budgets:read': true,
    'policies:read': true,
    'gateway:read': true,
    'gateway:manage': true,
    'agents:read': true,
    'agents:manage': true,
    'licenses:read': true,
    'licenses:manage': true,
    'insights:read': true,
    'members:read': true,
    'members:manage': true,
    'alerts:manage': true,
    'cost_centers:read': true,
    'cost_centers:manage': true,
  },
  [UserRole.VIEWER]: {
    ...(Object.fromEntries(PERMISSIONS.map((p) => [p, false])) as Record<
      Permission,
      boolean
    >),
    'providers:read': true,
    'budgets:read': true,
    'policies:read': true,
    'gateway:read': true,
    'agents:read': true,
    'licenses:read': true,
    'insights:read': true,
    'members:read': true,
    'cost_centers:read': true,
  },
};

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}
