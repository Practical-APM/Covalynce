import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProviderName } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { providerSupportsOAuth } from '../integrations/integration-auth.constants';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import {
  ConnectProviderDto,
  OAuthCallbackDto,
  OAuthStartQueryDto,
} from './dto/connect-provider.dto';
import { ProviderOAuthService } from './provider-oauth.service';
import { ProvidersService } from './providers.service';

@ApiTags('providers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/providers')
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly oauth: ProviderOAuthService,
  ) {}

  @Get()
  @RequirePermission('providers:read')
  list(@CurrentUser() user: AuthUser) {
    return this.providersService.list(user.organizationId);
  }

  @Get('sync-health')
  @RequirePermission('providers:read')
  syncHealth(@CurrentUser() user: AuthUser) {
    return this.providersService.getSyncHealth(user.organizationId);
  }

  @Get('oauth/:provider/start')
  @RequirePermission('providers:manage')
  startOAuth(
    @Param('provider') provider: ProviderName,
    @Query() query: OAuthStartQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (!providerSupportsOAuth(provider)) {
      return {
        provider,
        oauthAvailable: false,
        message: 'Use API key connect for this provider.',
      };
    }
    const origin =
      query.origin ?? process.env.FRONTEND_URL ?? 'http://localhost:3000';
    return {
      oauthAvailable: true,
      preferred: true,
      ...this.oauth.startOAuth(
        user.organizationId,
        user.userId,
        provider,
        origin,
      ),
    };
  }

  @Post('oauth/:provider/callback')
  @RequirePermission('providers:manage')
  async oauthCallback(
    @Param('provider') provider: ProviderName,
    @Body() dto: OAuthCallbackDto,
    @CurrentUser() user: AuthUser,
  ) {
    const tokens = await this.oauth.exchangeCode(provider, dto.code, dto.state);
    return this.providersService.connectViaOAuth(
      user.organizationId,
      user,
      provider,
      tokens,
    );
  }

  @Post('connect')
  @RequirePermission('providers:manage')
  connect(@CurrentUser() user: AuthUser, @Body() dto: ConnectProviderDto) {
    return this.providersService.connect(user.organizationId, user, dto);
  }

  @Get(':id')
  @RequirePermission('providers:read')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.providersService.findOne(id, user.organizationId);
  }

  @Post(':id/sync')
  @RequirePermission('providers:manage')
  async syncNow(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.providersService.syncProvider(id, user.organizationId);
  }

  @Delete(':id')
  @RequirePermission('providers:manage')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.providersService.remove(id, user.organizationId, user);
  }
}
