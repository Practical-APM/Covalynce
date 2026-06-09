import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { EditionsService } from './editions.service';

@ApiTags('editions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/editions')
export class EditionsController {
  constructor(private readonly editions: EditionsService) {}

  @Get('features')
  features(@CurrentUser() user: AuthUser) {
    return this.editions.featureFlagsForOrganization(user.organizationId);
  }
}
