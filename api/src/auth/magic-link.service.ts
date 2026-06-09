import { createHash, randomBytes } from 'crypto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationsService } from '../alerts/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModeService } from './auth-mode.service';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class MagicLinkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly authMode: AuthModeService,
  ) {}

  async requestLink(email: string, organizationSlug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug: organizationSlug },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId: org.id,
          email: email.toLowerCase(),
        },
      },
    });
    if (!user) {
      throw new NotFoundException(
        'No account for this email. Ask an admin to invite you first.',
      );
    }

    const rawToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 15 * 60_000);

    await this.prisma.magicLinkToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    await this.prisma.magicLinkToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt,
      },
    });

    const verifyUrl = `${this.authMode.getFrontendUrl()}/login/verify?token=${encodeURIComponent(rawToken)}`;
    const subject = `Sign in to ${org.name} on Covalynce`;
    const body = [
      `Use this link to sign in (expires in 15 minutes):`,
      '',
      verifyUrl,
      '',
      `Organization: ${org.name} (${org.slug})`,
      '',
      'If you did not request this, ignore this email.',
    ].join('\n');

    const emailResult = await this.notifications.sendEmail(
      [user.email],
      subject,
      body,
    );

    return {
      sent: emailResult.sent,
      demo: emailResult.demo,
      message: emailResult.sent
        ? 'Sign-in link sent to your email.'
        : emailResult.demo
          ? 'Email not configured — use the link below (dev only).'
          : 'Failed to send email.',
      ...(emailResult.demo ? { verifyUrl } : {}),
    };
  }

  async consumeToken(rawToken: string) {
    const record = await this.prisma.magicLinkToken.findFirst({
      where: {
        tokenHash: hashToken(rawToken),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { include: { organization: true } },
      },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or expired sign-in link');
    }

    await this.prisma.magicLinkToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return record.user;
  }
}
