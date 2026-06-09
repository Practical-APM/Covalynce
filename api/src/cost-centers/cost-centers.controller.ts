import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { CostCentersService } from './cost-centers.service';
import {
  CreateCostCenterDto,
  UpdateCostCenterDto,
} from './dto/cost-center.dto';

@ApiTags('cost-centers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/cost-centers')
export class CostCentersController {
  constructor(private readonly costCenters: CostCentersService) {}

  @Get()
  @RequirePermission('cost_centers:read')
  list(@CurrentUser() user: AuthUser) {
    return this.costCenters.list(user.organizationId);
  }

  @Get('chargeback-report')
  @RequirePermission('cost_centers:read')
  chargebackReport(
    @CurrentUser() user: AuthUser,
    @Query('days') days?: string,
  ) {
    const period = Math.min(365, Math.max(1, parseInt(days ?? '30', 10) || 30));
    return this.costCenters.chargebackReport(user.organizationId, period);
  }

  @Post('chargeback-report/email')
  @RequirePermission('cost_centers:read')
  emailChargebackReport(
    @CurrentUser() user: AuthUser,
    @Query('days') days?: string,
  ) {
    const period = Math.min(365, Math.max(1, parseInt(days ?? '30', 10) || 30));
    return this.costCenters.emailChargebackReport(
      user.organizationId,
      user.userId,
      period,
    );
  }

  @Post()
  @RequirePermission('cost_centers:manage')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCostCenterDto) {
    return this.costCenters.create(user.organizationId, user, dto);
  }

  @Patch(':id')
  @RequirePermission('cost_centers:manage')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateCostCenterDto,
  ) {
    return this.costCenters.update(id, user.organizationId, dto);
  }

  @Delete(':id')
  @RequirePermission('cost_centers:manage')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.costCenters.remove(id, user.organizationId);
  }
}
