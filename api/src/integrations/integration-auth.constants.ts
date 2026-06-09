import { ProviderName } from '@prisma/client';

export type IntegrationAuthMethod = 'oauth' | 'api_key' | 'webhook' | 'jwt';

export interface IntegrationDefinition {
  id: string;
  name: string;
  category: 'ai_provider' | 'identity' | 'notifications' | 'platform';
  preferredAuth: IntegrationAuthMethod;
  supportedAuth: IntegrationAuthMethod[];
  oauthAvailable: boolean;
  description: string;
}

export const PROVIDER_OAUTH_CONFIG: Partial<
  Record<
    ProviderName,
    {
      authorizationUrl: string;
      tokenUrl: string;
      scopes: string[];
      envClientId: string;
      envClientSecret: string;
      envRedirectUri: string;
    }
  >
> = {
  [ProviderName.OPENAI]: {
    authorizationUrl: 'https://auth.openai.com/oauth/authorize',
    tokenUrl: 'https://auth.openai.com/oauth/token',
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    envClientId: 'OPENAI_OAUTH_CLIENT_ID',
    envClientSecret: 'OPENAI_OAUTH_CLIENT_SECRET',
    envRedirectUri: 'OPENAI_OAUTH_REDIRECT_URI',
  },
  [ProviderName.GEMINI]: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/cloud-billing.readonly',
      'https://www.googleapis.com/auth/cloud-platform.read-only',
    ],
    envClientId: 'GOOGLE_OAUTH_CLIENT_ID',
    envClientSecret: 'GOOGLE_OAUTH_CLIENT_SECRET',
    envRedirectUri: 'GOOGLE_OAUTH_REDIRECT_URI',
  },
  [ProviderName.ANTHROPIC]: {
    authorizationUrl: 'https://console.anthropic.com/oauth/authorize',
    tokenUrl: 'https://console.anthropic.com/oauth/token',
    scopes: ['org:read', 'usage:read'],
    envClientId: 'ANTHROPIC_OAUTH_CLIENT_ID',
    envClientSecret: 'ANTHROPIC_OAUTH_CLIENT_SECRET',
    envRedirectUri: 'ANTHROPIC_OAUTH_REDIRECT_URI',
  },
};

export const INTEGRATIONS_CATALOG: IntegrationDefinition[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai_provider',
    preferredAuth: 'oauth',
    supportedAuth: ['oauth', 'api_key'],
    oauthAvailable: true,
    description: 'GPT models, embeddings, and usage APIs',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'ai_provider',
    preferredAuth: 'oauth',
    supportedAuth: ['oauth', 'api_key'],
    oauthAvailable: true,
    description: 'Claude models and organization usage',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'ai_provider',
    preferredAuth: 'oauth',
    supportedAuth: ['oauth', 'api_key'],
    oauthAvailable: true,
    description: 'Gemini via Google Cloud billing',
  },
  {
    id: 'azure_openai',
    name: 'Azure OpenAI',
    category: 'ai_provider',
    preferredAuth: 'api_key',
    supportedAuth: ['api_key'],
    oauthAvailable: false,
    description: 'Demo + Gateway today; native billing sync planned',
  },
  {
    id: 'bedrock',
    name: 'AWS Bedrock',
    category: 'ai_provider',
    preferredAuth: 'api_key',
    supportedAuth: ['api_key'],
    oauthAvailable: false,
    description: 'Demo + Gateway today; native billing sync planned',
  },
  {
    id: 'sso',
    name: 'Single sign-on',
    category: 'identity',
    preferredAuth: 'oauth',
    supportedAuth: ['oauth'],
    oauthAvailable: true,
    description: 'Clerk, Auth0, or custom OIDC for user login',
  },
  {
    id: 'gateway',
    name: 'Covalynce Gateway',
    category: 'platform',
    preferredAuth: 'api_key',
    supportedAuth: ['api_key'],
    oauthAvailable: false,
    description: 'Issue gk_ keys so apps proxy LLM traffic through Covalynce',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'notifications',
    preferredAuth: 'oauth',
    supportedAuth: ['oauth', 'webhook'],
    oauthAvailable: false,
    description: 'Budget and anomaly alerts to Slack channels',
  },
  {
    id: 'rest_api',
    name: 'REST API',
    category: 'platform',
    preferredAuth: 'jwt',
    supportedAuth: ['jwt'],
    oauthAvailable: false,
    description: 'Bearer JWT from user session — embed Covalynce anywhere',
  },
];

export function providerSupportsOAuth(name: ProviderName): boolean {
  return name in PROVIDER_OAUTH_CONFIG;
}
