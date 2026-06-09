import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('providers')
  providers(@CurrentUser() user: AuthUser, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getProviders(user.organizationId, query.range);
  }

  @Get('teams')
  teams(@CurrentUser() user: AuthUser, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getTeams(user.organizationId, query.range);
  }

  @Get('users')
  users(@CurrentUser() user: AuthUser, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getUsers(user.organizationId, query.range);
  }

  @Get('models')
  models(@CurrentUser() user: AuthUser, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getModels(user.organizationId, query.range);
  }
}
