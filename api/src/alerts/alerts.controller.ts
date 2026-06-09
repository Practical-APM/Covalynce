import {
  Body,
  Controller,
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
import { AlertsService } from './alerts.service';
import { UpdateAlertSettingsDto } from './dto/update-alert-settings.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/alerts')
export class AlertsController {
  constructor(
    private readonly alerts: AlertsService,
    private readonly notifications: NotificationsService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('unread') unread?: string) {
    return this.alerts.list(user.organizationId, unread === 'true');
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.alerts.markRead(id, user.organizationId);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: AuthUser) {
    return this.alerts.markAllRead(user.organizationId);
  }

  @Get('settings')
  getSettings(@CurrentUser() user: AuthUser) {
    return this.alerts.getSettings(user.organizationId);
  }

  @Patch('settings')
  @RequirePermission('alerts:manage')
  updateSettings(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateAlertSettingsDto,
  ) {
    return this.alerts.updateSettings(user.organizationId, user, dto);
  }

  @Post('settings/test-slack')
  @RequirePermission('alerts:manage')
  async testSlack(@CurrentUser() user: AuthUser) {
    const settings = await this.alerts.getSettings(user.organizationId);
    if (!settings.slackWebhook) {
      return { sent: false, error: 'No Slack webhook configured' };
    }
    const result = await this.notifications.sendSlack(
      settings.slackWebhook,
      'Covalynce test alert — Slack integration is working.',
    );
    await this.alerts.recordTestDelivery(user.organizationId, 'slack', result);
    return result;
  }

  @Post('evaluate')
  @RequirePermission('alerts:manage')
  evaluate(@CurrentUser() user: AuthUser) {
    return this.alerts.evaluateOrganization(user.organizationId);
  }
}
