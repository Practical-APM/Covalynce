import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { SimulateCostDto } from './dto/simulate-cost.dto';
import { InsightsService } from './insights.service';

@ApiTags('insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/insights')
export class InsightsController {
  constructor(private readonly insights: InsightsService) {}

  @Get('optimization')
  @RequirePermission('insights:read')
  optimization(@CurrentUser() user: AuthUser) {
    return this.insights.getOptimizationInsights(user.organizationId);
  }

  @Get('anomalies')
  @RequirePermission('insights:read')
  anomalies(@CurrentUser() user: AuthUser) {
    return this.insights.getAnomalies(user.organizationId);
  }

  @Get('simulate/models')
  @RequirePermission('insights:read')
  simulationModels(@CurrentUser() user: AuthUser) {
    return this.insights.getSimulationModels(user.organizationId);
  }

  @Post('simulate')
  @RequirePermission('insights:read')
  simulate(@CurrentUser() user: AuthUser, @Body() dto: SimulateCostDto) {
    return this.insights.simulateCost(user.organizationId, dto);
  }

  @Post('optimization/:id/apply')
  @RequirePermission('insights:apply')
  apply(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.insights.applyOptimizationInsight(
      user.organizationId,
      user,
      id,
    );
  }
}
