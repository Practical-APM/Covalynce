import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CredentialsService } from '../common/credentials.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  getSettingDefinition,
  INSTANCE_SETTING_DEFINITIONS,
} from './instance-settings.constants';

const CACHE_TTL_MS = 30_000;
const DEFAULT_JWT_SECRET = 'change-me-jwt-secret-min-32-chars-long';
const DEFAULT_ENCRYPTION_KEY = 'change-me-to-a-32-character-secret!!';

export type InstanceSettingSource = 'database' | 'environment' | 'none';

function maskSecret(value: string) {
  if (value.length <= 8) return '••••••••';
  return `••••••••${value.slice(-4)}`;
}

@Injectable()
export class InstanceSettingsService {
  private readonly logger = new Logger(InstanceSettingsService.name);
  private cache: Map<string, string> | null = null;
  private cacheLoadedAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly credentials: CredentialsService,
  ) {}

  invalidateCache() {
    this.cache = null;
    this.cacheLoadedAt = 0;
  }

  private safeDecrypt(payload: string): string | null {
    try {
      return this.credentials.decrypt(payload);
    } catch {
      this.logger.warn(
        'Failed to decrypt an instance setting — was CREDENTIALS_ENCRYPTION_KEY rotated?',
      );
      return null;
    }
  }

  private async loadOverrides(): Promise<Map<string, string>> {
    if (this.cache && Date.now() - this.cacheLoadedAt < CACHE_TTL_MS) {
      return this.cache;
    }
    const rows = await this.prisma.instanceSetting.findMany();
    const map = new Map<string, string>();
    for (const row of rows) {
      const value = row.secret ? this.safeDecrypt(row.value) : row.value;
      if (value !== null) {
        map.set(row.key, value);
      }
    }
    this.cache = map;
    this.cacheLoadedAt = Date.now();
    return map;
  }

  /** Resolve a runtime config value: database override first, env fallback. */
  async getValue(key: string): Promise<string | undefined> {
    const overrides = await this.loadOverrides();
    const fromDb = overrides.get(key);
    if (fromDb !== undefined && fromDb !== '') return fromDb;
    const fromEnv = this.config.get<string>(key);
    return fromEnv !== undefined && fromEnv !== '' ? fromEnv : undefined;
  }

  /** Masked listing for the admin UI — never returns raw secret values. */
  async list() {
    const rows = await this.prisma.instanceSetting.findMany();
    const dbRows = new Map(rows.map((r) => [r.key, r]));

    return INSTANCE_SETTING_DEFINITIONS.map((def) => {
      const dbRow = dbRows.get(def.key);
      const envValue = this.config.get<string>(def.key);
      const dbValue = dbRow
        ? def.secret
          ? this.safeDecrypt(dbRow.value)
          : dbRow.value
        : null;

      const source: InstanceSettingSource = dbValue
        ? 'database'
        : envValue
          ? 'environment'
          : 'none';
      const effective = dbValue ?? envValue ?? null;

      return {
        key: def.key,
        label: def.label,
        group: def.group,
        secret: def.secret,
        placeholder: def.placeholder ?? null,
        helpAnchor: def.helpAnchor ?? null,
        source,
        preview: effective
          ? def.secret
            ? maskSecret(effective)
            : effective
          : null,
        updatedAt: dbRow?.updatedAt?.toISOString() ?? null,
      };
    });
  }

  /**
   * Upsert (value) or clear (null / empty string) database overrides.
   * Returns the keys that changed; never logs or returns secret values.
   */
  async update(values: Record<string, string | null>) {
    const entries = Object.entries(values);
    if (entries.length === 0) {
      throw new BadRequestException('No settings provided');
    }

    const changed: string[] = [];
    for (const [key, rawValue] of entries) {
      const def = getSettingDefinition(key);
      if (!def) {
        throw new BadRequestException(`Unknown setting: ${key}`);
      }

      const value = rawValue?.trim() ?? null;
      if (value === null || value === '') {
        await this.prisma.instanceSetting.deleteMany({ where: { key } });
      } else {
        const stored = def.secret ? this.credentials.encrypt(value) : value;
        await this.prisma.instanceSetting.upsert({
          where: { key },
          create: { key, value: stored, secret: def.secret },
          update: { value: stored, secret: def.secret },
        });
      }
      changed.push(key);
    }

    this.invalidateCache();
    return { updated: changed };
  }

  /** Bootstrap deployment health — booleans only, no secret material. */
  async status() {
    let databaseConnected = true;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseConnected = false;
    }

    const jwtSecret = this.config.get<string>('JWT_SECRET');
    const encryptionKey = this.config.get<string>('CREDENTIALS_ENCRYPTION_KEY');

    return {
      databaseConnected,
      authMode:
        this.config.get<string>('AUTH_MODE') ??
        (this.config.get<string>('NODE_ENV') === 'production'
          ? 'magic_link'
          : 'dev_passwordless'),
      nodeEnv: this.config.get<string>('NODE_ENV') ?? 'development',
      jwtSecret: {
        set: Boolean(jwtSecret),
        isDefault: !jwtSecret || jwtSecret === DEFAULT_JWT_SECRET,
      },
      encryptionKey: {
        set: Boolean(encryptionKey),
        isDefault: !encryptionKey || encryptionKey === DEFAULT_ENCRYPTION_KEY,
      },
      emailConfigured: Boolean(await this.getValue('RESEND_API_KEY')),
      frontendUrl: this.config.get<string>('FRONTEND_URL') ?? null,
      corsOrigin: this.config.get<string>('CORS_ORIGIN') ?? null,
    };
  }

  /** Send a real delivery through Resend to verify the stored credentials. */
  async sendTestEmail(to: string) {
    const apiKey = await this.getValue('RESEND_API_KEY');
    if (!apiKey) {
      throw new BadRequestException(
        'Resend API key is not configured. Save it above, then retry.',
      );
    }
    const from = (await this.getValue('ALERT_FROM_EMAIL')) ?? 'alerts@covalynce.io';

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: 'Covalynce test email',
          text: [
            'This is a test email from your Covalynce instance.',
            '',
            'If you received it, email delivery (magic links, invites, budget alerts, chargeback reports) is working.',
          ].join('\n'),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          sent: false,
          status: res.status,
          error: text.slice(0, 300),
        };
      }
      return { sent: true, from, to };
    } catch (err) {
      return { sent: false, error: String(err) };
    }
  }
}
