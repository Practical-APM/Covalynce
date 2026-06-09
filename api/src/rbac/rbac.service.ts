import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_ROLE_PERMISSIONS,
  isPermission,
  PERMISSIONS,
  type Permission,
} from './permissions.constants';

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatrix(organizationId: string) {
    const overrides = await this.prisma.rolePermissionOverride.findMany({
      where: { organizationId },
    });

    const overrideMap = new Map<string, boolean>();
    for (const o of overrides) {
      overrideMap.set(`${o.role}:${o.permission}`, o.allowed);
    }

    const roles = Object.values(UserRole);
    const matrix: Record<string, Record<string, boolean>> = {};

    for (const role of roles) {
      matrix[role] = {};
      for (const permission of PERMISSIONS) {
        const key = `${role}:${permission}`;
        matrix[role][permission] =
          overrideMap.get(key) ?? DEFAULT_ROLE_PERMISSIONS[role][permission];
      }
    }

    return {
      permissions: PERMISSIONS,
      roles,
      matrix,
      hasOverrides: overrides.length > 0,
    };
  }

  async getEffectivePermissions(
    organizationId: string,
    role: UserRole,
  ): Promise<Record<Permission, boolean>> {
    const { matrix } = await this.getMatrix(organizationId);
    return matrix[role];
  }

  async hasPermission(
    organizationId: string,
    role: UserRole,
    permission: Permission,
  ): Promise<boolean> {
    const perms = await this.getEffectivePermissions(organizationId, role);
    return perms[permission] ?? false;
  }

  async setOverride(
    organizationId: string,
    role: UserRole,
    permission: string,
    allowed: boolean,
  ) {
    if (!isPermission(permission)) {
      throw new Error(`Unknown permission: ${permission}`);
    }

    const defaultAllowed = DEFAULT_ROLE_PERMISSIONS[role][permission];
    if (allowed === defaultAllowed) {
      await this.prisma.rolePermissionOverride.deleteMany({
        where: { organizationId, role, permission },
      });
      return { permission, role, allowed: defaultAllowed, overridden: false };
    }

    const record = await this.prisma.rolePermissionOverride.upsert({
      where: {
        organizationId_role_permission: {
          organizationId,
          role,
          permission,
        },
      },
      create: { organizationId, role, permission, allowed },
      update: { allowed },
    });

    return { ...record, overridden: true };
  }

  async resetRole(organizationId: string, role: UserRole) {
    await this.prisma.rolePermissionOverride.deleteMany({
      where: { organizationId, role },
    });
    return { role, reset: true };
  }
}
