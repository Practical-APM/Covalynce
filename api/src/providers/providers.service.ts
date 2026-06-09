import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProviderName, ProviderAuthType, ProviderStatus } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CredentialsService } from '../common/credentials.service';
import { CacheService } from '../cache/cache.service';
import { CostEngine } from '../cost/cost-engine';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderAdapterRegistry } from './adapters/provider-adapters';
import { ConnectProviderDto } from './dto/connect-provider.dto';
import {
  parseStoredProviderCredentials,
  serializeApiKeyCredentials,
  serializeOAuthCredentials,
  serializeStoredCredentials,
  isSampleProviderCredentials,
} from './credentials.util';
import { ProviderOAuthService } from './provider-oauth.service';
import type { OAuthTokenSet } from './provider-oauth.service';

const DISPLAY_NAMES: Record<ProviderName, string> = {
  OPENAI: 'OpenAI',
  ANTHROPIC: 'Anthropic',
  GEMINI: 'Google Gemini',
  AZURE_OPENAI: 'Azure OpenAI',
  BEDROCK: 'AWS Bedrock',
};

@Injectable()
export class ProvidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly credentials: CredentialsService,
    private readonly adapters: ProviderAdapterRegistry,
    private readonly costEngine: CostEngine,
    private readonly cache: CacheService,
    private readonly oauth: ProviderOAuthService,
  ) {}

  list(organizationId: string) {
    return this.prisma.provider
      .findMany({
        where: { organizationId },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          displayName: true,
          authType: true,
          encryptedCredentials: true,
          status: true,
          lastSyncAt: true,
          lastSyncError: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      .then((rows) => rows.map((row) => this.enrichProvider(row)));
  }

  private enrichProvider<
    T extends { encryptedCredentials: string } & Record<string, unknown>,
  >(provider: T) {
    const creds = parseStoredProviderCredentials(
      this.credentials.decrypt(provider.encryptedCredentials),
    );
    const { encryptedCredentials: _, ...rest } = provider;
    void _;
    return {
      ...rest,
      dataSource: isSampleProviderCredentials(creds)
        ? ('SAMPLE' as const)
        : ('LIVE' as const),
    };
  }

  async connect(
    organizationId: string,
    actor: AuthUser,
    dto: ConnectProviderDto,
  ) {
    if (!dto.apiKey?.trim()) {
      throw new BadRequestException(
        'API key is required. Prefer OAuth connect when available: GET /providers/oauth/:provider/start',
      );
    }

    const existing = await this.prisma.provider.findUnique({
      where: {
        organizationId_name: {
          organizationId,
          name: dto.name,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'Provider already connected for this organization',
      );
    }

    const adapter = this.adapters.getAdapter(dto.name);
    const credPayload = {
      authType: 'API_KEY' as const,
      apiKey: dto.apiKey,
      organizationId: dto.externalOrganizationId,
    };
    const valid = await adapter.validateCredentials(credPayload);
    if (!valid) {
      throw new BadRequestException('Invalid API key format for this provider');
    }

    const provider = await this.prisma.provider.create({
      data: {
        organizationId,
        name: dto.name,
        displayName: DISPLAY_NAMES[dto.name] ?? dto.name,
        authType: ProviderAuthType.API_KEY,
        status: ProviderStatus.CONNECTED,
        encryptedCredentials: this.credentials.encrypt(
          serializeApiKeyCredentials(dto.apiKey, dto.externalOrganizationId),
        ),
        lastSyncAt: null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'provider.connected',
        resource: 'provider',
        resourceId: provider.id,
        metadata: { name: dto.name, authType: 'API_KEY' },
      },
    });

    await this.syncProvider(provider.id, organizationId);

    return this.findOne(provider.id, organizationId);
  }

  async connectViaOAuth(
    organizationId: string,
    actor: AuthUser,
    providerName: ProviderName,
    tokens: OAuthTokenSet,
  ) {
    const existing = await this.prisma.provider.findUnique({
      where: {
        organizationId_name: { organizationId, name: providerName },
      },
    });
    if (existing) {
      throw new ConflictException(
        'Provider already connected for this organization',
      );
    }

    const adapter = this.adapters.getAdapter(providerName);
    const credPayload = {
      authType: 'OAUTH' as const,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    };
    const valid = await adapter.validateCredentials(credPayload);
    if (!valid) {
      throw new BadRequestException('OAuth token validation failed');
    }

    const provider = await this.prisma.provider.create({
      data: {
        organizationId,
        name: providerName,
        displayName: DISPLAY_NAMES[providerName] ?? providerName,
        authType: ProviderAuthType.OAUTH,
        status: ProviderStatus.CONNECTED,
        encryptedCredentials: this.credentials.encrypt(
          serializeOAuthCredentials({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
            scopes: tokens.scopes,
          }),
        ),
        lastSyncAt: null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'provider.connected',
        resource: 'provider',
        resourceId: provider.id,
        metadata: { name: providerName, authType: 'OAUTH' },
      },
    });

    await this.syncProvider(provider.id, organizationId);
    return this.findOne(provider.id, organizationId);
  }

  async findOne(id: string, organizationId: string) {
    const provider = await this.prisma.provider.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        name: true,
        displayName: true,
        authType: true,
        encryptedCredentials: true,
        status: true,
        lastSyncAt: true,
        lastSyncError: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    return this.enrichProvider(provider);
  }

  async remove(id: string, organizationId: string, actor: AuthUser) {
    const provider = await this.prisma.provider.findFirst({
      where: { id, organizationId },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    await this.prisma.provider.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorUserId: actor.userId,
        action: 'provider.disconnected',
        resource: 'provider',
        resourceId: id,
        metadata: { name: provider.name },
      },
    });

    return { deleted: true };
  }

  async syncProvider(providerId: string, organizationId: string) {
    const provider = await this.prisma.provider.findFirst({
      where: { id: providerId, organizationId },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    await this.prisma.provider.update({
      where: { id: providerId },
      data: { status: ProviderStatus.SYNCING },
    });

    try {
      let credsJson = this.credentials.decrypt(provider.encryptedCredentials);
      let creds = parseStoredProviderCredentials(credsJson);

      const refreshed = await this.oauth.refreshIfNeeded(provider.name, creds);
      if (refreshed.updated) {
        credsJson = serializeStoredCredentials(refreshed.credentials);
        await this.prisma.provider.update({
          where: { id: providerId },
          data: {
            encryptedCredentials: this.credentials.encrypt(credsJson),
          },
        });
        creds = refreshed.credentials;
      }

      const since = provider.lastSyncAt ?? new Date(Date.now() - 30 * 86400000);
      const adapter = this.adapters.getAdapter(provider.name);
      const events = await adapter.syncUsage(creds, since);

      let inserted = 0;
      for (const event of events) {
        const user = event.userEmail
          ? await this.prisma.user.findFirst({
              where: {
                organizationId,
                email: event.userEmail.toLowerCase(),
              },
            })
          : null;

        const cost = await this.costEngine.calculateCost(
          event.provider,
          event.model,
          event.inputTokens,
          event.outputTokens,
          event.timestamp,
        );

        try {
          await this.prisma.usageEvent.create({
            data: {
              organizationId,
              providerId: provider.id,
              provider: event.provider,
              model: event.model,
              userId: user?.id,
              inputTokens: event.inputTokens,
              outputTokens: event.outputTokens,
              cost,
              externalId: event.externalId,
              timestamp: event.timestamp,
            },
          });
          inserted++;
        } catch {
          // duplicate externalId — skip (immutable append-only)
        }
      }

      await this.prisma.provider.update({
        where: { id: providerId },
        data: {
          status: ProviderStatus.CONNECTED,
          lastSyncAt: new Date(),
          lastSyncError: null,
        },
      });

      await this.cache.invalidateOrg(organizationId);

      return { synced: true, eventsInserted: inserted };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      await this.prisma.provider.update({
        where: { id: providerId },
        data: {
          status: ProviderStatus.ERROR,
          lastSyncError: message,
        },
      });
      throw err;
    }
  }

  async syncAllForOrganization(organizationId: string) {
    const providers = await this.prisma.provider.findMany({
      where: { organizationId, status: { not: ProviderStatus.DISCONNECTED } },
    });
    const results = [];
    for (const p of providers) {
      results.push(await this.syncProvider(p.id, organizationId));
    }
    return results;
  }

  async getSyncHealth(organizationId: string) {
    const providers = await this.prisma.provider.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        authType: true,
        status: true,
        lastSyncAt: true,
        lastSyncError: true,
      },
    });

    const since24h = new Date(Date.now() - 24 * 3600000);
    const enriched = await Promise.all(
      providers.map(async (p) => {
        const eventsLast24h = await this.prisma.usageEvent.count({
          where: {
            organizationId,
            providerId: p.id,
            timestamp: { gte: since24h },
          },
        });
        return { ...p, eventsLast24h };
      }),
    );

    const errorCount = enriched.filter(
      (p) => p.status === ProviderStatus.ERROR,
    ).length;
    const staleCount = enriched.filter((p) => {
      if (!p.lastSyncAt) return true;
      return Date.now() - p.lastSyncAt.getTime() > 30 * 60 * 1000;
    }).length;

    let overall: 'healthy' | 'degraded' | 'error' | 'empty' = 'empty';
    if (enriched.length === 0) {
      overall = 'empty';
    } else if (errorCount > 0) {
      overall = 'error';
    } else if (staleCount > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      providerCount: enriched.length,
      errorCount,
      staleCount,
      lastCheckedAt: new Date().toISOString(),
      providers: enriched,
    };
  }
}
