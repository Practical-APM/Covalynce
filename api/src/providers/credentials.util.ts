import type { ProviderCredentials } from './adapters/provider-adapter.interface';

/** Demo keys and mock OAuth tokens — never call vendor APIs. */
export function isSampleProviderCredentials(
  creds: ProviderCredentials,
): boolean {
  const key =
    creds.authType === 'API_KEY' ? creds.apiKey : (creds.accessToken ?? '');
  if (!key) return true;
  return (
    key.startsWith('demo-') ||
    key.startsWith('sk-demo') ||
    key.startsWith('mock-access-')
  );
}

/** Parse encrypted credential blob from Provider.encryptedCredentials */
export function parseStoredProviderCredentials(
  credsJson: string,
): ProviderCredentials {
  const raw = JSON.parse(credsJson) as Record<string, unknown>;
  if (raw.authType === 'OAUTH') {
    return {
      authType: 'OAUTH',
      accessToken: raw.accessToken as string | undefined,
      refreshToken: raw.refreshToken as string | undefined,
      expiresAt: raw.expiresAt as string | undefined,
      organizationId: raw.organizationId as string | undefined,
    };
  }
  return {
    authType: 'API_KEY',
    apiKey: (raw.apiKey as string) ?? '',
    organizationId: raw.organizationId as string | undefined,
  };
}

export function serializeApiKeyCredentials(
  apiKey: string,
  organizationId?: string,
): string {
  return JSON.stringify({
    authType: 'API_KEY',
    apiKey,
    organizationId,
  });
}

export function serializeOAuthCredentials(tokens: {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scopes?: string[];
  organizationId?: string;
}): string {
  return JSON.stringify({
    authType: 'OAUTH',
    ...tokens,
  });
}

export function serializeStoredCredentials(creds: ProviderCredentials): string {
  if (creds.authType === 'OAUTH') {
    return serializeOAuthCredentials({
      accessToken: creds.accessToken ?? '',
      refreshToken: creds.refreshToken,
      expiresAt: creds.expiresAt,
      organizationId: creds.organizationId,
    });
  }
  return serializeApiKeyCredentials(creds.apiKey ?? '', creds.organizationId);
}
