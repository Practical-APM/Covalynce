import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnalyticsQueryDto } from '../analytics/dto/analytics-query.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getSummary(@CurrentUser() user: AuthUser, @Query() query: AnalyticsQueryDto) {
    return this.dashboardService.getSummary(
      user.organizationId,
      query.range ?? 'mtd',
    );
  }

  @Post('seed-demo')
  seedDemo(@CurrentUser() user: AuthUser) {
    return this.dashboardService.seedDemoData(user.organizationId);
  }
}
