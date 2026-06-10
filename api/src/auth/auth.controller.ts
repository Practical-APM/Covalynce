import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { EnterpriseFeatureGuard } from '../editions/enterprise-feature.guard';
import { RequireEnterpriseFeature } from '../editions/require-enterprise-feature.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';
import { SwitchOrganizationDto } from './dto/switch-organization.dto';
import { VerifyMagicLinkDto } from './dto/verify-magic-link.dto';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('config')
  @SkipThrottle()
  config() {
    return this.authService.getPublicConfig();
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('magic-link/request')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    return this.authService.requestMagicLink(dto.email, dto.organizationSlug);
  }

  @Post('magic-link/verify')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  verifyMagicLink(@Body() dto: VerifyMagicLinkDto) {
    return this.authService.verifyMagicLink(dto.token);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  refresh(@Body() dto: RefreshSessionDto) {
    return this.authService.refreshSession(dto.refreshToken);
  }

  @Post('logout')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('sessions/revoke-all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  revokeAllSessions(@CurrentUser() user: AuthUser) {
    return this.authService.revokeAllSessions(user);
  }

  @Get('memberships')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, EnterpriseFeatureGuard)
  @RequireEnterpriseFeature('multi_org')
  memberships(@CurrentUser() user: AuthUser) {
    return this.authService.listMemberships(user.userId);
  }

  @Post('switch-org')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, EnterpriseFeatureGuard)
  @RequireEnterpriseFeature('multi_org')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  switchOrg(@CurrentUser() user: AuthUser, @Body() dto: SwitchOrganizationDto) {
    return this.authService.switchOrganization(
      user.userId,
      dto.organizationSlug,
    );
  }
}
