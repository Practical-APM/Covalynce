export type InstanceSettingGroup =
  | 'email'
  | 'oauth_openai'
  | 'oauth_anthropic'
  | 'oauth_google';

export interface InstanceSettingDefinition {
  key: string;
  label: string;
  group: InstanceSettingGroup;
  secret: boolean;
  placeholder?: string;
  helpAnchor?: string;
}

/**
 * Whitelist of env vars that may be overridden at runtime from the admin UI.
 * Bootstrap config (DATABASE_URL, JWT_SECRET, CREDENTIALS_ENCRYPTION_KEY, ...)
 * is intentionally excluded: it is required before the app can serve this API.
 */
export const INSTANCE_SETTING_DEFINITIONS: InstanceSettingDefinition[] = [
  {
    key: 'RESEND_API_KEY',
    label: 'Resend API key',
    group: 'email',
    secret: true,
    placeholder: 're_xxxxxxxxxxxx',
    helpAnchor: 'resend',
  },
  {
    key: 'ALERT_FROM_EMAIL',
    label: 'From address',
    group: 'email',
    secret: false,
    placeholder: 'alerts@yourdomain.com',
    helpAnchor: 'resend',
  },
  {
    key: 'OPENAI_OAUTH_CLIENT_ID',
    label: 'OpenAI OAuth client ID',
    group: 'oauth_openai',
    secret: false,
    helpAnchor: 'provider-oauth',
  },
  {
    key: 'OPENAI_OAUTH_CLIENT_SECRET',
    label: 'OpenAI OAuth client secret',
    group: 'oauth_openai',
    secret: true,
    helpAnchor: 'provider-oauth',
  },
  {
    key: 'OPENAI_OAUTH_REDIRECT_URI',
    label: 'OpenAI OAuth redirect URI',
    group: 'oauth_openai',
    secret: false,
    placeholder: 'https://your-app.example.com/providers/oauth/callback',
    helpAnchor: 'provider-oauth',
  },
  {
    key: 'ANTHROPIC_OAUTH_CLIENT_ID',
    label: 'Anthropic OAuth client ID',
    group: 'oauth_anthropic',
    secret: false,
    helpAnchor: 'provider-oauth',
  },
  {
    key: 'ANTHROPIC_OAUTH_CLIENT_SECRET',
    label: 'Anthropic OAuth client secret',
    group: 'oauth_anthropic',
    secret: true,
    helpAnchor: 'provider-oauth',
  },
  {
    key: 'ANTHROPIC_OAUTH_REDIRECT_URI',
    label: 'Anthropic OAuth redirect URI',
    group: 'oauth_anthropic',
    secret: false,
    placeholder: 'https://your-app.example.com/providers/oauth/callback',
    helpAnchor: 'provider-oauth',
  },
  {
    key: 'GOOGLE_OAUTH_CLIENT_ID',
    label: 'Google OAuth client ID',
    group: 'oauth_google',
    secret: false,
    helpAnchor: 'provider-oauth',
  },
  {
    key: 'GOOGLE_OAUTH_CLIENT_SECRET',
    label: 'Google OAuth client secret',
    group: 'oauth_google',
    secret: true,
    helpAnchor: 'provider-oauth',
  },
  {
    key: 'GOOGLE_OAUTH_REDIRECT_URI',
    label: 'Google OAuth redirect URI',
    group: 'oauth_google',
    secret: false,
    placeholder: 'https://your-app.example.com/providers/oauth/callback',
    helpAnchor: 'provider-oauth',
  },
];

export const INSTANCE_SETTING_KEYS = INSTANCE_SETTING_DEFINITIONS.map(
  (d) => d.key,
);

export function getSettingDefinition(key: string) {
  return INSTANCE_SETTING_DEFINITIONS.find((d) => d.key === key);
}
