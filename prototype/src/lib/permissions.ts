/** Role helpers + RBAC permission keys (mirrors api/src/rbac/permissions.constants.ts) */

export const PERMISSIONS = [
  "providers:read",
  "providers:manage",
  "budgets:read",
  "budgets:manage",
  "policies:read",
  "policies:manage",
  "gateway:read",
  "gateway:manage",
  "agents:read",
  "agents:manage",
  "licenses:read",
  "licenses:manage",
  "insights:read",
  "insights:apply",
  "members:read",
  "members:manage",
  "audit:view",
  "compliance:export",
  "alerts:manage",
  "cost_centers:read",
  "cost_centers:manage",
  "sso:manage",
  "rbac:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const allTrue = (): Record<string, boolean> =>
  Object.fromEntries(PERMISSIONS.map((p) => [p, true]));

export function defaultPermissionsForRole(role: string): Record<string, boolean> {
  if (role === "ADMIN") return allTrue();
  if (role === "MANAGER") {
    return {
      ...Object.fromEntries(PERMISSIONS.map((p) => [p, false])),
      "providers:read": true,
      "providers:manage": true,
      "budgets:read": true,
      "policies:read": true,
      "gateway:read": true,
      "gateway:manage": true,
      "agents:read": true,
      "agents:manage": true,
      "licenses:read": true,
      "licenses:manage": true,
      "insights:read": true,
      "members:read": true,
      "members:manage": true,
      "alerts:manage": true,
      "cost_centers:read": true,
      "cost_centers:manage": true,
    };
  }
  return {
    ...Object.fromEntries(PERMISSIONS.map((p) => [p, false])),
    "providers:read": true,
    "budgets:read": true,
    "policies:read": true,
    "gateway:read": true,
    "agents:read": true,
    "licenses:read": true,
    "insights:read": true,
    "members:read": true,
    "cost_centers:read": true,
  };
}

export function isAdmin(role: string) {
  return role === "ADMIN";
}

export function canManageProviders(role: string) {
  return role === "ADMIN" || role === "MANAGER";
}

export function canManageBudgets(role: string) {
  return role === "ADMIN";
}

export function canManageMembers(role: string) {
  return role === "ADMIN" || role === "MANAGER";
}

export function canViewAuditLog(role: string) {
  return role === "ADMIN";
}

export function hasPermission(role: string, permission: Permission) {
  return defaultPermissionsForRole(role)[permission] === true;
}
