import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditService } from '../audit/audit.service';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsGuard } from './permissions.guard';
import { RequirePermission } from './require-permission.decorator';
import { EnterpriseFeatureGuard } from '../editions/enterprise-feature.guard';
import { RequireEnterpriseFeature } from '../editions/require-enterprise-feature.decorator';
import { RbacService } from './rbac.service';

@ApiTags('rbac')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, EnterpriseFeatureGuard)
@Controller('api/v1/rbac')
export class RbacController {
  constructor(
    private readonly rbac: RbacService,
    private readonly audit: AuditService,
  ) {}

  @Get('permissions')
  getMatrix(@CurrentUser() user: AuthUser) {
    return this.rbac.getMatrix(user.organizationId);
  }

  @Get('me')
  async myPermissions(@CurrentUser() user: AuthUser) {
    const permissions = await this.rbac.getEffectivePermissions(
      user.organizationId,
      user.role,
    );
    return { role: user.role, permissions };
  }

  @Patch('permissions')
  @RequirePermission('rbac:manage')
  @RequireEnterpriseFeature('rbac_overrides')
  async updatePermission(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePermissionDto,
  ) {
    const result = await this.rbac.setOverride(
      user.organizationId,
      dto.role,
      dto.permission,
      dto.allowed,
    );

    await this.audit.log(user.organizationId, {
      actorUserId: user.userId,
      action: 'rbac.permission_updated',
      resource: 'role_permission',
      metadata: {
        role: dto.role,
        permission: dto.permission,
        allowed: dto.allowed,
      },
    });

    return result;
  }

  @Post('permissions/reset/:role')
  @RequirePermission('rbac:manage')
  @RequireEnterpriseFeature('rbac_overrides')
  async resetRole(
    @Param('role') role: UserRole,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.rbac.resetRole(user.organizationId, role);

    await this.audit.log(user.organizationId, {
      actorUserId: user.userId,
      action: 'rbac.role_reset',
      resource: 'role_permission',
      metadata: { role },
    });

    return result;
  }
}
