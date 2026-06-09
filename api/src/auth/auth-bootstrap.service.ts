import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModeService } from './auth-mode.service';

@Injectable()
export class AuthBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AuthBootstrapService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly authMode: AuthModeService,
  ) {}

  onModuleInit() {
    const mode = this.authMode.getMode();
    const jwtSecret =
      this.config.get<string>('JWT_SECRET') ?? 'covalynce-dev-secret-change-me';
    const isProd = this.config.get<string>('NODE_ENV') === 'production';

    this.logger.log(`Auth mode: ${mode}`);

    if (isProd && jwtSecret.includes('change-me')) {
      this.logger.warn(
        'JWT_SECRET is using a default value — set a strong secret before production.',
      );
    }

    if (mode === 'magic_link' && !this.authMode.isEmailConfigured()) {
      this.logger.warn(
        'AUTH_MODE=magic_link but RESEND_API_KEY is not set — magic links will be logged to console only.',
      );
    }

    if (mode === 'sso_required') {
      this.logger.warn(
        'AUTH_MODE=sso_required — configure SSO in Settings before inviting users.',
      );
    }

    if (mode === 'dev_passwordless' && isProd) {
      this.logger.warn(
        'dev_passwordless auth in production NODE_ENV — set AUTH_MODE=magic_link for design partners.',
      );
    }
  }
}
