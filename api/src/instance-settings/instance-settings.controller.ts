import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  TestEmailDto,
  UpdateInstanceSettingsDto,
} from './dto/instance-settings.dto';
import { InstanceSettingsService } from './instance-settings.service';

@ApiTags('instance-settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('api/v1/instance-settings')
export class InstanceSettingsController {
  constructor(
    private readonly settings: InstanceSettingsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  async get() {
    const [settings, status] = await Promise.all([
      this.settings.list(),
      this.settings.status(),
    ]);
    return { settings, status };
  }

  @Put()
  async update(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateInstanceSettingsDto,
  ) {
    const result = await this.settings.update(dto.values);

    await this.audit.log(user.organizationId, {
      actorUserId: user.userId,
      action: 'instance.settings_updated',
      resource: 'instance_settings',
      // Keys only — values (secrets) are never written to the audit log.
      metadata: { keys: result.updated },
    });

    return { ...result, settings: await this.settings.list() };
  }

  @Post('test-email')
  async testEmail(@CurrentUser() user: AuthUser, @Body() dto: TestEmailDto) {
    return this.settings.sendTestEmail(dto.to ?? user.email);
  }
}
