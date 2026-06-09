import { createHash, randomBytes } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private refreshTtlMs() {
    const raw = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
    if (raw.endsWith('d')) {
      return parseInt(raw, 10) * 86400000;
    }
    if (raw.endsWith('h')) {
      return parseInt(raw, 10) * 3600000;
    }
    return 7 * 86400000;
  }

  async issue(userId: string) {
    const rawToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.refreshTtlMs());

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(rawToken),
        expiresAt,
      },
    });

    return { refreshToken: rawToken, expiresAt };
  }

  async validate(rawToken: string) {
    const record = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: hashToken(rawToken),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return record.user;
  }

  async revoke(rawToken: string) {
    const record = await this.prisma.refreshToken.findFirst({
      where: { tokenHash: hashToken(rawToken), revokedAt: null },
    });
    if (record) {
      await this.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  async rotate(rawToken: string) {
    const user = await this.validate(rawToken);
    await this.revoke(rawToken);
    const next = await this.issue(user.id);
    return { user, refreshToken: next.refreshToken };
  }
}
