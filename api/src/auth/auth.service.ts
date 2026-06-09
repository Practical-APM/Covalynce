import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModeService } from './auth-mode.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt.strategy';
import { MagicLinkService } from './magic-link.service';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly authMode: AuthModeService,
    private readonly magicLink: MagicLinkService,
    private readonly refreshTokens: RefreshTokenService,
  ) {}

  getPublicConfig() {
    return {
      mode: this.authMode.getMode(),
      passwordlessLoginAllowed: this.authMode.allowsPasswordlessLogin(),
      magicLinkEnabled:
        this.authMode.requiresMagicLink() ||
        this.authMode.getMode() === 'magic_link',
      ssoRequired: this.authMode.requiresSso(),
      emailDeliveryConfigured: this.authMode.isEmailConfigured(),
    };
  }

  private accessExpiresSeconds() {
    const raw = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    if (raw.endsWith('m')) return parseInt(raw, 10) * 60;
    if (raw.endsWith('h')) return parseInt(raw, 10) * 3600;
    if (raw.endsWith('d')) return parseInt(raw, 10) * 86400;
    return 900;
  }

  signAccessToken(
    user: Pick<User, 'id' | 'organizationId' | 'email' | 'role'>,
  ) {
    const payload: JwtPayload = {
      sub: user.id,
      orgId: user.organizationId,
      email: user.email,
      role: user.role,
    };
    const seconds = this.accessExpiresSeconds();
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: seconds }),
      expiresIn: `${seconds}s`,
    };
  }

  async signSession(
    user: User,
    organization: { id: string; name: string; slug: string; plan: string },
  ) {
    const refresh = await this.refreshTokens.issue(user.id);
    return {
      user: this.sanitizeUser(user),
      organization,
      ...this.signAccessToken(user),
      refreshToken: refresh.refreshToken,
    };
  }

  async login(dto: LoginDto) {
    if (!this.authMode.allowsPasswordlessLogin()) {
      throw new ForbiddenException(
        'Passwordless login is disabled. Request a magic sign-in link or use SSO.',
      );
    }

    const org = await this.prisma.organization.findUnique({
      where: { slug: dto.organizationSlug },
    });
    if (!org) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId: org.id,
          email: dto.email.toLowerCase(),
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signSession(user, org);
  }

  requestMagicLink(email: string, organizationSlug: string) {
    if (this.authMode.requiresSso()) {
      throw new ForbiddenException('Use SSO to sign in for this deployment.');
    }
    return this.magicLink.requestLink(email, organizationSlug);
  }

  async verifyMagicLink(token: string) {
    const user = await this.magicLink.consumeToken(token);
    const org = await this.prisma.organization.findUniqueOrThrow({
      where: { id: user.organizationId },
    });
    return this.signSession(user, org);
  }

  async refreshSession(refreshToken: string) {
    const { user, refreshToken: nextRefresh } =
      await this.refreshTokens.rotate(refreshToken);
    const org = await this.prisma.organization.findUniqueOrThrow({
      where: { id: user.organizationId },
    });
    return {
      user: this.sanitizeUser(user),
      organization: org,
      ...this.signAccessToken(user),
      refreshToken: nextRefresh,
    };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.refreshTokens.revoke(refreshToken);
    }
    return { ok: true };
  }

  async listMemberships(userId: string) {
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!current) {
      throw new UnauthorizedException('User not found');
    }

    const memberships = await this.prisma.user.findMany({
      where: { email: current.email.toLowerCase() },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, plan: true },
        },
      },
      orderBy: { organization: { name: 'asc' } },
    });

    return {
      email: current.email,
      activeOrganizationId: current.organizationId,
      memberships: memberships.map((m) => ({
        userId: m.id,
        role: m.role,
        organization: m.organization,
        isActive: m.organizationId === current.organizationId,
      })),
    };
  }

  async switchOrganization(userId: string, organizationSlug: string) {
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!current) {
      throw new UnauthorizedException('User not found');
    }

    const target = await this.prisma.user.findFirst({
      where: {
        email: current.email.toLowerCase(),
        organization: { slug: organizationSlug },
      },
      include: { organization: true },
    });

    if (!target) {
      throw new UnauthorizedException(
        'No membership in that organization. Ask an admin to invite you.',
      );
    }

    return this.signSession(target, target.organization);
  }

  sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      createdAt: user.createdAt,
    };
  }

  async linkClerkUser(
    externalAuthId: string,
    email: string,
    organizationId: string,
  ) {
    return this.prisma.user.update({
      where: {
        organizationId_email: {
          organizationId,
          email: email.toLowerCase(),
        },
      },
      data: { externalAuthId },
    });
  }
}
