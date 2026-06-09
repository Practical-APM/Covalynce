import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsageQueryDto } from './dto/usage-query.dto';
import { UsageService } from './usage.service';

@ApiTags('usage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: UsageQueryDto) {
    return this.usageService.list(user.organizationId, query);
  }
}
