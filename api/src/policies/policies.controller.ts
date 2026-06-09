import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import {
  CreatePolicyRuleDto,
  UpdateEnforcementDto,
  UpdatePolicyRuleDto,
} from './dto/create-policy-rule.dto';
import { ImportPoliciesYamlDto } from './dto/import-policies-yaml.dto';
import { PoliciesService } from './policies.service';

@ApiTags('policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/policies')
export class PoliciesController {
  constructor(private readonly policies: PoliciesService) {}

  @Get()
  @RequirePermission('policies:read')
  list(@CurrentUser() user: AuthUser) {
    return this.policies.list(user.organizationId);
  }

  @Get('enforcement')
  @RequirePermission('policies:read')
  getEnforcement(@CurrentUser() user: AuthUser) {
    return this.policies.getEnforcement(user.organizationId);
  }

  @Patch('enforcement')
  @RequirePermission('policies:manage')
  setEnforcement(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateEnforcementDto,
  ) {
    return this.policies.setEnforcement(
      user.organizationId,
      user,
      dto.budgetEnforcement,
    );
  }

  @Post()
  @RequirePermission('policies:manage')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePolicyRuleDto) {
    return this.policies.create(user.organizationId, user, dto);
  }

  @Get('export/yaml')
  @RequirePermission('policies:read')
  exportYaml(@CurrentUser() user: AuthUser) {
    return this.policies.exportYaml(user.organizationId);
  }

  @Post('import/yaml')
  @RequirePermission('policies:manage')
  importYaml(
    @CurrentUser() user: AuthUser,
    @Body() dto: ImportPoliciesYamlDto,
  ) {
    return this.policies.importYaml(
      user.organizationId,
      user,
      dto.yaml,
      dto.mode ?? 'append',
    );
  }

  @Patch(':id')
  @RequirePermission('policies:manage')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePolicyRuleDto,
  ) {
    return this.policies.update(id, user.organizationId, user, dto);
  }

  @Delete(':id')
  @RequirePermission('policies:manage')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.policies.remove(id, user.organizationId, user);
  }
}
