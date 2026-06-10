import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderName } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { InstanceSettingsService } from '../instance-settings/instance-settings.service';
import {
  PROVIDER_OAUTH_CONFIG,
  providerSupportsOAuth,
} from '../integrations/integration-auth.constants';
import type { ProviderCredentials } from './adapters/provider-adapter.interface';

export interface OAuthStatePayload {
  organizationId: string;
  provider: ProviderName;
  userId: string;
}

export interface OAuthTokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scopes?: string[];
}

@Injectable()
export class ProviderOAuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly instanceSettings: InstanceSettingsService,
  ) {}

  isMockEnabled() {
    return this.config.get<string>('PROVIDER_OAUTH_MOCK_ENABLED') === 'true';
  }

  getOAuthConfig(provider: ProviderName) {
    return PROVIDER_OAUTH_CONFIG[provider];
  }

  /** Client credentials resolve from the instance settings UI first, env second. */
  private clientCredential(key: string) {
    return this.instanceSettings.getValue(key);
  }

  async isOAuthConfigured(provider: ProviderName) {
    if (this.isMockEnabled()) return true;
    const cfg = this.getOAuthConfig(provider);
    if (!cfg) return false;
    const [clientId, clientSecret, redirectUri] = await Promise.all([
      this.clientCredential(cfg.envClientId),
      this.clientCredential(cfg.envClientSecret),
      this.clientCredential(cfg.envRedirectUri),
    ]);
    return Boolean(clientId && clientSecret && redirectUri);
  }

  async startOAuth(
    organizationId: string,
    userId: string,
    provider: ProviderName,
    frontendOrigin: string,
  ) {
    if (!providerSupportsOAuth(provider)) {
      throw new BadRequestException(
        `OAuth is not supported for ${provider}. Use API key connect instead.`,
      );
    }

    const state = this.signState({ organizationId, provider, userId });
    const cfg = this.getOAuthConfig(provider)!;

    if (this.isMockEnabled()) {
      const callbackUrl = `${frontendOrigin.replace(/\/$/, '')}/providers/oauth/callback?provider=${provider}&state=${encodeURIComponent(state)}&code=${encodeURIComponent(`mock-oauth:${provider}`)}`;
      return {
        provider,
        mock: true,
        state,
        authorizationUrl: callbackUrl,
        message:
          'Mock OAuth enabled — completing connect without vendor redirect.',
      };
    }

    if (!(await this.isOAuthConfigured(provider))) {
      throw new BadRequestException(
        `OAuth is not configured for ${provider}. Add the client credentials in Settings → Self-host (or set ${cfg.envClientId}), or use API key connect.`,
      );
    }

    const clientId = (await this.clientCredential(cfg.envClientId))!;
    const redirectUri = (await this.clientCredential(cfg.envRedirectUri))!;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: cfg.scopes.join(' '),
      state,
    });

    return {
      provider,
      mock: false,
      state,
      authorizationUrl: `${cfg.authorizationUrl}?${params.toString()}`,
    };
  }

  async exchangeCode(
    provider: ProviderName,
    code: string,
    state: string,
  ): Promise<OAuthTokenSet> {
    const payload = this.verifyState(state);
    if (payload.provider !== provider) {
      throw new UnauthorizedException('OAuth state provider mismatch');
    }

    if (code.startsWith('mock-oauth:') || this.isMockEnabled()) {
      return {
        accessToken: `mock-access-${provider.toLowerCase()}-${Date.now()}`,
        refreshToken: `mock-refresh-${provider.toLowerCase()}`,
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        scopes: this.getOAuthConfig(provider)?.scopes ?? [],
      };
    }

    const cfg = this.getOAuthConfig(provider);
    if (!cfg) {
      throw new BadRequestException('OAuth not configured for this provider');
    }

    const [clientId, clientSecret, redirectUri] = await Promise.all([
      this.clientCredential(cfg.envClientId),
      this.clientCredential(cfg.envClientSecret),
      this.clientCredential(cfg.envRedirectUri),
    ]);
    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException('OAuth client credentials not configured');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new BadRequestException(
        `OAuth token exchange failed: ${text.slice(0, 200)}`,
      );
    }

    const json = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
    };

    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt: json.expires_in
        ? new Date(Date.now() + json.expires_in * 1000).toISOString()
        : undefined,
      scopes: json.scope?.split(' ') ?? cfg.scopes,
    };
  }

  verifyState(state: string): OAuthStatePayload {
    try {
      const secret =
        this.config.get<string>('JWT_SECRET') ?? 'dev-secret-change-me';
      return jwt.verify(state, secret) as OAuthStatePayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }
  }

  isAccessTokenExpired(expiresAt?: string, skewMs = 60_000) {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() <= Date.now() + skewMs;
  }

  async refreshIfNeeded(
    provider: ProviderName,
    creds: ProviderCredentials,
  ): Promise<{
    credentials: ProviderCredentials;
    updated: boolean;
  }> {
    if (creds.authType !== 'OAUTH') {
      return { credentials: creds, updated: false };
    }
    if (!creds.refreshToken || !this.isAccessTokenExpired(creds.expiresAt)) {
      return { credentials: creds, updated: false };
    }

    const tokens = await this.refreshAccessToken(provider, creds.refreshToken);
    return {
      credentials: {
        authType: 'OAUTH',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? creds.refreshToken,
        expiresAt: tokens.expiresAt,
        organizationId: creds.organizationId,
      },
      updated: true,
    };
  }

  async refreshAccessToken(
    provider: ProviderName,
    refreshToken: string,
  ): Promise<OAuthTokenSet> {
    if (this.isMockEnabled()) {
      return {
        accessToken: `mock-access-${provider.toLowerCase()}-${Date.now()}`,
        refreshToken,
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        scopes: this.getOAuthConfig(provider)?.scopes ?? [],
      };
    }

    const cfg = this.getOAuthConfig(provider);
    if (!cfg) {
      throw new BadRequestException('OAuth not configured for this provider');
    }

    const [clientId, clientSecret] = await Promise.all([
      this.clientCredential(cfg.envClientId),
      this.clientCredential(cfg.envClientSecret),
    ]);
    if (!clientId || !clientSecret) {
      throw new BadRequestException('OAuth client credentials not configured');
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new BadRequestException(
        `OAuth token refresh failed: ${text.slice(0, 200)}`,
      );
    }

    const json = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
    };

    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? refreshToken,
      expiresAt: json.expires_in
        ? new Date(Date.now() + json.expires_in * 1000).toISOString()
        : undefined,
      scopes: json.scope?.split(' ') ?? cfg.scopes,
    };
  }

  private signState(payload: OAuthStatePayload) {
    const secret =
      this.config.get<string>('JWT_SECRET') ?? 'dev-secret-change-me';
    return jwt.sign(payload, secret, { expiresIn: '15m' });
  }
}
