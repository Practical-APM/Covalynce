import { ProviderName } from '@prisma/client';

export type ProviderAuthTypeLiteral = 'API_KEY' | 'OAUTH';

export interface CanonicalUsageEvent {
  externalId: string;
  provider: ProviderName;
  model: string;
  inputTokens: number;
  outputTokens: number;
  timestamp: Date;
  userEmail?: string;
}

export interface ProviderCredentials {
  authType: ProviderAuthTypeLiteral;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  organizationId?: string;
}

export interface ProviderAdapter {
  readonly name: ProviderName;
  validateCredentials(credentials: ProviderCredentials): Promise<boolean>;
  syncUsage(
    credentials: ProviderCredentials,
    since: Date,
  ): Promise<CanonicalUsageEvent[]>;
}

export interface ProviderAdapterFactory {
  getAdapter(name: ProviderName): ProviderAdapter;
}

export function resolveApiKey(credentials: ProviderCredentials): string {
  if (credentials.authType === 'API_KEY' && credentials.apiKey) {
    return credentials.apiKey;
  }
  if (credentials.authType === 'OAUTH' && credentials.accessToken) {
    return credentials.accessToken;
  }
  return '';
}
