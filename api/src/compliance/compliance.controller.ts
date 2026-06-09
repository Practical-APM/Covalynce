import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { EnterpriseFeatureGuard } from '../editions/enterprise-feature.guard';
import { RequireEnterpriseFeature } from '../editions/require-enterprise-feature.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { ComplianceService } from './compliance.service';

@ApiTags('compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, EnterpriseFeatureGuard)
@RequirePermission('compliance:export')
@RequireEnterpriseFeature('compliance_export')
@Controller('api/v1/compliance')
export class ComplianceController {
  constructor(private readonly compliance: ComplianceService) {}

  @Get('export')
  export(@CurrentUser() user: AuthUser, @Query('days') days?: string) {
    const period = Math.min(365, Math.max(1, parseInt(days ?? '30', 10) || 30));
    return this.compliance.exportBundle(user.organizationId, period);
  }
}
