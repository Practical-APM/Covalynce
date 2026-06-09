import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SsoProvider } from '@prisma/client';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import type { UpdateSsoConfigDto } from './dto/sso.dto';

type ExternalClaims = {
  sub: string;
  email?: string;
  iss?: string;
  aud?: string | string[];
};

@Injectable()
export class SsoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  async getConfig(organizationId: string) {
    const config = await this.prisma.organizationSsoConfig.findUnique({
      where: { organizationId },
    });
    if (!config) {
      return {
        provider: SsoProvider.NONE,
        enabled: false,
        issuerUrl: null,
        jwksUri: null,
        audience: null,
        allowedEmailDomains: [] as string[],
      };
    }
    return {
      provider: config.provider,
      enabled: config.enabled,
      issuerUrl: config.issuerUrl,
      jwksUri: config.jwksUri,
      audience: config.audience,
      allowedEmailDomains: (config.allowedEmailDomains as string[]) ?? [],
    };
  }

  async getPublicStatus(organizationSlug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug: organizationSlug },
      include: { ssoConfig: true },
    });
    if (!org) {
      return { enabled: false, provider: SsoProvider.NONE };
    }
    return {
      enabled: org.ssoConfig?.enabled ?? false,
      provider: org.ssoConfig?.provider ?? SsoProvider.NONE,
    };
  }

  async updateConfig(organizationId: string, dto: UpdateSsoConfigDto) {
    const allowedEmailDomains = dto.allowedEmailDomains ?? [];

    const config = await this.prisma.organizationSsoConfig.upsert({
      where: { organizationId },
      create: {
        organizationId,
        provider: dto.provider ?? SsoProvider.NONE,
        enabled: dto.enabled ?? false,
        issuerUrl: dto.issuerUrl,
        jwksUri: dto.jwksUri,
        audience: dto.audience,
        allowedEmailDomains,
      },
      update: {
        ...(dto.provider !== undefined ? { provider: dto.provider } : {}),
        ...(dto.enabled !== undefined ? { enabled: dto.enabled } : {}),
        ...(dto.issuerUrl !== undefined ? { issuerUrl: dto.issuerUrl } : {}),
        ...(dto.jwksUri !== undefined ? { jwksUri: dto.jwksUri } : {}),
        ...(dto.audience !== undefined ? { audience: dto.audience } : {}),
        ...(dto.allowedEmailDomains !== undefined
          ? { allowedEmailDomains }
          : {}),
      },
    });

    return {
      provider: config.provider,
      enabled: config.enabled,
      issuerUrl: config.issuerUrl,
      jwksUri: config.jwksUri,
      audience: config.audience,
      allowedEmailDomains: config.allowedEmailDomains as string[],
    };
  }

  async exchangeToken(organizationSlug: string, accessToken: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug: organizationSlug },
      include: { ssoConfig: true },
    });
    if (!org) {
      throw new UnauthorizedException('Organization not found');
    }

    const sso = org.ssoConfig;
    if (!sso?.enabled) {
      throw new BadRequestException('SSO is not enabled for this organization');
    }

    const claims = await this.verifyToken(accessToken, sso);
    const email = claims.email?.toLowerCase();
    if (!email) {
      throw new UnauthorizedException('SSO token missing email claim');
    }

    this.assertEmailDomain(email, sso.allowedEmailDomains as string[]);

    let user = await this.prisma.user.findFirst({
      where: {
        organizationId: org.id,
        OR: [{ externalAuthId: claims.sub }, { email }],
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'No matching user — invite this email before SSO login',
      );
    }

    if (!user.externalAuthId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { externalAuthId: claims.sub },
      });
    }

    return {
      authProvider: sso.provider,
      ...(await this.auth.signSession(user, org)),
    };
  }

  private assertEmailDomain(email: string, allowedDomains: string[]) {
    if (!allowedDomains.length) return;
    const domain = email.split('@')[1]?.toLowerCase();
    if (
      !domain ||
      !allowedDomains.map((d) => d.toLowerCase()).includes(domain)
    ) {
      throw new UnauthorizedException('Email domain not allowed for SSO');
    }
  }

  private async verifyToken(
    accessToken: string,
    sso: {
      provider: SsoProvider;
      jwksUri: string | null;
      issuerUrl: string | null;
      audience: string | null;
    },
  ): Promise<ExternalClaims> {
    const mockEnabled =
      this.config.get<string>('SSO_MOCK_ENABLED') === 'true' &&
      this.config.get<string>('NODE_ENV') !== 'production';

    if (mockEnabled && accessToken.startsWith('mock-sso:')) {
      const email = accessToken.slice('mock-sso:'.length).trim();
      if (!email.includes('@')) {
        throw new UnauthorizedException('Invalid mock SSO token');
      }
      return { sub: `mock-${email}`, email };
    }

    if (!sso.jwksUri) {
      throw new BadRequestException('SSO JWKS URI not configured');
    }

    const client = jwksClient({
      jwksUri: sso.jwksUri,
      cache: true,
      rateLimit: true,
    });

    const getKey = (
      header: jwt.JwtHeader,
      callback: jwt.SigningKeyCallback,
    ) => {
      if (!header.kid) {
        callback(new Error('Missing kid in token header'));
        return;
      }
      client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          callback(err);
          return;
        }
        callback(null, key?.getPublicKey());
      });
    };

    return new Promise((resolve, reject) => {
      jwt.verify(
        accessToken,
        getKey,
        {
          algorithms: ['RS256'],
          issuer: sso.issuerUrl ?? undefined,
          audience: sso.audience ?? undefined,
        },
        (err, decoded) => {
          if (err) {
            reject(
              new UnauthorizedException(`SSO token invalid: ${err.message}`),
            );
            return;
          }
          resolve(decoded as ExternalClaims);
        },
      );
    });
  }

  clerkDefaults() {
    return {
      issuerUrl: 'https://clerk.covalynce.app',
      jwksUri: 'https://clerk.covalynce.app/.well-known/jwks.json',
      hint: 'Replace with your Clerk Frontend API domain from the Clerk dashboard',
    };
  }

  auth0Defaults() {
    return {
      hint: 'Set issuerUrl to https://YOUR_DOMAIN/ and jwksUri to https://YOUR_DOMAIN/.well-known/jwks.json',
    };
  }
}
