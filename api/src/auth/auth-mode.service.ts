import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InstanceSettingsService } from '../instance-settings/instance-settings.service';

export type AuthMode = 'dev_passwordless' | 'magic_link' | 'sso_required';

@Injectable()
export class AuthModeService {
  constructor(
    private readonly config: ConfigService,
    private readonly instanceSettings: InstanceSettingsService,
  ) {}

  getMode(): AuthMode {
    const explicit = this.config.get<string>('AUTH_MODE');
    if (
      explicit === 'dev_passwordless' ||
      explicit === 'magic_link' ||
      explicit === 'sso_required'
    ) {
      return explicit;
    }
    return this.config.get<string>('NODE_ENV') === 'production'
      ? 'magic_link'
      : 'dev_passwordless';
  }

  allowsPasswordlessLogin() {
    return this.getMode() === 'dev_passwordless';
  }

  requiresMagicLink() {
    return this.getMode() === 'magic_link';
  }

  requiresSso() {
    return this.getMode() === 'sso_required';
  }

  async isEmailConfigured() {
    return Boolean(await this.instanceSettings.getValue('RESEND_API_KEY'));
  }

  getFrontendUrl() {
    return (
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');
  }
}
