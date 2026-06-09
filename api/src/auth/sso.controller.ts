import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { EditionsService } from '../editions/editions.service';
import { EnterpriseFeatureGuard } from '../editions/enterprise-feature.guard';
import { RequireEnterpriseFeature } from '../editions/require-enterprise-feature.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SsoExchangeDto, UpdateSsoConfigDto } from './dto/sso.dto';
import { SsoService } from './sso.service';

@ApiTags('auth')
@Controller('api/v1/auth/sso')
export class SsoController {
  constructor(
    private readonly sso: SsoService,
    private readonly audit: AuditService,
    private readonly editions: EditionsService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Post('exchange')
  @SkipThrottle()
  async exchange(@Body() dto: SsoExchangeDto) {
    const org = await this.prisma.organization.findUnique({
      where: { slug: dto.organizationSlug },
      select: { id: true },
    });
    if (org) {
      const mockEnabled =
        this.config.get<string>('SSO_MOCK_ENABLED') === 'true';
      if (!mockEnabled) {
        await this.editions.assertEnterpriseFeature(org.id, 'sso');
      }
    }

    return this.sso.exchangeToken(dto.organizationSlug, dto.accessToken);
  }

  @Get('config')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, EnterpriseFeatureGuard)
  @RequirePermission('sso:manage')
  @RequireEnterpriseFeature('sso')
  getConfig(@CurrentUser() user: AuthUser) {
    return this.sso.getConfig(user.organizationId);
  }

  @Patch('config')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, EnterpriseFeatureGuard)
  @RequirePermission('sso:manage')
  @RequireEnterpriseFeature('sso')
  async updateConfig(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateSsoConfigDto,
  ) {
    const config = await this.sso.updateConfig(user.organizationId, dto);

    await this.audit.log(user.organizationId, {
      actorUserId: user.userId,
      action: 'sso.config_updated',
      resource: 'organization_sso_config',
      resourceId: user.organizationId,
      metadata: {
        provider: config.provider,
        enabled: config.enabled,
      },
    });

    return config;
  }

  @Get('presets')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, EnterpriseFeatureGuard)
  @RequirePermission('sso:manage')
  @RequireEnterpriseFeature('sso')
  presets() {
    return {
      clerk: this.sso.clerkDefaults(),
      auth0: this.sso.auth0Defaults(),
    };
  }

  @Get('status/:slug')
  @SkipThrottle()
  status(@Param('slug') slug: string) {
    return this.sso.getPublicStatus(slug);
  }
}
