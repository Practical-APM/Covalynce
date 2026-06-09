import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { CreateGatewayKeyDto } from './dto/create-gateway-key.dto';
import { UpdateGatewayKeyDto } from './dto/update-gateway-key.dto';
import { UpdateRoutingSettingsDto } from './dto/update-routing-settings.dto';
import type { GatewayContext } from './gateway.types';
import { GATEWAY_ENDPOINTS } from './gateway.types';
import { GatewayKeyGuard } from './gateway-key.guard';
import { GatewayKeysService } from './gateway-keys.service';
import { GatewayProxyService } from './gateway-proxy.service';
import { ModelRouterService } from './model-router.service';

@ApiTags('gateway')
@Controller('api/v1/gateway')
export class GatewayController {
  constructor(
    private readonly keys: GatewayKeysService,
    private readonly proxy: GatewayProxyService,
    private readonly router: ModelRouterService,
  ) {}

  @Get('keys')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermission('gateway:read')
  listKeys(@CurrentUser() user: AuthUser) {
    return this.keys.list(user.organizationId);
  }

  @Post('keys')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermission('gateway:manage')
  createKey(@CurrentUser() user: AuthUser, @Body() dto: CreateGatewayKeyDto) {
    return this.keys.create(user.organizationId, user, dto.name);
  }

  @Delete('keys/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermission('gateway:manage')
  revokeKey(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.keys.revoke(id, user.organizationId, user);
  }

  @Patch('keys/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermission('gateway:manage')
  updateKey(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateGatewayKeyDto,
  ) {
    return this.keys.updateRateLimit(
      id,
      user.organizationId,
      user,
      dto.rateLimitRpm,
    );
  }

  @Get('status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async status(@CurrentUser() user: AuthUser) {
    const [keyCount, routing] = await Promise.all([
      this.proxy.getStatus(user.organizationId),
      this.router.getSettings(user.organizationId),
    ]);
    return {
      enabled: keyCount > 0,
      activeKeys: keyCount,
      endpoints: GATEWAY_ENDPOINTS,
      unifiedRouting: true,
      intelligentRouting: routing.intelligentRouting,
      streaming: true,
      rateLimitPerKey: '120/min default (configurable per key)',
    };
  }

  @Get('routing')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermission('gateway:read')
  getRouting(@CurrentUser() user: AuthUser) {
    return this.router.getSettings(user.organizationId);
  }

  @Patch('routing')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermission('gateway:manage')
  updateRouting(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateRoutingSettingsDto,
  ) {
    return this.router.updateSettings(user.organizationId, dto);
  }

  /** Unified multi-provider route — OpenAI-compatible, auto-selects provider */
  @Post('v1/route/completions')
  @SkipThrottle()
  @UseGuards(GatewayKeyGuard)
  async routeUnified(
    @Req() req: { gateway: GatewayContext },
    @Res({ passthrough: true }) res: Response,
    @Body() body: Record<string, unknown>,
  ) {
    return this.proxy.routeUnified(
      req.gateway,
      body as {
        model: string;
        messages?: { role: string; content: string }[];
        max_tokens?: number;
        stream?: boolean;
      },
      res,
    );
  }

  /** OpenAI-compatible chat completions */
  @Post('v1/chat/completions')
  @SkipThrottle()
  @UseGuards(GatewayKeyGuard)
  async openAiChat(
    @Req() req: { gateway: GatewayContext },
    @Res({ passthrough: true }) res: Response,
    @Body() body: Record<string, unknown>,
  ) {
    const payload = body as {
      model: string;
      messages?: unknown[];
      stream?: boolean;
    };
    if (payload.stream) {
      await this.proxy.openAiChatStream(req.gateway, payload, res);
      return;
    }
    return this.proxy.openAiChat(req.gateway, payload);
  }

  /** Anthropic Messages API */
  @Post('anthropic/v1/messages')
  @SkipThrottle()
  @UseGuards(GatewayKeyGuard)
  async anthropicMessages(
    @Req() req: { gateway: GatewayContext },
    @Res({ passthrough: true }) res: Response,
    @Body() body: Record<string, unknown>,
  ) {
    const payload = body as {
      model: string;
      max_tokens: number;
      messages: { role: string; content: string }[];
      stream?: boolean;
    };
    if (payload.stream) {
      await this.proxy.anthropicMessagesStream(req.gateway, payload, res);
      return;
    }
    return this.proxy.anthropicMessages(req.gateway, payload);
  }

  /** Gemini generateContent (simplified body) */
  @Post('gemini/v1/generate')
  @SkipThrottle()
  @UseGuards(GatewayKeyGuard)
  async geminiGenerate(
    @Req() req: { gateway: GatewayContext },
    @Res({ passthrough: true }) res: Response,
    @Body() body: Record<string, unknown>,
  ) {
    const payload = body as {
      model: string;
      contents: { role?: string; parts: { text: string }[] }[];
      stream?: boolean;
    };
    if (payload.stream) {
      await this.proxy.geminiGenerateStream(req.gateway, payload, res);
      return;
    }
    return this.proxy.geminiGenerate(req.gateway, payload);
  }
}
